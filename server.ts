import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Lazy initialize Gemini client
  let ai: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required");
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  }

  // API endpoint for Asking Intellion questions about evaluation and anomalies
  app.post("/api/ask-intellion", async (req, res) => {
    try {
      const { question, observations, nodesContext } = req.body;

      if (!question) {
        return res.status(400).json({ error: "No question provided in body" });
      }

      // Safe guard when GEMINI_API_KEY has not been configured in the interface yet
      if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in the environment.");
        
        let localResponse = "";
        const lowerQ = question.toLowerCase();
        
        if (lowerQ.includes("bug") || lowerQ.includes("anomal") || lowerQ.includes("devi") || lowerQ.includes("issue")) {
          localResponse = `💡 **Mock Intellion Analysis** *(To unlock live AI analysis, add your \`GEMINI_API_KEY\` to Settings > Secrets)*:\n\nBased on the current telemetry context, Intellion has flagged **${observations?.length || 0} active anomaly trends**. An issue with negative checkout totals (due to decrement below 0) and address verification white screens are standard regression risks in this test session.`;
        } else if (lowerQ.includes("selector") || lowerQ.includes("code") || lowerQ.includes("test")) {
          localResponse = `💡 **Mock Intellion Selector Helper** *(Add \`GEMINI_API_KEY\` under Settings > Secrets to enable automated refactoring)*:\n\nThe current verified element selector under test is \`@btn-add-to-cart-primary\` or \`button#btn-add-to-cart-primary\`. Make sure your Playwright, Cypress, or Puppeteer test structures accurately verify these classes to prevent false positive regression alarms.`;
        } else {
          localResponse = `✨ **Intellion Core Verification Assistant**\n\nI am ready to help you analyze your application's knowledge maps, but the environment does not have a \`GEMINI_API_KEY\` loaded yet.\n\nTo configure access:\n1. Click the **Settings > Secrets** panel in the upper-right corner of AI Studio.\n2. Add your \`GEMINI_API_KEY\` value.\n\n*Currently, I have received your question:* "${question}" *and can analyze ${nodesContext?.length || 0} mapping nodes and ${observations?.length || 0} telemetry observations!*`;
        }
        return res.json({ answer: localResponse });
      }

      const client = getGeminiClient();

      const promptContext = `
You are the Intellion Verification Console Core Assistant.
Answering human user prompt: "${question}"

--- telemetry inputs ---
Primary Observations: ${JSON.stringify(observations || [])}
Graph Target Nodes: ${JSON.stringify(nodesContext || [])}
---

Explain testing outcomes, selector paths, test optimizations, or the active regressions (deviations) concisely. Answer professionally in clean Markdown with appropriate formatting. Keep it concise, friendly, and structured.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContext,
      });

      res.json({ answer: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "An issue occurred querying Gemini" });
    }
  });

  // Vite middleware for development
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
    console.log(`Fullstack Express + Vite App running on port ${PORT}`);
  });
}

startServer();
