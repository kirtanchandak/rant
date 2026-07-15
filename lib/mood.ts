import { geminiClient } from '@/lib/gemini'
import { Type, Schema } from '@google/genai'

// Structured output schema for mood analysis
export const MoodAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    mood_score: {
      type: Type.INTEGER,
      description:
        'Overall mood score from 0 to 100. 0 = very negative/distressed, 50 = neutral, 100 = very positive/joyful.',
    },
    mood_label: {
      type: Type.STRING,
      description:
        'A single word mood label. Must be one of: happy, stressed, calm, anxious, excited, reflective, frustrated, grateful, neutral, sad, hopeful, tired, confident, overwhelmed, content, angry, inspired, bored, lonely, proud',
    },
    emotions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          emotion: {
            type: Type.STRING,
            description: 'Name of the detected emotion (e.g. excitement, anxiety, gratitude, frustration)',
          },
          intensity: {
            type: Type.NUMBER,
            description: 'Intensity of the emotion from 0.0 to 1.0',
          },
        },
        required: ['emotion', 'intensity'],
      },
      description: 'Array of detected emotions with their intensity levels. Return 1-4 emotions.',
    },
    summary: {
      type: Type.STRING,
      description:
        'A one-sentence summary of the emotional tone of the entry. Write in third person, e.g. "Feeling optimistic about the new project launch but slightly nervous about the deadline."',
    },
  },
  required: ['mood_score', 'mood_label', 'emotions', 'summary'],
}

export type MoodAnalysisResult = {
  mood_score: number
  mood_label: string
  emotions: { emotion: string; intensity: number }[]
  summary: string
}

/**
 * Analyze the mood/sentiment of a single journal entry.
 */
export async function analyzeMood(content: string): Promise<MoodAnalysisResult> {
  const prompt = `Analyze the emotional tone and mood of the following journal entry.
Consider the overall sentiment, specific emotions expressed, and the writer's state of mind.
Only return a JSON object matching the exact schema provided.

Journal Entry:
"""
${content}
"""`

  const response = await geminiClient.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: MoodAnalysisSchema,
      temperature: 0.1,
    },
  })

  if (!response.text) {
    throw new Error('Gemini returned no text for mood analysis')
  }

  return JSON.parse(response.text) as MoodAnalysisResult
}
