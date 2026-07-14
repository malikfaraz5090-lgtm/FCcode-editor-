<template>
  <div class="settings-page">
    <header class="settings-header">
      <button @click="$router.back()" class="back-btn">← Back</button>
      <h1>⚙️ Settings</h1>
    </header>
    <div class="settings-content">
      <div class="setting-group">
        <h3>Editor Settings</h3>
        <div class="setting-item">
          <label>Theme</label>
          <select v-model="settingsStore.settings.theme" @change="save">
            <option value="vs-dark">Dark+</option>
            <option value="vs">Light+</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>
        <div class="setting-item">
          <label>Font Size</label>
          <input type="number" v-model.number="settingsStore.settings.fontSize" @change="save" min="10" max="30">
        </div>
        <div class="setting-item">
          <label>Tab Size</label>
          <select v-model.number="settingsStore.settings.tabSize" @change="save">
            <option :value="2">2 spaces</option>
            <option :value="4">4 spaces</option>
          </select>
        </div>
        <div class="setting-item">
          <label>Word Wrap</label>
          <input type="checkbox" v-model="settingsStore.settings.wordWrap" @change="save">
        </div>
        <div class="setting-item">
          <label>Minimap</label>
          <input type="checkbox" v-model="settingsStore.settings.minimap" @change="save">
        </div>
        <div class="setting-item">
          <label>Auto Save</label>
          <input type="checkbox" v-model="settingsStore.settings.autoSave" @change="save">
        </div>
      </div>
      <div class="setting-group">
        <h3>About</h3>
        <p><strong>Faraz Code Editor</strong></p>
        <p>Version 1.0.0</p>
        <p>Professional Code Editor for Android</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '../stores/settingsStore'
const settingsStore = useSettingsStore()
function save() {
  settingsStore.saveSettings()
}
</script>

<style scoped>
.settings-page { height: 100vh; background: #1e1e1e; color: #ccc; display: flex; flex-direction: column; }
.settings-header { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #252526; border-bottom: 1px solid #3e3e42; }
.settings-header h1 { font-size: 18px; color: #fff; }
.back-btn { padding: 8px 16px; background: #2d2d30; border: 1px solid #3e3e42; border-radius: 6px; color: #ccc; cursor: pointer; font-size: 14px; }
.back-btn:hover { background: #37373d; }
.settings-content { flex: 1; overflow-y: auto; padding: 20px; }
.setting-group { margin-bottom: 24px; }
.setting-group h3 { font-size: 14px; color: #007acc; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
.setting-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #333; }
.setting-item label { font-size: 14px; }
.setting-item select, .setting-item input[type="number"] { padding: 6px 12px; background: #2d2d30; border: 1px solid #3e3e42; color: #ccc; border-radius: 4px; }
.setting-group p { margin: 4px 0; font-size: 13px; color: #888; }
.setting-group p strong { color: #007acc; }
</style>
