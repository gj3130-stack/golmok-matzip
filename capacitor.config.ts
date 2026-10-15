import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kr.golmokmatzip.app',
  appName: '골목맛집',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    // Keep the WebView under the status bar area handled by CSS safe-area insets
  },
};

export default config;
