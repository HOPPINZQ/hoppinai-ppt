
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

const SLIDE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    content: { type: Type.ARRAY, items: { type: Type.STRING } },
    notes: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['title', 'content', 'feature', 'summary'] },
    visualType: { type: Type.STRING, enum: ['chart', 'icon-grid', 'none', 'pie-chart', 'flow-chart', 'radar', 'radial-bar', 'area-chart'] }
  },
  required: ['title', 'content', 'type']
};

export const generateFullDeck = async (topic: string, lang: Language = 'zh'): Promise<Slide[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langName = getLanguageName(lang);
  
  const prompt = `
    Create a complete 6-slide professional presentation about: "${topic}".
    
    Slide Structure & Visuals:
    1. Title Slide (type: 'title')
    2. Agenda/Overview (type: 'content', visualType: 'icon-grid')
    3. Technical Capability Analysis (type: 'content', visualType: 'radar') - Use 5-6 dimensions like Performance, Security, Cost, Scalability, Ease of Use.
    4. Market Adoption/落地进度 (type: 'content', visualType: 'radial-bar')
    5. Trend Analysis (type: 'content', visualType: 'area-chart')
    6. Summary & Conclusion (type: 'summary', visualType: 'chart')
    
    CRITICAL: Use ONLY ${langName} for all text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: SLIDE_SCHEMA
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
    Analyze the following text and generate a refined PPT deck (6-8 slides).
    Text: ${rawText}
    Assign diverse visual types: 'radar' for capabilities, 'radial-bar' for scores, 'area-chart' for growth.
    Use ONLY ${langName}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: SLIDE_SCHEMA
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
    Generate 2-3 additional slides for: "${currentTopic}". Use advanced visuals like 'radar' or 'area-chart'.
    Use ONLY ${langName}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: SLIDE_SCHEMA
        }
      }
    });

    const newSlidesData = JSON.parse(response.text || '[]');
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
  const prompt = `Regenerate the slide "${slide.title}". Use a cool visualType like 'radar', 'radial-bar', or 'area-chart'. Use ONLY ${langName}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: SLIDE_SCHEMA
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
  const systemInstruction = `You are a professional presentation expert. Suggest cool visuals: radar charts, radial bars, etc. Respond in ${langName}.`;

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
              items: SLIDE_SCHEMA
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
