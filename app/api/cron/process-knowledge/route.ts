import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { geminiClient, KnowledgeGraphSchema } from '@/lib/gemini';
import { analyzeMood } from '@/lib/mood';

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

    const results = [];

    if (entries && entries.length > 0) {
      // 3. Group entries by user_id for batched processing
      const userEntriesMap: Record<string, typeof entries> = {};
      for (const entry of entries) {
        if (!userEntriesMap[entry.user_id]) {
          userEntriesMap[entry.user_id] = [];
        }
        userEntriesMap[entry.user_id].push(entry);
      }

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
    }

    // =========================================================
    // 5. Mood Analysis Pass
    // Process entries that have no mood analysis yet (limit 50)
    // =========================================================
    let moodProcessed = 0;

    const { data: unmoodedEntries, error: moodFetchError } = await supabase
      .from('entries')
      .select('id, user_id, content')
      .not('content', 'eq', '')
      .order('created_at', { ascending: true })
      .limit(50);

    if (!moodFetchError && unmoodedEntries && unmoodedEntries.length > 0) {
      // Filter out entries that already have moods
      const entryIds = unmoodedEntries.map(e => e.id);
      const { data: existingMoods } = await supabase
        .from('entry_moods')
        .select('entry_id')
        .in('entry_id', entryIds);

      const existingMoodEntryIds = new Set((existingMoods || []).map(m => m.entry_id));
      const entriesToProcess = unmoodedEntries.filter(e => !existingMoodEntryIds.has(e.id));

      for (const entry of entriesToProcess) {
        if (!entry.content.trim()) continue;
        try {
          const moodResult = await analyzeMood(entry.content);

          await supabase.from('entry_moods').insert({
            entry_id: entry.id,
            user_id: entry.user_id,
            mood_score: Math.max(0, Math.min(100, moodResult.mood_score)),
            mood_label: moodResult.mood_label,
            emotions: moodResult.emotions,
            summary: moodResult.summary,
          });

          moodProcessed++;
        } catch (err) {
          console.error(`Error analyzing mood for entry ${entry.id}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      knowledge: results,
      moodProcessed,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Cron job error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
export async function GET(req: Request) {
  // Allow GET as well for simple web triggers, but keep same verification
  return POST(req);
}
