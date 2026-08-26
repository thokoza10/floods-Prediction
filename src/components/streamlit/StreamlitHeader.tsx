import React from "react";
import { Play, RotateCw, Activity, Database, Sparkles, Moon, Sun, FileCode } from "lucide-react";

interface StreamlitHeaderProps {
  isRunning: boolean;
  onRerun: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  datasetCount: number;
  activeModel: string;
  onOpenAppPy?: () => void;
}

export const StreamlitHeader: React.FC<StreamlitHeaderProps> = ({
  isRunning,
  onRerun,
  darkMode,
  onToggleDarkMode,
  datasetCount,
  activeModel,
  onOpenAppPy,
}) => {
  return (
    <header
      id="streamlit-header"
      className={`border-b px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 transition-all backdrop-blur-xl ${
        darkMode
          ? "bg-[#030712]/80 border-slate-800/80 text-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]"
          : "bg-white/90 border-slate-200 text-slate-900 shadow-xs"
      }`}
    >
      {/* Left: Streamlit Identity & Status */}
      <div className="flex items-center space-x-3">
        {/* Streamlit Iconic Red Crown / Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.4)] text-white font-black text-sm tracking-tight border border-white/20">
            st
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-base tracking-tight flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                FloodForecast <span className="text-red-400 font-mono text-xs px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]">AI/ML v3.4</span>
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-slate-200 dark:border-slate-800">
          <span className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>{datasetCount.toLocaleString()} Records</span>
          </span>
          <span className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">{activeModel}</span>
          </span>
        </div>
      </div>

      {/* Right: Streamlit Running State, Theme Switcher & Rerun Controls */}
      <div className="flex items-center space-x-2">
        {/* Python app.py Quick Button */}
        {onOpenAppPy && (
          <button
            onClick={onOpenAppPy}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all"
            title="View Streamlit app.py source code"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>app.py</span>
          </button>
        )}

        {/* Streamlit Running Status Indicator */}
        <div
          id="st-running-indicator"
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
            isRunning
              ? "bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)] animate-pulse"
              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning ? "bg-amber-400 animate-ping" : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
            }`}
          />
          <span className="hidden sm:inline">{isRunning ? "Running..." : "Online"}</span>
        </div>

        {/* Theme Toggle */}
        <button
          id="st-theme-toggle"
          onClick={onToggleDarkMode}
          title="Toggle Streamlit Theme"
          className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/80 border border-transparent dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Rerun App Button */}
        <button
          id="st-rerun-btn"
          onClick={onRerun}
          title="Rerun Streamlit Pipeline (R)"
          className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-slate-700 dark:text-slate-200 shadow-xs"
        >
          <RotateCw className={`w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 ${isRunning ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Rerun</span>
          <kbd className="hidden lg:inline-block text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 font-mono">R</kbd>
        </button>
      </div>
    </header>
  );
};
