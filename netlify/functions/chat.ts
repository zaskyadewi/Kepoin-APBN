import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../../src/systemInstruction";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "GEMINI_API_KEY belum terdeteksi di Netlify Environment Variables. Silakan buka Dashboard Netlify > Site configuration > Environment variables, buat key bernama 'GEMINI_API_KEY' dengan value API Key Google AI Studio Anda, lalu lakukan 'Clear cache and deploy site'."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const body = await req.json();
    const { prompt, history } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required and must be a string." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
    });

    const answer = response.text || "Wah, maaf sepertinya ada sedikit kendala koneksi dengan otakku. Coba lagi yah!";
    return new Response(JSON.stringify({ text: answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Gemini API Error (Netlify Function):", error);
    return new Response(
      JSON.stringify({
        error: `Gagal memproses AI: ${error?.message || "Periksa validitas API Key Google Anda."}`,
        details: error?.message || String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
