import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert on polytopes, higher-dimensional geometry, and related mathematical concepts.
Your primary sources of information are the Polytope Wiki (https://polytope.miraheze.org/wiki/Main_Page) and the Higher Space website (https://hi.gher.space/).
Use the provided tools to search these websites and the broader web for accurate, up-to-date information to answer the user's questions.
Always provide detailed, mathematically sound explanations. If you use information from a search, cite it appropriately.`;

export async function sendMessageStream(
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  message: string,
  onChunk: (text: string) => void
): Promise<{ text: string; groundingChunks?: any[] }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const fullMessage = `${message}\n\n(Remember to use https://polytope.miraheze.org/wiki/Main_Page and https://hi.gher.space/ as your primary sources if relevant.)`;

    const contents = [
      ...history,
      { role: "user", parts: [{ text: fullMessage }] },
    ];

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.1-pro-preview",
      contents: contents as any,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }, { urlContext: {} }],
      },
    });

    let fullText = "";
    let groundingChunks: any[] | undefined = undefined;

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullText += c.text;
        onChunk(fullText);
      }
      
      if (c.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        groundingChunks = c.candidates[0].groundingMetadata.groundingChunks;
      }
    }

    return {
      text: fullText || "I'm sorry, I couldn't generate a response.",
      groundingChunks: groundingChunks,
    };
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw error;
  }
}
