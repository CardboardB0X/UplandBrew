import { RouteGeometry } from '../types/venue';

/**
 * Calculates Haversine distance in kilometers.
 */
function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
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

/**
 * Fetches real street driving route from OpenStreetMap OSRM public routing API.
 * Falls back to an interpolated geometric path if offline or timed out.
 */
export async function fetchRouteGeometry(
  fromCoords: [number, number],
  toCoords: [number, number]
): Promise<RouteGeometry> {
  const [fromLat, fromLng] = fromCoords;
  const [toLat, toLng] = toCoords;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
        const drivingMinutes = Math.max(1, Math.round(route.duration / 60));
        // Approximate walking time at ~4.5 km/h
        const walkingMinutes = Math.max(2, Math.round((distanceKm / 4.5) * 60));

        // OSRM returns coordinates as [lng, lat], Leaflet needs [lat, lng]
        const leafletCoords: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );

        return {
          coordinates: leafletCoords,
          distanceKm,
          drivingMinutes,
          walkingMinutes,
        };
      }
    }
  } catch (err) {
    // Fall back to geodesic route interpolation
  }

  // Graceful fallback: 5-point interpolated road path
  const directDistance = haversineDistanceKm(fromLat, fromLng, toLat, toLng);
  const estimatedKm = Math.round(directDistance * 1.25 * 10) / 10;
  const drivingMinutes = Math.max(1, Math.round((estimatedKm / 35) * 60));
  const walkingMinutes = Math.max(2, Math.round((estimatedKm / 4.5) * 60));

  const steps = 6;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    coords.push([
      fromLat + (toLat - fromLat) * t,
      fromLng + (toLng - fromLng) * t,
    ]);
  }

  return {
    coordinates: coords,
    distanceKm: estimatedKm,
    drivingMinutes,
    walkingMinutes,
  };
}
