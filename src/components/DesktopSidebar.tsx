import React from 'react';
import {
  Navigation,
  MapPin,
  ChevronRight,
  Star,
  Flame,
  Users,
  Heart,
  UtensilsCrossed,
} from 'lucide-react';
import { ScoredVenue, WeatherData } from '../types/venue';
import { getTierBadgeStyle } from '../utils/scoring';
import {
  GlassDomeIcon,
  RidgeElevationIcon,
  SpringWaterIcon,
  UplandFogIcon,
  RainPoPIcon,
} from './WeatherIcons';

interface DesktopSidebarProps {
  venues: ScoredVenue[];
  selectedVenue: ScoredVenue | null;
  onSelectVenue: (venue: ScoredVenue) => void;
  weather: WeatherData;
  userCoords: [number, number];
  favorites?: string[];
  onToggleFavorite?: (venueId: string) => void;
  onOpenGallery?: (venue: ScoredVenue) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  venues,
  selectedVenue,
  onSelectVenue,
  weather,
  favorites = [],
  onToggleFavorite,
  onOpenGallery,
}) => {
  return (
    <aside className="hidden lg:flex flex-col w-[430px] h-[calc(100vh-2rem)] fixed left-4 top-4 bottom-4 z-[990] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-3xl shadow-2xl shadow-black/10 overflow-hidden select-none transition-all">
      {/* Brand Header & Topographic Context */}
      <div className="p-4 pb-3 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
              Kalawakan <span className="font-light text-zinc-400">/</span> UplandBrew
            </h1>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            <RidgeElevationIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Indang, Cavite Topography (285m–375m ASL)</span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
            {venues.length} Spots
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5 font-medium">
            Rain Chance {weather.rain_probability_pct}%
          </span>
        </div>
      </div>

      {/* Selected Venue Quick Inspection Drawer */}
      {selectedVenue && (
        <div className="p-3.5 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 transition-all">
          <div className="flex items-start gap-3">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-black/5">
              <img
                src={selectedVenue.image_url}
                alt={selectedVenue.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white text-center py-0.5">
                {selectedVenue.local_temp_c}°C
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {selectedVenue.name}
                </h2>
                <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {selectedVenue.match_score_pct}% Match
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="text-amber-500 font-bold flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-current" />
                  {selectedVenue.popularity_rating}
                </span>
                <span>({selectedVenue.review_count} visits)</span>
                <span>•</span>
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                  {selectedVenue.traffic_level}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
                <span className="inline-flex items-center gap-0.5">
                  <RidgeElevationIcon className="w-2.5 h-2.5 text-emerald-600" />
                  {selectedVenue.elevation_m}m ASL
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-0.5">
                  <RainPoPIcon className="w-2.5 h-2.5 text-sky-500" />
                  PoP {selectedVenue.effective_rain_probability_pct}%
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-0.5">
                  <UplandFogIcon className="w-2.5 h-2.5 text-sky-400" />
                  Fog {selectedVenue.effective_fog_density_pct}%
                </span>
              </div>
            </div>
          </div>

          {/* Contextual Weather Recommendation Reason */}
          <div className="mt-2.5 p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-200">
            <span className="font-bold text-sky-800 dark:text-sky-300">
              Why this is a {selectedVenue.match_score_pct}% match right now:{' '}
            </span>
            {selectedVenue.recommendation_reason}
          </div>

          {/* Seating Topology Mini Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              <span>Seating Layout</span>
              <span>
                {Math.round(selectedVenue.indoor_ac_ratio * 100)}% AC | {Math.round(selectedVenue.covered_patio_ratio * 100)}% Kubo | {Math.round(selectedVenue.open_air_ratio * 100)}% Open
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 flex overflow-hidden p-0.5 gap-0.5">
              <div
                style={{ width: `${Math.round(selectedVenue.indoor_ac_ratio * 100)}%` }}
                className="h-full bg-sky-500 rounded-full"
                title="Indoor AC"
              />
              <div
                style={{ width: `${Math.round(selectedVenue.covered_patio_ratio * 100)}%` }}
                className="h-full bg-emerald-500 rounded-full"
                title="Covered Veranda / Kubo"
              />
              <div
                style={{ width: `${Math.round(selectedVenue.open_air_ratio * 100)}%` }}
                className="h-full bg-amber-500 rounded-full"
                title="Open Farm Deck"
              />
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenGallery?.(selectedVenue)}
              className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-amber-500/30"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Menu & Photos</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedVenue.lat},${selectedVenue.lng}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1 py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 fill-current" />
              <span>Directions</span>
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Ranked Venue List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1 pt-1">
          Ranked by Weather Match & Popularity
        </div>

        {venues.map((venue, idx) => {
          const isSelected = selectedVenue?.id === venue.id;
          const isFav = favorites.includes(venue.id);
          const tier = getTierBadgeStyle(venue.color_tier);

          return (
            <div
              key={venue.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectVenue(venue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectVenue(venue);
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/50 shadow-sm ring-1 ring-sky-500/30'
                  : 'bg-white/60 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[10px] text-zinc-400">
                      #{idx + 1}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {venue.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    <span>{venue.barangay}</span>
                    <span>•</span>
                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {venue.popularity_rating}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">
                      {venue.local_temp_c}°C
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.(venue.id);
                    }}
                    title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                    className={`p-1.5 rounded-full transition-colors ${
                      isFav
                        ? 'text-rose-500 bg-rose-500/15'
                        : 'text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  <div
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl border ${tier.bgClass} ${tier.borderClass}`}
                  >
                    <span className={`font-mono font-extrabold text-xs ${tier.textClass}`}>
                      {venue.match_score_pct}%
                    </span>
                    <span className="text-[9px] uppercase font-bold text-zinc-500">Match</span>
                  </div>
                </div>
              </div>

              <p className="mt-1.5 text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-1">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Specialty:</span>{' '}
                {venue.signature_offering}
              </p>

              <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60 pt-1.5">
                <div className="flex items-center gap-2">
                  {venue.is_glasshouse && (
                    <span className="inline-flex items-center gap-0.5 text-sky-600 dark:text-sky-400">
                      <GlassDomeIcon className="w-3 h-3" />
                      Glass Dome
                    </span>
                  )}
                  {venue.is_riverside && (
                    <span className="inline-flex items-center gap-0.5 text-teal-600 dark:text-teal-400">
                      <SpringWaterIcon className="w-3 h-3" />
                      Riverside
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5">
                    <RidgeElevationIcon className="w-3 h-3 text-emerald-600" />
                    {venue.elevation_m}m ASL
                  </span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400">
                  <span>Inspect</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
