export type IndangBarangay =
  | 'CvSU Main Campus'
  | 'Bancod'
  | 'Poblacion'
  | 'Kayquit'
  | 'Alulod';

export type ColorTier = 'emerald' | 'amber' | 'rose';

export type FilterCategory =
  | 'best_weather'
  | 'rain_glasshouse'
  | 'cvsu_study'
  | 'farm_alfresco'
  | 'favorites';

export type WeatherScenarioId =
  | 'upland_drizzle'
  | 'habagat_downpour'
  | 'extreme_heat'
  | 'cool_breeze'
  | 'live_weather';

export type MapTypeOption = 'voyager' | 'satellite' | 'dark';
export type WeatherMeshMode = 'precipitation' | 'mist' | 'heat';

export interface MenuItem {
  id: string;
  name: string;
  category: 'Specialty Coffee' | 'Signature Drinks' | 'Comfort Food' | 'Pastries & Desserts';
  price_php: number;
  description: string;
  is_signature?: boolean;
  is_cold?: boolean;
}

export interface VenuePhoto {
  url: string;
  caption: string;
  tag: 'Ambiance' | 'Seating' | 'Coffee & Food' | 'Mountain View';
}

export interface PopularHour {
  hour: number;
  label: string;
  busynessPct: number; // 0 to 100
  isPeak?: boolean;
}

export interface RouteGeometry {
  coordinates: [number, number][]; // [lat, lng] points along streets
  distanceKm: number;
  drivingMinutes: number;
  walkingMinutes: number;
}

export interface HourlyForecastPoint {
  timeLabel: string;
  hour: number;
  temp_c: number;
  rain_probability_pct: number;
  rain_mm: number;
  fog_index: number;
  condition: string;
  icon: string;
}

export interface MicroclimateZone {
  id: string;
  name: string;
  type: 'fog_zone' | 'rain_zone' | 'breeze_zone' | 'sheltered_zone';
  label: string;
  description: string;
  centerCoords: [number, number];
  polygonCoords: [number, number][];
  coreCoords?: [number, number][];
  elevationRange: string;
  currentEffect: string;
  accentColor: string;
  densityPct: number; // Atmospheric weight and density
}

export interface Venue {
  id: string;
  name: string;
  barangay: IndangBarangay;
  address: string;
  lat: number;
  lng: number;
  elevation_m: number;
  image_url: string;
  /** Ratio 0.0 to 1.0 (sum with covered_patio_ratio + open_air_ratio === 1.0) */
  indoor_ac_ratio: number;
  /** Ratio 0.0 to 1.0 (covered verandas, kubos, roofed decks) */
  covered_patio_ratio: number;
  /** Ratio 0.0 to 1.0 (exposed farm lawns, open view decks) */
  open_air_ratio: number;
  is_glasshouse: boolean;
  is_riverside: boolean;
  has_covered_parking: boolean;
  has_paved_walkway: boolean;
  wifi_ready: boolean;
  power_outlets: boolean;
  signature_offering: string;
  distance_from_cvsu_km: number;
  opening_hours: string;
  price_level: '$' | '$$' | '$$$';
  contact?: string;
  popularity_rating: number; // e.g. 4.9 out of 5.0
  review_count: number; // e.g. 380
  traffic_level: 'High Traffic' | 'Moderate' | 'Relaxed & Quiet';
  description?: string;
  menu?: MenuItem[];
  gallery_photos?: VenuePhoto[];
  popular_hours?: PopularHour[];
}

export interface WeatherData {
  temp_c: number;
  feels_like_c: number;
  rain_mm: number;
  wind_kph: number;
  uv_index: number;
  humidity_pct: number;
  rain_probability_pct: number;
  fog_index: number; // 0 to 100% density of upland mist and fog
  condition_text: string;
  barangay_nowcast: string;
  is_live?: boolean;
  hourly_forecast?: HourlyForecastPoint[];
}

export interface WeatherScenarioPreset {
  id: WeatherScenarioId;
  label: string;
  short_label: string;
  badge_title: string;
  description: string;
  telemetry: WeatherData;
}

export interface ScoredVenue extends Venue {
  match_score_pct: number; // Universal 0-100% weather match (replacing cryptic WSS jargon)
  color_tier: ColorTier;
  suitability_label: string; // e.g. "Perfect Match", "Good with Caution", "Weather Risk"
  recommendation_reason: string;
  weather_warning_tag: string | null;
  local_temp_c: number; // Elevation-adjusted real temperature at this venue
  effective_rain_probability_pct: number;
  effective_fog_density_pct: number;
}

export interface RadarFrameInfo {
  tileUrlTemplate: string;
  timestampUnix: number;
  formattedTimePHT: string;
  host: string;
  path: string;
}
