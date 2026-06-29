import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { geminiClient, KnowledgeGraphSchema } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    // 1. Verify Cron Secret to secure the endpoint
    const authHeader = req.headers.get('Authorization');
    const expectedHeader = `Bearer ${process.env.CRON_SECRET}`;
    if (!process.env.CRON_SECRET || authHeader !== expectedHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // 2. Fetch unprocessed entries (process in batches of 100 to prevent timeouts)
    const { data: entries, error: fetchError } = await supabase
      .from('entries')
      .select('id, user_id, content')
      .eq('processed', false)
      .limit(100);

    if (fetchError) {
      throw fetchError;
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({ success: true, message: 'No unprocessed entries found.' });
    }

    // 3. Group entries by user_id for batched processing
    const userEntriesMap: Record<string, typeof entries> = {};
    for (const entry of entries) {
      if (!userEntriesMap[entry.user_id]) {
        userEntriesMap[entry.user_id] = [];
      }
      userEntriesMap[entry.user_id].push(entry);
    }

    const results = [];

    // 4. Process each user's batch of entries
    for (const [userId, userEntries] of Object.entries(userEntriesMap)) {
      // Concatenate all entries for this user into a single text block
      const concatenatedContent = userEntries
        .map((e, index) => `Entry ${index + 1}:\n"""\n${e.content}\n"""`)
        .join('\n\n');

      const prompt = `Extract the knowledge graph entities, events, and relationships from the following journal entries written by the user.
Analyze them together to form a coherent set of extractions.
Only return a JSON object matching the exact schema provided.

Journal Entries:
${concatenatedContent}`;

      try {
        const response = await geminiClient.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: KnowledgeGraphSchema,
            temperature: 0.1,
          }
        });

        if (!response.text) {
          console.error(`Failed to generate content for user ${userId}`);
          continue;
        }

        const extractedData = JSON.parse(response.text);

        // Process Memories (Entities) with Merge Strategy
        const memoryIdMap: Record<string, string> = {};

        if (extractedData.entities && Array.isArray(extractedData.entities)) {
          for (const entity of extractedData.entities) {
            if (!entity.name) continue;
            const normalizedName = entity.name.trim().toLowerCase();

            const { data: existing } = await supabase
              .from('memories')
              .select('id, mention_count')
              .ilike('name', normalizedName)
              .eq('user_id', userId)
              .maybeSingle();

            if (existing) {
              const { data: updated } = await supabase
                .from('memories')
                .update({
                  mention_count: (existing.mention_count || 0) + 1,
                  last_seen: new Date().toISOString(),
                })
                .eq('id', existing.id)
                .select('id')
                .single();
              if (updated) memoryIdMap[normalizedName] = updated.id;
            } else {
              const { data: inserted } = await supabase
                .from('memories')
                .insert({
                  user_id: userId,
                  type: entity.type || 'other',
                  name: entity.name,
                  summary: entity.summary,
                  metadata: entity.metadata || {},
                  confidence: entity.confidence || 1.0,
                  status: 'proposed'
                })
                .select('id')
                .single();
              if (inserted) memoryIdMap[normalizedName] = inserted.id;
            }
          }
        }

        // Process Events
        if (extractedData.events && Array.isArray(extractedData.events)) {
          for (const event of extractedData.events) {
            if (!event.name) continue;
            await supabase.from('events').insert({
              user_id: userId,
              name: event.name,
              summary: event.summary,
              event_date: event.eventDate,
              confidence: event.confidence || 1.0,
              metadata: event.metadata || {}
            });
          }
        }

        // Process Relationships
        if (extractedData.relationships && Array.isArray(extractedData.relationships)) {
          for (const rel of extractedData.relationships) {
            if (!rel.sourceEntityName || !rel.targetEntityName) continue;
            const sourceId = memoryIdMap[rel.sourceEntityName.trim().toLowerCase()];
            const targetId = memoryIdMap[rel.targetEntityName.trim().toLowerCase()];

            if (sourceId && targetId) {
              await supabase.from('relationships').insert({
                user_id: userId,
                source_memory_id: sourceId,
                relation: rel.relation || 'RELATED_TO',
                target_memory_id: targetId,
                confidence: rel.confidence || 1.0
              });
            }
          }
        }

        // Mark entries as processed
        const entryIds = userEntries.map(e => e.id);
        await supabase
          .from('entries')
          .update({ processed: true })
          .in('id', entryIds);

        results.push({ userId, processedCount: entryIds.length });

      } catch (err) {
        console.error(`Error processing batch for user ${userId}:`, err);
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
export async function GET(req: Request) {
  // Allow GET as well for simple web triggers, but keep same verification
  return POST(req);
}
