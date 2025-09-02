import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c642909236134c6ea94522140ac09444',
  appName: 'hilightpro',
  webDir: 'dist',
  server: {
    url: 'https://c6429092-3613-4c6e-a945-22140ac09444.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  }
};

export default config;