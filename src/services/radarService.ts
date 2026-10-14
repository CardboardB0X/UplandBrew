import { RadarFrameInfo } from '../types/venue';

interface RainViewerRadarItem {
  time: number;
  path: string;
}

interface RainViewerApiResponse {
  version: string;
  generated: number;
  host: string;
  radar?: {
    past?: RainViewerRadarItem[];
    nowcast?: RainViewerRadarItem[];
  };
}

const RAINVIEWER_API_URL = 'https://api.rainviewer.com/public/weather-maps.json';

/**
 * Formats a Unix epoch timestamp (seconds) into Philippine Standard Time (PHT / UTC+8)
 * e.g., "4:30 PM PHT"
 */
function formatUnixToPHT(unixSeconds: number): string {
  try {
    const date = new Date(unixSeconds * 1000);
    return (
      new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila',
      }).format(date) + ' PHT'
    );
  } catch {
    return 'Live Nowcast';
  }
}

/**
 * Queries RainViewer's public weather-maps API, extracts the latest available
 * precipitation radar frame, and constructs a Leaflet-compatible XYZ raster tile URL.
 *
 * Tile URL format specification:
 * {host}{path}/256/{z}/{x}/{y}/{color}/{options}.png
 * Color scheme 2 = Universal Blue, Options 1_1 = smoothed + snow/rain mask
 */
export async function fetchLatestRainRadarFrame(): Promise<RadarFrameInfo | null> {
  try {
    const response = await fetch(RAINVIEWER_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RainViewer HTTP status ${response.status}`);
    }

    const data: RainViewerApiResponse = await response.json();
    const host = data.host || 'https://tilecache.rainviewer.com';
    const pastFrames = data.radar?.past ?? [];
    const nowcastFrames = data.radar?.nowcast ?? [];

    // Prefer the most recent observed radar frame; if unavailable, check nowcast
    const latestFrame =
      pastFrames.length > 0
        ? pastFrames[pastFrames.length - 1]
        : nowcastFrames.length > 0
        ? nowcastFrames[0]
        : null;

    if (!latestFrame) {
      return null;
    }

    const tileUrlTemplate = `${host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    return {
      tileUrlTemplate,
      timestampUnix: latestFrame.time,
      formattedTimePHT: formatUnixToPHT(latestFrame.time),
      host,
      path: latestFrame.path,
    };
  } catch (error) {
    console.warn('[RadarService] Unable to load live RainViewer frame:', error);
    return null;
  }
}
