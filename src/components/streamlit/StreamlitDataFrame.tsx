import React, { useState, useMemo } from "react";
import { FloodRecord } from "../../types";
import { Search, Download, ArrowUpDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface StreamlitDataFrameProps {
  data: FloodRecord[];
  title?: string;
  maxHeight?: string;
}

export const StreamlitDataFrame: React.FC<StreamlitDataFrameProps> = ({
  data,
  title = "Kaggle Flood Prediction Dataset (Real-World Telemetry 2018-2026)",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [floodFilter, setFloodFilter] = useState("All");
  const [sortField, setSortField] = useState<keyof FloodRecord>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const regions = useMemo(() => {
    const unique = Array.from(new Set(data.map((d) => d.riverBasin)));
    return ["All", ...unique];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.riverBasin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm) ||
        item.country.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion = regionFilter === "All" || item.riverBasin === regionFilter;
      const matchesFlood =
        floodFilter === "All" ||
        (floodFilter === "Flooded" && item.floodOccurred === 1) ||
        (floodFilter === "Normal" && item.floodOccurred === 0);

      return matchesSearch && matchesRegion && matchesFlood;
    });
  }, [data, searchTerm, regionFilter, floodFilter]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return sortDirection === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (field: keyof FloodRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const exportToCSV = () => {
    if (!sortedData.length) return;
    const headers = [
      "Date",
      "Station",
      "River_Basin",
      "Country",
      "Monsoon_0_10",
      "Rainfall_mm",
      "WaterLevel_m",
      "Discharge_m3s",
      "SoilMoisture_pct",
      "DamStorage_pct",
      "Drainage_0_10",
      "InundationProb",
      "FloodOccurred",
    ];

    const rows = sortedData.map((d) => [
      d.date,
      `"${d.stationName}"`,
      `"${d.riverBasin}"`,
      `"${d.country}"`,
      d.monsoonIntensity,
      d.rainfall_mm,
      d.waterLevel_m,
      d.riverDischarge_m3s,
      d.soilMoisture_pct,
      d.damsStorage_pct,
      d.topographyDrainage,
      d.inundationProbability,
      d.floodOccurred,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flood_forecasting_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0b1120]/80 backdrop-blur-md overflow-hidden shadow-sm">
      {/* Header with Search & Filter Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-[#070d19]/80">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="font-mono text-cyan-400">st.dataframe:</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              Showing {sortedData.length} records ({data.length} total)
            </span>
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search station, basin, date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-red-500 w-48 sm:w-56 font-mono"
            />
          </div>

          {/* Region Filter */}
          <div className="flex items-center space-x-1">
            <Filter className="w-3 h-3 text-cyan-400" />
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Flood Status Filter */}
          <select
            value={floodFilter}
            onChange={(e) => {
              setFloodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1.5 px-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
          >
            <option value="All">All Statuses</option>
            <option value="Flooded">Flooded Only (1)</option>
            <option value="Normal">Normal Only (0)</option>
          </select>

          {/* CSV Export Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-semibold select-none">
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("date")}>
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("stationName")}>
                <div className="flex items-center gap-1">
                  <span>Station / Basin</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("rainfall_mm")}>
                <div className="flex items-center gap-1">
                  <span>Rainfall (mm)</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("waterLevel_m")}>
                <div className="flex items-center gap-1">
                  <span>Water Lvl (m)</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("riverDischarge_m3s")}>
                <div className="flex items-center gap-1">
                  <span>Discharge (m³/s)</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("soilMoisture_pct")}>
                <div className="flex items-center gap-1">
                  <span>Soil Moist %</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("monsoonIntensity")}>
                <div className="flex items-center gap-1">
                  <span>Monsoon (0-10)</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("inundationProbability")}>
                <div className="flex items-center gap-1">
                  <span>Flood Prob</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">Flood Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {pageData.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors font-mono"
              >
                <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                  {row.date}
                </td>
                <td className="py-2.5 px-3 font-sans">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{row.stationName}</div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[180px] font-mono">{row.riverBasin}</div>
                </td>
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                  <span className="font-semibold text-cyan-500 dark:text-cyan-400">{row.rainfall_mm}</span> mm
                </td>
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                  {row.waterLevel_m} m
                </td>
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                  {row.riverDischarge_m3s.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                  {row.soilMoisture_pct}%
                </td>
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                  {row.monsoonIntensity}
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-14 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          row.inundationProbability >= 0.7
                            ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                            : row.inundationProbability >= 0.4
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${row.inundationProbability * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-[11px]">
                      {(row.inundationProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight font-sans ${
                      row.floodOccurred === 1
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {row.floodOccurred === 1 ? "FLOOD (1)" : "NORMAL (0)"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-[#070d19]/80 text-xs text-slate-600 dark:text-slate-400 font-mono">
        <div>
          Page <span className="font-semibold text-slate-200">{currentPage}</span> of{" "}
          <span className="font-semibold text-slate-200">{Math.max(1, totalPages)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
