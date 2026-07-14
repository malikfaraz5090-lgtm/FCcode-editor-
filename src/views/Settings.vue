<template>
  <div class="settings">
    <header class="header">
      <button @click="$router.push('/')" class="btn-back">← Back</button>
      <h1>⚙️ Settings</h1>
    </header>
    <div class="content">
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
      <div class="item">
        <label>Word Wrap</label>
        <input type="checkbox" v-model="store.settings.wordWrap" @change="save">
      </div>
      <div class="about">
        <p><strong>Faraz Code Editor</strong></p>
        <p>Version 1.0.0</p>
        <p>Professional Code Editor</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from '../stores/store.js'
const store = useStore()
function save() { store.saveSettings() }
</script>

<style scoped>
.settings { height: 100vh; background: #1e1e1e; color: #ccc; }
.header { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: #252526; border-bottom: 1px solid #3e3e42; }
.header h1 { font-size: 18px; }
.btn-back { background: #333; border: none; color: #ccc; padding: 6px 14px; border-radius: 6px; cursor: pointer; }
.content { padding: 20px; max-width: 500px; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #333; }
.item label { font-size: 14px; }
.item select, .item input { padding: 6px 12px; background: #2d2d30; border: 1px solid #3e3e42; color: #ccc; border-radius: 6px; }
.item input[type="number"] { width: 70px; }
.about { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #888; font-size: 13px; line-height: 2; }
</style>
