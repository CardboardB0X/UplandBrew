import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { MapTypeOption, WeatherData, WeatherMeshMode } from '../types/venue';
import { INDANG_MUNICIPAL_PERIMETER } from '../data/mockVenues';

interface IsobaricMistMeshLayerProps {
  weather: WeatherData;
  meshEnabled: boolean;
  opacityMultiplier?: number;
  mapType?: MapTypeOption;
  mode?: WeatherMeshMode;
}

interface StreamlineParticle {
  lat: number;
  lng: number;
  speed: number;
  length: number;
  alpha: number;
}

/**
 * Professional Geospatial Weather Mesh Layer.
 * Supports clean mode separation:
 * - 'precipitation': Live rain fronts & sleek Windy velocity streamlines.
 * - 'mist' & 'heat': Shared continuous spectrum (Red -> Orange -> White -> Light Blue -> Blue).
 */
export const IsobaricMistMeshLayer: React.FC<IsobaricMistMeshLayerProps> = ({
  weather,
  meshEnabled,
  opacityMultiplier = 0.82,
  mapType = 'voyager',
  mode = 'precipitation',
}) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<StreamlineParticle[]>([]);

  const isDark = mapType === 'dark';

  // Initialize subtle Windy-style meteorological velocity streamlines
  useEffect(() => {
    const particles: StreamlineParticle[] = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      particles.push({
        lat: 14.130 + Math.random() * 0.110,
        lng: 120.820 + Math.random() * 0.100,
        speed: 0.0004 + Math.random() * 0.0005,
        length: 10 + Math.random() * 12,
        alpha: 0.3 + Math.random() * 0.5,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    const startTime = performance.now();

    const resize = () => {
      const size = map.getSize();
      if (canvas.width !== size.x || canvas.height !== size.y) {
        canvas.width = size.x;
        canvas.height = size.y;
      }
    };
    resize();

    map.on('resize', resize);
    map.on('move', resize);

    const render = (now: number) => {
      if (!isRunning) return;

      resize();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!meshEnabled) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      const elapsed = (now - startTime) * 0.001;
      const currentZoom = map.getZoom();

      // Atmospheric weight scaler
      const intensityFactor = Math.max(
        0.45,
        Math.min(
          1.1,
          (weather.fog_index / 100) * 0.45 +
            (weather.rain_probability_pct / 100) * 0.35 +
            (weather.rain_mm > 0 ? 0.30 : 0.0)
        )
      );
      const effectiveAlpha = intensityFactor * opacityMultiplier;

      // Project Indang municipal perimeter onto screen coordinates
      const perimeterPoints = INDANG_MUNICIPAL_PERIMETER.map((coord) =>
        map.latLngToContainerPoint(coord)
      );

      // Bounding box of Indang on screen
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      for (let i = 0; i < perimeterPoints.length; i++) {
        const pt = perimeterPoints[i];
        if (pt.x < minX) minX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y > maxY) maxY = pt.y;
      }

      const width = maxX - minX;
      const height = maxY - minY;
      const centerX = minX + width * 0.5;
      const centerY = minY + height * 0.5;

      ctx.save();

      // STRICT GEOGRAPHIC CLIPPING: Paint strictly inside Indang
      ctx.beginPath();
      for (let i = 0; i < perimeterPoints.length; i++) {
        if (i === 0) ctx.moveTo(perimeterPoints[i].x, perimeterPoints[i].y);
        else ctx.lineTo(perimeterPoints[i].x, perimeterPoints[i].y);
      }
      ctx.closePath();
      ctx.clip();

      const isMistOrHeat = mode === 'mist' || mode === 'heat';

      if (isMistOrHeat) {
        // ============================================================
        // SHARED MIST & HEAT SPECTRUM (Red -> Orange -> White -> Light Blue -> Blue)
        // ============================================================
        // North/Valley (Heat): Red/Orange
        // Mid (Plateau): White / Warm White
        // South/Ridge (Mist/Cool): Light Blue / Blue
        const thermalGrad = ctx.createLinearGradient(centerX, minY, centerX, maxY);

        // Elevation lapse gradient: Top/North to Bottom/South
        thermalGrad.addColorStop(0, 'rgba(239, 68, 68, 0.26)');   // Red (Heat)
        thermalGrad.addColorStop(0.25, 'rgba(249, 115, 22, 0.22)'); // Orange (Warm)
        thermalGrad.addColorStop(0.50, 'rgba(255, 255, 255, 0.28)'); // White (Comfortable)
        thermalGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.24)');  // Light Blue (Mist)
        thermalGrad.addColorStop(1.0, 'rgba(2, 132, 199, 0.28)');   // Blue (Cold Ridge Fog)

        ctx.globalAlpha = effectiveAlpha * 0.70;
        ctx.fillStyle = thermalGrad;
        ctx.fillRect(minX - 20, minY - 20, width + 40, height + 40);

        // Dynamic Undulating Spectrum Wave Fronts
        const waveCount = 4;
        const waveSpeed = 0.22;

        for (let w = 0; w < waveCount; w++) {
          const phaseOffset = (w / waveCount) * Math.PI * 2;
          const progress = ((elapsed * waveSpeed + phaseOffset) % (Math.PI * 2)) / (Math.PI * 2);

          const waveCenterY = minY + progress * height;
          const waveRadius = width * 0.45;

          ctx.save();
          ctx.globalAlpha = effectiveAlpha * 0.22 * (1.0 - Math.abs(progress - 0.5) * 1.3);

          ctx.beginPath();
          const steps = 28;
          for (let s = 0; s <= steps; s++) {
            const theta = (s / steps) * Math.PI * 2;
            const harmonic = Math.sin(theta * 3 + elapsed * 0.5 + w) * 0.12;
            const r = waveRadius * (1.0 + harmonic);
            const px = centerX + Math.cos(theta) * r;
            const py = waveCenterY + Math.sin(theta) * r;

            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();

          const waveGrad = ctx.createRadialGradient(centerX, waveCenterY, 0, centerX, waveCenterY, waveRadius);
          waveGrad.addColorStop(0, 'rgba(249, 115, 22, 0.25)'); // Orange
          waveGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.35)'); // White
          waveGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.25)'); // Light Blue
          waveGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

          ctx.fillStyle = waveGrad;
          ctx.fill();

          // Subtle isoline trace
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.lineWidth = 1.0;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.restore();
        }

        // Highland Ridge Mist Accent (Kayquit - 380m)
        const kayquitScreen = map.latLngToContainerPoint([14.178, 120.871]);
        const metersPerPixel = (40075016.686 * Math.cos((14.1953 * Math.PI) / 180)) / Math.pow(2, currentZoom + 8);
        const ridgeRadiusPx = (1400 / metersPerPixel);

        ctx.save();
        const ridgePulse = 1.0 + Math.sin(elapsed * 0.8) * 0.06;
        ctx.globalAlpha = effectiveAlpha * 0.40;

        const ridgeGrad = ctx.createRadialGradient(
          kayquitScreen.x,
          kayquitScreen.y,
          0,
          kayquitScreen.x,
          kayquitScreen.y,
          ridgeRadiusPx * ridgePulse
        );
        ridgeGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)'); // Light Blue
        ridgeGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.25)'); // Blue
        ridgeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = ridgeGrad;
        ctx.beginPath();
        ctx.arc(kayquitScreen.x, kayquitScreen.y, ridgeRadiusPx * ridgePulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else {
        // ============================================================
        // PRECIPITATION & RAIN RADAR SPECTRUM
        // ============================================================
        const rainGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.65);
        rainGrad.addColorStop(0, 'rgba(2, 132, 199, 0.28)'); // Azure
        rainGrad.addColorStop(0.65, 'rgba(99, 102, 241, 0.22)'); // Royal Blue
        rainGrad.addColorStop(1, 'rgba(186, 230, 253, 0.08)');

        ctx.globalAlpha = effectiveAlpha * 0.55;
        ctx.fillStyle = rainGrad;
        ctx.fillRect(minX - 20, minY - 20, width + 40, height + 40);

        // Windy-style subtle velocity rain streamlines
        const isRaining = weather.rain_mm > 0 || weather.rain_probability_pct >= 40;
        if (isRaining) {
          const rainNorm = Math.min(1.0, Math.max(0.2, weather.rain_mm / 14.0));
          const streamAlpha = 0.25 + rainNorm * 0.45;
          const streamColor = isDark ? '#38BDF8' : '#0284C7';
          const particles = particlesRef.current;
          const slant = 0.22;

          ctx.save();
          ctx.lineWidth = 1.3;

          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.lat -= p.speed * 0.010;
            p.lng += p.speed * 0.004;

            if (p.lat < 14.122) p.lat = 14.244;
            if (p.lng > 120.928) p.lng = 120.818;

            const pt = map.latLngToContainerPoint([p.lat, p.lng]);
            const len = p.length * (1 + rainNorm * 0.6);

            const tailX = pt.x + Math.sin(slant) * len;
            const tailY = pt.y + Math.cos(slant) * len;

            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(tailX, tailY);

            ctx.strokeStyle = streamColor;
            ctx.globalAlpha = p.alpha * streamAlpha;
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      ctx.restore(); // Restore context, ending Indang clipping

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      map.off('resize', resize);
      map.off('move', resize);
    };
  }, [map, meshEnabled, weather, opacityMultiplier, mapType, isDark, mode]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[420] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
        style={{
          mixBlendMode: isDark ? 'screen' : 'multiply',
        }}
      />
    </div>
  );
};
