import React, { useState } from 'react';
import { WeatherData, WeatherMeshMode } from '../types/venue';
import { CloudRain, CloudFog, Flame, ThermometerSnowflake, ChevronDown, ChevronUp } from 'lucide-react';

interface WeatherIntensityLegendBarProps {
  weather: WeatherData;
  mode?: WeatherMeshMode;
  onModeChange?: (mode: WeatherMeshMode) => void;
  className?: string;
  defaultMinimized?: boolean;
}

interface LegendConfig {
  modeName: string;
  icon: React.ReactNode;
  activeReading: string;
  statusBadge: string;
  gradientStyle: string;
  ticks: string[];
  currentPercentage: number;
  badgeBg: string;
}

function computeLegendConfig(weather: WeatherData, mode: WeatherMeshMode = 'precipitation'): LegendConfig {
  // Option A: Precipitation Mode
  if (mode === 'precipitation') {
    const maxVal = 25.0; // mm/h
    const pct = Math.min(100, Math.max(0, (weather.rain_mm / maxVal) * 100));
    return {
      modeName: 'Precipitation & Radar Front',
      icon: <CloudRain className="w-3.5 h-3.5 text-sky-500" />,
      activeReading: `${weather.rain_mm.toFixed(1)} mm/h • PoP ${weather.rain_probability_pct}%`,
      statusBadge: weather.rain_mm >= 7.5 ? 'Heavy Downpour' : weather.rain_mm > 0 ? 'Active Rain' : 'Dry & Clear',
      gradientStyle: 'linear-gradient(to right, #BAE6FD 0%, #38BDF8 25%, #0284C7 60%, #4338CA 100%)',
      ticks: ['0 mm (Dry)', '2.5 mm', '7.5 mm', '15 mm', '25+ mm (Torr)'],
      currentPercentage: pct,
      badgeBg: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    };
  }

  // Option B & C: Shared Mist & Heat Spectrum (Red -> Orange -> White -> Light Blue -> Blue)
  // Left: Red (Extreme Heat 38°C+) -> Orange (Warm 32°C) -> White (Balanced 26°C) -> Light Blue (Mist 21°C) -> Blue (Cold Fog 16°C)
  const maxHeatTemp = 38;
  const minColdTemp = 16;
  const span = maxHeatTemp - minColdTemp;

  // Normalized position: 0% = Red (Hot), 50% = White (Comfortable), 100% = Blue (Cold Fog)
  let rawPosition = (maxHeatTemp - weather.feels_like_c) / span;
  if (weather.fog_index >= 50) {
    rawPosition = Math.min(1.0, rawPosition + (weather.fog_index / 100) * 0.15);
  }
  const pct = Math.min(100, Math.max(0, rawPosition * 100));

  let status = 'Comfortable Upland';
  if (weather.feels_like_c >= 34) status = 'Extreme Heat (Red)';
  else if (weather.feels_like_c >= 30) status = 'Warm Basin (Orange)';
  else if (weather.fog_index >= 70) status = 'Dense Mountain Fog (Blue)';
  else if (weather.fog_index >= 40) status = 'Upland Mist (Light Blue)';

  const isMist = mode === 'mist';

  return {
    modeName: isMist ? 'Upland Mist & Thermal Spectrum' : 'Thermal Heat & Comfort Spectrum',
    icon: isMist ? (
      <CloudFog className="w-3.5 h-3.5 text-sky-500" />
    ) : (
      <Flame className="w-3.5 h-3.5 text-orange-500" />
    ),
    activeReading: isMist
      ? `${weather.feels_like_c}°C Feels • ${weather.fog_index}% Mist`
      : `${weather.feels_like_c}°C Feels • UV ${weather.uv_index}`,
    statusBadge: status,
    // Exact requested visual: red to orange to white to light blue to blue
    gradientStyle: 'linear-gradient(to right, #EF4444 0%, #F97316 25%, #FFFFFF 50%, #38BDF8 75%, #0284C7 100%)',
    ticks: ['Heat (38°C+)', 'Warm (32°C)', 'Comfort (26°C)', 'Mist (21°C)', 'Cold Fog (16°C)'],
    currentPercentage: pct,
    badgeBg:
      pct < 35
        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
        : pct > 65
        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30'
        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  };
}

/**
 * Weather Intensity Legend Line Bar.
 * Replaces the bottom bar line with the shared Red -> Orange -> White -> Light Blue -> Blue
 * diverging spectrum for Mist and Heat, with live real-time needle tracking.
 */
export const WeatherIntensityLegendBar: React.FC<WeatherIntensityLegendBarProps> = ({
  weather,
  mode = 'mist',
  onModeChange,
  className = '',
  defaultMinimized = false,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(defaultMinimized);
  const config = computeLegendConfig(weather, mode);

  return (
    <div className={`pointer-events-auto select-none transition-all duration-300 ${className}`}>
      <div className="px-3 py-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/60 dark:border-zinc-800 shadow-glass text-zinc-800 dark:text-zinc-100 max-w-sm sm:max-w-md w-full">
        {/* Minimized Quick Capsule */}
        {isMinimized ? (
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="w-full flex items-center justify-between gap-2 text-left"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                {config.icon}
              </div>
              <span className="text-[11px] font-bold truncate">
                {config.modeName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-[10px] font-extrabold text-sky-600 dark:text-sky-400">
                {config.activeReading}
              </span>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${config.badgeBg}`}>
                {config.statusBadge}
              </span>
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
            </div>
          </button>
        ) : (
          <>
            {/* Header with collapse button */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  {config.icon}
                </div>
                <span className="text-[11px] font-bold truncate block tracking-tight">
                  {config.modeName}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono text-[10px] font-extrabold text-sky-600 dark:text-sky-400">
                  {config.activeReading}
                </span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${config.badgeBg}`}>
                  {config.statusBadge}
                </span>
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  title="Minimize legend"
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Segmented Mode Selector Options: Precipitation | Mist | Heat */}
            {onModeChange && (
              <div className="flex items-center gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl mb-2 border border-zinc-200/50 dark:border-zinc-700/50">
                <button
                  type="button"
                  onClick={() => onModeChange('precipitation')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mode === 'precipitation'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>Precipitation</span>
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange('mist')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mode === 'mist'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <CloudFog className="w-3.5 h-3.5" />
                  <span>Mist</span>
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange('heat')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mode === 'heat'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Heat</span>
                </button>
              </div>
            )}

            {/* The Intensity Gradient Line Bar Track with Sliding Indicator Needle */}
            <div className="relative w-full h-2 rounded-full overflow-visible my-1.5">
              <div
                className="w-full h-full rounded-full shadow-inner border border-black/10 dark:border-white/10"
                style={{ background: config.gradientStyle }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-500 ease-out z-10"
                style={{ left: `${config.currentPercentage}%` }}
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-white shadow-md ring-2 ring-sky-500/40" />
                </div>
              </div>
            </div>

            {/* Legend Scale Ticks */}
            <div className="flex justify-between items-center text-[8px] font-semibold text-zinc-400 dark:text-zinc-500 pt-0.5">
              {config.ticks.map((tick, idx) => (
                <span
                  key={idx}
                  className={
                    idx === 0
                      ? 'text-left text-rose-500 font-bold'
                      : idx === config.ticks.length - 1
                      ? 'text-right text-sky-500 font-bold'
                      : 'text-center'
                  }
                >
                  {tick}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
