import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    theme: 'dark',
    fontSize: 14,
    fontFamily: 'Fira Code',
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    autoSave: true,
    autoSaveDelay: 2000,
    previewMode: 'mobile',
    lineNumbers: true,
    bracketColorization: true
  })

  function loadSettings() {
    const saved = localStorage.getItem('faraz_settings')
    if (saved) {
      settings.value = { ...settings.value, ...JSON.parse(saved) }
    }
  }

  function saveSettings() {
    localStorage.setItem('faraz_settings', JSON.stringify(settings.value))
  }

  function updateSetting(key, value) {
    settings.value[key] = value
    saveSettings()
  }

  function resetSettings() {
    localStorage.removeItem('faraz_settings')
    loadSettings()
  }

  loadSettings()

  return {
    settings,
    updateSetting,
    resetSettings,
    saveSettings
  }
})
