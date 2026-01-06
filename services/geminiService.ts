
import { GoogleGenAI, Type } from "@google/genai";
import { Slide, ChatMessage } from "../types";
import { Language } from "../locales";

const getLanguageName = (lang: Language) => {
  switch(lang) {
    case 'zh': return 'Simplified Chinese';
    case 'en': return 'English';
    case 'ja': return 'Japanese';
    case 'ko': return 'Korean';
    default: return 'Simplified Chinese';
  }
};

export const generateFullDeck = async (topic: string, lang: Language = 'zh'): Promise<Slide[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langName = getLanguageName(lang);
  
  const prompt = `
    Create a complete 6-slide professional presentation about: "${topic}".
    
    Slide Structure:
    1. Title Slide (type: 'title')
    2. Agenda/Overview (type: 'content', visualType: 'icon-grid')
    3. Technical/Core Concept (type: 'content', visualType: 'flow-chart')
    4. Data/Market Analysis (type: 'content', visualType: 'chart')
    5. Strategic Outlook (type: 'content', visualType: 'pie-chart')
    6. Summary & Conclusion (type: 'summary', visualType: 'chart')
    
    Ensure the content is insightful and professional. 
    CRITICAL: Use ONLY ${langName} for all text.
    Strictly follow the JSON schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              content: { type: Type.ARRAY, items: { type: Type.STRING } },
              notes: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['title', 'content', 'feature', 'summary'] },
              visualType: { type: Type.STRING, enum: ['chart', 'icon-grid', 'none', 'pie-chart', 'flow-chart'] }
            },
            required: ['title', 'content', 'type']
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    return data.map((s: any, index: number) => ({
      ...s,
      id: `init-${Date.now()}-${index}`,
      backgroundGradient: s.type === 'title' || s.type === 'summary' ? 'from-slate-100 to-slate-200' : 'from-white to-slate-50'
    }));
  } catch (error) {
    console.error("Full Deck Generation Error:", error);
    throw error;
  }
};

export const processTemplateContent = async (rawText: string, lang: Language = 'zh'): Promise<Slide[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langName = getLanguageName(lang);
  
  const prompt = `
    You are an AI presentation expert. I have extracted the following text from an existing PPT template:
    ---
    ${rawText}
    ---
    Please analyze this content and:
    1. Summarize the core theme.
    2. Generate a refined and professionally rewritten version of these slides (6-8 slides).
    3. If the content is sparse, expand it with relevant professional insights.
    4. Use ONLY ${langName} for all output text.
    5. Ensure each slide has a logical 'visualType'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              content: { type: Type.ARRAY, items: { type: Type.STRING } },
              notes: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['title', 'content', 'feature', 'summary'] },
              visualType: { type: Type.STRING, enum: ['chart', 'icon-grid', 'none', 'pie-chart', 'flow-chart'] }
            },
            required: ['title', 'content', 'type']
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    return data.map((s: any, index: number) => ({
      ...s,
      id: `tmpl-${Date.now()}-${index}`,
      backgroundGradient: s.type === 'title' || s.type === 'summary' ? 'from-slate-100 to-slate-200' : 'from-white to-slate-50'
    }));
  } catch (error) {
    console.error("Template Processing Error:", error);
    throw error;
  }
};

export const generateMoreSlides = async (currentTopic: string, lang: Language = 'zh'): Promise<Slide[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langName = getLanguageName(lang);
  
  const prompt = `
    Based on the following existing slides: "${currentTopic}", 
    generate 2-3 additional professional presentation slides in JSON format that expand on the topic.
    Use ONLY ${langName} for all text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              content: { type: Type.ARRAY, items: { type: Type.STRING } },
              notes: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['content', 'feature', 'summary'] },
              visualType: { type: Type.STRING, enum: ['chart', 'icon-grid', 'none', 'pie-chart', 'flow-chart'] }
            },
            required: ['title', 'content', 'type']
          }
        }
      }
    });

    const rawText = response.text;
    const newSlidesData = JSON.parse(rawText || '[]');
    return newSlidesData.map((s: any, index: number) => ({
      ...s,
      id: `gen-${Date.now()}-${index}`,
      backgroundGradient: 'from-white to-slate-50'
    }));
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const regenerateSingleSlide = async (slide: Slide, lang: Language = 'zh'): Promise<Slide> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langName = getLanguageName(lang);
  const prompt = `Regenerate the slide content with title "${slide.title}". Provide deeper insights. Use ONLY ${langName}. Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            content: { type: Type.ARRAY, items: { type: Type.STRING } },
            type: { type: Type.STRING, enum: ['content', 'feature', 'summary'] },
            visualType: { type: Type.STRING, enum: ['chart', 'pie-chart', 'icon-grid', 'flow-chart', 'none'] }
          },
          required: ['title', 'content', 'type']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return { ...slide, ...result };
  } catch (error) {
    console.error("Regenerate Slide Error:", error);
    throw error;
  }
};

export const generateSlidesFromChat = async (prompt: string, currentSlides: Slide[], lang: Language = 'zh'): Promise<{ slides: Slide[], reply: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langName = getLanguageName(lang);
  const systemInstruction = `You are a professional presentation expert. Current slides: ${currentSlides.map(s => s.title).join(', ')}. Respond and generate in ONLY ${langName}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newSlides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  content: { type: Type.ARRAY, items: { type: Type.STRING } },
                  type: { type: Type.STRING, enum: ['content', 'feature', 'summary'] },
                  visualType: { type: Type.STRING, enum: ['chart', 'pie-chart', 'icon-grid', 'flow-chart', 'none'] }
                },
                required: ['title', 'content', 'type']
              }
            },
            reply: { type: Type.STRING }
          },
          required: ['newSlides', 'reply']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const slidesWithIds = (result.newSlides || []).map((s: any, index: number) => ({
      ...s,
      id: `chat-gen-${Date.now()}-${index}`,
      backgroundGradient: 'from-white to-slate-50'
    }));

    return { slides: slidesWithIds, reply: result.reply };
  } catch (error) {
    console.error("Chat Generation Error:", error);
    throw error;
  }
};
