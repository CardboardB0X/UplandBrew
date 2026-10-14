import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import {
  FilterCategory,
  IndangBarangay,
  MapTypeOption,
  RadarFrameInfo,
  ScoredVenue,
  WeatherData,
  WeatherMeshMode,
  WeatherScenarioId,
} from './types/venue';
import {
  INDANG_CENTER_COORDS,
  INDANG_VENUES,
  WEATHER_SCENARIO_PRESETS,
} from './data/mockVenues';
import { calculateWSS } from './utils/scoring';
import { fetchLatestRainRadarFrame } from './services/radarService';
import { fetchLiveIndangWeather } from './services/weatherService';
import { WeatherPillHeader } from './components/WeatherPillHeader';
import { WeatherMap } from './components/WeatherMap';
import { VenueDetailCard } from './components/VenueDetailCard';
import { DesktopSidebar } from './components/DesktopSidebar';
import { AtmosphericFogOverlay } from './components/AtmosphericFogOverlay';
import { VenueGalleryModal } from './components/VenueGalleryModal';

const PREF_WEATHER_PRESET_KEY = 'upland_indang_weather_preset';
const PREF_RADAR_ENABLED_KEY = 'upland_indang_radar_enabled';
const PREF_FOG_ENABLED_KEY = 'upland_indang_fog_enabled';
const PREF_MAP_TYPE_KEY = 'upland_indang_map_type';
const PREF_ZONES_ENABLED_KEY = 'upland_indang_zones_enabled';
const PREF_FAVORITES_KEY = 'upland_indang_favorites';

