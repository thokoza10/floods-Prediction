import React, { useState } from "react";
import { Info, AlertTriangle, AlertOctagon, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";

interface ContainerProps {
  id?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const StreamlitContainer: React.FC<ContainerProps> = ({
  id,
  title,
  subtitle,
  action,
  children,
  className = "",
}) => {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#0b1120]/80 backdrop-blur-md shadow-sm p-4 sm:p-5 transition-all ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export const StreamlitInfo: React.FC<{ message: React.ReactNode; id?: string }> = ({ message, id }) => (
  <div id={id} className="flex items-start space-x-2.5 p-3 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 text-cyan-950 dark:text-cyan-200 text-xs leading-relaxed my-2.5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
    <Info className="w-4 h-4 text-cyan-500 dark:text-cyan-400 mt-0.5 shrink-0" />
    <div className="flex-1">{message}</div>
  </div>
);

export const StreamlitWarning: React.FC<{ message: React.ReactNode; id?: string }> = ({ message, id }) => (
  <div id={id} className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs leading-relaxed my-2.5 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
    <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
    <div className="flex-1">{message}</div>
  </div>
);

export const StreamlitError: React.FC<{ message: React.ReactNode; id?: string }> = ({ message, id }) => (
  <div id={id} className="flex items-start space-x-2.5 p-3 rounded-xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 text-rose-950 dark:text-rose-200 text-xs leading-relaxed my-2.5 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
    <AlertOctagon className="w-4 h-4 text-rose-500 dark:text-rose-400 mt-0.5 shrink-0" />
    <div className="flex-1">{message}</div>
  </div>
);

export const StreamlitSuccess: React.FC<{ message: React.ReactNode; id?: string }> = ({ message, id }) => (
  <div id={id} className="flex items-start space-x-2.5 p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-xs leading-relaxed my-2.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
    <div className="flex-1">{message}</div>
  </div>
);

export const StreamlitExpander: React.FC<{
  label: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  id?: string;
}> = ({ label, defaultExpanded = false, children, id }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div id={id} className="rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden my-2.5 bg-white dark:bg-[#0b1120]/80">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
      >
        <span className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          {label}
        </span>
      </button>
      {expanded && <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070d19]/80 text-xs">{children}</div>}
    </div>
  );
};
