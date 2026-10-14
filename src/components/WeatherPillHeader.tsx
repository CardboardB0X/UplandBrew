import React, { useState } from 'react';
import {
  CloudRain,
  Wind,
  Sun,
  Sparkles,
  BookOpen,
  SlidersHorizontal,
  Wifi,
  WifiOff,
  ChevronDown,
  Search,
  X,
  MapPin,
  Heart,
  Radio,
  RefreshCw,
} from 'lucide-react';
import {
  FilterCategory,
  IndangBarangay,
  WeatherData,
  WeatherScenarioId,
  WeatherScenarioPreset,
} from '../types/venue';
import {
  GlassDomeIcon,
  RidgeElevationIcon,
  UplandFogIcon,
  RainPoPIcon,
} from './WeatherIcons';

interface WeatherPillHeaderProps {
  weather: WeatherData;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterCategory;
  onSelectFilter: (filter: FilterCategory) => void;
  selectedBarangay: IndangBarangay | 'ALL';
  onSelectBarangay: (barangay: IndangBarangay | 'ALL') => void;
  presets: WeatherScenarioPreset[];
  activePresetId: WeatherScenarioId;
  onSelectPreset: (presetId: WeatherScenarioId) => void;
  isOnline: boolean;
  matchingCount: number;
  fogEnabled: boolean;
  onToggleFog: () => void;
  favoritesCount?: number;
  onFetchLiveWeather?: () => void;
  isLiveWeatherLoading?: boolean;
}

interface FilterOption {
  id: FilterCategory;
  label: string;
  icon: React.ReactNode;
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    id: 'best_weather',
    label: 'Optimal Weather Match',
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
  },
  {
    id: 'rain_glasshouse',
    label: 'Glass Domes & Verandas',
    icon: <GlassDomeIcon className="w-3.5 h-3.5 text-sky-500" />,
  },
  {
    id: 'cvsu_study',
    label: 'CvSU Study & Co-Work',
    icon: <BookOpen className="w-3.5 h-3.5 text-indigo-500" />,
  },
  {
    id: 'farm_alfresco',
    label: 'Highland Ridge & Farm',
    icon: <RidgeElevationIcon className="w-3.5 h-3.5 text-emerald-500" />,
  },
];

const BARANGAY_OPTIONS: Array<IndangBarangay | 'ALL'> = [
  'ALL',
  'CvSU Main Campus',
  'Kayquit',
  'Poblacion',
  'Bancod',
  'Alulod',
];

