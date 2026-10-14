import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  Tooltip,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Radar,
  LocateFixed,
  Compass,
  Layers,
  Check,
  X,
  Lock,
  CloudFog,
  CloudRain,
  Sliders,
  Plus,
  Minus,
  Waves,
  Car,
  Footprints,
} from 'lucide-react';
import {
  MapTypeOption,
  MicroclimateZone,
  RadarFrameInfo,
  RouteGeometry,
  ScoredVenue,
  WeatherData,
  WeatherMeshMode,
} from '../types/venue';
import { getTierBadgeStyle } from '../utils/scoring';
import {
  INDANG_BOUNDS,
  INDANG_CENTER_COORDS,
  INDANG_MICROCLIMATE_ZONES,
} from '../data/mockVenues';
import { IsobaricMistMeshLayer } from './IsobaricMistMeshLayer';
import { IndangPerimeterFogMask } from './IndangPerimeterFogMask';
import { WeatherIntensityLegendBar } from './WeatherIntensityLegendBar';
import { fetchRouteGeometry } from '../services/routingService';

interface WeatherMapProps {
  venues: ScoredVenue[];
  selectedVenue: ScoredVenue | null;
  onSelectVenue: (venue: ScoredVenue) => void;
  userCoords: [number, number];
  isUsingRealGps: boolean;
  onRecenterGps: () => void;
  radarEnabled: boolean;
  onToggleRadar: () => void;
  radarFrame: RadarFrameInfo | null;
  isRadarLoading: boolean;
  mapType: MapTypeOption;
  onChangeMapType: (type: MapTypeOption) => void;
  showMicroclimateZones: boolean;
  onToggleMicroclimateZones: () => void;
  weather: WeatherData;
  weatherMeshMode?: WeatherMeshMode;
  onChangeWeatherMeshMode?: (mode: WeatherMeshMode) => void;
  isMobileDetailExpanded?: boolean;
}

/**
 * Controller component that handles flyTo triggers and monitors live zoom level
 */
const MapCameraController: React.FC<{
  selectedVenue: ScoredVenue | null;
  flyToTrigger: { coords: [number, number]; zoom: number; nonce: number } | null;
  onZoomChange: (zoom: number) => void;
}> = ({ selectedVenue, flyToTrigger, onZoomChange }) => {
  const map = useMap();

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  useEffect(() => {
    if (selectedVenue) {
      map.flyTo([selectedVenue.lat, selectedVenue.lng], 15, {
        animate: true,
        duration: 0.75,
      });
    }
  }, [selectedVenue, map]);

  useEffect(() => {
    if (flyToTrigger) {
      map.flyTo(flyToTrigger.coords, flyToTrigger.zoom, {
        animate: true,
        duration: 0.85,
      });
    }
  }, [flyToTrigger, map]);

  return null;
};

/**
 * Generates simplistic, compact, and appealing map pins (32px)
 * displaying match percentage and tier styling without obscuring map terrain.
 */
/**
 * Generates simplistic, compact, and mathematically precise vector map pins (32x40px).
 * Features a sharp needle tip anchored with subpixel precision directly on coordinates,
 * bottom-center scaling origin to prevent selection drift, and clean match percentage display.
 */
