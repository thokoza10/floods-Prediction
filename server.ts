import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// App.py Python Source Code Endpoint
app.get("/api/python/app-code", async (req, res) => {
  try {
    const fs = await import("fs/promises");
    const appPyPath = path.join(process.cwd(), "app.py");
    const reqsPath = path.join(process.cwd(), "requirements.txt");
    
    const [appPyContent, reqsContent] = await Promise.all([
      fs.readFile(appPyPath, "utf-8").catch(() => "# app.py not found"),
      fs.readFile(reqsPath, "utf-8").catch(() => "streamlit>=1.35.0\npandas>=2.0.0"),
    ]);

    res.json({
      success: true,
      appPy: appPyContent,
      requirements: reqsContent,
      filename: "app.py",
      sizeBytes: Buffer.byteLength(appPyContent, "utf8"),
      lastModified: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// AI Hydrology Risk Analysis Endpoint
app.post("/api/ai/analyze-flood-risk", async (req, res) => {
  try {
    const { basin, metrics, forecastData, modelPerformance } = req.body;

    const prompt = `You are a Senior Chief Hydrologist and Disaster Risk Prediction Specialist.
Analyze the following river basin flood telemetry and predictive model output:

Target Basin / Region: ${basin?.name || "Global Monitoring Station"} (${basin?.country || "International"})
Current Gauge Level: ${metrics?.waterLevel || "4.8"} meters (Danger Mark: ${basin?.dangerLevel || "4.5"} m)
24-Hour Rainfall: ${metrics?.rainfall || "120"} mm
River Discharge: ${metrics?.discharge || "3400"} m³/s
Soil Moisture Saturation: ${metrics?.soilMoisture || "88"}%
Monsoon Intensity Index: ${metrics?.monsoonIntensity || "8.5"}/10
Upstream Dam Storage: ${metrics?.damCapacity || "92"}%
Deforestation & Urbanization Index: ${metrics?.urbanization || "7.2"}/10

Model Predicted Flood Probability: ${forecastData?.probability ? (forecastData.probability * 100).toFixed(1) + "%" : "86.4%"}
Model Confidence Level: ${forecastData?.confidence || "High (93.8% AUC)"}

Provide a concise, professional, highly actionable Hydrological Disaster Early Warning Report in clean Markdown formatting:
1. **Executive Risk Summary** (Risk level: LOW / ELEVATED / CRITICAL / CATASTROPHIC, and timeline for peak crest).
2. **Hydraulic & Meteorological Root Causes** (Key contributing variables: rainfall intensity, soil saturation, drainage bottleneck).
3. **72-Hour Inundation Projection** (Expected flood surge behavior and vulnerable downstream zones).
4. **Recommended Emergency Directives** (Dam spillway release strategy, evacuation alerts, floodwall reinforcement, civic advisories).
5. **Model Accuracy & Uncertainty Evaluation** (Brief insight into hydrological non-linearity and sensor reliability).

Keep it authoritative, rigorous, scientific, and realistic.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert hydrological engineer and early warning disaster prediction scientist. Provide clear, structured, and technically accurate flood analysis.",
        temperature: 0.2,
      },
    });

    res.json({
      success: true,
      analysis: response.text || "Report generation completed.",
    });
  } catch (error: any) {
    console.error("Gemini Flood Analysis Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate AI hydrological report.",
    });
  }
});

// Scenario Simulator AI Assistant
app.post("/api/ai/scenario-advisor", async (req, res) => {
  try {
    const { scenarioParams } = req.body;

    const prompt = `Assess the following What-If Flood Scenario simulation:
- Simulated Rainfall: ${scenarioParams.rainfall} mm/day
- River Inflow: ${scenarioParams.discharge} m³/s
- Soil Saturation: ${scenarioParams.soilMoisture}%
- Dam Release Rate: ${scenarioParams.damRelease || 50}%
- Flood Defense Wall Height: ${scenarioParams.wallHeight || 5.0}m

Explain in 3 concise bullet points what specific physical thresholds will be breached and the immediate engineering mitigations needed.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    res.json({
      success: true,
      advice: response.text || "Scenario assessment complete.",
    });
  } catch (error: any) {
    console.error("Scenario Advisor Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Scenario advisor error",
    });
  }
});

// Start Server & Integrate Vite
async function start() {
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
    console.log(`Streamlit Flood Predictor Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
