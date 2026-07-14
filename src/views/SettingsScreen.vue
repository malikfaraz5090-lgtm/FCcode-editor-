cat > src/views/SettingsScreen.vue << 'EOF'
<template>
  <div class="settings-screen">
    <header class="settings-header">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <h1>Settings</h1>
    </header>

    <div class="settings-content">
      <div class="setting-group">
        <h2>Editor</h2>
        
        <div class="setting-item">
          <label>Theme</label>
          <select v-model="editorStore.settings.theme" @change="applySetting('theme', $event.target.value)">
            <option value="vs-dark">Dark+</option>
            <option value="vs">Light+</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>

        <div class="setting-item">
          <label>Font Size</label>
          <input 
            type="number" 
            v-model.number="editorStore.settings.fontSize" 
            @change="applySetting('fontSize', $event.target.value)"
            min="10" 
            max="30"
          >
        </div>

        <div class="setting-item">
          <label>Tab Size</label>
          <select v-model.number="editorStore.settings.tabSize" @change="applySetting('tabSize', $event.target.value)">
            <option :value="2">2</option>
            <option :value="4">4</option>
            <option :value="8">8</option>
          </select>
        </div>

        <div class="setting-item">
          <label>Word Wrap</label>
          <select v-model="editorStore.settings.wordWrap" @change="applySetting('wordWrap', $event.target.value)">
            <option value="on">On</option>
            <option value="off">Off</option>
            <option value="wordWrapColumn">Column</option>
          </select>
        </div>

        <div class="setting-item">
          <label>Minimap</label>
          <label class="switch">
            <input 
              type="checkbox" 
              v-model="editorStore.settings.minimap"
              @change="applySetting('minimap', $event.target.checked)"
            >
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <label>Auto Save</label>
          <label class="switch">
            <input 
              type="checkbox" 
              v-model="editorStore.settings.autoSave"
            >
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="setting-group">
        <h2>About</h2>
        <div class="about-info">
          <p><strong>Faraz Code Editor</strong></p>
          <p>Version 1.0.0</p>
          <p>Professional code editor for Android</p>
          <p>Built with Vue.js, Monaco Editor & Capacitor</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEditorStore } from '../stores/editorStore'

const editorStore = useEditorStore()

function applySetting(key, value) {
  editorStore.updateSetting(key, value)
}
</script>

<style scoped>
.settings-screen {
  height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.back-btn {
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-size: 14px;
}

.settings-header h1 {
  font-size: 18px;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  max-width: 600px;
}

.setting-group {
  margin-bottom: 32px;
}

.setting-group h2 {
  font-size: 14px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(62, 62, 66, 0.5);
}

.setting-item label {
  font-size: 14px;
  color: var(--text-primary);
}

.setting-item select,
.setting-item input[type="number"] {
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  transition: 0.3s;
  border-radius: 24px;
  border: 1px solid var(--border-color);
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--accent-color);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.about-info {
  padding: 12px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.about-info strong {
  color: var(--accent-color);
}
</style>
EOF
