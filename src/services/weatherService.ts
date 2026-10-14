import { HourlyForecastPoint, WeatherData } from '../types/venue';

/**
 * Maps WMO Weather Interpretation Codes (0-99) to clean descriptions and icons.
 */
function mapWmoCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear Sky', icon: '☀️' };
  if (code === 1) return { condition: 'Mainly Clear', icon: '🌤️' };
  if (code === 2) return { condition: 'Partly Cloudy', icon: '⛅' };
  if (code === 3) return { condition: 'Overcast Cloud', icon: '☁️' };
  if (code === 45 || code === 48) return { condition: 'Highland Mist & Fog', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { condition: 'Upland Drizzle', icon: '🌦️' };
  if (code >= 61 && code <= 65) return { condition: 'Rain Showers', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { condition: 'Hail / Cold Precipitation', icon: '🌨️' };
  if (code >= 80 && code <= 82) return { condition: 'Heavy Rain Showers', icon: '🌧️' };
  if (code >= 95 && code <= 99) return { condition: 'Thunderstorm Squall', icon: '⛈️' };
  return { condition: 'Upland Weather', icon: '🌤️' };
}

/**
 * Estimates fog index (0-100%) from relative humidity, cloud cover, and elevation dew point.
 */
function estimateFogIndex(humidity: number, cloudCover: number, wmoCode: number): number {
  if (wmoCode === 45 || wmoCode === 48) return 88;
  if (wmoCode >= 51 && wmoCode <= 55) return 80;
  if (humidity >= 90) return Math.min(100, Math.round(50 + (humidity - 90) * 4 + cloudCover * 0.2));
  if (humidity >= 80) return Math.min(75, Math.round(25 + (humidity - 80) * 2.5 + cloudCover * 0.15));
  return Math.max(5, Math.round((cloudCover / 100) * 20));
}

/**
 * Fetches authentic real-time meteorological observations for Indang, Cavite
 * from Open-Meteo's high-resolution global forecast model (free, no API key required).
 */
export async function fetchLiveIndangWeather(): Promise<WeatherData> {
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=14.1953&longitude=120.8770&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,cloud_cover,weather_code&timezone=Asia%2FManila&forecast_days=1';

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Open-Meteo API HTTP ${res.status}`);
  }

  const data = await res.json();
  const current = data.current;
  const hourly = data.hourly;

  const currentWmo = mapWmoCode(current.weather_code ?? 1);
  const fogIndex = estimateFogIndex(
    current.relative_humidity_2m ?? 80,
    current.cloud_cover ?? 40,
    current.weather_code ?? 1
  );

  // Find the closest current hour index in the hourly array
  const now = new Date();
  const currentHour = now.getHours();

  // Generate next 6 hours timeline
  const hourlyPoints: HourlyForecastPoint[] = [];
  const startIdx = Math.max(0, currentHour);

  for (let offset = 0; offset <= 5; offset++) {
    const idx = startIdx + offset;
    if (idx < hourly.time.length) {
      const pointHour = (currentHour + offset) % 24;
      const hourFormatted =
        pointHour === 0
          ? '12 AM'
          : pointHour < 12
          ? `${pointHour} AM`
          : pointHour === 12
          ? '12 PM'
          : `${pointHour - 12} PM`;

      const wmo = mapWmoCode(hourly.weather_code[idx] ?? 1);
      const rainPoP = hourly.precipitation_probability ? hourly.precipitation_probability[idx] ?? 10 : 10;
      const pointHumidity = current.relative_humidity_2m ?? 80;
      const pointCloud = hourly.cloud_cover ? hourly.cloud_cover[idx] ?? 30 : 30;

      hourlyPoints.push({
        timeLabel: offset === 0 ? 'Now' : hourFormatted,
        hour: pointHour,
        temp_c: Math.round((hourly.temperature_2m[idx] ?? current.temperature_2m) * 10) / 10,
        rain_probability_pct: Math.min(100, Math.max(0, Math.round(rainPoP))),
        rain_mm: Math.round((hourly.precipitation ? hourly.precipitation[idx] ?? 0 : 0) * 10) / 10,
        fog_index: estimateFogIndex(pointHumidity, pointCloud, hourly.weather_code[idx] ?? 1),
        condition: wmo.condition,
        icon: wmo.icon,
      });
    }
  }

  return {
    temp_c: Math.round((current.temperature_2m ?? 24) * 10) / 10,
    feels_like_c: Math.round((current.apparent_temperature ?? current.temperature_2m ?? 24) * 10) / 10,
    rain_mm: Math.round((current.precipitation ?? current.rain ?? 0) * 10) / 10,
    wind_kph: Math.round(current.wind_speed_10m ?? 12),
    uv_index: currentHour >= 9 && currentHour <= 16 ? (current.cloud_cover > 75 ? 3 : 7) : 0,
    humidity_pct: Math.round(current.relative_humidity_2m ?? 85),
    rain_probability_pct: hourlyPoints[0]?.rain_probability_pct ?? 15,
    fog_index: fogIndex,
    condition_text: currentWmo.condition,
    barangay_nowcast: `Live: ${currentWmo.condition} across Indang`,
    is_live: true,
    hourly_forecast: hourlyPoints,
  };
}
