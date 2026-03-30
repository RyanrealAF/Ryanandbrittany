import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface VerseOption {
  vibe: string;
  text: string;
}

export interface SongAnalysis {
  arc: string;
  coreTheme: string;
  tension: string;
  hooks: {
    label: string;
    text: string;
    why: string;
  }[];
  sunoStyle: string;
}

export async function generateVerseOptions(
  author: string,
  rawInput: string,
  previousVerses: { author: string; text: string }[]
): Promise<VerseOption[]> {
  const model = "gemini-3-flash-preview";
  
  const context = previousVerses.length 
    ? previousVerses.map((v, i) => `[Verse ${i + 1} — ${v.author}]\n${v.text}`).join('\n\n')
    : "This is the first verse.";

  const voiceProfile = author === "Ryan" 
    ? "dominant, street-literate, philosophically sharp — reads the world like a crime scene"
    : "emotional weight, warmth, unflinching honesty — names the thing nobody else will";

  const prompt = `You are a boom-bap lyricist and co-creator. You receive raw unstructured input and transform it into three distinct verse options (8-12 bars each).
  
  Current Song Context:
  ${context}
  
  Current Author: ${author}
  Voice Profile: ${voiceProfile}
  
  Raw Input: "${rawInput}"
  
  Generate 3 distinct verse options. Each should:
  - Be 8-12 bars with line breaks.
  - Flow from previous verses.
  - Use the raw input as emotional source.
  - Have a distinct vibe.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                vibe: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ["vibe", "text"]
            }
          }
        },
        required: ["options"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  return result.options || [];
}

export async function generateSongAnalysis(
  verses: { author: string; text: string }[]
): Promise<SongAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const context = verses.map((v, i) => `[Verse ${i + 1} — ${v.author}]\n${v.text}`).join('\n\n');

  const prompt = `Analyze these four song verses and provide a narrative arc, core theme, thematic tension, and 3 hook options. Also provide a Suno-style music generation prompt.
  
  Verses:
  ${context}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          arc: { type: Type.STRING },
          coreTheme: { type: Type.STRING },
          tension: { type: Type.STRING },
          hooks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                text: { type: Type.STRING },
                why: { type: Type.STRING }
              },
              required: ["label", "text", "why"]
            }
          },
          sunoStyle: { type: Type.STRING }
        },
        required: ["arc", "coreTheme", "tension", "hooks", "sunoStyle"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
