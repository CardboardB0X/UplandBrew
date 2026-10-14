import { ColorTier, ScoredVenue, Venue, WeatherData } from '../types/venue';

export type UplandWeatherRegime =
  | 'SEVERE_RAIN_OR_WIND'
  | 'LIGHT_UPLAND_DRIZZLE'
  | 'EXTREME_HEAT_UV'
  | 'COOL_PLEASANT_BREEZE'
  | 'MODERATE_TRANSITIONAL';

/**
 * Classifies active Indang microclimate telemetry into one of five upland weather regimes.
 */
export function classifyWeatherRegime(weather: WeatherData): UplandWeatherRegime {
  const { rain_mm, wind_kph, feels_like_c, uv_index, temp_c } = weather;

  if (rain_mm >= 7.5 || wind_kph > 30) {
    return 'SEVERE_RAIN_OR_WIND';
  }

  if ((rain_mm > 0 && rain_mm < 7.5) || (weather.rain_probability_pct >= 70 && weather.fog_index >= 60)) {
    return 'LIGHT_UPLAND_DRIZZLE';
  }

  if (feels_like_c >= 33 || uv_index >= 8) {
    return 'EXTREME_HEAT_UV';
  }

  if (temp_c >= 20 && temp_c <= 27 && rain_mm === 0) {
    return 'COOL_PLEASANT_BREEZE';
  }

  return 'MODERATE_TRANSITIONAL';
}

