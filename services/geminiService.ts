
import { Slide, ModelConfig } from "../types";
import { Language } from "../locales";

const ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

const getLanguageName = (lang: Language) => {
  switch(lang) {
    case 'zh': return 'Simplified Chinese';
    case 'en': return 'English';
    case 'ja': return 'Japanese';
    case 'ko': return 'Korean';
    default: return 'Simplified Chinese';
  }
};

/**
 * Core function to communicate with GLM API
 */
const callGLM = async (prompt: string, modelConfig: ModelConfig, systemMsg: string = "") => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing in environment variables.");

  const messages = [];
  if (systemMsg) {
    messages.push({ role: "system", content: systemMsg });
  }
  messages.push({ role: "user", content: prompt });

  const response = await fetch(ZHIPU_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelConfig.model,
      messages: messages,
      temperature: modelConfig.temperature ?? 0.7,
      top_p: modelConfig.topP ?? 0.7,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `GLM API Error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse GLM JSON content:", content);
    throw new Error("AI returned invalid JSON structure.");
  }
};

export const generateFullDeck = async (topic: string, lang: Language = 'zh', modelConfig: ModelConfig): Promise<Slide[]> => {
  const langName = getLanguageName(lang);
  
  const systemMsg = `You are a world-class presentation designer. 
  You must output a JSON object containing a "slides" array.
  Each slide must follow this schema:
  {
    "title": "Slide Title",
    "subtitle": "Brief subtitle",
    "content": ["Point 1", "Point 2", "Point 3"],
    "notes": "Speaker guidance",
    "type": "title" | "content" | "feature" | "summary",
    "visualType": "chart" | "icon-grid" | "none" | "pie-chart" | "flow-chart" | "radar" | "radial-bar" | "area-chart"
  }
  Important: All text must be in ${langName}. Generate exactly 6 professional slides.`;

  const prompt = `Create a deep, professional 6-slide presentation about: "${topic}". 
  Ensure technical accuracy and sophisticated language.
  Slides should cover: Title, Overview, Core Tech Analysis, Market Dynamics, Future Projections, and Summary.`;

  try {
    const data = await callGLM(prompt, modelConfig, systemMsg);
    const slides = data.slides || [];
    
    return slides.map((s: any, index: number) => ({
      ...s,
      id: `glm-${Date.now()}-${index}`,
      backgroundGradient: s.type === 'title' || s.type === 'summary' ? 'from-slate-100 to-slate-200' : 'from-white to-slate-50'
    }));
  } catch (error) {
    console.error("Full Deck Generation Error:", error);
    throw error;
  }
};

export const generateMoreSlides = async (currentTopic: string, lang: Language = 'zh', modelConfig: ModelConfig): Promise<Slide[]> => {
  const langName = getLanguageName(lang);
  const systemMsg = `You are a professional presentation assistant. Return a JSON object with a "slides" array of 2-3 new slides. Language: ${langName}.`;
  const prompt = `Based on the context of "${currentTopic}", generate 2-3 additional deep-dive slides using advanced visuals like 'radar' or 'area-chart'.`;

  try {
    const data = await callGLM(prompt, modelConfig, systemMsg);
    const slides = data.slides || [];
    return slides.map((s: any, index: number) => ({
      ...s,
      id: `gen-glm-${Date.now()}-${index}`,
      backgroundGradient: 'from-white to-slate-50'
    }));
  } catch (error) {
    console.error("GLM More Slides Error:", error);
    throw error;
  }
};

export const regenerateSingleSlide = async (slide: Slide, lang: Language = 'zh', modelConfig: ModelConfig): Promise<Slide> => {
  const langName = getLanguageName(lang);
  const systemMsg = `You are a professional presentation editor. Return a single slide JSON object. Language: ${langName}.`;
  const prompt = `Regenerate this slide with more depth and better phrasing: "${slide.title}". Keep the same visualType if appropriate or upgrade it to 'radar' or 'area-chart'.`;

  try {
    const data = await callGLM(prompt, modelConfig, systemMsg);
    // Handle both wrapped and unwrapped response
    const result = data.slides ? data.slides[0] : data;
    return { ...slide, ...result, id: slide.id };
  } catch (error) {
    console.error("Regenerate Slide Error:", error);
    throw error;
  }
};

export const generateSlidesFromChat = async (prompt: string, currentSlides: Slide[], lang: Language = 'zh'): Promise<{ reply: string; slides: Slide[] }> => {
  const langName = getLanguageName(lang);
  const slidesContext = currentSlides.map(s => s.title).join(', ');
  
  const systemMsg = `You are a professional AI presentation consultant. 
  Current context: ${slidesContext}.
  You must return a JSON object: { "reply": "Your conversational response", "slides": [Optional new slide objects] }.
  Language: ${langName}.`;

  try {
    const chatConfig: ModelConfig = { model: 'glm-4.5-flash', temperature: 0.7, topP: 0.7 };
    const data = await callGLM(prompt, chatConfig, systemMsg);
    
    const slides = (data.slides || []).map((s: any, index: number) => ({
      ...s,
      id: `chat-glm-${Date.now()}-${index}`,
      backgroundGradient: 'from-white to-slate-50'
    }));
    return { reply: data.reply || "我已根据您的要求处理了内容。", slides };
  } catch (error) {
    console.error("Chat Error:", error);
    return { reply: "抱歉，在处理您的请求时遇到了技术挑战。", slides: [] };
  }
};
