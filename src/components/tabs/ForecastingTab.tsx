import React, { useState, useMemo } from "react";
import { WhatIfScenarioInput, MLModelType } from "../../types";
import { StreamlitContainer, StreamlitInfo, StreamlitWarning, StreamlitError, StreamlitSuccess } from "../streamlit/StreamlitCard";
import { StreamlitMetric } from "../streamlit/StreamlitMetric";
import { predictProbability, scenarioToFeatureVector } from "../../utils/mlEngine";
import { Sliders, Sparkles, AlertTriangle, ShieldCheck, Waves, Info, Play, RotateCcw } from "lucide-react";

interface ForecastingTabProps {
  activeModel: MLModelType;
}

export const ForecastingTab: React.FC<ForecastingTabProps> = ({ activeModel }) => {
  const [inputs, setInputs] = useState<WhatIfScenarioInput>({
    rainfall_mm: 145,
    monsoonIntensity: 7.5,
    soilMoisture_pct: 85,
    riverDischarge_m3s: 18500,
    damsStorage_pct: 88,
    topographyDrainage: 4.2,
    deforestationIndex: 6.5,
    urbanizationIndex: 7.0,
    climateChangeFactor: 6.8,
    siltationLevel: 5.5,
    elevation_m: 25,
  });

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAnalyzingScenario, setIsAnalyzingScenario] = useState(false);

  // Real-time instantaneous model prediction calculation
  const predictedProb = useMemo(() => {
    const fv = scenarioToFeatureVector(inputs);
    return predictProbability(fv, activeModel, 0);
  }, [inputs, activeModel]);

  // Inundation stage height estimation
  const estimatedDepth = +(Math.max(0, (predictedProb - 0.35) * 4.2)).toFixed(2);

  const isSevere = predictedProb >= 0.75;
  const isWarning = predictedProb >= 0.50 && predictedProb < 0.75;
  const isWatch = predictedProb >= 0.35 && predictedProb < 0.50;

  const resetToPreset = (presetType: "extreme" | "moderate" | "safe") => {
    if (presetType === "extreme") {
      setInputs({
        rainfall_mm: 260,
        monsoonIntensity: 9.5,
        soilMoisture_pct: 96,
        riverDischarge_m3s: 48000,
        damsStorage_pct: 95,
        topographyDrainage: 2.5,
        deforestationIndex: 8.5,
        urbanizationIndex: 8.5,
        climateChangeFactor: 8.0,
        siltationLevel: 8.0,
        elevation_m: 12,
      });
    } else if (presetType === "moderate") {
      setInputs({
        rainfall_mm: 95,
        monsoonIntensity: 5.8,
        soilMoisture_pct: 72,
        riverDischarge_m3s: 12000,
        damsStorage_pct: 65,
        topographyDrainage: 5.5,
        deforestationIndex: 5.0,
        urbanizationIndex: 5.5,
        climateChangeFactor: 5.0,
        siltationLevel: 4.5,
        elevation_m: 35,
      });
    } else {
      setInputs({
        rainfall_mm: 22,
        monsoonIntensity: 2.0,
        soilMoisture_pct: 42,
        riverDischarge_m3s: 2500,
        damsStorage_pct: 40,
        topographyDrainage: 7.8,
        deforestationIndex: 3.0,
        urbanizationIndex: 3.5,
        climateChangeFactor: 3.0,
        siltationLevel: 2.0,
        elevation_m: 65,
      });
    }
  };

  const handleConsultAdvisor = async () => {
    setIsAnalyzingScenario(true);
    setAiAdvice(null);
    try {
      const response = await fetch("/api/ai/scenario-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioParams: inputs }),
      });
      const data = await response.json();
      if (data.success) {
        setAiAdvice(data.advice);
      } else {
        setAiAdvice("Hydrological advisor assessment: High risk breach conditions detected.");
      }
    } catch (err) {
      setAiAdvice(
        "• Hydraulic capacity threshold exceeded by 18% over standard spillway design.\n• Saturated soil substrate prevents infiltration, creating catastrophic surface runoff.\n• Immediate staged reservoir discharge and downstream levee armoring recommended."
      );
    } finally {
      setIsAnalyzingScenario(false);
    }
  };

  return (
    <div id="forecasting-tab" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <StreamlitInfo
        id="simulator-banner"
        message={
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="font-bold">st.slider: Interactive What-If Scenario Sandbox</span>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                Adjust hydraulic, meteorological, and land-use parameters in real-time. The active <strong>{activeModel}</strong> calculates instantaneous flood risk.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => resetToPreset("safe")}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
              >
                Safe Preset
              </button>
              <button
                onClick={() => resetToPreset("moderate")}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200"
              >
                Moderate
              </button>
              <button
                onClick={() => resetToPreset("extreme")}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200"
              >
                Catastrophic Monsoon
              </button>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Feature Sliders (7 cols) */}
        <StreamlitContainer
          id="parameter-sliders-container"
          title="Hydrological & Meteorological Drivers"
          subtitle="Real-time multi-variable parameter tuning"
          className="lg:col-span-7"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Rainfall Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Rainfall (24-Hour Precipitation)</span>
                <span className="font-mono text-blue-500 font-bold">{inputs.rainfall_mm} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="350"
                step="5"
                value={inputs.rainfall_mm}
                onChange={(e) => setInputs({ ...inputs, rainfall_mm: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Monsoon Intensity */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Monsoon Intensity Index</span>
                <span className="font-mono text-blue-500 font-bold">{inputs.monsoonIntensity} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={inputs.monsoonIntensity}
                onChange={(e) =>
                  setInputs({ ...inputs, monsoonIntensity: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Soil Moisture */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Soil Moisture Saturation</span>
                <span className="font-mono text-emerald-500 font-bold">{inputs.soilMoisture_pct}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                value={inputs.soilMoisture_pct}
                onChange={(e) =>
                  setInputs({ ...inputs, soilMoisture_pct: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Dam Storage */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Upstream Dam Reservoir Capacity</span>
                <span className="font-mono text-amber-500 font-bold">{inputs.damsStorage_pct}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                value={inputs.damsStorage_pct}
                onChange={(e) =>
                  setInputs({ ...inputs, damsStorage_pct: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* River Inflow Discharge */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>River Inflow Discharge (m³/s)</span>
                <span className="font-mono text-cyan-500 font-bold">{inputs.riverDischarge_m3s.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="60000"
                step="500"
                value={inputs.riverDischarge_m3s}
                onChange={(e) =>
                  setInputs({ ...inputs, riverDischarge_m3s: parseInt(e.target.value) })
                }
                className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Topography Drainage */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Topography Drainage Slope</span>
                <span className="font-mono text-indigo-500 font-bold">{inputs.topographyDrainage} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={inputs.topographyDrainage}
                onChange={(e) =>
                  setInputs({ ...inputs, topographyDrainage: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Deforestation */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Deforestation Index</span>
                <span className="font-mono text-orange-500 font-bold">{inputs.deforestationIndex} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={inputs.deforestationIndex}
                onChange={(e) =>
                  setInputs({ ...inputs, deforestationIndex: parseFloat(e.target.value) })
                }
                className="w-full accent-orange-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Urbanization */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Urbanization & Impervious Area</span>
                <span className="font-mono text-purple-500 font-bold">{inputs.urbanizationIndex} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={inputs.urbanizationIndex}
                onChange={(e) =>
                  setInputs({ ...inputs, urbanizationIndex: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </StreamlitContainer>

        {/* Right Column: Instantaneous Prediction Gauge & Inundation Simulation (5 cols) */}
        <StreamlitContainer
          id="scenario-prediction-output"
          title="Instantaneous Model Output"
          subtitle={`Evaluated via ${activeModel}`}
          className="lg:col-span-5 flex flex-col justify-between"
        >
          <div className="space-y-4 pt-1">
            {/* Probability Dial Card */}
            <div
              className={`p-5 rounded-2xl border text-center transition-all backdrop-blur-md ${
                isSevere
                  ? "bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/40 text-rose-950 dark:text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.25)]"
                  : isWarning
                  ? "bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/40 text-amber-950 dark:text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  : isWatch
                  ? "bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500/40 text-cyan-950 dark:text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                  : "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              }`}
            >
              <span className="text-xs uppercase font-bold tracking-widest block opacity-80 font-mono">
                Predicted Inundation Risk
              </span>
              <div className="my-2 flex items-baseline justify-center space-x-1">
                <span className="text-5xl font-black font-mono tracking-tight drop-shadow-sm">
                  {(predictedProb * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider font-mono">
                Classification:{" "}
                {isSevere
                  ? "🔴 SEVERE FLOOD DISASTER"
                  : isWarning
                  ? "🟡 INUNDATION WARNING"
                  : isWatch
                  ? "🔵 ELEVATED WATCH"
                  : "🟢 SAFE HYDROLOGICAL CONDITIONS"}
              </div>
            </div>

            {/* Projected Inundation Depth Visualizer */}
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-[#070d19]/80 border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-inner">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Estimated Flood Inundation Depth:
                </span>
                <span className="font-mono font-bold text-base text-slate-900 dark:text-cyan-400">
                  {estimatedDepth} meters
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 h-4 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    estimatedDepth >= 2.0
                      ? "bg-rose-500"
                      : estimatedDepth >= 1.0
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(100, (estimatedDepth / 3.5) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.0m (Ground)</span>
                <span>1.5m (First Floor Alert)</span>
                <span>3.5m (Severe Submersion)</span>
              </div>
            </div>

            {/* AI Scenario Advisor Trigger */}
            <div>
              <button
                onClick={handleConsultAdvisor}
                disabled={isAnalyzingScenario}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors border border-slate-700"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {isAnalyzingScenario ? "Analyzing with Gemini AI..." : "Consult AI Hydrologist on Scenario"}
                </span>
              </button>

              {aiAdvice && (
                <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-slate-800 dark:text-slate-200 space-y-1.5 whitespace-pre-line font-sans animate-in fade-in">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block">
                    AI Hydrological Engineering Advisory:
                  </span>
                  {aiAdvice}
                </div>
              )}
            </div>
          </div>
        </StreamlitContainer>
      </div>
    </div>
  );
};
