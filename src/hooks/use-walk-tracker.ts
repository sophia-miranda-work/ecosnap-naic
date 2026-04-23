import { useEffect, useRef, useState } from "react";

type Coords = { lat: number; lon: number };

export type WalkTrackerStatus =
  | "idle"
  | "requesting"
  | "tracking"
  | "denied"
  | "unavailable"
  | "error";

export type WalkTrackerState = {
  status: WalkTrackerStatus;
  /** Distance in meters accumulated since tracking started. */
  distanceMeters: number;
  /** Number of GPS samples collected. */
  points: number;
  /** Last error message, if any. */
  error: string | null;
};

const EARTH_RADIUS_M = 6_371_000;
/** Ignore tiny GPS jitter under this many meters between samples. */
const MIN_STEP_M = 3;
/** Ignore samples with poor accuracy (meters). */
const MAX_ACCURACY_M = 30;

function haversine(a: Coords, b: Coords): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/**
 * Tracks walking distance via the browser Geolocation API while `active` is true.
 * Resets distance to 0 each time tracking starts.
 */
export function useWalkTracker(active: boolean): WalkTrackerState {
  const [state, setState] = useState<WalkTrackerState>({
    status: "idle",
    distanceMeters: 0,
    points: 0,
    error: null,
  });
  const lastCoordsRef = useRef<Coords | null>(null);

  useEffect(() => {
    if (!active) {
      lastCoordsRef.current = null;
      setState((s) =>
        s.status === "idle" ? s : { ...s, status: "idle", error: null },
      );
      return;
    }

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState({
        status: "unavailable",
        distanceMeters: 0,
        points: 0,
        error: "Geolocation is not available in this browser.",
      });
      return;
    }

    // Reset distance for the new walk.
    lastCoordsRef.current = null;
    setState({
      status: "requesting",
      distanceMeters: 0,
      points: 0,
      error: null,
    });

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (typeof accuracy === "number" && accuracy > MAX_ACCURACY_M) {
          // Skip noisy samples but mark that we're receiving data.
          setState((s) => ({ ...s, status: "tracking" }));
          return;
        }
        const next: Coords = { lat: latitude, lon: longitude };
        const prev = lastCoordsRef.current;
        lastCoordsRef.current = next;

        setState((s) => {
          if (!prev) {
            return { ...s, status: "tracking", points: s.points + 1 };
          }
          const step = haversine(prev, next);
          if (step < MIN_STEP_M) {
            return { ...s, status: "tracking", points: s.points + 1 };
          }
          return {
            ...s,
            status: "tracking",
            distanceMeters: s.distanceMeters + step,
            points: s.points + 1,
          };
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState((s) => ({
          ...s,
          status: denied ? "denied" : "error",
          error: err.message || "Unable to read location.",
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [active]);

  return state;
}