/**
 * Calculates great-circle Haversine distance in kilometers between two lat/lng coordinates.
 */
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const App: React.FC = () => {
  // 1. Microclimate Scenario Preset (Default: Upland Mist & Drizzle)
  const [activePresetId, setActivePresetId] =
    useState<WeatherScenarioId>('upland_drizzle');
  const [liveWeatherData, setLiveWeatherData] = useState<WeatherData | null>(null);
  const [isLiveWeatherLoading, setIsLiveWeatherLoading] = useState<boolean>(false);

  // 2. Real-Time Search & Category Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] =
    useState<FilterCategory>('best_weather');
  const [selectedBarangay, setSelectedBarangay] =
    useState<IndangBarangay | 'ALL'>('ALL');
  const [favorites, setFavorites] = useState<string[]>([]);

  // 3. Selected Venue & Mobile Bottom Sheet State
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState<boolean>(false);
  const [isPlaceCardDismissed, setIsPlaceCardDismissed] = useState<boolean>(false);

  // 4. Gallery & Media Modal State
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [galleryVenue, setGalleryVenue] = useState<ScoredVenue | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 5. Native Device Telemetry: GPS & Network
  const [userCoords, setUserCoords] =
    useState<[number, number]>(INDANG_CENTER_COORDS);
  const [isUsingRealGps, setIsUsingRealGps] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // 6. RainViewer Precipitation Radar Layer State
  const [radarEnabled, setRadarEnabled] = useState<boolean>(false);
  const [radarFrame, setRadarFrame] = useState<RadarFrameInfo | null>(null);
  const [isRadarLoading, setIsRadarLoading] = useState<boolean>(false);

  // 7. Atmospheric Upland Fog Mist Overlay State
  const [fogEnabled, setFogEnabled] = useState<boolean>(true);

  // 8. Map Type & Microclimate Zones Toggles
  const [mapType, setMapType] = useState<MapTypeOption>('voyager');
  const [showMicroclimateZones, setShowMicroclimateZones] = useState<boolean>(true);

  // 9. Separated Meteorological Mesh & Intensity Mode ('precipitation' | 'mist' | 'heat')
  const [weatherMeshMode, setWeatherMeshMode] = useState<WeatherMeshMode>('mist');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const activeWeatherPreset = useMemo(
    () =>
      WEATHER_SCENARIO_PRESETS.find((p) => p.id === activePresetId) ??
      WEATHER_SCENARIO_PRESETS[0],
    [activePresetId]
  );

  const activeWeatherTelemetry: WeatherData = useMemo(() => {
    if (activePresetId === 'live_weather' && liveWeatherData) {
      return liveWeatherData;
    }
    return activeWeatherPreset.telemetry;
  }, [activePresetId, liveWeatherData, activeWeatherPreset]);

  // Restore saved preferences and deep-linked venue on mount
  useEffect(() => {
    async function restorePreferences() {
      try {
        const savedPreset = await Preferences.get({
          key: PREF_WEATHER_PRESET_KEY,
        });
        if (
          savedPreset.value &&
          WEATHER_SCENARIO_PRESETS.some((p) => p.id === savedPreset.value)
        ) {
          setActivePresetId(savedPreset.value as WeatherScenarioId);
        }

        const savedRadar = await Preferences.get({
          key: PREF_RADAR_ENABLED_KEY,
        });
        if (savedRadar.value === 'true') {
          setRadarEnabled(true);
        }

        const savedFog = await Preferences.get({
          key: PREF_FOG_ENABLED_KEY,
        });
        if (savedFog.value === 'false') {
          setFogEnabled(false);
        }

        const savedMapType = await Preferences.get({
          key: PREF_MAP_TYPE_KEY,
        });
        if (savedMapType.value && ['voyager', 'satellite', 'dark'].includes(savedMapType.value)) {
          setMapType(savedMapType.value as MapTypeOption);
        }

        const savedZones = await Preferences.get({
          key: PREF_ZONES_ENABLED_KEY,
        });
        if (savedZones.value === 'false') {
          setShowMicroclimateZones(false);
        }

        const savedFavorites = await Preferences.get({
          key: PREF_FAVORITES_KEY,
        });
        if (savedFavorites.value) {
          try {
            const parsed = JSON.parse(savedFavorites.value);
            if (Array.isArray(parsed)) {
              setFavorites(parsed);
            }
          } catch {
            // Ignore
          }
        }

        // Deep linking: auto-select venue if present in URL query
        const params = new URLSearchParams(window.location.search);
        const venueParam = params.get('venue');
        if (venueParam && INDANG_VENUES.some((v) => v.id === venueParam)) {
          setSelectedVenueId(venueParam);
        }
      } catch (err) {
        console.warn('[Preferences] Could not restore saved state:', err);
      }
    }
    restorePreferences();
  }, []);

  // Monitor connectivity
  useEffect(() => {
    let isMounted = true;
    async function initNetworkMonitor() {
      try {
        const status = await Network.getStatus();
        if (isMounted) setIsOnline(status.connected);

        Network.addListener('networkStatusChange', (newStatus) => {
          if (isMounted) setIsOnline(newStatus.connected);
        });
      } catch {
        if (isMounted) setIsOnline(navigator.onLine);
      }
    }
    initNetworkMonitor();
    return () => {
      isMounted = false;
      Network.removeAllListeners().catch(() => {});
    };
  }, []);

  // Acquire GPS position with Indang bounds check
  const syncUserGpsLocation = useCallback(async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 6000,
      });

      const { latitude, longitude } = position.coords;
      const distanceFromIndangKm = calculateDistanceKm(
        latitude,
        longitude,
        INDANG_CENTER_COORDS[0],
        INDANG_CENTER_COORDS[1]
      );

      if (distanceFromIndangKm <= 15) {
        setUserCoords([latitude, longitude]);
        setIsUsingRealGps(true);
      } else {
        setUserCoords(INDANG_CENTER_COORDS);
        setIsUsingRealGps(false);
      }
    } catch {
      setUserCoords(INDANG_CENTER_COORDS);
      setIsUsingRealGps(false);
    }
  }, []);

  useEffect(() => {
    syncUserGpsLocation();
  }, [syncUserGpsLocation]);

  // RainViewer live radar fetch: preload on mount and whenever radar or precipitation mode is active
  useEffect(() => {
    let cancelled = false;
    async function loadRadar() {
      setIsRadarLoading(true);
      const frame = await fetchLatestRainRadarFrame();
      if (!cancelled) {
        setRadarFrame(frame);
        setIsRadarLoading(false);
      }
    }
    loadRadar();
    const interval = setInterval(loadRadar, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [radarEnabled, weatherMeshMode]);

  const handleFetchLiveWeather = useCallback(async () => {
    setIsLiveWeatherLoading(true);
    try {
      const liveData = await fetchLiveIndangWeather();
      setLiveWeatherData(liveData);
      setActivePresetId('live_weather');
      if (liveData.rain_mm >= 3) {
        setWeatherMeshMode('precipitation');
      } else if (liveData.temp_c >= 32) {
        setWeatherMeshMode('heat');
      } else {
        setWeatherMeshMode('mist');
      }
      showToast('Synced with Live Open-Meteo Indang telemetry!');
    } catch (err) {
      console.error('[LiveWeather] Failed to fetch:', err);
      showToast('Could not reach live weather service. Showing upland preset.');
    } finally {
      setIsLiveWeatherLoading(false);
    }
  }, [showToast]);

  const handleSelectWeatherPreset = async (presetId: WeatherScenarioId) => {
    if (presetId === 'live_weather') {
      handleFetchLiveWeather();
      return;
    }
    setActivePresetId(presetId);
    if (presetId === 'extreme_heat') {
      setWeatherMeshMode('heat');
    } else if (presetId === 'habagat_downpour') {
      setWeatherMeshMode('precipitation');
    } else {
      setWeatherMeshMode('mist');
    }
    try {
      await Preferences.set({
        key: PREF_WEATHER_PRESET_KEY,
        value: presetId,
      });
    } catch {
      // Ignore
    }
  };

  const handleToggleFavorite = async (venueId: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(venueId);
      const next = isFav ? prev.filter((id) => id !== venueId) : [...prev, venueId];
      Preferences.set({
        key: PREF_FAVORITES_KEY,
        value: JSON.stringify(next),
      }).catch(() => {});
      showToast(isFav ? 'Removed from favorites' : 'Added to favorites!');
      return next;
    });
  };

  const handleOpenGallery = (venue: ScoredVenue) => {
    setGalleryVenue(venue);
    setIsGalleryOpen(true);
  };

  const handleShareVenue = (venue: ScoredVenue) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('venue', venue.id);
      const shareUrl = url.toString();
      const title = `${venue.name} — UplandBrew Indang`;
      const text = `Check out ${venue.name} in Indang, Cavite (${venue.match_score_pct}% match for today's upland microclimate).`;

      if (navigator.share) {
        navigator.share({ title, text, url: shareUrl }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        showToast(`Share link for ${venue.name} copied to clipboard!`);
      } else {
        showToast(`Spot: ${venue.name}`);
      }
    } catch {
      showToast(`Spot: ${venue.name}`);
    }
  };

  const handleToggleRadar = async () => {
    const nextState = !radarEnabled;
    setRadarEnabled(nextState);
    try {
      await Preferences.set({
        key: PREF_RADAR_ENABLED_KEY,
        value: String(nextState),
      });
    } catch {
      // Ignore
    }
  };

  const handleToggleFog = async () => {
    const nextState = !fogEnabled;
    setFogEnabled(nextState);
    try {
      await Preferences.set({
        key: PREF_FOG_ENABLED_KEY,
        value: String(nextState),
      });
    } catch {
      // Ignore
    }
  };

  const handleChangeMapType = async (type: MapTypeOption) => {
    setMapType(type);
    try {
      await Preferences.set({
        key: PREF_MAP_TYPE_KEY,
        value: type,
      });
    } catch {
      // Ignore
    }
  };

  const handleToggleMicroclimateZones = async () => {
    const nextState = !showMicroclimateZones;
    setShowMicroclimateZones(nextState);
    try {
      await Preferences.set({
        key: PREF_ZONES_ENABLED_KEY,
        value: String(nextState),
      });
    } catch {
      // Ignore
    }
  };

  // Deterministic scoring, searching, and filtering
  const scoredAndFilteredVenues: ScoredVenue[] = useMemo(() => {
    const allScored = INDANG_VENUES.map((venue) =>
      calculateWSS(venue, activeWeatherTelemetry)
    );

    const query = searchQuery.trim().toLowerCase();

    return allScored
      .filter((venue) => {
        // 1. Search query filter
        if (query) {
          const matchName = venue.name.toLowerCase().includes(query);
          const matchBarangay = venue.barangay.toLowerCase().includes(query);
          const matchAddress = venue.address.toLowerCase().includes(query);
          const matchOffering = venue.signature_offering.toLowerCase().includes(query);
          const matchTags =
            (query.includes('wifi') && venue.wifi_ready) ||
            (query.includes('outlet') && venue.power_outlets) ||
            (query.includes('study') && venue.indoor_ac_ratio >= 0.5) ||
            (query.includes('glass') && venue.is_glasshouse) ||
            (query.includes('river') && venue.is_riverside);

          if (!matchName && !matchBarangay && !matchAddress && !matchOffering && !matchTags) {
            return false;
          }
        }

        // 2. Barangay filter
        if (selectedBarangay !== 'ALL' && venue.barangay !== selectedBarangay) {
          return false;
        }

        // 3. Category filter
        switch (activeFilter) {
          case 'favorites':
            return favorites.includes(venue.id);
          case 'rain_glasshouse':
            return venue.is_glasshouse || venue.covered_patio_ratio >= 0.45;
          case 'cvsu_study':
            return (
              venue.wifi_ready &&
              venue.power_outlets &&
              venue.indoor_ac_ratio >= 0.5
            );
          case 'farm_alfresco':
            return (
              venue.open_air_ratio >= 0.25 ||
              venue.is_riverside ||
              venue.barangay === 'Kayquit' ||
              venue.barangay === 'Alulod'
            );
          case 'best_weather':
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (b.match_score_pct !== a.match_score_pct) return b.match_score_pct - a.match_score_pct;
        const distA = calculateDistanceKm(
          userCoords[0],
          userCoords[1],
          a.lat,
          a.lng
        );
        const distB = calculateDistanceKm(
          userCoords[0],
          userCoords[1],
          b.lat,
          b.lng
        );
        return distA - distB;
      });
  }, [activeWeatherTelemetry, searchQuery, selectedBarangay, activeFilter, favorites, userCoords]);

  // Sync active selection
  useEffect(() => {
    if (scoredAndFilteredVenues.length > 0) {
      if (!selectedVenueId || !scoredAndFilteredVenues.some((v) => v.id === selectedVenueId)) {
        setSelectedVenueId(scoredAndFilteredVenues[0].id);
      }
    } else {
      setSelectedVenueId(null);
    }
  }, [scoredAndFilteredVenues, selectedVenueId]);

  const activeVenueIndex = useMemo(() => {
    if (!selectedVenueId) return 0;
    const idx = scoredAndFilteredVenues.findIndex((v) => v.id === selectedVenueId);
    return idx >= 0 ? idx : 0;
  }, [scoredAndFilteredVenues, selectedVenueId]);

  const activeVenue: ScoredVenue | null =
    scoredAndFilteredVenues[activeVenueIndex] ?? null;

  const activeVenueDistanceKm = useMemo(() => {
    if (!activeVenue) return null;
    return calculateDistanceKm(
      userCoords[0],
      userCoords[1],
      activeVenue.lat,
      activeVenue.lng
    );
  }, [activeVenue, userCoords]);

  const handleSelectVenue = (venue: ScoredVenue) => {
    setSelectedVenueId(venue.id);
    setIsPlaceCardDismissed(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('venue', venue.id);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore
    }
  };

  const handleSelectPrevVenue = () => {
    if (scoredAndFilteredVenues.length === 0) return;
    const prevIdx =
      (activeVenueIndex - 1 + scoredAndFilteredVenues.length) %
      scoredAndFilteredVenues.length;
    handleSelectVenue(scoredAndFilteredVenues[prevIdx]);
  };

  const handleSelectNextVenue = () => {
    if (scoredAndFilteredVenues.length === 0) return;
    const nextIdx = (activeVenueIndex + 1) % scoredAndFilteredVenues.length;
    handleSelectVenue(scoredAndFilteredVenues[nextIdx]);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden font-sans antialiased text-zinc-900 dark:text-zinc-100 select-none">
      {/* 1. Atmospheric Upland Fog Mist & Rain Probability Overlay */}
      <AtmosphericFogOverlay
        weather={activeWeatherTelemetry}
        fogEnabled={fogEnabled}
        onToggleFog={handleToggleFog}
      />

      {/* 2. Responsive Desktop Dual-Pane Sidebar (Hidden on Mobile) */}
      <DesktopSidebar
        venues={scoredAndFilteredVenues}
        selectedVenue={activeVenue}
        onSelectVenue={(v) => handleSelectVenue(v)}
        weather={activeWeatherTelemetry}
        userCoords={userCoords}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onOpenGallery={handleOpenGallery}
      />

      {/* 3. Top Floating Microclimate Header with Live Search & Barangay Filter */}
      <WeatherPillHeader
        weather={activeWeatherTelemetry}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        selectedBarangay={selectedBarangay}
        onSelectBarangay={setSelectedBarangay}
        presets={WEATHER_SCENARIO_PRESETS}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectWeatherPreset}
        isOnline={isOnline}
        matchingCount={scoredAndFilteredVenues.length}
        fogEnabled={fogEnabled}
        onToggleFog={handleToggleFog}
        favoritesCount={favorites.length}
        onFetchLiveWeather={handleFetchLiveWeather}
        isLiveWeatherLoading={isLiveWeatherLoading}
      />

      {/* 4. Interactive Geospatial Leaflet Map locked to Indang bounds */}
      <WeatherMap
        venues={scoredAndFilteredVenues}
        selectedVenue={isPlaceCardDismissed ? null : activeVenue}
        onSelectVenue={handleSelectVenue}
        userCoords={userCoords}
        isUsingRealGps={isUsingRealGps}
        onRecenterGps={syncUserGpsLocation}
        radarEnabled={radarEnabled}
        onToggleRadar={handleToggleRadar}
        radarFrame={radarFrame}
        isRadarLoading={isRadarLoading}
        mapType={mapType}
        onChangeMapType={handleChangeMapType}
        showMicroclimateZones={showMicroclimateZones}
        onToggleMicroclimateZones={handleToggleMicroclimateZones}
        weather={activeWeatherTelemetry}
        weatherMeshMode={weatherMeshMode}
        onChangeWeatherMeshMode={setWeatherMeshMode}
        isMobileDetailExpanded={isDrawerExpanded}
      />

      {/* 5. Middle-Low Google Maps-Style Selected Place Card */}
      {activeVenue && !isPlaceCardDismissed && (
        <VenueDetailCard
          venue={activeVenue}
          rankIndex={activeVenueIndex}
          totalVenues={scoredAndFilteredVenues.length}
          isExpanded={isDrawerExpanded}
          onToggleExpand={() => setIsDrawerExpanded((prev) => !prev)}
          onSelectPrev={handleSelectPrevVenue}
          onSelectNext={handleSelectNextVenue}
          userDistanceKm={activeVenueDistanceKm}
          onClose={() => setIsPlaceCardDismissed(true)}
          isFavorite={favorites.includes(activeVenue.id)}
          onToggleFavorite={handleToggleFavorite}
          onOpenGallery={handleOpenGallery}
          onShare={handleShareVenue}
        />
      )}

      {/* 6. Venue Menu & Photo Gallery Modal */}
      {isGalleryOpen && galleryVenue && (
        <VenueGalleryModal
          venue={galleryVenue}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}

      {/* 7. Action Toast Notification */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[1200] px-4 py-2.5 rounded-2xl bg-zinc-900/95 dark:bg-white/95 text-white dark:text-zinc-900 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-black/10 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2"
        >
          <span>✨</span>
          <span>{toastMessage}</span>
        </aside>
      )}
    </main>
  );
};

export default App;
