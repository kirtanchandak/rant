import { GoogleGenAI, Type, Schema } from '@google/genai';

// Initialize the client. It automatically picks up GEMINI_API_KEY from the environment.
export const geminiClient = new GoogleGenAI({});

export const KnowledgeGraphSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    entities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: "Must be one of: person, relationship, organization, company, project, goal, skill, task, habit, preference, belief, interest, book, movie, music, podcast, game, sport, team, athlete, place, country, city, location, device, vehicle, product, food, drink, restaurant, event, other",
          },
          name: {
            type: Type.STRING,
            description: "The normalized name of the entity",
          },
          summary: {
            type: Type.STRING,
            description: "A brief summary or description of the entity based on the context",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score between 0.0 and 1.0",
          },
          metadata: {
            type: Type.OBJECT,
            description: "Any additional metadata relevant to the entity (optional)",
          }
        },
        required: ["type", "name", "confidence"]
      }
    },
    events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The name of the event",
          },
          summary: {
            type: Type.STRING,
            description: "A brief summary of what happened",
          },
          eventDate: {
            type: Type.STRING,
            description: "The date or approximate time of the event if mentioned",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score between 0.0 and 1.0",
          },
          metadata: {
            type: Type.OBJECT,
          }
        },
        required: ["name", "confidence"]
      }
    },
    relationships: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sourceEntityName: {
            type: Type.STRING,
            description: "The name of the source entity",
          },
          relation: {
            type: Type.STRING,
            description: "The relationship type (e.g. USES, CHILD_OF, LIKES, CREATED_BY)",
          },
          targetEntityName: {
            type: Type.STRING,
            description: "The name of the target entity",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score between 0.0 and 1.0",
          }
        },
        required: ["sourceEntityName", "relation", "targetEntityName", "confidence"]
      }
    }
  },
  required: ["entities", "events", "relationships"]
};
