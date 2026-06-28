import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { geminiClient, KnowledgeGraphSchema } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { journalEntryId } = await req.json();

    if (!journalEntryId) {
      return NextResponse.json({ error: 'journalEntryId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Authenticate request
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the raw journal entry
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .select('content, id')
      .eq('id', journalEntryId)
      .eq('user_id', user.id)
      .single();

    if (entryError || !entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Extract knowledge using Gemini 1.5 Flash
    const prompt = `Extract the knowledge graph entities, events, and relationships from the following journal entry.
Only return a JSON object matching the exact schema provided.

Journal Entry:
"""
${entry.content}
"""`;

    const response = await geminiClient.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: KnowledgeGraphSchema,
        temperature: 0.1, // Low temperature for consistent extraction
      }
    });

    if (!response.text) {
      return NextResponse.json({ error: 'Failed to extract knowledge' }, { status: 500 });
    }

    const extractedData = JSON.parse(response.text);

    // 1. Process Memories (Entities)
    const memoryIdMap: Record<string, string> = {};

    if (extractedData.entities && Array.isArray(extractedData.entities)) {
      for (const entity of extractedData.entities) {
        if (!entity.name) continue;
        
        const normalizedName = entity.name.trim().toLowerCase();
        
        // Search for existing memory
        const { data: existing } = await supabase
          .from('memories')
          .select('id, mention_count')
          .ilike('name', normalizedName)
          .eq('user_id', user.id)
          .single();

        if (existing) {
          // Update existing memory
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
          // Insert new memory
          const { data: inserted } = await supabase
            .from('memories')
            .insert({
              user_id: user.id,
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

    // 2. Process Events
    if (extractedData.events && Array.isArray(extractedData.events)) {
      for (const event of extractedData.events) {
        if (!event.name) continue;
        await supabase.from('events').insert({
          user_id: user.id,
          name: event.name,
          summary: event.summary,
          event_date: event.eventDate,
          confidence: event.confidence || 1.0,
          metadata: event.metadata || {}
        });
      }
    }

    // 3. Process Relationships
    if (extractedData.relationships && Array.isArray(extractedData.relationships)) {
      for (const rel of extractedData.relationships) {
        if (!rel.sourceEntityName || !rel.targetEntityName) continue;
        
        const sourceId = memoryIdMap[rel.sourceEntityName.trim().toLowerCase()];
        const targetId = memoryIdMap[rel.targetEntityName.trim().toLowerCase()];
        
        if (sourceId && targetId) {
          await supabase.from('relationships').insert({
            user_id: user.id,
            source_memory_id: sourceId,
            relation: rel.relation || 'RELATED_TO',
            target_memory_id: targetId,
            confidence: rel.confidence || 1.0
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error: any) {
    console.error('Error processing knowledge graph:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
