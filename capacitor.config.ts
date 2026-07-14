import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.farazcode.editor',
  appName: 'Faraz Code Editor',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}

export default config
