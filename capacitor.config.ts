import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig & { bundledWebRuntime?: boolean } = {
  appId: 'com.indang.uplandbrew.app',
  appName: 'UplandBrew Indang',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    Geolocation: {
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    },
    Preferences: {
      group: 'UplandBrewIndangStorage',
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: '#09090B',
  },
};

export default config;