function createVenuePillIcon(
  venue: ScoredVenue,
  isSelected: boolean,
  isTopPick: boolean
): L.DivIcon {
  const tier = getTierBadgeStyle(venue.color_tier);
  const scaleTransform = isSelected ? 'scale(1.22)' : 'scale(1)';
  const pinFill = isSelected ? tier.hexPrimary : '#FFFFFF';
  const pinStroke = isSelected ? '#FFFFFF' : tier.hexPrimary;
  const textColor = isSelected ? '#FFFFFF' : tier.hexPrimary;
  const innerCircleFill = isSelected ? `${tier.hexSecondary}dd` : '#F8FAFC';
  const dropFilter = isSelected
    ? `drop-shadow(0 0 6px ${tier.hexPrimary}cc) drop-shadow(0 4px 10px rgba(0,0,0,0.35))`
    : `drop-shadow(0 2px 4px rgba(0,0,0,0.22))`;

  const html = `
    <div style="
      position: relative;
      width: 32px;
      height: 40px;
      cursor: pointer;
      transform-origin: 16px 39px;
      transform: ${scaleTransform};
      transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      filter: ${dropFilter};
      pointer-events: auto;
    ">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; overflow: visible;">
        <!-- Ground contact shadow ellipse -->
        <ellipse cx="16" cy="39" rx="4.5" ry="1.4" fill="rgba(15,23,42,0.28)" />
        
        <!-- Precision Teardrop Body pointing exactly at (16, 39) -->
        <path
          d="M 16 39 C 12 30 3 22.5 3 14 A 13 13 0 1 1 29 14 C 29 22.5 20 30 16 39 Z"
          fill="${pinFill}"
          stroke="${pinStroke}"
          stroke-width="2.2"
          stroke-linejoin="round"
        />

        <!-- Inner score disk -->
        <circle cx="16" cy="14" r="10" fill="${innerCircleFill}" stroke="${pinStroke}" stroke-width="0.8" opacity="0.95" />

        <!-- Score readout -->
        <text
          x="16"
          y="14"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="Inter, -apple-system, sans-serif"
          font-weight="900"
          font-size="9.5"
          fill="${textColor}"
          letter-spacing="-0.3px"
        >${venue.match_score_pct}<tspan font-size="6.5" font-weight="700">%</tspan></text>

        <!-- Precision needle tip anchor bead at ground contact point -->
        <circle cx="16" cy="39" r="1.3" fill="${tier.hexPrimary}" stroke="#FFFFFF" stroke-width="0.6" />

        ${
          isTopPick
            ? `<!-- Top Pick Star Badge -->
               <g transform="translate(25, 4)">
                 <circle cx="0" cy="0" r="5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.2" />
                 <text x="0" y="0.5" text-anchor="middle" dominant-baseline="central" font-size="6.5" font-weight="900" fill="#FFFFFF">★</text>
               </g>`
            : ''
        }
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'upland-compact-pin-marker',
    html,
    iconSize: [32, 40],
    iconAnchor: [16, 39],
    popupAnchor: [0, -40],
  });
}

/**
 * Generates geospatially anchored density badges for Fog and Rain Zones
 * that scale and move 1:1 with terrain coordinates during zooming.
 */
function createZoneDensityBadge(zone: MicroclimateZone): L.DivIcon {
  const isFog = zone.type === 'fog_zone';
  const isRain = zone.type === 'rain_zone';
  const icon = isFog ? '🌫️' : isRain ? '🌧️' : '🌿';

  const html = `
    <div style="
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      border-radius: 9999px;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #FFFFFF;
      font-family: Inter, -apple-system, sans-serif;
      font-size: 10px;
      font-weight: 700;
      border: 1px solid ${zone.accentColor}88;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      white-space: nowrap;
      pointer-events: auto;
      cursor: pointer;
    ">
      <span>${icon}</span>
      <span style="color: ${zone.accentColor}; font-weight: 800;">${zone.densityPct}%</span>
      <span style="opacity: 0.9;">${zone.name.split(' ')[0]}</span>
    </div>
  `;

  return L.divIcon({
    className: 'upland-zone-density-badge',
    html,
    iconSize: [120, 24],
    iconAnchor: [60, 12],
  });
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  venues,
  selectedVenue,
  onSelectVenue,
  userCoords,
  isUsingRealGps,
  onRecenterGps,
  radarEnabled,
  onToggleRadar,
  radarFrame,
  isRadarLoading,
  mapType,
  onChangeMapType,
  showMicroclimateZones,
  onToggleMicroclimateZones,
  weather,
  weatherMeshMode: externalMeshMode,
  onChangeWeatherMeshMode,
  isMobileDetailExpanded = false,
}) => {
  const [internalMeshMode, setInternalMeshMode] = useState<WeatherMeshMode>('mist');
  const activeMeshMode = externalMeshMode ?? internalMeshMode;
  const handleMeshModeChange = (mode: WeatherMeshMode) => {
    setInternalMeshMode(mode);
    onChangeWeatherMeshMode?.(mode);
  };

  const [flyTarget, setFlyTarget] = useState<{
    coords: [number, number];
    zoom: number;
    nonce: number;
  } | null>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(14);
  const [showLayersModal, setShowLayersModal] = useState<boolean>(false);
  const [activeZoneDetail, setActiveZoneDetail] = useState<MicroclimateZone | null>(null);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.70);
  const [fogDensity, setFogDensity] = useState<number>(0.85);

  const [route, setRoute] = useState<RouteGeometry | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!selectedVenue) {
      setRoute(null);
      return;
    }
    const destCoords: [number, number] = [selectedVenue.lat, selectedVenue.lng];

    async function loadRoute() {
      setIsRouteLoading(true);
      try {
        const geo = await fetchRouteGeometry(userCoords, destCoords);
        if (isMounted) {
          setRoute(geo);
          setIsRouteLoading(false);
        }
      } catch {
        if (isMounted) setIsRouteLoading(false);
      }
    }

    loadRoute();
    return () => {
      isMounted = false;
    };
  }, [selectedVenue?.id, userCoords[0], userCoords[1]]);

  const handleRecenterUser = () => {
    onRecenterGps();
    setFlyTarget({
      coords: userCoords,
      zoom: 15,
      nonce: Date.now(),
    });
  };

  const handleResetIndangOverview = () => {
    setFlyTarget({
      coords: INDANG_CENTER_COORDS,
      zoom: 14,
      nonce: Date.now(),
    });
  };

  const cartoKey = import.meta.env.VITE_CARTO_API_KEY || 'cb1_4ke0_1_4c00f6d7e8aa454860d5b7df';

  const getTileConfig = () => {
    switch (mapType) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri World Imagery & GeoEye',
          maxZoom: 18,
          maxNativeZoom: 18,
          subdomains: ['a', 'b', 'c', 'd'],
        };
      case 'dark':
        return {
          url: `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`,
          attribution: '&copy; CARTO Dark Matter',
          maxZoom: 18,
          maxNativeZoom: 18,
          subdomains: ['a', 'b', 'c', 'd'],
        };
      case 'voyager':
      default:
        return {
          url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoKey}`,
          attribution: '&copy; CARTO Voyager Upland',
          maxZoom: 18,
          maxNativeZoom: 18,
          subdomains: ['a', 'b', 'c', 'd'],
        };
    }
  };

  const activeTileConfig = getTileConfig();
  const isRadarActive = radarEnabled || activeMeshMode === 'precipitation';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-100 dark:bg-zinc-950 select-none">
      <MapContainer
        center={INDANG_CENTER_COORDS}
        zoom={14}
        minZoom={11.5}
        maxZoom={18}
        zoomSnap={0.25}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        maxBounds={INDANG_BOUNDS}
        maxBoundsViscosity={0.65}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        {/* Base Map Tiles */}
        <TileLayer
          key={mapType}
          attribution={activeTileConfig.attribution}
          url={activeTileConfig.url}
          maxZoom={activeTileConfig.maxZoom}
          maxNativeZoom={activeTileConfig.maxNativeZoom}
          subdomains={activeTileConfig.subdomains}
        />

        {/* Topographic Fog of War & Outside Indang Cloud Mask */}
        <IndangPerimeterFogMask mapType={mapType} />

        {/* Apple Weather-style Dynamic Whole-Municipality Isobaric Heat & Mist Mesh */}
        {showMicroclimateZones && (
          <IsobaricMistMeshLayer
            weather={weather}
            meshEnabled={showMicroclimateZones}
            opacityMultiplier={fogDensity}
            mapType={mapType}
            mode={activeMeshMode}
          />
        )}

        {/* Terrain-Anchored Microclimate Zone Badges (Clickable for rich telemetry modal) */}
        {showMicroclimateZones &&
          INDANG_MICROCLIMATE_ZONES.map((zone) => (
            <Marker
              key={zone.id}
              position={zone.centerCoords}
              icon={createZoneDensityBadge(zone)}
              zIndexOffset={450}
              eventHandlers={{
                click: () => setActiveZoneDetail(zone),
              }}
            >
              <Tooltip sticky direction="top">
                <div className="p-1 font-sans text-xs">
                  <div className="font-bold flex items-center gap-1 text-zinc-900">
                    <span>{zone.type === 'fog_zone' ? '🌫️' : zone.type === 'rain_zone' ? '🌧️' : '🌿'}</span>
                    <span>{zone.label}</span>
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-0.5">
                    {zone.elevationRange} • {zone.currentEffect}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          ))}


        {/* GPS Pulse Marker */}
        <CircleMarker
          center={userCoords}
          radius={20}
          pathOptions={{
            color: '#0EA5E9',
            fillColor: '#0EA5E9',
            fillOpacity: 0.18,
            weight: 1,
          }}
        />
        <CircleMarker
          center={userCoords}
          radius={6.5}
          pathOptions={{
            color: '#FFFFFF',
            fillColor: '#0284C7',
            fillOpacity: 1,
            weight: 2.5,
          }}
        />

        {/* Dynamic Route Polyline from User GPS to Selected Venue */}
        {selectedVenue && route && route.coordinates.length > 1 && (
          <>
            {/* Route glow outline */}
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color: '#38BDF8',
                weight: 7,
                opacity: 0.45,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Route main street line */}
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color: '#0284C7',
                weight: 3.5,
                opacity: 0.95,
                dashArray: '6, 8',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Simplistic, Compact & Appealing Venue Markers (32px) with Interactive Tooltip */}
        {venues.map((venue, idx) => {
          const isSelected = selectedVenue?.id === venue.id;
          const isTopPick = idx === 0;
          const tier = getTierBadgeStyle(venue.color_tier);
          return (
            <Marker
              key={`${venue.id}-${venue.match_score_pct}-${isSelected}`}
              position={[venue.lat, venue.lng]}
              icon={createVenuePillIcon(venue, isSelected, isTopPick)}
              zIndexOffset={isSelected ? 1000 : isTopPick ? 600 : 100 - idx}
              eventHandlers={{
                click: () => onSelectVenue(venue),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -42]}
                opacity={0.97}
              >
                <div className="p-1 font-sans text-xs">
                  <div className="font-extrabold flex items-center justify-between gap-2 text-zinc-900">
                    <span className="truncate max-w-[140px]">{venue.name}</span>
                    <span className="text-[10px] text-amber-500 font-bold shrink-0">★ {venue.popularity_rating}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                    <span>{venue.barangay}</span>
                    <span>•</span>
                    <span>{venue.local_temp_c}°C</span>
                    <span>•</span>
                    <span style={{ color: tier.hexPrimary }} className="font-extrabold">
                      {venue.match_score_pct}% Match
                    </span>
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        <MapCameraController
          selectedVenue={selectedVenue}
          flyToTrigger={flyTarget}
          onZoomChange={setCurrentZoom}
        />
      </MapContainer>

      {/* Weather Intensity Legend Line Bar (Adjusted to the Right Side) */}
      <WeatherIntensityLegendBar
        weather={weather}
        mode={activeMeshMode}
        onModeChange={handleMeshModeChange}
        className={`fixed right-3 sm:right-5 z-[940] max-w-[320px] sm:max-w-[340px] w-[calc(100vw-24px)] transition-all duration-300 ${
          selectedVenue
            ? 'bottom-[200px] sm:bottom-[210px] lg:bottom-5'
            : 'bottom-4 sm:bottom-5'
        } ${
          isMobileDetailExpanded
            ? 'opacity-0 pointer-events-none -translate-y-2 lg:opacity-100 lg:pointer-events-auto lg:translate-y-0'
            : 'opacity-100'
        }`}
      />

      {/* Floating Map Controls & Zoom Toolbar (Right Side) */}
      <div className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-[950] flex flex-col gap-2.5">
        {/* Zoom In/Out Buttons with Smooth Level Readout */}
        <div className="flex flex-col gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/50 dark:border-zinc-800 rounded-2xl shadow-glass overflow-hidden p-1">
          <button
            type="button"
            onClick={() =>
              setFlyTarget({
                coords: INDANG_CENTER_COORDS,
                zoom: Math.min(18, Math.round((currentZoom + 0.5) * 2) / 2),
                nonce: Date.now(),
              })
            }
            title="Smooth Zoom In"
            className="p-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="text-[9px] font-mono font-bold text-center py-0.5 text-zinc-500 border-y border-zinc-100 dark:border-zinc-800">
            {Number.isInteger(currentZoom) ? currentZoom : currentZoom.toFixed(1)}x
          </div>
          <button
            type="button"
            onClick={() =>
              setFlyTarget({
                coords: INDANG_CENTER_COORDS,
                zoom: Math.max(12.5, Math.round((currentZoom - 0.5) * 2) / 2),
                nonce: Date.now(),
              })
            }
            title="Smooth Zoom Out"
            className="p-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Map Types & Layer Details FAB */}
        <button
          type="button"
          onClick={() => setShowLayersModal(true)}
          title="Map Types, Radar & Density Controls"
          aria-label="Map Layers and Type Switcher"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/50 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-glass hover:scale-105 active:scale-95 transition-all"
        >
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </button>

        {/* 2. Toggle Weather Mesh FAB (Replaces Toggle Radar FAB) */}
        <button
          type="button"
          onClick={onToggleMicroclimateZones}
          title={
            showMicroclimateZones
              ? 'Hide Isobaric Weather Mesh (Mist, Heat, Rain)'
              : 'Show Isobaric Weather Mesh (Mist, Heat, Rain)'
          }
          aria-label="Toggle Weather Mesh"
          className={`relative w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-300 ${
            showMicroclimateZones
              ? 'bg-sky-500 text-white border-sky-300 shadow-pill-radar scale-105'
              : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 border-white/50 dark:border-zinc-800 shadow-glass hover:scale-105'
          }`}
        >
          {showMicroclimateZones && (
            <span className="absolute inset-0 rounded-full bg-sky-400 animate-radar-pulse pointer-events-none" />
          )}
          <Waves className="w-5 h-5 relative z-10" />
        </button>

        {/* 3. Recenter GPS FAB */}
        <button
          type="button"
          onClick={handleRecenterUser}
          title={
            isUsingRealGps
              ? 'Recenter on your live GPS'
              : 'Recenter on CvSU / Indang Center'
          }
          aria-label="Recenter GPS"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/50 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-glass hover:scale-105 active:scale-95 transition-all"
        >
          <LocateFixed className="w-5 h-5 text-sky-600 dark:text-sky-400" />
        </button>

        {/* 4. Reset Indang Bounds Overview FAB */}
        <button
          type="button"
          onClick={handleResetIndangOverview}
          title="Reset to Full Indang Municipal Boundary"
          aria-label="Reset Indang Overview"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/50 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-glass hover:scale-105 active:scale-95 transition-all"
        >
          <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </button>
      </div>

      {/* Live Meteorological Mesh Status Pill */}
      {showMicroclimateZones && (
        <div className="fixed left-3 sm:left-5 lg:left-[460px] top-32 z-[900] pointer-events-none transition-all">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 text-slate-100 backdrop-blur-xl border border-white/20 shadow-lg text-[11px] font-medium">
            <Waves className="w-3.5 h-3.5 text-sky-400" />
            <span>
              Weather Mesh: <strong className="capitalize">{activeMeshMode}</strong> • {Math.round(fogDensity * 100)}% Opacity
            </span>
          </div>
        </div>
      )}

      {/* Floating Route Travel Time Preview Pill */}
      {selectedVenue && route && (
        <div className="fixed top-28 sm:top-24 left-1/2 -translate-x-1/2 lg:left-[calc(50%+210px)] z-[950] pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 dark:bg-white/95 text-white dark:text-zinc-900 shadow-xl backdrop-blur-xl border border-white/20 dark:border-black/10 text-xs font-semibold">
            <span className="flex items-center gap-1 text-sky-400 dark:text-sky-600 font-bold">
              <Car className="w-3.5 h-3.5" />
              <span>{route.drivingMinutes} min</span>
            </span>
            <span className="text-zinc-500">•</span>
            <span className="font-mono text-[11px] text-zinc-300 dark:text-zinc-600">
              {route.distanceKm.toFixed(1)} km
            </span>
            <span className="text-zinc-500">•</span>
            <span className="flex items-center gap-1 text-emerald-400 dark:text-emerald-600 text-[11px]">
              <Footprints className="w-3 h-3" />
              <span>{route.walkingMinutes} min walk</span>
            </span>
          </div>
        </div>
      )}

      {/* Active Zone Detail Inspector Pill */}
      {activeZoneDetail && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[960] pointer-events-auto max-w-md w-[92vw] sm:w-auto">
          <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/60 dark:border-zinc-800 shadow-2xl flex items-start gap-3">
            <div
              className="p-2 rounded-xl text-white shrink-0"
              style={{ backgroundColor: activeZoneDetail.accentColor }}
            >
              {activeZoneDetail.type === 'fog_zone' ? (
                <CloudFog className="w-4 h-4" />
              ) : (
                <CloudRain className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                    {activeZoneDetail.name}
                  </h4>
                  <span className="font-mono text-[10px] font-extrabold text-sky-600 bg-sky-500/15 px-1.5 py-0.5 rounded-md">
                    {activeZoneDetail.densityPct}% Density
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveZoneDetail(null)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {activeZoneDetail.description}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                <span>{activeZoneDetail.elevationRange}</span>
                <span>•</span>
                <span>{activeZoneDetail.currentEffect}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Types, Radar Density & Details Modal */}
      {showLayersModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/60 dark:border-zinc-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  Map Styles & Atmosphere
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLayersModal(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Map Types Selector */}
            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Basemap Style
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeMapType('voyager')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    mapType === 'voyager'
                      ? 'bg-sky-500/15 border-sky-500 text-sky-700 dark:text-sky-300 font-bold ring-2 ring-sky-500/30'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sm">
                    🗺️
                  </div>
                  <span className="text-[11px]">Voyager</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeMapType('satellite')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    mapType === 'satellite'
                      ? 'bg-sky-500/15 border-sky-500 text-sky-700 dark:text-sky-300 font-bold ring-2 ring-sky-500/30'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-sm">
                    🛰️
                  </div>
                  <span className="text-[11px]">Satellite</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeMapType('dark')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    mapType === 'dark'
                      ? 'bg-sky-500/15 border-sky-500 text-sky-700 dark:text-sky-300 font-bold ring-2 ring-sky-500/30'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-sm">
                    🌙
                  </div>
                  <span className="text-[11px]">Dark Mode</span>
                </button>
              </div>
            </div>

            {/* 2. Atmosphere & Smoke Density Sliders */}
            <div className="space-y-3 mb-4">
              {/* Isobaric Mist Mesh Density Slider */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <CloudFog className="w-3.5 h-3.5 text-sky-500" />
                    <span>Isobaric Mist Mesh Density</span>
                  </span>
                  <span className="font-mono text-sky-600 dark:text-sky-400">
                    {Math.round(fogDensity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={fogDensity}
                  onChange={(e) => setFogDensity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between text-[9px] font-semibold text-zinc-400 mt-1">
                  <span>Soft Mist (20%)</span>
                  <span>Deep Atmospheric Mesh (100%)</span>
                </div>
              </div>

              {/* Radar Precipitation Density Slider */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-500" />
                    <span>Precipitation Layer Density</span>
                  </span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {Math.round(radarOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="1.0"
                  step="0.05"
                  value={radarOpacity}
                  onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[9px] font-semibold text-zinc-400 mt-1">
                  <span>Light (25%)</span>
                  <span>Full Saturation (100%)</span>
                </div>
              </div>
            </div>

            {/* 3. Toggles */}
            <div className="space-y-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
              {/* RainViewer Live Radar */}
              <button
                type="button"
                onClick={onToggleRadar}
                className="w-full p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <Radar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      RainViewer Precipitation Radar
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Synchronized scaling across zoom levels 10x-18x
                    </span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
                    radarEnabled ? 'bg-sky-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  {radarEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              {/* Isobaric Microclimate Mesh & Badges Toggle */}
              <button
                type="button"
                onClick={onToggleMicroclimateZones}
                className="w-full p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      Isobaric Microclimate Mesh
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Apple Weather-style gradient contours & badges
                    </span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
                    showMicroclimateZones ? 'bg-sky-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  {showMicroclimateZones && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowLayersModal(false)}
              className="w-full mt-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs shadow-md transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