function clampScore(rawScore: number): number {
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

/**
 * Maps 0-100% weather match to design color tier.
 */
export function getScoreColorTier(scorePct: number): ColorTier {
  if (scorePct >= 80) return 'emerald';
  if (scorePct >= 55) return 'amber';
  return 'rose';
}

/**
 * Returns human-readable, universal suitability tier metadata.
 * Uses plain, intuitive phrases instead of jargon.
 */
export function getTierBadgeStyle(tier: ColorTier): {
  label: string;
  shortLabel: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  glowClass: string;
  hexPrimary: string;
  hexSecondary: string;
} {
  switch (tier) {
    case 'emerald':
      return {
        label: 'Perfect Match',
        shortLabel: 'Ideal',
        bgClass: 'bg-emerald-500/15 dark:bg-emerald-500/20',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        borderClass: 'border-emerald-500/30',
        glowClass: 'shadow-pill-emerald',
        hexPrimary: '#10B981',
        hexSecondary: '#047857',
      };
    case 'amber':
      return {
        label: 'Fair Choice',
        shortLabel: 'Fair',
        bgClass: 'bg-amber-500/15 dark:bg-amber-500/20',
        textClass: 'text-amber-700 dark:text-amber-300',
        borderClass: 'border-amber-500/30',
        glowClass: 'shadow-pill-amber',
        hexPrimary: '#F59E0B',
        hexSecondary: '#B45309',
      };
    case 'rose':
      return {
        label: 'Weather Warning',
        shortLabel: 'Alert',
        bgClass: 'bg-rose-500/15 dark:bg-rose-500/20',
        textClass: 'text-rose-700 dark:text-rose-300',
        borderClass: 'border-rose-500/30',
        glowClass: 'shadow-pill-rose',
        hexPrimary: '#F43F5E',
        hexSecondary: '#BE123C',
      };
  }
}

/**
 * Calculates a universal Weather Match Score (0-100%) and local temperature
 * based on elevation lapse rate and architectural seating topology.
 */
export function calculateWSS(venue: Venue, weather: WeatherData): ScoredVenue {
  const regime = classifyWeatherRegime(weather);

  // Elevation lapse rate: ~0.65°C drop per 100m elevation gain above 300m baseline
  const elevationDeltaM = venue.elevation_m - 300;
  const localTempC = Number(
    (weather.temp_c - (elevationDeltaM * 0.0065)).toFixed(1)
  );

  const altitudeDelta = elevationDeltaM / 100;
  const effectiveRainProbability = Math.min(
    100,
    Math.max(0, Math.round(weather.rain_probability_pct + altitudeDelta * 6))
  );
  const effectiveFogDensity = Math.min(
    100,
    Math.max(0, Math.round(weather.fog_index + altitudeDelta * 12))
  );

  let rawScore = 50;
  let recommendationReason = '';
  let weatherWarningTag: string | null = null;

  switch (regime) {
    case 'SEVERE_RAIN_OR_WIND': {
      rawScore =
        venue.indoor_ac_ratio * 78 +
        venue.covered_patio_ratio * 24 -
        venue.open_air_ratio * 48;

      if (venue.has_paved_walkway) {
        rawScore += 14;
      } else {
        rawScore -= 22;
        weatherWarningTag = 'Muddy Path Hazard';
      }

      if (venue.has_covered_parking) {
        rawScore += 12;
      } else {
        rawScore -= 6;
      }

      if (venue.is_riverside) {
        rawScore -= 28;
        weatherWarningTag = 'Ravine Swell Hazard';
      }

      if (venue.open_air_ratio >= 0.5 && !weatherWarningTag) {
        weatherWarningTag = `Exposed (${weather.wind_kph} km/h Gusts)`;
      }

      if (venue.indoor_ac_ratio >= 0.7 && venue.has_paved_walkway) {
        recommendationReason = `${Math.round(
          venue.indoor_ac_ratio * 100
        )}% enclosed climate control with paved access—shielded from ${
          weather.rain_mm
        } mm/h monsoon rain.`;
      } else if (venue.indoor_ac_ratio >= 0.45) {
        recommendationReason = `Good indoor shelter (${Math.round(
          venue.indoor_ac_ratio * 100
        )}% AC space), though open verandas may get wind-blown spray.`;
      } else {
        recommendationReason = `High outdoor exposure (${Math.round(
          venue.open_air_ratio * 100
        )}% open lawn); vulnerable to ${weather.wind_kph} km/h mountain gusts.`;
      }
      break;
    }

    case 'LIGHT_UPLAND_DRIZZLE': {
      rawScore =
        venue.covered_patio_ratio * 58 +
        venue.indoor_ac_ratio * 52 -
        venue.open_air_ratio * 25;

      if (venue.is_glasshouse) {
        rawScore += 30;
      }

      if (venue.covered_patio_ratio >= 0.4) {
        rawScore += 12;
      }

      if (venue.has_paved_walkway) {
        rawScore += 10;
      } else {
        rawScore -= 12;
        weatherWarningTag = 'Damp Lawn Path';
      }

      if (venue.has_covered_parking) {
        rawScore += 5;
      }

      if (venue.open_air_ratio >= 0.6) {
        weatherWarningTag = 'Lawn Seating Wet';
      }

      if (venue.is_glasshouse) {
        recommendationReason = `Signature rain-viewing glass dome (${venue.elevation_m}m ASL)—spectacular misty ridge views while staying 100% dry.`;
      } else if (venue.covered_patio_ratio >= 0.45) {
        recommendationReason = `Roofed veranda & kubo layout (${Math.round(
          venue.covered_patio_ratio * 100
        )}% covered patio)—ideal for ${localTempC}°C upland mist and hot coffee.`;
      } else if (venue.indoor_ac_ratio >= 0.7) {
        recommendationReason = `Comfortable ${Math.round(
          venue.indoor_ac_ratio * 100
        )}% indoor AC space with reliable Wi-Fi and power during light drizzle.`;
      } else {
        recommendationReason = `Mostly open lawn tables (${Math.round(
          venue.open_air_ratio * 100
        )}% open-air); limited dry seating under active mist (${effectiveFogDensity}% density).`;
      }
      break;
    }

    case 'EXTREME_HEAT_UV': {
      rawScore =
        venue.indoor_ac_ratio * 86 +
        venue.covered_patio_ratio * 34 -
        venue.open_air_ratio * 42;

      if (venue.is_glasshouse && venue.indoor_ac_ratio < 0.6) {
        rawScore -= 14;
        weatherWarningTag = `Radiant Solar Glare (UV ${weather.uv_index})`;
      } else if (venue.indoor_ac_ratio >= 0.75) {
        rawScore += 12;
      }

      if (venue.has_covered_parking) {
        rawScore += 8;
      }

      if (venue.is_riverside && venue.covered_patio_ratio >= 0.4) {
        rawScore += 6;
      }

      if (venue.open_air_ratio >= 0.45) {
        weatherWarningTag = `Direct Sunlight (UV ${weather.uv_index})`;
      }

      if (venue.indoor_ac_ratio >= 0.7) {
        recommendationReason = `Full climate control (${Math.round(
          venue.indoor_ac_ratio * 100
        )}% AC) protecting you from ${weather.feels_like_c}°C apparent heat and a UV index of ${
          weather.uv_index
        }.`;
      } else if (venue.covered_patio_ratio >= 0.5) {
        recommendationReason = `Shaded roof blocks direct solar radiation (UV ${weather.uv_index}), though ambient air is warm (${localTempC}°C).`;
      } else {
        recommendationReason = `Uncovered outdoor terraces face intense solar glare and heat (UV ${weather.uv_index}).`;
      }
      break;
    }

    case 'COOL_PLEASANT_BREEZE': {
      rawScore =
        venue.open_air_ratio * 66 +
        venue.covered_patio_ratio * 62 +
        venue.indoor_ac_ratio * 38;

      if (venue.open_air_ratio + venue.covered_patio_ratio >= 0.65) {
        rawScore += 24;
      }

      if (venue.is_riverside) {
        rawScore += 10;
      }

      if (venue.is_glasshouse) {
        rawScore += 8;
      }

      if (venue.open_air_ratio >= 0.45) {
        recommendationReason = `Prime ${localTempC}°C mountain airflow from Tagaytay ridge with zero rain—ideal for garden terrace dining.`;
      } else if (venue.is_riverside) {
        recommendationReason = `Shaded river deck captures fresh spring airflow (${weather.wind_kph} km/h), making creekside dining exceptionally refreshing.`;
      } else if (venue.covered_patio_ratio >= 0.4) {
        recommendationReason = `Open-sided patio (${Math.round(
          venue.covered_patio_ratio * 100
        )}% covered deck) captures Indang's natural mountain breeze.`;
      } else {
        recommendationReason = `Cozy indoor lounge, though today's crisp ${localTempC}°C ridge breeze favors open-air farm seating.`;
      }
      break;
    }

    case 'MODERATE_TRANSITIONAL':
    default: {
      rawScore =
        venue.indoor_ac_ratio * 55 +
        venue.covered_patio_ratio * 60 +
        venue.open_air_ratio * 45 +
        15;
      recommendationReason = `Balanced hybrid seating layout well-suited for mild ${localTempC}°C conditions in ${venue.barangay}.`;
      break;
    }
  }

  const matchScorePct = clampScore(rawScore);
  const colorTier = getScoreColorTier(matchScorePct);
  const { label: suitabilityLabel } = getTierBadgeStyle(colorTier);

  return {
    ...venue,
    match_score_pct: matchScorePct,
    color_tier: colorTier,
    suitability_label: suitabilityLabel,
    recommendation_reason: recommendationReason,
    weather_warning_tag: weatherWarningTag,
    local_temp_c: localTempC,
    effective_rain_probability_pct: effectiveRainProbability,
    effective_fog_density_pct: effectiveFogDensity,
  };
}