export const WeatherPillHeader: React.FC<WeatherPillHeaderProps> = ({
  weather,
  searchQuery,
  onSearchChange,
  activeFilter,
  onSelectFilter,
  selectedBarangay,
  onSelectBarangay,
  presets,
  activePresetId,
  onSelectPreset,
  isOnline,
  matchingCount,
  fogEnabled,
  onToggleFog,
  favoritesCount = 0,
  onFetchLiveWeather,
  isLiveWeatherLoading = false,
}) => {
  const [showSimulatorMenu, setShowSimulatorMenu] = useState(false);

  const activePreset =
    presets.find((p) => p.id === activePresetId) ?? presets[0];

  const getPulseColor = () => {
    if (weather.rain_mm >= 7.5 || weather.wind_kph > 30) {
      return 'bg-rose-500';
    }
    if (weather.rain_mm > 0 || weather.rain_probability_pct >= 60) {
      return 'bg-sky-500';
    }
    if (weather.feels_like_c >= 33) {
      return 'bg-amber-500';
    }
    return 'bg-emerald-500';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] pointer-events-none px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-2">
        {/* Top Floating Telemetry & Simulator Launcher Pill */}
        <div className="pointer-events-auto relative">
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-2xl shadow-glass px-3 py-2 flex items-center justify-between gap-2.5 transition-all">
            {/* Left: Weather Condition & Live Telemetry Stepper */}
            <button
              type="button"
              onClick={() => setShowSimulatorMenu((prev) => !prev)}
              className="flex items-center gap-2.5 text-left group min-w-0 flex-1"
              title="Tap to switch Indang microclimate scenario telemetry"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getPulseColor()}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${getPulseColor()}`}
                />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 tracking-tight font-mono">
                    {weather.temp_c.toFixed(1)}°C
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-600 font-bold">•</span>
                  <span className="font-semibold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 truncate">
                    {weather.barangay_nowcast}
                  </span>
                  {weather.is_live && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-wider shrink-0">
                      LIVE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400">
                    <CloudRain className="w-2.5 h-2.5 shrink-0" />
                    <span>{weather.rain_mm.toFixed(1)} mm/h</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-300">
                    <RainPoPIcon className="w-2.5 h-2.5 shrink-0" />
                    <span>PoP {weather.rain_probability_pct}%</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hidden xs:inline-flex">
                    <Wind className="w-2.5 h-2.5 shrink-0" />
                    <span>{weather.wind_kph} km/h</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hidden sm:inline-flex">
                    <Sun className="w-2.5 h-2.5 shrink-0" />
                    <span>UV {weather.uv_index}</span>
                  </span>
                </div>
              </div>

              {/* Simulator Trigger Badge */}
              <div className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100/90 dark:bg-zinc-800/90 group-hover:bg-sky-500/15 group-hover:text-sky-600 dark:group-hover:text-sky-400 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 transition-colors">
                <SlidersHorizontal className="w-3 h-3 text-sky-500" />
                <span className="hidden xs:inline">
                  {weather.is_live ? 'Live Weather' : activePreset.short_label}
                </span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    showSimulatorMenu ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Fog Overlay Quick Toggle Button */}
            <button
              type="button"
              onClick={onToggleFog}
              title={fogEnabled ? 'Disable Upland Mist overlay' : 'Enable Upland Mist overlay'}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                fogEnabled
                  ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-400/40 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <UplandFogIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mist</span>
            </button>

            {/* Network Telemetry Badge */}
            <div
              className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
              }`}
              title={isOnline ? 'Real-time telemetry online' : 'Offline cached mode'}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden md:inline">{isOnline ? 'LIVE' : 'CACHE'}</span>
            </div>
          </div>

          {/* Microclimate Scenario Simulator Modal */}
          {showSimulatorMenu && (
            <div className="mt-2 p-3.5 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/60 dark:border-zinc-800 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                    Indang Microclimate Simulator (Defense Testing)
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Real-time physics calculation across upland elevations
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                  {matchingCount} matches
                </span>
              </div>

              {/* Live Open-Meteo Real-Time Microclimate Option */}
              <button
                type="button"
                onClick={() => {
                  onSelectPreset('live_weather');
                  onFetchLiveWeather?.();
                  setShowSimulatorMenu(false);
                }}
                className={`w-full mb-2.5 p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  activePresetId === 'live_weather' || weather.is_live
                    ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40 text-emerald-950 dark:text-emerald-50'
                    : 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>Live Indang Microclimate (Open-Meteo)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-black uppercase">
                        Live API
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Real-time readings for Indang, Cavite (14.1953°N, 120.8770°E)
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {isLiveWeatherLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                  ) : weather.is_live ? (
                    `${weather.temp_c}°C Active`
                  ) : (
                    'Switch to Live'
                  )}
                </div>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((preset) => {
                  const isSelected = preset.id === activePresetId && !weather.is_live;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset.id);
                        setShowSimulatorMenu(false);
                      }}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-sky-500/15 dark:bg-sky-500/25 border-sky-500/50 ring-1 ring-sky-500/40'
                          : 'bg-zinc-50/80 dark:bg-zinc-800/60 border-zinc-200/70 dark:border-zinc-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {preset.badge_title}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-zinc-600 dark:text-zinc-300">
                          {preset.telemetry.temp_c}°C
                        </span>
                      </div>
                      <p className="text-[10px] leading-snug text-zinc-500 dark:text-zinc-400 mb-2">
                        {preset.description}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] font-semibold text-zinc-600 dark:text-zinc-400 mt-auto">
                        <span>🌧️ {preset.telemetry.rain_mm} mm/h</span>
                        <span>💨 {preset.telemetry.wind_kph} km/h</span>
                        <span>🌫️ Fog {preset.telemetry.fog_index}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5-Hour Microclimate Forecast Timeline Strip */}
          {weather.hourly_forecast && weather.hourly_forecast.length > 0 && (
            <div className="mt-1.5 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800/80 shadow-xs flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 shrink-0 mr-1">
                <Radio className="w-3 h-3 text-sky-500" />
                <span>Next 5h Forecast:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {weather.hourly_forecast.slice(0, 5).map((point, i) => (
                  <div
                    key={`${point.hour}-${point.timeLabel}`}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-semibold shrink-0 transition-colors ${
                      i === 0
                        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold border border-sky-400/30'
                        : 'text-zinc-600 dark:text-zinc-300 bg-zinc-100/60 dark:bg-zinc-800/60'
                    }`}
                  >
                    <span className="font-mono text-[9px] text-zinc-400">{point.timeLabel}</span>
                    <span className="text-xs">{point.icon}</span>
                    <span className="font-bold">{point.temp_c}°</span>
                    {point.rain_probability_pct > 0 && (
                      <span className="text-[9px] text-sky-600 dark:text-sky-400 font-mono">
                        {point.rain_probability_pct}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Real-Time Interactive Search Bar */}
        <div className="pointer-events-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search spots, Liberica, study hubs, Wi-Fi, Kayquit..."
              className="w-full pl-9 pr-9 py-2 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-white/60 dark:border-zinc-800/80 shadow-glass text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Category Filters & Barangay Selectors */}
        <div className="pointer-events-auto -mx-3 px-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 pb-1">
            {/* Favorites Fast Filter Chip */}
            {favoritesCount > 0 && (
              <button
                type="button"
                onClick={() => onSelectFilter('favorites')}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border backdrop-blur-xl ${
                  activeFilter === 'favorites'
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md scale-[1.02]'
                    : 'bg-white/85 dark:bg-zinc-900/85 text-zinc-700 dark:text-zinc-300 border-white/50 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 shadow-sm'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 text-rose-500 ${activeFilter === 'favorites' ? 'fill-current text-white' : ''}`} />
                <span>Favorites ({favoritesCount})</span>
              </button>
            )}

            {/* Category Filter Chips */}
            {FILTER_OPTIONS.map((chip) => {
              const isActive = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onSelectFilter(chip.id)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border backdrop-blur-xl ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-md scale-[1.02]'
                      : 'bg-white/85 dark:bg-zinc-900/85 text-zinc-700 dark:text-zinc-300 border-white/50 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 shadow-sm'
                  }`}
                >
                  {chip.icon}
                  <span>{chip.label}</span>
                </button>
              );
            })}

            <span className="text-zinc-300 dark:text-zinc-700 px-0.5">•</span>

            {/* Barangay Fast-Filter Chips */}
            {BARANGAY_OPTIONS.map((bgy) => {
              const isActive = selectedBarangay === bgy;
              return (
                <button
                  key={bgy}
                  type="button"
                  onClick={() => onSelectBarangay(bgy)}
                  className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all border backdrop-blur-xl ${
                    isActive
                      ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                      : 'bg-white/70 dark:bg-zinc-900/70 text-zinc-600 dark:text-zinc-400 border-white/40 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800'
                  }`}
                >
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{bgy === 'ALL' ? 'All Indang' : bgy}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
