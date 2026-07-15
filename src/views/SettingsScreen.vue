<template>
  <div class="settings">
    <header class="header">
      <button @click="$router.push('/')" class="btn-back">← Back</button>
      <h1>⚙️ Settings</h1>
    </header>
    <div class="content">
      <div class="section">
        <h3>Editor</h3>
        <div class="item">
          <label>Font Size</label>
          <input type="number" v-model.number="store.settings.fontSize" @change="save" min="10" max="30">
        </div>
        <div class="item">
          <label>Tab Size</label>
          <select v-model.number="store.settings.tabSize" @change="save">
            <option :value="2">2 spaces</option>
            <option :value="4">4 spaces</option>
          </select>
        </div>
        <div class="item">
          <label>Auto Save</label>
          <input type="checkbox" v-model="store.settings.autoSave" @change="save">
        </div>
      </div>
      <div class="section">
        <h3>About</h3>
        <p><strong>Faraz Code Editor</strong></p>
        <p>Version 1.0.0</p>
        <p>Professional Code Editor for Android</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProjectStore } from '../stores/projectStore.js'
const store = useProjectStore()
function save() { store.saveSettings() }
</script>

<style scoped>
.settings { height: 100vh; background: #1e1e1e; color: #ccc; display: flex; flex-direction: column; }
.header { display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: #252526; border-bottom: 1px solid #3e3e42; }
.header h1 { font-size: 18px; color: #fff; }
.btn-back { background: #333; border: none; color: #ccc; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-back:hover { background: #444; }
.content { flex: 1; overflow-y: auto; padding: 20px; max-width: 600px; }
.section { margin-bottom: 24px; }
.section h3 { font-size: 13px; color: #007acc; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #333; }
.item label { font-size: 14px; }
.item select, .item input { padding: 6px 12px; background: #2d2d30; border: 1px solid #3e3e42; color: #ccc; border-radius: 6px; }
.item input[type="number"] { width: 70px; }
.item input[type="checkbox"] { width: 20px; height: 20px; accent-color: #007acc; }
.section p { margin: 4px 0; font-size: 13px; color: #888; }
.section p strong { color: #007acc; }
</style>
