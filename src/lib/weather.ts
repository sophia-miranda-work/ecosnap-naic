/**
 * Tiny weather helper using Open-Meteo (no API key).
 *
 * We just need to know "is it raining right now?" to surface a bonus
 * rainy-day quest from Mossback. The `precipitation` field reports mm in
 * the last hour — anything > 0 counts as rain. We also fall back to the
 * WMO weather_code to catch drizzle/showers when precipitation rounds to 0.
 */

import { getCurrentCoords } from "./vitamin-d";

export type CurrentWeather = {
  /** mm of precipitation in the last hour. */
  precipitation: number;
  /** WMO weather interpretation code. */
  weatherCode: number;
  /** Convenience boolean — is some form of rain falling now? */
  isRaining: boolean;
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

export async function fetchCurrentWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation,weather_code&timezone=auto`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
  const json = (await res.json()) as {
    current?: { precipitation?: number; weather_code?: number };
  };
  const precipitation = json.current?.precipitation ?? 0;
  const weatherCode = json.current?.weather_code ?? 0;
  const isRaining = precipitation > 0 || RAIN_CODES.has(weatherCode);
  return { precipitation, weatherCode, isRaining };
}

export { getCurrentCoords };