<template>
  <div class="settings">
    <header class="header">
      <button class="btn-back" @click="$router.push('/')">← Back</button>
      <h1>⚙️ Settings</h1>
    </header>
    <div class="content">
      <div class="item">
        <label>Theme</label>
        <select v-model="store.settings.theme" @change="store.saveSettings()">
          <option value="vs-dark">Dark+</option>
          <option value="vs">Light+</option>
          <option value="hc-black">High Contrast</option>
        </select>
      </div>
      <div class="item">
        <label>Font Size</label>
        <input type="number" v-model.number="store.settings.fontSize" @change="store.saveSettings()" min="10" max="30">
      </div>
      <div class="item">
        <label>Tab Size</label>
        <select v-model.number="store.settings.tabSize" @change="store.saveSettings()">
          <option :value="2">2</option>
          <option :value="4">4</option>
        </select>
      </div>
      <div class="item">
        <label>Word Wrap</label>
        <input type="checkbox" v-model="store.settings.wordWrap" @change="store.saveSettings()">
      </div>
      <div class="about">
        <p><strong>Faraz Code Editor</strong></p>
        <p>Version 1.0.0</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from '../stores/store.js'
const store = useStore()
</script>

<style scoped>
.settings { height: 100vh; background: #1e1e1e; color: #ccc; }
.header { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: #252526; border-bottom: 1px solid #333; }
.header h1 { font-size: 18px; }
.btn-back { background: #333; border: none; color: #ccc; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
.content { padding: 20px; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #333; }
.item select, .item input { padding: 6px 12px; background: #2d2d30; border: 1px solid #333; border-radius: 4px; color: #ccc; }
.about { margin-top: 20px; padding-top: 16px; border-top: 1px solid #333; color: #888; font-size: 13px; line-height: 1.8; }
</style>
