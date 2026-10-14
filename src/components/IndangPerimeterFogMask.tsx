import React, { useEffect, useRef } from 'react';
import { Polygon, Polyline, useMap } from 'react-leaflet';
import { MapTypeOption } from '../types/venue';
import { INDANG_MUNICIPAL_PERIMETER } from '../data/mockVenues';

interface IndangPerimeterFogMaskProps {
  mapType: MapTypeOption;
}

// World bounding coordinates to create the inverted boundary mask
const WORLD_MASK_RING: [number, number][] = [
  [-85, -180],
  [85, -180],
  [85, 180],
  [-85, 180],
  [-85, -180],
];

/**
 * Professional Topographic Focus Mask & Atmospheric Vignette.
 * Minimalist, high-contrast, executive GIS presentation:
 * Quietly de-emphasizes the surrounding territory outside Indang with an
 * elegant, semi-opaque atmospheric veil and a subtle feathered boundary gradient,
 * isolating Indang as the illuminated, high-fidelity subject.
 */
export const IndangPerimeterFogMask: React.FC<IndangPerimeterFogMaskProps> = ({
  mapType,
}) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const isDark = mapType === 'dark';
  const boundaryColor = isDark ? '#38BDF8' : '#0284C7';
  const maskColor = isDark ? '#090D16' : '#F1F5F9';

  // Closed perimeter loop for boundary polyline
  const closedPerimeter: [number, number][] = [
    ...INDANG_MUNICIPAL_PERIMETER,
    INDANG_MUNICIPAL_PERIMETER[0],
  ];

  // Render a subtle, clean feathered atmospheric boundary vignette on map move/resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted || !canvas) return;
      const size = map.getSize();
      if (canvas.width !== size.x || canvas.height !== size.y) {
        canvas.width = size.x;
        canvas.height = size.y;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const perimeterPoints = INDANG_MUNICIPAL_PERIMETER.map((coord) =>
        map.latLngToContainerPoint(coord)
      );

      ctx.save();

      // Subtle, clean atmospheric relief shadow along the municipal boundary
      ctx.lineWidth = 14;
      ctx.strokeStyle = isDark
        ? 'rgba(0, 0, 0, 0.40)'
        : 'rgba(148, 163, 184, 0.35)';

      ctx.beginPath();
      for (let i = 0; i < perimeterPoints.length; i++) {
        if (i === 0) ctx.moveTo(perimeterPoints[i].x, perimeterPoints[i].y);
        else ctx.lineTo(perimeterPoints[i].x, perimeterPoints[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Delicate inner boundary feather with soft luminous glow
      ctx.shadowColor = isDark ? '#38BDF8' : '#0284C7';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;
      ctx.strokeStyle = isDark
        ? 'rgba(56, 189, 248, 0.35)'
        : 'rgba(2, 132, 199, 0.25)';
      ctx.stroke();

      ctx.restore();
    };

    render();

    map.on('resize', render);
    map.on('move', render);
    map.on('zoomend', render);

    return () => {
      isMounted = false;
      map.off('resize', render);
      map.off('move', render);
      map.off('zoomend', render);
    };
  }, [map, isDark]);

  return (
    <>
      {/* 1. Professional Topographic Focus Mask (Soft semi-opaque atmospheric veil outside Indang) */}
      <Polygon
        positions={[WORLD_MASK_RING, INDANG_MUNICIPAL_PERIMETER]}
        pathOptions={{
          fillColor: maskColor,
          fillOpacity: 0.88,
          weight: 0,
          stroke: false,
          interactive: false,
        }}
      />

      {/* 2. Minimalist Boundary Atmospheric Relief Canvas */}
      <div className="absolute inset-0 pointer-events-none z-[410] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* 3. Multi-Layer High-Precision Municipal Boundary Visuals */}
      {/* Layer A: Wide Ambient Luminous Glow (12px) */}
      <Polyline
        positions={closedPerimeter}
        pathOptions={{
          color: isDark ? '#0284C7' : '#38BDF8',
          weight: 12,
          opacity: isDark ? 0.30 : 0.22,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false,
        }}
      />

      {/* Layer B: Vibrant Secondary Aura (5px) */}
      <Polyline
        positions={closedPerimeter}
        pathOptions={{
          color: isDark ? '#38BDF8' : '#0284C7',
          weight: 5,
          opacity: 0.65,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false,
        }}
      />

      {/* Layer C: Crisp Precision Laser Core Line (2px) */}
      <Polyline
        positions={closedPerimeter}
        pathOptions={{
          color: isDark ? '#E0F2FE' : '#0369A1',
          weight: 2,
          opacity: 0.98,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false,
        }}
      />

      {/* Layer D: Architectural Topographic Dashed Beacon Sensor Ticks (1.4px) */}
      <Polyline
        positions={closedPerimeter}
        pathOptions={{
          color: '#FFFFFF',
          weight: 1.4,
          dashArray: '4, 10',
          opacity: 0.95,
          lineCap: 'butt',
          lineJoin: 'round',
          interactive: false,
        }}
      />
    </>
  );
};
