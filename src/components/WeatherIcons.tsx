import React from 'react';

interface IconProps {
  className?: string;
}

/**
 * Bespoke Upland Mist & Fog icon with layered waving vapor currents
 */
export const UplandFogIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 8h16M2 12h18.5a1.5 1.5 0 0 0 1.5-1.5 2.5 2.5 0 0 0-2.5-2.5c-.2 0-.4.02-.6.06A4.5 4.5 0 0 0 12 5.5a4.5 4.5 0 0 0-4.3 3.1A3 3 0 0 0 4 8" opacity="0.5" />
    <path d="M3 15h18" />
    <path d="M5 19h14" />
    <path d="M7 11h10" />
  </svg>
);

/**
 * Indang Liberica Coffee Bean Icon
 */
export const LibericaBeanIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <ellipse cx="12" cy="12" rx="7.5" ry="9.5" />
    <path d="M12 2.5c2 4-3 7 0 9.5s2 5.5 0 9.5" />
  </svg>
);

/**
 * Architectural Glasshouse / Geodesic Conservatory Dome
 */
export const GlassDomeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 20h18" />
    <path d="M4 20C4 11.16 7.58 4 12 4s8 7.16 8 16" />
    <path d="M12 4v16" />
    <path d="M6 14h12" />
    <path d="M8 8.5h8" />
  </svg>
);

/**
 * Upland Ridge / Elevation Altitude Icon
 */
export const RidgeElevationIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 19l6.5-11 4.5 7 3-4.5 4 8.5H3z" />
    <path d="M14 15l-2.5-3.5L9.5 8" opacity="0.6" />
    <circle cx="18" cy="6" r="2" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

/**
 * Covered Kubo / Veranda Shelter Icon
 */
export const KuboShelterIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M2 10L12 3l10 7" />
    <path d="M4 9.5V20h16V9.5" />
    <path d="M9 20v-6h6v6" />
    <path d="M4 14h16" opacity="0.4" />
  </svg>
);

/**
 * Riverside Spring / Natural Cavite Waterway Icon
 */
export const SpringWaterIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M2 6c3 0 3 2 6 2s3-2 6-2 3 2 6 2" />
    <path d="M2 12c3 0 3 2 6 2s3-2 6-2 3 2 6 2" />
    <path d="M2 18c3 0 3 2 6 2s3-2 6-2 3 2 6 2" />
  </svg>
);

/**
 * Precision Rain Probability (PoP) Icon
 */
export const RainPoPIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    <path d="M9 13a3 3 0 0 0 6 0" opacity="0.5" />
  </svg>
);
