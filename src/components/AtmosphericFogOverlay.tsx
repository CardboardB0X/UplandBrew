import React from 'react';
import { WeatherData } from '../types/venue';
import { UplandFogIcon } from './WeatherIcons';

interface AtmosphericFogOverlayProps {
  weather: WeatherData;
  fogEnabled: boolean;
  onToggleFog: () => void;
}

/**
 * Atmospheric Fog Telemetry indicator.
 * All volumetric smoke and fog physics are rendered directly on the terrain
 * canvas inside Leaflet, preventing static screen-fixed artifacts during zoom.
 */
export const AtmosphericFogOverlay: React.FC<AtmosphericFogOverlayProps> = ({
  weather,
  fogEnabled,
  onToggleFog,
}) => {
  return (
    <>
      {/* Subtle edge atmospheric vignette (only active during heavy upland fog) */}
      {fogEnabled && weather.fog_index >= 70 && (
        <div
          className="fixed inset-0 pointer-events-none z-[410] transition-opacity duration-1000 select-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 60%, rgba(224, 242, 254, 0.15) 100%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Floating Fog & Atmospheric Status Capsule (Desktop only; on mobile it is in the top header) */}
      <div className="hidden lg:block fixed bottom-5 left-5 z-[920] pointer-events-auto">
        <button
          type="button"
          onClick={onToggleFog}
          title="Toggle Apple Weather-style Isobaric Mist Mesh"
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/50 dark:border-zinc-800 shadow-glass text-zinc-700 dark:text-zinc-200 hover:scale-105 active:scale-95 transition-all text-xs"
        >
          <div className="relative flex items-center justify-center p-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <UplandFogIcon className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            <span>Isobaric Mist</span>
            <span className="font-mono text-sky-600 dark:text-sky-400 font-extrabold">
              {weather.fog_index}%
            </span>
            <span className="text-zinc-300 dark:text-zinc-600">•</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">
              PoP {weather.rain_probability_pct}%
            </span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold uppercase tracking-wider">
            {weather.fog_index >= 60 ? 'Active Mesh' : 'Ambient'}
          </span>
        </button>
      </div>
    </>
  );
};
