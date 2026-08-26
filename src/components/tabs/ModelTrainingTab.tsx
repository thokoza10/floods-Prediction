import React, { useState } from "react";
import { MLModelType, Hyperparameters, EvaluationResults, TrainingMetrics, FloodRecord } from "../../types";
import { StreamlitContainer, StreamlitInfo, StreamlitSuccess, StreamlitExpander } from "../streamlit/StreamlitCard";
import { StreamlitMetric } from "../streamlit/StreamlitMetric";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";
import { Play, RotateCw, CheckCircle, BrainCircuit, Sliders, Award, Layers, HelpCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface ModelTrainingTabProps {
  modelType: MLModelType;
  onSelectModel: (m: MLModelType) => void;
  dataset: FloodRecord[];
  hyperparams: Hyperparameters;
  onChangeHyperparams: (params: Hyperparameters) => void;
  isTraining: boolean;
  trainingProgress: number; // 0 to 100
  epochsMetrics: TrainingMetrics[];
  evaluation: EvaluationResults | null;
  onStartTraining: () => void;
}

export const ModelTrainingTab: React.FC<ModelTrainingTabProps> = ({
  modelType,
  onSelectModel,
  dataset,
  hyperparams,
  onChangeHyperparams,
  isTraining,
  trainingProgress,
  epochsMetrics,
  evaluation,
  onStartTraining,
}) => {
  const [activeMetricView, setActiveMetricView] = useState<"loss" | "accuracy">("accuracy");

  const handleTrainClick = () => {
    onStartTraining();
  };

  return (
    <div id="model-training-tab" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner introducing the ML Architecture */}
      <StreamlitInfo
        id="ml-architecture-info"
        message={
          <div>
            <span className="font-bold">Active Machine Learning Engine: {modelType}</span>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300">
              Trained on {dataset.length} multi-basin hydrological records spanning 2018–2026. Adjust the train/test split, regularization, and estimators below, then click <strong>Train & Evaluate Model</strong>.
            </p>
          </div>
        }
      />

      {/* Hyperparameters & Controls Configuration Bar (`st.slider`, `st.number_input`) */}
      <StreamlitContainer
        id="hyperparameters-container"
        title="st.form: Hyperparameter Tuning & Cross-Validation"
        subtitle="Configure model weights, decision threshold, and validation splits"
        action={
          <button
            id="st-train-btn"
            disabled={isTraining}
            onClick={handleTrainClick}
            className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
              isTraining
                ? "bg-amber-500/80 text-white cursor-wait opacity-80 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.35)] border border-red-400/30"
            }`}
          >
            {isTraining ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Training Epochs ({trainingProgress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Train & Evaluate Model</span>
              </>
            )}
          </button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          {/* Train/Test Split Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>st.slider: Train/Test Split</span>
              <span className="font-mono text-red-500 font-bold">
                {Math.round(hyperparams.trainSplit * 100)}% / {Math.round((1 - hyperparams.trainSplit) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.9"
              step="0.05"
              value={hyperparams.trainSplit}
              onChange={(e) =>
                onChangeHyperparams({ ...hyperparams, trainSplit: parseFloat(e.target.value) })
              }
              className="w-full accent-red-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              {Math.round(dataset.length * hyperparams.trainSplit)} Train | {Math.round(dataset.length * (1 - hyperparams.trainSplit))} Test
            </span>
          </div>

          {/* Estimators / Epochs */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>st.slider: N_Estimators / Epochs</span>
              <span className="font-mono text-red-500 font-bold">{hyperparams.nEstimators}</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={hyperparams.nEstimators}
              onChange={(e) =>
                onChangeHyperparams({ ...hyperparams, nEstimators: parseInt(e.target.value) })
              }
              className="w-full accent-red-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Iterations before convergence
            </span>
          </div>

          {/* Classification Threshold */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>st.slider: Decision Threshold</span>
              <span className="font-mono text-red-500 font-bold">
                {(hyperparams.threshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.05"
              value={hyperparams.threshold}
              onChange={(e) =>
                onChangeHyperparams({ ...hyperparams, threshold: parseFloat(e.target.value) })
              }
              className="w-full accent-red-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Cutoff probability for flood alert
            </span>
          </div>

          {/* K-Fold Cross Validation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              st.selectbox: K-Fold Cross Validation
            </label>
            <select
              value={hyperparams.kFold}
              onChange={(e) =>
                onChangeHyperparams({ ...hyperparams, kFold: parseInt(e.target.value) })
              }
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
            >
              <option value="3">3-Fold Stratified CV</option>
              <option value="5">5-Fold Stratified CV (Recommended)</option>
              <option value="10">10-Fold Stratified CV</option>
            </select>
            <span className="text-[10px] text-slate-400 block mt-1">
              Reduces overfitting on rare seasonal floods
            </span>
          </div>
        </div>

        {/* Real-time Progress Bar (`st.progress`) */}
        {isTraining && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono font-medium">
              <span className="text-slate-600 dark:text-slate-300">
                Fitting ensemble decision trees & backpropagating loss...
              </span>
              <span className="text-red-500 font-bold">{trainingProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-150 rounded-full"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>
        )}
      </StreamlitContainer>

      {/* Model Performance Evaluation Metrics (`st.metric`) */}
      {evaluation && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StreamlitMetric
              id="metric-eval-acc"
              label="Test Accuracy"
              value={`${(evaluation.accuracy * 100).toFixed(1)}%`}
              delta="+1.2%"
              deltaColor="inverse"
              badge="Primary Metric"
              help="Proportion of overall correct classifications on unseen test records"
            />
            <StreamlitMetric
              id="metric-eval-auc"
              label="ROC-AUC Score"
              value={evaluation.rocAuc.toFixed(3)}
              delta="+0.04"
              deltaColor="inverse"
              badge="Discriminative"
              help="Area under the Receiver Operating Characteristic curve"
            />
            <StreamlitMetric
              id="metric-eval-recall"
              label="Recall (Sensitivity)"
              value={`${(evaluation.recall * 100).toFixed(1)}%`}
              delta="+3.5%"
              deltaColor="inverse"
              badge="Disaster Safety"
              help="Ability to detect true flood events without missing dangerous inundations"
            />
            <StreamlitMetric
              id="metric-eval-precision"
              label="Precision (PPV)"
              value={`${(evaluation.precision * 100).toFixed(1)}%`}
              delta="-0.8%"
              deltaColor="normal"
              badge="Reliability"
              help="Proportion of predicted flood alerts that were true positive floods"
            />
            <StreamlitMetric
              id="metric-eval-f1"
              label="F1 Harmonic Score"
              value={evaluation.f1Score.toFixed(3)}
              delta="+0.02"
              deltaColor="inverse"
              badge="Balanced"
              help="Harmonic mean between precision and recall"
            />
            <StreamlitMetric
              id="metric-eval-loss"
              label="Log-Loss (Cross-Entropy)"
              value={evaluation.logLoss.toFixed(3)}
              delta="-0.08"
              deltaColor="inverse"
              badge="Loss"
              help="Binary cross-entropy loss on probabilistic test predictions"
            />
          </div>

          {/* Interactive Charts: Training Loss/Accuracy Curves & Confusion Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Animated Training Learning Curves (7 cols) */}
            <StreamlitContainer
              id="training-curves-container"
              title="Model Convergence & Learning Curves"
              subtitle="Epoch-by-epoch loss reduction and validation accuracy"
              action={
                <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveMetricView("accuracy")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      activeMetricView === "accuracy"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Accuracy & F1
                  </button>
                  <button
                    onClick={() => setActiveMetricView("loss")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      activeMetricView === "loss"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Train/Val Loss
                  </button>
                </div>
              }
              className="lg:col-span-7"
            >
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={epochsMetrics} margin={{ top: 10, right: 15, bottom: 15, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                    <XAxis dataKey="epoch" stroke="#888888" fontSize={11} tickLine={false} label={{ value: "Epoch / Estimator Iteration", position: "insideBottom", offset: -8, fontSize: 10 }} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs space-y-1 font-mono border border-slate-700">
                              <p className="font-bold text-slate-300">Epoch {label}</p>
                              {payload.map((entry, idx) => (
                                <div key={idx} style={{ color: entry.color }}>
                                  {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(4) : entry.value}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />

                    {activeMetricView === "accuracy" ? (
                      <>
                        <Line
                          type="monotone"
                          dataKey="trainAccuracy"
                          name="Train Accuracy"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="valAccuracy"
                          name="Validation Accuracy"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="valF1"
                          name="Validation F1"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={false}
                        />
                      </>
                    ) : (
                      <>
                        <Line
                          type="monotone"
                          dataKey="trainLoss"
                          name="Training Loss (BCE)"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="valLoss"
                          name="Validation Loss"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </StreamlitContainer>

            {/* Right: 2x2 Interactive Confusion Matrix (5 cols) */}
            <StreamlitContainer
              id="confusion-matrix-container"
              title="Confusion Matrix (Test Evaluation)"
              subtitle={`Computed on ${evaluation.confusionMatrix.total} out-of-fold test samples`}
              className="lg:col-span-5 flex flex-col justify-between"
            >
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2.5 text-center">
                  {/* True Positive (TP) */}
                  <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                      True Positive (TP)
                    </span>
                    <span className="text-2xl font-bold font-mono text-emerald-500 dark:text-emerald-300 drop-shadow-sm">
                      {evaluation.confusionMatrix.truePositive}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Flood Predicted & Happened</span>
                  </div>

                  {/* False Positive (FP) */}
                  <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block font-mono">
                      False Alarm (FP)
                    </span>
                    <span className="text-2xl font-bold font-mono text-amber-500 dark:text-amber-300 drop-shadow-sm">
                      {evaluation.confusionMatrix.falsePositive}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">False Flood Alarm</span>
                  </div>

                  {/* False Negative (FN) */}
                  <div className="p-3 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
                    <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block font-mono">
                      Missed Event (FN)
                    </span>
                    <span className="text-2xl font-bold font-mono text-rose-500 dark:text-rose-300 drop-shadow-sm">
                      {evaluation.confusionMatrix.falseNegative}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Missed Flood Disaster</span>
                  </div>

                  {/* True Negative (TN) */}
                  <div className="p-3 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                    <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block font-mono">
                      True Negative (TN)
                    </span>
                    <span className="text-2xl font-bold font-mono text-cyan-500 dark:text-cyan-300 drop-shadow-sm">
                      {evaluation.confusionMatrix.trueNegative}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Safe Predicted & Safe</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Specificity (TNR):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {(
                      (evaluation.confusionMatrix.trueNegative /
                        Math.max(1, evaluation.confusionMatrix.trueNegative + evaluation.confusionMatrix.falsePositive)) *
                      100
                    ).toFixed(1)}%
                  </span>
                </div>
              </div>
            </StreamlitContainer>
          </div>

          {/* Bottom Row: Feature Importance / SHAP Bar Chart & ROC Curve */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Feature Importance Bar Chart (7 cols) */}
            <StreamlitContainer
              id="feature-importance-chart"
              title="Feature Importances & Hydrological Sensitivities"
              subtitle="Normalized Gini / permutation importance across input drivers"
              className="lg:col-span-7"
            >
              <div className="h-64 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={evaluation.featureImportances}
                    layout="vertical"
                    margin={{ top: 5, right: 20, bottom: 5, left: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                    <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} stroke="#888888" fontSize={11} />
                    <YAxis dataKey="feature" type="category" stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const f = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs space-y-1 font-sans border border-slate-700">
                              <p className="font-bold text-red-400">{f.feature}</p>
                              <p className="text-slate-300">{f.description}</p>
                              <p className="text-emerald-400 font-mono">
                                Importance: {(f.importance * 100).toFixed(1)}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="importance"
                      fill="#ef4444"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </StreamlitContainer>

            {/* ROC Curve Chart (5 cols) */}
            <StreamlitContainer
              id="roc-curve-container"
              title="Receiver Operating Characteristic (ROC)"
              subtitle={`AUC = ${evaluation.rocAuc.toFixed(3)} (Discriminative Power)`}
              className="lg:col-span-5"
            >
              <div className="h-64 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evaluation.rocCurve} margin={{ top: 10, right: 15, bottom: 15, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                    <XAxis
                      dataKey="fpr"
                      stroke="#888888"
                      fontSize={11}
                      domain={[0, 1]}
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                      label={{ value: "False Positive Rate (1 - Specificity)", position: "insideBottom", offset: -8, fontSize: 10 }}
                    />
                    <YAxis
                      dataKey="tpr"
                      stroke="#888888"
                      fontSize={11}
                      domain={[0, 1]}
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                      label={{ value: "True Positive Rate (Recall)", angle: -90, position: "insideLeft", fontSize: 10 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const pt = payload[0].payload;
                          return (
                            <div className="p-2 rounded-lg bg-slate-900 text-white text-xs font-mono space-y-1">
                              <div>Threshold: {(pt.threshold * 100).toFixed(0)}%</div>
                              <div className="text-emerald-400">TPR (Recall): {(pt.tpr * 100).toFixed(1)}%</div>
                              <div className="text-rose-400">FPR: {(pt.fpr * 100).toFixed(1)}%</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Chance diagonal line */}
                    <ReferenceLine stroke="#94a3b8" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="tpr"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </StreamlitContainer>
          </div>
        </div>
      )}
    </div>
  );
};
