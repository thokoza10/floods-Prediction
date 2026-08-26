import React, { useState } from "react";
import { BasinStation } from "../../types";
import { StreamlitContainer, StreamlitInfo } from "../streamlit/StreamlitCard";
import { StreamlitMetric } from "../streamlit/StreamlitMetric";
import { MapPin, Waves, AlertTriangle, ShieldCheck, Droplets, Wind } from "lucide-react";

interface GeospatialMapTabProps {
  stations: BasinStation[];
  selectedStationId: string;
  onSelectStation: (id: string) => void;
}

export const GeospatialMapTab: React.FC<GeospatialMapTabProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
}) => {
  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  // Map coordinate conversion for SVG projection (-180 to 180 lng, -90 to 90 lat)
  const getCoordinates = (lat: number, lng: number) => {
    // Basic Equirectangular projection
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  return (
    <div id="geospatial-map-tab" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Info Banner */}
      <StreamlitInfo
        id="gis-map-info"
        message={
          <div>
            <span className="font-bold">st.map: Global River Basin GIS & Inundation Risk Map</span>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300">
              Real-time geospatial telemetry across international river networks. Click on any monitoring buoy or river gauge to inspect localized stage heights.
            </p>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive SVG GIS Map (8 cols) */}
        <StreamlitContainer
          id="svg-map-container"
          title="Interactive Global Hydrometric Telemetry Network"
          subtitle="Real-time sensor nodes color-coded by active flood risk level"
          className="lg:col-span-8"
        >
          <div className="relative w-full aspect-[2/1] bg-[#030712] rounded-2xl overflow-hidden border border-slate-800/80 p-2 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
            {/* World Continents Background Vector Art */}
            <svg viewBox="0 0 1000 500" className="w-full h-full">
              {/* Oceanic Background Grids */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f172a" strokeWidth="0.75" />
                </pattern>
                {/* Radial Glow for Critical Stations */}
                <radialGradient id="criticalGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="1000" height="500" fill="#020617" />
              <rect width="1000" height="500" fill="url(#grid)" />

              {/* Simplified Landmass Outlines */}
              {/* North America */}
              <path
                d="M 150 70 Q 220 50 280 90 Q 300 160 260 220 Q 200 240 160 170 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1"
              />
              {/* South America */}
              <path
                d="M 280 250 Q 350 270 330 380 Q 290 450 260 400 Q 240 310 280 250 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1"
              />
              {/* Europe & Africa */}
              <path
                d="M 450 60 Q 560 50 560 140 Q 520 180 460 150 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1"
              />
              <path
                d="M 460 170 Q 580 180 570 320 Q 510 420 450 350 Q 420 250 460 170 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1"
              />
              {/* Asia & India */}
              <path
                d="M 580 60 Q 820 60 850 180 Q 750 260 620 220 Q 570 140 580 60 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1"
              />
              <path
                d="M 680 200 Q 740 220 720 290 Q 670 270 680 200 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1"
              />
              {/* Australia */}
              <path
                d="M 780 320 Q 880 320 870 410 Q 790 420 780 320 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1"
              />

              {/* Major River Flow Arteries (Cyan paths) */}
              {/* Mississippi */}
              <path d="M 230 110 Q 245 150 250 190" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="3 2" />
              {/* Amazon */}
              <path d="M 270 290 Q 310 280 345 285" fill="none" stroke="#0ea5e9" strokeWidth="3" />
              {/* Rhine */}
              <path d="M 490 100 Q 500 120 505 135" fill="none" stroke="#0ea5e9" strokeWidth="2" />
              {/* Yangtze */}
              <path d="M 720 170 Q 770 175 810 185" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
              {/* Ganges / Brahmaputra */}
              <path d="M 710 190 Q 730 215 745 230" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
              {/* Indus */}
              <path d="M 675 165 Q 685 190 690 220" fill="none" stroke="#0ea5e9" strokeWidth="2" />

              {/* Interactive Station Markers */}
              {stations.map((stn) => {
                const { x, y } = getCoordinates(stn.lat, stn.lng);
                const isSelected = stn.id === selectedStation.id;
                const isCritical = stn.status === "Critical";
                const isWarning = stn.status === "Warning";

                const color = isCritical
                  ? "#ef4444"
                  : isWarning
                  ? "#f59e0b"
                  : stn.status === "Watch"
                  ? "#3b82f6"
                  : "#10b981";

                return (
                  <g
                    key={stn.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => onSelectStation(stn.id)}
                  >
                    {/* Pulsing ring for critical stations */}
                    {isCritical && (
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 18 : 14}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        className="animate-ping origin-center"
                        opacity={0.7}
                      />
                    )}

                    {/* Outer Glow Selection Ring */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={12}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}

                    {/* Main Station Dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : 4.5}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Station Name Label */}
                    <text
                      x={x + 8}
                      y={y + 4}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight={isSelected ? "bold" : "normal"}
                      className="select-none pointer-events-none drop-shadow-md"
                    >
                      {stn.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend Bar */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-3 text-[10px] font-sans text-slate-300">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Normal (Safe)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Watch</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Warning</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Critical Breach</span>
              </span>
            </div>
          </div>
        </StreamlitContainer>

        {/* Right Column: Selected Station Inspector (4 cols) */}
        <StreamlitContainer
          id="station-inspector-container"
          title="Station Telemetry Inspector"
          subtitle={selectedStation.name}
          className="lg:col-span-4 flex flex-col justify-between"
        >
          <div className="space-y-4 pt-1">
            {/* Status Pill */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/80 dark:bg-[#070d19]/90 border border-slate-200 dark:border-slate-800/80 shadow-inner">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                  Current Threat Level
                </span>
                <span
                  className={`text-base font-bold font-mono ${
                    selectedStation.status === "Critical"
                      ? "text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]"
                      : selectedStation.status === "Warning"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {selectedStation.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                  Risk Probability
                </span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-cyan-400">
                  {(selectedStation.riskScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Stage vs Danger */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
                <span>River Basin:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">{selectedStation.riverBasin}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
                <span>Country / Region:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">{selectedStation.country}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
                <span>Current Water Gauge:</span>
                <span className="font-mono font-bold text-cyan-500 dark:text-cyan-400">{selectedStation.currentWaterLevel} m</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
                <span>Danger Mark Threshold:</span>
                <span className="font-mono text-rose-500 dark:text-rose-400 font-semibold">{selectedStation.dangerLevel_m} m</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
                <span>24h Rainfall:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200">{selectedStation.currentRainfall_mm} mm</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
                <span>Discharge Flow:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200">{selectedStation.currentDischarge_m3s.toLocaleString()} m³/s</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
                <span>Soil Moisture:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200">{selectedStation.currentSoilMoisture_pct}%</span>
              </div>
            </div>
          </div>
        </StreamlitContainer>
      </div>
    </div>
  );
};
