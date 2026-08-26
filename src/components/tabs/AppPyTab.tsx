import React, { useState, useEffect } from "react";
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Play, 
  Sparkles, 
  FileText, 
  Layers, 
  Search, 
  RefreshCw,
  ExternalLink,
  Cpu,
  Package
} from "lucide-react";

interface AppPyTabProps {
  darkMode?: boolean;
}

export const AppPyTab: React.FC<AppPyTabProps> = ({ darkMode = true }) => {
  const [activeFile, setActiveFile] = useState<"app.py" | "requirements.txt" | "train_pipeline.py" | "README.md">("app.py");
  const [appPyCode, setAppPyCode] = useState<string>("");
  const [reqsCode, setReqsCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSimulatingRun, setIsSimulatingRun] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Fetch live app.py and requirements.txt from server API
  useEffect(() => {
    fetch("/api/python/app-code")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAppPyCode(data.appPy || "");
          setReqsCode(data.requirements || "");
        }
      })
      .catch((err) => {
        console.error("Failed to load app.py:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const trainPipelineCode = `"""
train_pipeline.py - Dedicated Standalone Hydrological Model Trainer
"""
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score

def train_and_save_model(data_path="flood_data.csv", output_model="flood_model.pkl"):
    print("[*] Loading hydrological training dataset...")
    df = pd.read_csv(data_path)
    
    features = [
        "Rainfall_mm", "WaterLevel_m", "RiverDischarge_m3s",
        "SoilMoisture_pct", "MonsoonIntensity", "TopographyDrainage",
        "DeforestationIndex", "UrbanizationIndex", "DamsStorage_pct"
    ]
    target = "FloodOccurred"
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print("[*] Fitting Gradient Boosting Classifier (n_estimators=100, max_depth=6)...")
    clf = GradientBoostingClassifier(n_estimators=100, max_depth=6, learning_rate=0.05, random_state=42)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)[:, 1]
    
    print("=== MODEL EVALUATION METRICS ===")
    print(f"ROC AUC Score: {roc_auc_score(y_test, y_proba):.4f}")
    print(classification_report(y_test, y_pred))
    
    print(f"[*] Serializing fitted model to {output_model}...")
    with open(output_model, "wb") as f:
        pickle.dump(clf, f)
    print("[✓] Model saved successfully.")

if __name__ == "__main__":
    train_and_save_model()
`;

  const readmeCode = `# FloodForecast AI/ML Studio (Streamlit Application)

## Quickstart Guide

### 1. Set Up Python Virtual Environment
\`\`\`bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate

# Install required dependencies
pip install -r requirements.txt
\`\`\`

### 2. Launch the Streamlit App
\`\`\`bash
streamlit run app.py
\`\`\`
The application will automatically launch in your browser at:
\`http://localhost:8501\`

### 3. Application Structure
- \`app.py\`: Complete interactive Streamlit Web UI with Plotly charts, ML estimators, GIS maps, and telemetry gauges.
- \`requirements.txt\`: Core Python packages (Streamlit, Scikit-learn, XGBoost, Plotly, Pandas, NumPy).
- \`train_pipeline.py\`: Standalone ML offline model training and serialization pipeline.
`;

  // Get current file code
  const currentCode = 
    activeFile === "app.py" 
      ? appPyCode 
      : activeFile === "requirements.txt"
      ? reqsCode
      : activeFile === "train_pipeline.py"
      ? trainPipelineCode
      : readmeCode;

  // Copy to clipboard handler
  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download File Handler
  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Simulate local execution in terminal
  const handleSimulateRun = () => {
    setIsSimulatingRun(true);
    setTerminalLogs([
      "$ python -m venv .venv",
      "$ source .venv/bin/activate",
      "$ pip install -r requirements.txt",
      "Collecting streamlit>=1.35.0 (done)",
      "Collecting scikit-learn>=1.3.0 (done)",
      "Collecting plotly>=5.18.0 (done)",
      "Collecting pandas>=2.0.0 (done)",
      "Successfully installed packages into .venv environment.",
      "$ streamlit run app.py",
      "",
      "  Welcome to Streamlit!",
      "  Local URL: http://localhost:8501",
      "  Network URL: http://192.168.1.42:8501",
      "",
      "[HydroStreamlit] Loaded 1,500 historical Kaggle/NOAA records.",
      "[ML Pipeline] Fitted XGBoost Classifier (ROC AUC: 0.942, Accuracy: 92.4%).",
      "[Telemetry] Monitoring 8 global river basin gauge stations in real time.",
      "[Status] Streamlit Server Ready & Listening on Port 8501."
    ]);
  };

  // Filtered code lines for search
  const codeLines = currentCode.split("\n");

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900/80 to-cyan-950/40 border border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <FileCode className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Streamlit Python Application (<code className="text-cyan-400 font-mono">app.py</code>)</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Production Python Code
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-mono">
            Direct Python source code ready to run locally via <code className="text-cyan-300">streamlit run app.py</code> or deploy directly to Streamlit Community Cloud, Docker, or AWS.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => handleDownload(activeFile, currentCode)}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all border border-cyan-400/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {activeFile}</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono flex items-center space-x-1.5 border border-slate-700 transition-all shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>

          <button
            onClick={handleSimulateRun}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold font-mono flex items-center space-x-1.5 shadow-[0_0_15px_rgba(244,63,94,0.35)] transition-all border border-red-400/30"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run in CLI Simulator</span>
          </button>
        </div>
      </div>

      {/* Main Code View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Code Navigator and Tabs */}
        <div className="lg:col-span-12">
          <div className="rounded-2xl border border-slate-800/80 bg-[#030712]/90 backdrop-blur-xl overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.6)]">
            {/* Code Header Bar: File Tabs & Search */}
            <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setActiveFile("app.py")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                    activeFile === "app.py"
                      ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-red-400" />
                  <span>app.py</span>
                  <span className="text-[9px] px-1 py-0.2 bg-red-500/30 text-red-300 rounded">Main UI</span>
                </button>

                <button
                  onClick={() => setActiveFile("requirements.txt")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                    activeFile === "requirements.txt"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-cyan-400" />
                  <span>requirements.txt</span>
                </button>

                <button
                  onClick={() => setActiveFile("train_pipeline.py")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                    activeFile === "train_pipeline.py"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>train_pipeline.py</span>
                </button>

                <button
                  onClick={() => setActiveFile("README.md")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                    activeFile === "README.md"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>README.md</span>
                </button>
              </div>

              {/* In-File Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search code (e.g. st.metric)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Code Body Area with Line Numbers */}
            <div className="relative p-0 max-h-[620px] overflow-y-auto bg-[#020617] font-mono text-xs text-slate-300 select-text">
              {isLoading ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mx-auto" />
                  <p>Loading Python source code...</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <tbody>
                    {codeLines.map((line, idx) => {
                      const lineNum = idx + 1;
                      const isMatch = searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());
                      return (
                        <tr
                          key={lineNum}
                          className={`hover:bg-slate-800/30 transition-colors ${
                            isMatch ? "bg-amber-500/15 text-amber-200" : ""
                          }`}
                        >
                          <td className="w-12 py-0.5 px-3 text-right text-slate-600 select-none border-r border-slate-800/60 text-[11px]">
                            {lineNum}
                          </td>
                          <td className="py-0.5 px-4 whitespace-pre text-slate-200 leading-relaxed font-mono">
                            {line.startsWith("#") ? (
                              <span className="text-slate-500 italic">{line}</span>
                            ) : line.startsWith("import") || line.startsWith("from") ? (
                              <span className="text-cyan-400 font-semibold">{line}</span>
                            ) : line.includes("def ") || line.includes("class ") ? (
                              <span className="text-amber-400 font-bold">{line}</span>
                            ) : line.includes("st.") ? (
                              <span className="text-rose-400 font-medium">{line}</span>
                            ) : (
                              line
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Code Footer: Status info */}
            <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center space-x-3">
                <span>File: <strong className="text-cyan-400">{activeFile}</strong></span>
                <span>•</span>
                <span>Lines: <strong>{codeLines.length}</strong></span>
                <span>•</span>
                <span>Encoding: <strong>UTF-8</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Python 3.10+ / Streamlit 1.35+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive CLI Terminal Simulation Drawer */}
      {isSimulatingRun && (
        <div className="rounded-2xl border border-slate-800/80 bg-[#020617] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-200">Terminal — Streamlit CLI Execution Output</span>
            </div>
            <button
              onClick={() => setIsSimulatingRun(false)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800"
            >
              Close Terminal
            </button>
          </div>
          <div className="p-4 font-mono text-xs space-y-1 text-emerald-400/90 max-h-56 overflow-y-auto">
            {terminalLogs.map((log, i) => (
              <div key={i} className={log.startsWith("$") ? "text-cyan-300 font-bold" : log.includes("Error") ? "text-rose-400" : ""}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
