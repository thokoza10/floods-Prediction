import React from "react";
import { BasinStation, MLModelType } from "../../types";
import { 
  LayoutDashboard, 
  MapPin, 
  Database, 
  Cpu, 
  SlidersHorizontal, 
  Bot, 
  Waves,
  Calendar,
  AlertTriangle,
  Upload,
  Layers,
  HelpCircle,
  FileCode
} from "lucide-react";

export type NavTabId = "dashboard" | "map" | "explorer" | "training" | "forecast" | "ai_advisor" | "app_py";

interface StreamlitSidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  stations: BasinStation[];
  selectedStationId: string;
  onSelectStation: (id: string) => void;
  selectedModel: MLModelType;
  onSelectModel: (m: MLModelType) => void;
  alertThreshold: number;
  onChangeAlertThreshold: (v: number) => void;
  startDate: string;
  endDate: string;
  onChangeDateRange: (start: string, end: string) => void;
  onUploadCsv: (file: File) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isTraining: boolean;
}

export const StreamlitSidebar: React.FC<StreamlitSidebarProps> = ({
  activeTab,
  onSelectTab,
  stations,
  selectedStationId,
  onSelectStation,
  selectedModel,
  onSelectModel,
  alertThreshold,
  onChangeAlertThreshold,
  startDate,
  endDate,
  onChangeDateRange,
  onUploadCsv,
  collapsed,
  onToggleCollapse,
  isTraining,
}) => {
  const navItems = [
    { id: "dashboard" as NavTabId, label: "Live Telemetry & Dashboard", icon: LayoutDashboard, badge: "Live" },
    { id: "map" as NavTabId, label: "GIS Basin Geospatial Map", icon: MapPin, badge: "GIS" },
    { id: "explorer" as NavTabId, label: "Kaggle Dataset & EDA", icon: Database, badge: "Data" },
    { id: "training" as NavTabId, label: "ML Model Training Studio", icon: Cpu, badge: "Train" },
    { id: "forecast" as NavTabId, label: "What-If Future Simulator", icon: SlidersHorizontal, badge: "Sim" },
    { id: "ai_advisor" as NavTabId, label: "AI Hydrologist (Gemini)", icon: Bot, badge: "AI" },
    { id: "app_py" as NavTabId, label: "Streamlit Python (app.py)", icon: FileCode, badge: "Python" },
  ];

  const modelOptions: MLModelType[] = [
    "XGBoost (Gradient Boosted Trees)",
    "Random Forest Classifier",
    "Hydrological Deep LSTM",
    "Support Vector Classifier (RBF)",
    "ElasticNet Logistic Regression",
    "SuperLearner Multi-Stack Ensemble",
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCsv(e.target.files[0]);
    }
  };

  return (
    <aside
      id="st-sidebar"
      className={`border-r border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#030712]/90 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between shrink-0 overflow-y-auto ${
        collapsed ? "w-16" : "w-72 sm:w-80"
      }`}
      style={{ minHeight: "calc(100vh - 53px)" }}
    >
      <div className="p-4 space-y-6">
        {/* Streamlit Sidebar Brand Title */}
        {!collapsed && (
          <div>
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-sm">
              <Waves className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
              <span>HydroStreamlit Studio</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Hydrological AI Predictive Engine
            </p>
          </div>
        )}

        {/* Navigation Selector (`st.sidebar.radio`) */}
        <div className="space-y-1">
          {!collapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-1 font-mono">
              st.sidebar.navigation
            </span>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`st-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-2.5"
                } rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] font-semibold border border-red-400/30"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-900/80 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive ? "bg-white/20 text-white font-bold" : "bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Station Selectbox (`st.sidebar.selectbox`) */}
        {!collapsed && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5 font-mono">
                <span>st.sidebar.station</span>
                <span className="text-[10px] text-cyan-400">8 Global Basins</span>
              </label>
              <select
                id="st-station-select"
                value={selectedStationId}
                onChange={(e) => onSelectStation(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-red-500 focus:outline-hidden transition-colors"
              >
                {stations.map((stn) => (
                  <option key={stn.id} value={stn.id}>
                    {stn.name} ({stn.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Model Architecture Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5 font-mono">
                <span>st.sidebar.model_type</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {isTraining ? "Training..." : "Active"}
                </span>
              </label>
              <select
                id="st-model-select"
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value as MLModelType)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-red-500 focus:outline-hidden transition-colors"
              >
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Classification Threshold Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  st.sidebar.threshold
                </label>
                <span className="text-xs font-mono font-bold text-red-400">
                  {(alertThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={alertThreshold}
                onChange={(e) => onChangeAlertThreshold(parseFloat(e.target.value))}
                className="w-full accent-red-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>Recall (20%)</span>
                <span>Balanced (50%)</span>
                <span>Precision (80%)</span>
              </div>
            </div>

            {/* Date Range Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>st.sidebar.date_range</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onChangeDateRange(e.target.value, endDate)}
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">End Date</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onChangeDateRange(startDate, e.target.value)}
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Custom CSV Upload */}
            <div className="pt-2">
              <label
                htmlFor="custom-csv-upload"
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500/80 bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 cursor-pointer text-xs font-medium transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Custom Kaggle CSV</span>
              </label>
              <input
                id="custom-csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Diagnostic Panel */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/80">
        {!collapsed ? (
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Streamlit React Engine</span>
            </div>
            <button
              onClick={onToggleCollapse}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              « Collapse
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-full flex justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="Expand Sidebar"
          >
            »
          </button>
        )}
      </div>
    </aside>
  );
};
