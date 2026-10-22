import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { SYSTEM_INSTRUCTION } from "./src/systemInstruction";
import { calculateAllocation } from "./src/calculations";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Endpoint to fetch calculated percentages directly
app.post("/api/calculate", (req, res) => {
  const { nominal } = req.body;
  if (!nominal || isNaN(nominal) || nominal <= 0) {
    return res.status(400).json({ error: "Nominal harus berupa angka positif" });
  }

  const results = calculateAllocation(nominal);
  res.json({ nominal, results });
});


// Chat endpoint with state LKPP 2024 system instructions
app.post("/api/chat", async (req, res) => {
  const { prompt, history } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required and must be a string." });
  }

  try {
    // Format history in Gemini 3.5 format for chats
    // The @google/genai SDK chats use a simple format, let's look at the instructions:
    // const chat = ai.chats.create({ model: "gemini-3.5-flash", config: { systemInstruction: ... } });
    // let response = await chat.sendMessage({ message: ... });
    
    // We can use ai.chats or generateContent with history. Let's build the chat history manually for absolute reliability
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
    res.json({ text: answer });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Yah, ada error saat menghubungkan ke asisten APBN. Pastikan API Key di Secrets sudah terisi!",
      details: error.message
    });
  }
});

// Serve frontend application
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kepoin APBN Express server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
