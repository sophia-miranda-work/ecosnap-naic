/**
 * Tiny weather helper using Open-Meteo (no API key).
 *
 * We classify the current sky into one of: rainy, snowy, foggy, sunny,
 * partly-cloudy, or cloudy, so we can surface a matching bonus quest from
 * one of our characters.
 */

import { getCurrentCoords } from "./vitamin-d";

export type WeatherKind =
  | "rainy"
  | "snowy"
  | "foggy"
  | "sunny"
  | "partly-cloudy"
  | "cloudy";

export type CurrentWeather = {
  /** mm of precipitation in the last hour. */
  precipitation: number;
  /** WMO weather interpretation code. */
  weatherCode: number;
  /** Cloud cover percentage 0–100, if reported. */
  cloudCover: number;
  /** Whether the sun is currently above the horizon at this location. */
  isDay: boolean;
  /** Convenience boolean — is some form of rain falling now? */
  isRaining: boolean;
  /** High-level weather classification. */
  kind: WeatherKind;
};

/** WMO codes that mean "some kind of rain/drizzle/showers". */
const RAIN_CODES = new Set<number>([
  51, 53, 55, // drizzle
  56, 57, // freezing drizzle
  61, 63, 65, // rain
  66, 67, // freezing rain
  80, 81, 82, // rain showers
  95, 96, 99, // thunderstorm (often with rain)
]);

/** WMO codes that mean snow / sleet / snow showers. */
const SNOW_CODES = new Set<number>([71, 73, 75, 77, 85, 86]);

/** WMO codes that mean fog / depositing rime fog. */
const FOG_CODES = new Set<number>([45, 48]);

function classify(args: {
  weatherCode: number;
  precipitation: number;
  cloudCover: number;
  isDay: boolean;
}): WeatherKind {
  const { weatherCode, precipitation, cloudCover, isDay } = args;
  if (precipitation > 0 || RAIN_CODES.has(weatherCode)) return "rainy";
  if (SNOW_CODES.has(weatherCode)) return "snowy";
  if (FOG_CODES.has(weatherCode)) return "foggy";
  // WMO 0=clear, 1=mainly clear, 2=partly cloudy, 3=overcast.
  if (weatherCode === 0 || (weatherCode === 1 && cloudCover < 30)) {
    return isDay ? "sunny" : "cloudy"; // no "sunny" at night — fall back
  }
  if (weatherCode === 3 || cloudCover >= 80) return "cloudy";
  return "partly-cloudy";
}

export async function fetchCurrentWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation,weather_code,cloud_cover,is_day&timezone=auto`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
  const json = (await res.json()) as {
    current?: {
      precipitation?: number;
      weather_code?: number;
      cloud_cover?: number;
      is_day?: number;
    };
  };
  const precipitation = json.current?.precipitation ?? 0;
  const weatherCode = json.current?.weather_code ?? 0;
  const cloudCover = json.current?.cloud_cover ?? 0;
  const isDay = (json.current?.is_day ?? 1) === 1;
  const isRaining = precipitation > 0 || RAIN_CODES.has(weatherCode);
  const kind = classify({ weatherCode, precipitation, cloudCover, isDay });
  return { precipitation, weatherCode, cloudCover, isDay, isRaining, kind };
}

export { getCurrentCoords };