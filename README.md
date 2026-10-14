# ☕ Kalawakan / UplandBrew Indang

> **Hyper-Local Microclimate Weather & Specialty Coffee Intelligence for Indang, Cavite**  
> Elevated between 285m and 375m Above Sea Level (ASL) across the Cavite Upland Ridge.

![UplandBrew Indang Preview](public/preview.png)

---

## 🌟 Overview

**UplandBrew Indang** is a progressive geospatial web & mobile application designed for coffee enthusiasts, students, and travelers venturing into Indang, Cavite. 

Due to the unique topographic variations of the highland ridge, rainfall and fog density fluctuate significantly across different barangays (from CvSU Main Campus in Bancod to the forested rivers of Kayquit and Alulod). UplandBrew combines **deterministic microclimate scoring** with **real-time Open-Meteo telemetry**, **open-street route navigation (OSRM)**, and **authentic venue intel (menus in ₱, photos, popular hours)** to recommend the optimal cafe for current meteorological conditions.

---

## ✨ Key Features

### 1. 🌦️ Real-Time Microclimate Telemetry & 5-Hour Forecast
- **Open-Meteo Integration**: Free, open-source real-time weather query specifically anchored to Indang coordinates (`14.1953°N, 120.8770°E`) with zero API keys required.
- **Microclimate Timeline Strip**: Displays the next 5 hours of temperature, WMO weather condition icons, and rain probability (`PoP %`).
- **Interactive Scenario Simulator**: Test defensive scenarios including *Upland Mist & Drizzle*, *Habagat Downpour*, *Cool Mountain Breeze*, and *Highland Solar Heatwave*.

### 2. 🗺️ Geospatial Isobaric Weather Mesh & Visuals
- **Dynamic Weather Mesh**: Whole-municipality isobaric heatmap overlay for highland mist, rain, and solar heat with density tuning.
- **Precision Needled Map Pins (32px)**: Vector-anchored pins anchored with subpixel precision directly on coordinates displaying match percentages without obscuring map terrain.
- **Topographic Fog-of-War Perimeter Mask**: Highlights Indang's municipal boundary while softly masking external regions.
- **Multiple Basemaps**: Seamless switching between CARTO Voyager, High-Resolution Satellite (Esri), and Dark Matter modes.

### 3. 🚗 On-Map Street Route & Travel Time Preview
- **Street Routing Engine**: Powered by OpenStreetMap Routing (OSRM) with intelligent Haversine distance fallbacks.
- **Dashed Street Navigation Line**: Animated cyan/sky-blue road polyline tracing from user GPS / CvSU center to the destination.
- **Floating Travel Pill**: Shows real-time driving minutes, walking minutes, and distance in kilometers (`🚗 8 min • 3.4 km • 🚶 41 min walk`).

### 4. 🍽️ Authentic Menus, Pricing & Photo Galleries
- **Full Menus in Philippine Peso (`₱`)**: Authentic menu offerings categorized by *Specialty Coffee, Signature Drinks, Comfort Food, and Pastries*.
- **Photo Carousel Modal**: Ambiance, seating arrangements, food items, and mountain ridge views for all 8 featured Indang cafes.
- **Google Maps-Style Popular Times**: Hourly busyness histogram (8:00 AM – 8:00 PM) indicating peak visit hours (e.g., 2:00 PM – 5:00 PM).

### 5. ❤️ Bookmarking & Shareable Deep Links
- **Persistent Favorites**: Bookmark favorite coffee spots with automatic persistence via `@capacitor/preferences`.
- **Fast Filter**: Instant 1-tap filtering for favorited cafes.
- **Deep-Linking**: Every cafe has a dedicated shareable URL (`?venue=<id>`) that automatically selects and centers the cafe on page load.
- **Native Web Share**: Built-in native share drawer with fallback clipboard copy and floating confirmation toast.

---

## 🏛️ Featured Indang Cafes

1. **Agapita Craft Coffee & Garden** (*Brgy. Kayquit II*) — Glasshouse & lush garden cafe with specialty Cold Brew Liberica.
2. **Kape Isla Highland Farm** (*Brgy. Alulod*) — Farm estate with panoramic Mt. Sungay ridge deck and drip bar.
3. **The Glasshouse at CvSU** (*Brgy. Bancod*) — Architectural glass pavilion ideal for research, thesis work, and high-speed Wi-Fi.
4. **Kalikasan Forest Cafe** (*Brgy. Kayquit I*) — Open-air bamboo kubo verandas nestled alongside natural springs.
5. **Indang Heritage Coffee House** (*Poblacion 3*) — Spanish-era ancestral home serving traditional Barako and native pastries.
6. **Balai Upland Roastery** (*Brgy. Bancod*) — CvSU student study hub equipped with ergonomic seating and ample power outlets.
7. **Ridgeview Veranda Cafe** (*Brgy. Kayquit III*) — Sunset viewpoint with outdoor lawn seating overlooking Cavite lowlands.
8. **Riverbend Coffee Co.** (*Brgy. Alulod*) — Riverside stone patio offering cold drip coffee and riverside breezes.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons + Glassmorphism UI
- **Mapping**: Leaflet + React-Leaflet + CARTO Basemaps + Esri Satellite
- **Meteorology**: Open-Meteo API (WMO Weather Code Engine) + RainViewer Precipitation Radar
- **Routing**: OpenStreetMap Routing Machine (OSRM)
- **Mobile Runtime**: Capacitor 5 (Geolocation, Network, Preferences)
- **Hosting**: Vercel

---

## 🚀 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/CardboardB0X/UplandBrew.git
   cd UplandBrew
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local dev server**:
   ```bash
   npm run dev
   ```

4. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## 📄 License

MIT License © 2026 UplandBrew Indang.
