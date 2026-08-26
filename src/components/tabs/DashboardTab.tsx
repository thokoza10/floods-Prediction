import React from "react";
import { BasinStation, ForecastDay } from "../../types";
import { StreamlitMetric } from "../streamlit/StreamlitMetric";
import { StreamlitContainer, StreamlitWarning, StreamlitError, StreamlitSuccess } from "../streamlit/StreamlitCard";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
} from "recharts";
import { AlertCircle, Waves, Droplets, CloudRain, Gauge, Compass, ShieldAlert, Sparkles } from "lucide-react";

interface DashboardTabProps {
  station: BasinStation;
  forecast: ForecastDay[];
  onOpenAdvisor: () => void;
  onSelectStation: (id: string) => void;
  allStations: BasinStation[];
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  station,
  forecast,
  onOpenAdvisor,
  onSelectStation,
  allStations,
}) => {
  const isCritical = station.status === "Critical";
  const isWarning = station.status === "Warning";
  const isWatch = station.status === "Watch";

  // Calculate percentage of water level to danger level
  const waterPercent = Math.min(130, Math.round((station.currentWaterLevel / station.dangerLevel_m) * 100));

  return (
    <div id="dashboard-tab" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Alert depending on station status */}
      {isCritical ? (
        <StreamlitError
          id="critical-flood-alert"
          message={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  🔴 CRITICAL FLOOD WARNING ACTIVE:
                </span>{" "}
                {station.name} has exceeded danger mark ({station.currentWaterLevel}m / {station.dangerLevel_m}m). Severe inundation expected within downstream sectors.
              </div>
              <button
                onClick={onOpenAdvisor}
                className="shrink-0 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate AI Protocol
              </button>
            </div>
          }
        />
      ) : isWarning ? (
        <StreamlitWarning
          id="warning-flood-alert"
          message={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  🟡 ELEVATED INUNDATION ALERT:
                </span>{" "}
                River discharge at {station.riverBasin} is accelerating rapidly with high soil saturation ({station.currentSoilMoisture_pct}%).
              </div>
              <button
                onClick={onOpenAdvisor}
                className="shrink-0 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Risk Assessment
              </button>
            </div>
          }
        />
      ) : (
        <StreamlitSuccess
          id="normal-flood-alert"
          message={
            <div className="flex items-center justify-between">
              <span>
                <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  🟢 HYDROLOGICAL BASELINE NORMAL:
                </span>{" "}
                Gauging levels at {station.name} are currently within safe operational capacity.
              </span>
            </div>
          }
        />
      )}

      {/* Primary Key Metrics Row (`st.metric`) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StreamlitMetric
          id="metric-water-level"
          label="Current Water Gauge Level"
          value={`${station.currentWaterLevel} m`}
          delta={
            station.currentWaterLevel >= station.dangerLevel_m
              ? `+${(station.currentWaterLevel - station.dangerLevel_m).toFixed(2)}m Above Danger`
              : `-${(station.dangerLevel_m - station.currentWaterLevel).toFixed(2)}m Below Danger`
          }
          deltaColor={station.currentWaterLevel >= station.dangerLevel_m ? "normal" : "inverse"}
          badge={`Danger: ${station.dangerLevel_m}m`}
          help="Direct ultrasonic and telemetry river stage measurement"
        />

        <StreamlitMetric
          id="metric-rainfall"
          label="24-Hour Precipitation"
          value={`${station.currentRainfall_mm} mm`}
          delta={station.currentRainfall_mm > 100 ? "+42.5 mm" : "-12.0 mm"}
          deltaColor={station.currentRainfall_mm > 100 ? "normal" : "inverse"}
          badge="Meteorology"
          help="Accumulated 24-hour Doppler & ground gauge rainfall"
        />

        <StreamlitMetric
          id="metric-discharge"
          label="Volumetric Discharge Rate"
          value={`${station.currentDischarge_m3s.toLocaleString()} m³/s`}
          delta={station.riskScore > 0.6 ? "+18.4%" : "-4.2%"}
          deltaColor={station.riskScore > 0.6 ? "normal" : "inverse"}
          badge="Flow Rate"
          help="Hydraulic discharge volume through sensor cross-section"
        />

        <StreamlitMetric
          id="metric-soil-moisture"
          label="Soil Saturation Index"
          value={`${station.currentSoilMoisture_pct}%`}
          delta={station.currentSoilMoisture_pct > 80 ? "+12.1% Saturated" : "-5.4% Saturated"}
          deltaColor={station.currentSoilMoisture_pct > 80 ? "normal" : "inverse"}
          badge={station.currentSoilMoisture_pct > 85 ? "Critical Saturation" : "Permeable"}
          help="Subsurface hydrological moisture saturation percentage"
        />
      </div>

      {/* Main Visuals: Gauge Water Stage Animation & 7-Day Timeseries Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Water Column Visualizer (4 cols) */}
        <StreamlitContainer
          id="water-stage-container"
          title="Hydro Stage & Danger Threshold"
          subtitle={`${station.name} (${station.riverBasin})`}
          className="lg:col-span-4 flex flex-col justify-between"
        >
          <div className="relative my-2 p-4 rounded-2xl bg-slate-100/70 dark:bg-[#070d19]/80 border border-slate-200 dark:border-slate-800/80 flex flex-col items-center shadow-inner">
            {/* Water Tube Illustration */}
            <div className="relative w-28 h-64 bg-slate-200 dark:bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-800 flex flex-col justify-end shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
              {/* Danger Level Line Indicator */}
              <div
                className="absolute w-full border-b-2 border-dashed border-rose-500 z-10 flex items-center justify-end pr-1 text-[10px] font-mono font-bold text-rose-400 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]"
                style={{ bottom: `${Math.min(95, (station.dangerLevel_m / station.majorFloodLevel_m) * 100)}%` }}
              >
                <span>Danger Mark</span>
              </div>

              {/* Animated Water Body */}
              <div
                className={`w-full transition-all duration-1000 relative ${
                  waterPercent >= 100
                    ? "bg-gradient-to-t from-rose-700 via-rose-600 to-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                    : waterPercent >= 80
                    ? "bg-gradient-to-t from-amber-700 via-amber-500 to-cyan-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    : "bg-gradient-to-t from-blue-900 via-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                }`}
                style={{ height: `${Math.min(100, (station.currentWaterLevel / station.majorFloodLevel_m) * 100)}%` }}
              >
                {/* Surface Ripple Effect */}
                <div className="absolute inset-x-0 top-0 h-2 bg-white/50 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </div>
            </div>

            {/* Gauge Reading Status */}
            <div className="mt-4 text-center space-y-1">
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white drop-shadow-sm">
                {station.currentWaterLevel} m / {station.dangerLevel_m} m
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                Stage Ratio: <span className={waterPercent >= 100 ? "text-rose-400 font-bold" : "text-cyan-400"}>{waterPercent}%</span> of Danger Limit
              </div>
            </div>
          </div>

          {/* Quick Basin Status Badges */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Risk Probability Index:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-cyan-400">
                {(station.riskScore * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Major Flood Level:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">{station.majorFloodLevel_m} m</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Coordinates:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">
                {station.lat.toFixed(2)}°N, {station.lng.toFixed(2)}°E
              </span>
            </div>
          </div>
        </StreamlitContainer>

        {/* Right Column: 7-Day Predictive Inundation & Precipitation Timeseries (8 cols) */}
        <StreamlitContainer
          id="timeseries-forecast-chart"
          title="7-Day Predictive Inundation & Rainfall Forecast"
          subtitle="Model predictions with 95% upper and lower confidence intervals"
          className="lg:col-span-8"
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecast} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="dayName" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis
                  yAxisId="prob"
                  domain={[0, 1]}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="rain"
                  orientation="right"
                  stroke="#3b82f6"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${v}mm`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ForecastDay;
                      return (
                        <div className="p-3 rounded-lg bg-slate-900 text-white shadow-lg text-xs space-y-1 font-sans border border-slate-700">
                          <p className="font-bold text-slate-200">
                            {data.dayName} ({data.date})
                          </p>
                          <div className="text-red-400 font-medium">
                            Flood Probability: {(data.floodProbability * 100).toFixed(1)}%
                          </div>
                          <div className="text-slate-300 text-[11px]">
                            95% CI: [{(data.lowerConfidence * 100).toFixed(0)}% - {(data.upperConfidence * 100).toFixed(0)}%]
                          </div>
                          <div className="text-blue-400">
                            Precipitation: {data.predictedRainfall_mm} mm
                          </div>
                          <div className="text-emerald-400">
                            Water Level: {data.predictedWaterLevel_m} m
                          </div>
                          <div className="text-amber-400 font-bold">
                            Status: {data.status}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                
                {/* Confidence Interval Band */}
                <Area
                  yAxisId="prob"
                  type="monotone"
                  dataKey="upperConfidence"
                  stroke="none"
                  fill="#ef4444"
                  fillOpacity={0.15}
                  name="Upper/Lower Confidence Band (95%)"
                />
                <Area
                  yAxisId="prob"
                  type="monotone"
                  dataKey="lowerConfidence"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={0.1}
                />

                {/* Rainfall Bar Column */}
                <Bar
                  yAxisId="rain"
                  dataKey="predictedRainfall_mm"
                  name="Rainfall (mm)"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                  opacity={0.7}
                />

                {/* Probability Line */}
                <Line
                  yAxisId="prob"
                  type="monotone"
                  dataKey="floodProbability"
                  name="Predicted Flood Risk Probability"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#ef4444" }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </StreamlitContainer>
      </div>

      {/* Global River Basins Comparison Grid */}
      <StreamlitContainer
        id="global-basins-grid"
        title="Global River Basin Monitoring Network"
        subtitle="Click any basin to inspect specific real-time gauge telemetry and machine learning predictions"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {allStations.map((stn) => {
            const isSelected = stn.id === station.id;
            return (
              <div
                key={stn.id}
                onClick={() => onSelectStation(stn.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                    : "border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-[#070d19]/80 hover:border-slate-400 dark:hover:border-cyan-500/40 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {stn.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      stn.status === "Critical"
                        ? "bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                        : stn.status === "Warning"
                        ? "bg-amber-500 text-white"
                        : stn.status === "Watch"
                        ? "bg-blue-500 text-white"
                        : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {stn.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate font-mono">
                  {stn.riverBasin}
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-300">
                    {stn.currentWaterLevel}m / {stn.dangerLevel_m}m
                  </span>
                  <span
                    className={`font-bold ${
                      stn.riskScore >= 0.7 ? "text-rose-400" : stn.riskScore >= 0.4 ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {(stn.riskScore * 100).toFixed(0)}% Risk
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </StreamlitContainer>
    </div>
  );
};
