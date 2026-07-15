import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.farazcode.editor',
  appName: 'Faraz Code Editor',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  android: { allowMixedContent: true }
}

export default config
