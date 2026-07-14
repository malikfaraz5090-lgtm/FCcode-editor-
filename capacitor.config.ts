import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.farazcode.editor',
  appName: 'Faraz Code Editor',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1e1e1e',
      androidSplashResourceName: 'splash',
      showSpinner: true,
      spinnerColor: '#007acc',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1e1e1e',
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
