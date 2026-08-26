import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StreamlitMetricProps {
  id?: string;
  label: string;
  value: string | number;
  delta?: string | number;
  deltaColor?: "normal" | "inverse" | "off";
  help?: string;
  badge?: string;
}

export const StreamlitMetric: React.FC<StreamlitMetricProps> = ({
  id,
  label,
  value,
  delta,
  deltaColor = "normal",
  help,
  badge,
}) => {
  const isPositiveDelta = typeof delta === "string" ? !delta.startsWith("-") : Number(delta) >= 0;
  const isZeroDelta = delta === 0 || delta === "0" || delta === "0.0%" || delta === "0%";

  let deltaColorClass = "text-slate-500";
  if (!isZeroDelta && delta !== undefined) {
    if (deltaColor === "normal") {
      deltaColorClass = isPositiveDelta ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400";
    } else if (deltaColor === "inverse") {
      deltaColorClass = isPositiveDelta ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
    }
  }

  return (
    <div
      id={id || `st-metric-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b1120]/80 backdrop-blur-md shadow-sm hover:border-slate-300 dark:hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-tight" title={help}>
          {label}
        </span>
        {badge && (
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
            {badge}
          </span>
        )}
      </div>

      <div className="my-1.5 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono drop-shadow-sm">
          {value}
        </span>
      </div>

      {delta !== undefined && (
        <div className={`flex items-center space-x-1 text-xs font-medium ${deltaColorClass}`}>
          {isZeroDelta ? (
            <Minus className="w-3.5 h-3.5" />
          ) : isPositiveDelta ? (
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
          <span className="font-mono">{delta}</span>
          <span className="text-[10px] text-slate-400 font-normal">vs prev avg</span>
        </div>
      )}
    </div>
  );
};
