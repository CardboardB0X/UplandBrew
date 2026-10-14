import React, { useState } from 'react';
import {
  Navigation,
  Wifi,
  Plug,
  Car,
  Footprints,
  Sparkles,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Star,
  Phone,
  X,
  Heart,
  Share2,
  UtensilsCrossed,
  Images,
  TrendingUp,
} from 'lucide-react';
import { ScoredVenue } from '../types/venue';
import { getTierBadgeStyle } from '../utils/scoring';
import {
  GlassDomeIcon,
  RidgeElevationIcon,
  SpringWaterIcon,
  UplandFogIcon,
  RainPoPIcon,
} from './WeatherIcons';

interface VenueDetailCardProps {
  venue: ScoredVenue;
  rankIndex: number;
  totalVenues: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectPrev: () => void;
  onSelectNext: () => void;
  userDistanceKm: number | null;
  onClose?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (venueId: string) => void;
  onOpenGallery?: (venue: ScoredVenue) => void;
  onShare?: (venue: ScoredVenue) => void;
}

export const VenueDetailCard: React.FC<VenueDetailCardProps> = ({
  venue,
  rankIndex,
  totalVenues,
  isExpanded,
  onToggleExpand,
  onSelectPrev,
  onSelectNext,
  userDistanceKm,
  onClose,
  isFavorite = false,
  onToggleFavorite,
  onOpenGallery,
  onShare,
}) => {
  const tierStyle = getTierBadgeStyle(venue.color_tier);

  const indoorPct = Math.round(venue.indoor_ac_ratio * 100);
  const coveredPct = Math.round(venue.covered_patio_ratio * 100);
  const openPct = Math.round(venue.open_air_ratio * 100);

  const handleOpenNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}&travelmode=driving`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      aria-label="Selected Venue Details"
      className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 lg:left-[calc(50%+210px)] z-[1000] pointer-events-none px-3 sm:px-4 w-full max-w-lg lg:max-w-xl transition-all duration-300"
    >
      <div className="w-full pointer-events-auto">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/60 dark:border-zinc-800 rounded-3xl shadow-2xl shadow-black/25 overflow-hidden transition-all duration-300 max-h-[85vh] flex flex-col">
          {/* Top Drag / Status Header Bar */}
          <div className="w-full pt-2.5 pb-1 px-4 flex flex-col items-center select-none">
            <div
              role="button"
              tabIndex={0}
              onClick={onToggleExpand}
              className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mb-1.5 cursor-pointer hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors"
            />
            <div className="w-full flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-extrabold text-[10px]">
                  #{rankIndex + 1} of {totalVenues}
                </span>
                <span className="truncate max-w-[140px] sm:max-w-none">
                  {rankIndex === 0
                    ? 'Top Weather Match'
                    : `${venue.match_score_pct}% Match for Current Weather`}
                </span>
              </span>

              <div className="flex items-center gap-1.5">
                {/* Favorite Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.(venue.id);
                  }}
                  title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                  className={`p-1.5 rounded-full transition-colors ${
                    isFavorite
                      ? 'text-rose-500 bg-rose-500/15 hover:bg-rose-500/25'
                      : 'text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.(venue);
                  }}
                  title="Share this spot"
                  aria-label="Share this spot"
                  className="p-1.5 rounded-full text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onToggleExpand}
                  className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline cursor-pointer ml-1"
                >
                  <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                </button>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    title="Dismiss place card"
                    aria-label="Dismiss place card"
                    className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Place Summary & Extended Content */}
          <div className="px-4 pb-3.5 pt-1 overflow-y-auto max-h-[70vh]">
            <div className="flex items-start gap-3.5">
              {/* Venue Thumbnail with Elevation & Temp Badges - Clickable to open gallery */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onOpenGallery?.(venue)}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800 border border-black/5 dark:border-white/5 shadow-sm cursor-pointer group"
                title="View venue photos & menu"
              >
                <img
                  src={venue.image_url}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-1 right-1 p-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] flex items-center gap-0.5">
                  <Images className="w-3 h-3" />
                </div>
                <div className="absolute bottom-1.5 left-1.5 right-1.5 px-1 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-bold text-white text-center flex items-center justify-center gap-1">
                  <span>{venue.local_temp_c}°C</span>
                  <span>•</span>
                  <span>{venue.elevation_m}m</span>
                </div>
              </div>

              {/* Venue Title, Location & Quick Badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-50 truncate leading-tight">
                      {venue.name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        {venue.popularity_rating}
                      </span>
                      <span>({venue.review_count})</span>
                      <span>•</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{venue.price_level}</span>
                      <span>•</span>
                      <span>Brgy. {venue.barangay}</span>
                      <span>•</span>
                      <span>
                        {userDistanceKm !== null
                          ? `${userDistanceKm.toFixed(1)} km away`
                          : `${venue.distance_from_cvsu_km} km from CvSU`}
                      </span>
                    </div>
                  </div>

                  {/* Universal Match Score Badge */}
                  <div
                    className={`shrink-0 flex flex-col items-center justify-center px-2.5 py-1.5 rounded-2xl border ${tierStyle.bgClass} ${tierStyle.borderClass} ${tierStyle.glowClass}`}
                  >
                    <div className="flex items-baseline gap-0.5">
                      <span
                        className={`text-lg sm:text-xl font-black font-mono leading-none ${tierStyle.textClass}`}
                      >
                        {venue.match_score_pct}%
                      </span>
                    </div>
                    <span
                      className={`text-[8px] font-extrabold uppercase tracking-wider mt-0.5 ${tierStyle.textClass}`}
                    >
                      {tierStyle.shortLabel}
                    </span>
                  </div>
                </div>

                {/* Google Maps-Style Extended Description */}
                {venue.description && (
                  <p className={`mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                    {venue.description}
                  </p>
                )}

                <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-300 truncate">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Specialty:
                  </span>{' '}
                  {venue.signature_offering}
                </p>

                {venue.weather_warning_tag && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px] font-semibold">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{venue.weather_warning_tag}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contextual Weather Reasoning */}
            <div
              onClick={onToggleExpand}
              className="mt-3 p-2.5 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 flex items-start gap-2.5 cursor-pointer"
            >
              <div className="p-1.5 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-200">
                <span className="font-bold text-zinc-900 dark:text-white">
                  Why it's a {venue.match_score_pct}% match:{' '}
                </span>
                {venue.recommendation_reason}
              </div>
            </div>

            {/* Expanded Architectural Breakdown Drawer */}
            {isExpanded && (
              <div className="mt-3.5 pt-3.5 border-t border-zinc-200/70 dark:border-zinc-800 space-y-3.5 animate-in fade-in duration-200">
                {/* 0. Google Maps Essentials: Address, Hours, Phone */}
                <div className="space-y-1.5 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{venue.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{venue.opening_hours}</span>
                  </div>
                  {venue.contact && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <a href={`tel:${venue.contact}`} className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">
                        {venue.contact}
                      </a>
                    </div>
                  )}
                </div>

                {/* 0.5. Menu & Food Gallery Quick Launcher */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Menu & Photo Gallery
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {venue.menu ? `${venue.menu.length} signature items (₱ pricing)` : 'View food & ambiance photos'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenGallery?.(venue)}
                    className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
                  >
                    View Menu
                  </button>
                </div>

                {/* 1. Microclimate Telemetry Gauges */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center">
                    <div className="flex items-center justify-center gap-1 text-sky-600 dark:text-sky-400 text-xs font-bold">
                      <RainPoPIcon className="w-3 h-3" />
                      <span>{venue.effective_rain_probability_pct}%</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                      Rain Chance
                    </span>
                  </div>

                  <div className="p-2 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-center">
                    <div className="flex items-center justify-center gap-1 text-teal-600 dark:text-teal-400 text-xs font-bold">
                      <UplandFogIcon className="w-3 h-3" />
                      <span>{venue.effective_fog_density_pct}%</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                      Highland Mist
                    </span>
                  </div>

                  <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <RidgeElevationIcon className="w-3 h-3" />
                      <span>{venue.elevation_m}m</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                      Elevation ASL
                    </span>
                  </div>
                </div>

                {/* 1.5. Popular Times / Hourly Activity Histogram */}
                {venue.popular_hours && venue.popular_hours.length > 0 && (
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                        <span>Popular Times (Typical Visit Flow)</span>
                      </span>
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                        Peak: 2 PM – 5 PM
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-1 h-14 pt-2 px-1">
                      {venue.popular_hours.map((hourItem) => {
                        const heightPct = Math.max(12, hourItem.busynessPct);
                        return (
                          <div
                            key={hourItem.hour}
                            className="flex-1 flex flex-col items-center gap-1 group relative"
                            title={`${hourItem.label}: ${hourItem.busynessPct}% busy`}
                          >
                            <div className="w-full h-10 flex items-end justify-center">
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full max-w-[14px] rounded-t-sm transition-all duration-300 ${
                                  hourItem.isPeak
                                    ? 'bg-amber-500 shadow-xs'
                                    : 'bg-sky-500/70 hover:bg-sky-500'
                                }`}
                              />
                            </div>
                            <span className="text-[8px] font-mono text-zinc-400 tracking-tighter">
                              {hourItem.label.replace(' ', '')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Seating Topology Segmented Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <span>Architectural Seating Topology</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      100% Mapped
                    </span>
                  </div>

                  {/* Multi-Segment Bar */}
                  <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex p-0.5 gap-0.5">
                    {indoorPct > 0 && (
                      <div
                        style={{ width: `${indoorPct}%` }}
                        className="h-full bg-sky-500 first:rounded-l-full last:rounded-r-full transition-all duration-500"
                        title={`Indoor AC: ${indoorPct}%`}
                      />
                    )}
                    {coveredPct > 0 && (
                      <div
                        style={{ width: `${coveredPct}%` }}
                        className="h-full bg-emerald-500 first:rounded-l-full last:rounded-r-full transition-all duration-500"
                        title={`Covered Kubo / Veranda: ${coveredPct}%`}
                      />
                    )}
                    {openPct > 0 && (
                      <div
                        style={{ width: `${openPct}%` }}
                        className="h-full bg-amber-500 first:rounded-l-full last:rounded-r-full transition-all duration-500"
                        title={`Open-Air Lawn / Deck: ${openPct}%`}
                      />
                    )}
                  </div>

                  {/* Segment Legend Labels */}
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
                    <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 rounded-xl px-2 py-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {indoorPct}% Indoor AC
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-2 py-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {coveredPct}% Kubo/Patio
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-2 py-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {openPct}% Lawn/Deck
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Environmental & Access Tag Pills */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Access & Amenities
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        venue.has_paved_walkway
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <Footprints className="w-3.5 h-3.5" />
                      {venue.has_paved_walkway ? 'Paved Access' : 'Unpaved Trail'}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        venue.has_covered_parking
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      {venue.has_covered_parking ? 'Covered Parking' : 'Open Parking'}
                    </span>

                    {venue.is_glasshouse && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                        <GlassDomeIcon className="w-3.5 h-3.5" />
                        Glass Dome
                      </span>
                    )}

                    {venue.is_riverside && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                        <SpringWaterIcon className="w-3.5 h-3.5" />
                        Riverside
                      </span>
                    )}

                    {venue.wifi_ready && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">
                        <Wifi className="w-3.5 h-3.5" />
                        High-Speed Wi-Fi
                      </span>
                    )}

                    {venue.power_outlets && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                        <Plug className="w-3.5 h-3.5" />
                        Power Outlets
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      <Clock className="w-3.5 h-3.5" />
                      {venue.opening_hours}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="mt-3.5 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full border border-zinc-200/80 dark:border-zinc-700/80">
                <button
                  type="button"
                  onClick={onSelectPrev}
                  aria-label="Previous ranked venue"
                  className="p-2 rounded-full hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1.5 text-zinc-600 dark:text-zinc-300">
                  {rankIndex + 1}/{totalVenues}
                </span>
                <button
                  type="button"
                  onClick={onSelectNext}
                  aria-label="Next ranked venue"
                  className="p-2 rounded-full hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {venue.contact && (
                <a
                  href={`tel:${venue.contact}`}
                  className="p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700"
                  title={`Call ${venue.name} (${venue.contact})`}
                  aria-label="Call Venue"
                >
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </a>
              )}

              <button
                type="button"
                onClick={() => onOpenGallery?.(venue)}
                className="p-2.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 transition-colors flex items-center justify-center shrink-0 border border-amber-500/30"
                title="View authentic menu & photos"
                aria-label="View authentic menu & photos"
              >
                <UtensilsCrossed className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </button>

              <button
                type="button"
                onClick={handleOpenNavigation}
                className="flex-1 py-2.5 px-4 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              >
                <Navigation className="w-4 h-4 fill-current" />
                <span>Navigate in Google Maps</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
