import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Filter, X, ShieldCheck } from "lucide-react";
import { SPORT_STAT_FILTERS, POSITIONS_BY_SPORT, US_STATES } from "@/data/sportStatFilters";

/**
 * AdvancedStatFilters — collapsible panel for performance-filtered recruiting.
 *
 * Props:
 *   sport         - currently selected sport (e.g. "Basketball")
 *   filters       - current filter state object
 *   onFiltersChange - callback with updated filters
 */
export default function AdvancedStatFilters({ sport, filters, onFiltersChange }) {
  const [expanded, setExpanded] = useState(false);

  const statDefs = sport && sport !== "All" ? (SPORT_STAT_FILTERS[sport] || []) : [];
  const positions = sport && sport !== "All" ? (POSITIONS_BY_SPORT[sport] || []) : [];

  const update = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFiltersChange({
      position: "",
      state: "",
      gradYear: "",
      verifiedOnly: false,
      sortBy: "relevance",
      statThresholds: {},
    });
  };

  const updateStatThreshold = (statKey, value) => {
    const thresholds = { ...(filters.statThresholds || {}) };
    if (value === "" || value === undefined) {
      delete thresholds[statKey];
    } else {
      thresholds[statKey] = parseFloat(value);
    }
    update("statThresholds", thresholds);
  };

  const activeCount =
    (filters.position ? 1 : 0) +
    (filters.state ? 1 : 0) +
    (filters.gradYear ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    Object.keys(filters.statThresholds || {}).length;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Advanced Filters</span>
          {activeCount > 0 && (
            <Badge className="bg-cyan-600 text-white text-[10px] px-1.5 py-0 h-5">
              {activeCount}
            </Badge>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-800">
          {/* Row 1: Position, State, Grad Year */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
            {positions.length > 0 && (
              <div>
                <label className="text-[11px] text-gray-400 font-medium mb-1 block">Position</label>
                <select
                  value={filters.position || ""}
                  onChange={(e) => update("position", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-2 text-sm text-white"
                >
                  <option value="">Any</option>
                  {positions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-[11px] text-gray-400 font-medium mb-1 block">State</label>
              <select
                value={filters.state || ""}
                onChange={(e) => update("state", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-2 text-sm text-white"
              >
                <option value="">Any</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-gray-400 font-medium mb-1 block">Grad Year</label>
              <select
                value={filters.gradYear || ""}
                onChange={(e) => update("gradYear", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-2 text-sm text-white"
              >
                <option value="">Any</option>
                {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stat thresholds */}
          {statDefs.length > 0 && (
            <div>
              <label className="text-[11px] text-gray-400 font-medium mb-2 block">
                Minimum Stats {sport && `(${sport})`}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {statDefs.map((stat) => (
                  <div key={stat.key} className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500 w-16 truncate" title={stat.label}>
                      {stat.label}
                    </span>
                    <Input
                      type="number"
                      placeholder={stat.lowerIsBetter ? `< ${stat.max}` : `> ${stat.min}`}
                      value={filters.statThresholds?.[stat.key] ?? ""}
                      onChange={(e) => updateStatThreshold(stat.key, e.target.value)}
                      step={stat.step}
                      min={stat.min}
                      max={stat.max}
                      className="h-8 bg-gray-800 border-gray-700 text-white text-xs px-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified toggle + Sort */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verifiedOnly || false}
                onChange={(e) => update("verifiedOnly", e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
              />
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-white font-medium">Verified stats only</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-400">Sort by</label>
              <select
                value={filters.sortBy || "relevance"}
                onChange={(e) => update("sortBy", e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white"
              >
                <option value="relevance">Best Match</option>
                <option value="most_active">Most Active</option>
                <option value="most_viewed">Most Viewed</option>
                {statDefs.map((stat) => (
                  <option key={stat.key} value={`stat_${stat.key}`}>
                    {stat.lowerIsBetter ? "Lowest" : "Highest"} {stat.label}
                  </option>
                ))}
              </select>
            </div>

            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-white h-7 px-2"
              >
                <X className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
