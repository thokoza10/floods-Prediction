/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FloodRecord,
  BasinStation,
  MLModelType,
  Hyperparameters,
  EvaluationResults,
  TrainingMetrics,
} from "./types";
import { MONITORING_STATIONS, HISTORICAL_DATASET, generateFuture7DayForecast } from "./data/floodDatasets";
import { runModelPipeline } from "./utils/mlEngine";
import { StreamlitHeader } from "./components/streamlit/StreamlitHeader";
import { StreamlitSidebar, NavTabId } from "./components/streamlit/StreamlitSidebar";
import { DashboardTab } from "./components/tabs/DashboardTab";
import { ModelTrainingTab } from "./components/tabs/ModelTrainingTab";
import { ForecastingTab } from "./components/tabs/ForecastingTab";
import { DataExplorerTab } from "./components/tabs/DataExplorerTab";
import { GeospatialMapTab } from "./components/tabs/GeospatialMapTab";
import { AiAdvisorTab } from "./components/tabs/AiAdvisorTab";
import { AppPyTab } from "./components/tabs/AppPyTab";
import confetti from "canvas-confetti";

export default function App() {
  // App Themes
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // App Navigation State
  const [activeTab, setActiveTab] = useState<NavTabId>("dashboard");

  // Stations & Dataset
  const [stations, setStations] = useState<BasinStation[]>(MONITORING_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string>("STN-BG-02"); // Default Sirajganj/Brahmaputra (High activity)
  const [dataset, setDataset] = useState<FloodRecord[]>(HISTORICAL_DATASET);

  // Filter States
  const [startDate, setStartDate] = useState<string>("2018-01-01");
  const [endDate, setEndDate] = useState<string>("2026-08-25");
  const [alertThreshold, setAlertThreshold] = useState<number>(0.5);

  // Model & Training States
  const [selectedModel, setSelectedModel] = useState<MLModelType>("XGBoost (Gradient Boosted Trees)");
  const [hyperparams, setHyperparams] = useState<Hyperparameters>({
    trainSplit: 0.8,
    learningRate: 0.05,
    nEstimators: 30,
    maxDepth: 6,
    threshold: 0.5,
    randomSeed: 42,
    kFold: 5,
    regularization: 0.1,
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [epochsMetrics, setEpochsMetrics] = useState<TrainingMetrics[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResults | null>(null);

  // Selected Station Object
  const currentStation = useMemo(() => {
    return stations.find((s) => s.id === selectedStationId) || stations[0];
  }, [stations, selectedStationId]);

  // 7-day Future Forecast for the Selected Station
  const forecast7Days = useMemo(() => {
    return generateFuture7DayForecast(currentStation);
  }, [currentStation]);

  // Execute ML Model Pipeline
  const executeTrainingPipeline = useCallback(
    (customHyperparams?: Hyperparameters, customModel?: MLModelType) => {
      setIsTraining(true);
      setIsRunning(true);
      setTrainingProgress(0);

      const activeHp = customHyperparams || hyperparams;
      const activeM = customModel || selectedModel;

      const pipelineOutput = runModelPipeline(dataset, activeM, activeHp);

      // Animate progress smoothly across epochs
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setTrainingProgress(Math.min(100, currentProgress));

        if (currentProgress >= 100) {
          clearInterval(interval);
          setEpochsMetrics(pipelineOutput.epochsMetrics);
          setEvaluation(pipelineOutput.evaluation);
          setIsTraining(false);
          setIsRunning(false);

          // Confetti celebratory burst for high accuracy
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
            });
          } catch (e) {
            // Ignore if canvas-confetti is not loaded in sandbox
          }
        }
      }, 70);
    },
    [dataset, hyperparams, selectedModel]
  );

  // Initial Run on App Load
  useEffect(() => {
    executeTrainingPipeline();
  }, []);

  // Update HTML theme class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Handle Rerun App Action (Streamlit R key shortcut or rerun button)
  const handleRerun = () => {
    setIsRunning(true);
    setTimeout(() => {
      executeTrainingPipeline();
      setIsRunning(false);
    }, 400);
  };

  // Keyboard shortcut for Streamlit 'R' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "r" || e.key === "R") && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        handleRerun();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle CSV Upload
  const handleCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const parsedRecords: FloodRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",");
        if (parts.length >= 6) {
          const date = parts[0]?.trim() || `2024-06-${(i % 28) + 1}`;
          const stationName = parts[1]?.replace(/"/g, "").trim() || `Station ${i}`;
          const rainfall = parseFloat(parts[5]) || parseFloat(parts[2]) || 65.0;
          const monsoon = parseFloat(parts[4]) || 5.0;
          const prob = Math.min(0.99, Math.max(0.01, parseFloat(parts[parts.length - 2]) || (rainfall > 100 ? 0.8 : 0.2)));

          parsedRecords.push({
            id: i,
            date,
            stationId: `CUSTOM-STN-${i}`,
            stationName,
            riverBasin: parts[2]?.replace(/"/g, "").trim() || "Uploaded Basin Network",
            region: "Custom Region",
            country: parts[3]?.replace(/"/g, "").trim() || "International",
            lat: 25.0 + (i % 20) * 0.5,
            lng: 85.0 + (i % 30) * 0.5,
            monsoonIntensity: Math.min(10, Math.max(1, monsoon)),
            topographyDrainage: 5.0,
            riverDischarge_m3s: Math.round(rainfall * 250),
            waterLevel_m: +(4.0 + rainfall * 0.03).toFixed(2),
            soilMoisture_pct: +(50.0 + rainfall * 0.2).toFixed(1),
            rainfall_mm: rainfall,
            deforestationIndex: 5.0,
            urbanizationIndex: 5.0,
            climateChangeFactor: 6.0,
            elevation_m: 30,
            damsStorage_pct: 70,
            siltationLevel: 4.5,
            inundationProbability: prob,
            floodOccurred: prob >= 0.5 ? 1 : 0,
            alertLevel: prob >= 0.7 ? "Severe" : prob >= 0.4 ? "Warning" : "Normal",
          });
        }
      }

      if (parsedRecords.length > 0) {
        setDataset(parsedRecords);
        executeTrainingPipeline(hyperparams, selectedModel);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? "bg-[#030712] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200" : "bg-slate-50 text-slate-900 selection:bg-blue-500/20"
    }`}>
      {/* Streamlit Top Header Bar */}
      <StreamlitHeader
        isRunning={isRunning}
        onRerun={handleRerun}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        datasetCount={dataset.length}
        activeModel={selectedModel}
        onOpenAppPy={() => setActiveTab("app_py")}
      />

      {/* Main Workspace Layout: Streamlit Sidebar + Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Streamlit Left Sidebar */}
        <StreamlitSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          stations={stations}
          selectedStationId={selectedStationId}
          onSelectStation={(id) => setSelectedStationId(id)}
          selectedModel={selectedModel}
          onSelectModel={(model) => {
            setSelectedModel(model);
            executeTrainingPipeline(hyperparams, model);
          }}
          alertThreshold={alertThreshold}
          onChangeAlertThreshold={(th) => {
            setAlertThreshold(th);
            setHyperparams((prev) => ({ ...prev, threshold: th }));
          }}
          startDate={startDate}
          endDate={endDate}
          onChangeDateRange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
          onUploadCsv={handleCsvUpload}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isTraining={isTraining}
        />

        {/* Main Content Area */}
        <main
          id="st-main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6"
        >
          {/* Active Tab View Rendering */}
          {activeTab === "dashboard" && (
            <DashboardTab
              station={currentStation}
              forecast={forecast7Days}
              onOpenAdvisor={() => setActiveTab("ai_advisor")}
              onSelectStation={(id) => setSelectedStationId(id)}
              allStations={stations}
            />
          )}

          {activeTab === "map" && (
            <GeospatialMapTab
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={(id) => setSelectedStationId(id)}
            />
          )}

          {activeTab === "explorer" && <DataExplorerTab dataset={dataset} />}

          {activeTab === "training" && (
            <ModelTrainingTab
              modelType={selectedModel}
              onSelectModel={(m) => {
                setSelectedModel(m);
                executeTrainingPipeline(hyperparams, m);
              }}
              dataset={dataset}
              hyperparams={hyperparams}
              onChangeHyperparams={(hp) => setHyperparams(hp)}
              isTraining={isTraining}
              trainingProgress={trainingProgress}
              epochsMetrics={epochsMetrics}
              evaluation={evaluation}
              onStartTraining={() => executeTrainingPipeline()}
            />
          )}

          {activeTab === "forecast" && <ForecastingTab activeModel={selectedModel} />}

          {activeTab === "ai_advisor" && (
            <AiAdvisorTab
              station={currentStation}
              forecast={forecast7Days}
              evaluation={evaluation}
            />
          )}

          {activeTab === "app_py" && <AppPyTab darkMode={darkMode} />}
        </main>
      </div>
    </div>
  );
}
