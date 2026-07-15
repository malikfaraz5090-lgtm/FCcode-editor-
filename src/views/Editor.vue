<template>
  <div class="editor">
    <header class="topbar">
      <button @click="$router.push('/')" class="btn-back">←</button>
      <span class="title">{{ project?.name }}</span>
      <button @click="saveFile" class="btn-save">💾</button>
      <button @click="openPreview" class="btn-preview">👁</button>
    </header>
    
    <div class="tabs" v-if="project">
      <button v-for="f in project.files" :key="f.id" @click="activeFile = f" class="tab" :class="{ active: activeFile?.id === f.id }">
        {{ f.name }}
        <span class="tab-close" v-if="project.files.length > 1" @click.stop="delFile(f.id)">×</span>
      </button>
      <button @click="addFile" class="tab add">+</button>
    </div>
    
    <textarea v-if="activeFile" v-model="activeFile.code" @input="onChange" class="code-area" :style="{ fontSize: '14px' }" spellcheck="false"></textarea>
    
    <div class="statusbar">
      <span>{{ activeFile?.lang || 'text' }}</span>
      <span>{{ saved ? '✓' : '●' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../stores/store.js'

const route = useRoute()
const router = useRouter()
const store = useStore()

const project = ref(null)
const activeFile = ref(null)
const saved = ref(true)
let timer = null

onMounted(() => {
  const id = parseInt(route.params.id)
  project.value = store.getProject(id)
  if (!project.value) { router.push('/'); return }
  if (project.value.files.length) activeFile.value = project.value.files[0]
})

function onChange() {
  saved.value = false
  clearTimeout(timer)
  timer = setTimeout(() => saveFile(), 1000)
}

function saveFile() {
  if (!project.value || !activeFile.value) return
  store.updateFile(project.value.id, activeFile.value.id, activeFile.value.code)
  saved.value = true
}

function addFile() {
  const name = prompt('File name:')
  if (!name) return
  const f = store.addFile(project.value.id, name)
  if (f) activeFile.value = f
}

function delFile(id) {
  if (!confirm('Delete?')) return
  store.deleteFile(project.value.id, id)
  if (activeFile.value?.id === id) activeFile.value = project.value.files[0] || null
}

function openPreview() {
  if (!saved.value) saveFile()
  router.push('/preview/' + project.value.id)
}
</script>

<style scoped>
.editor { height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; }
.topbar { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #252526; border-bottom: 1px solid #3e3e42; }
.btn-back { background: #333; border: none; color: #fff; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.title { flex: 1; font-weight: 600; color: #007acc; }
.btn-save, .btn-preview { padding: 6px 14px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; }
.btn-save { background: #2d8c3c; color: #fff; }
.btn-preview { background: #4ec9b0; color: #fff; }
.tabs { display: flex; gap: 2px; padding: 6px 8px; background: #2d2d30; overflow-x: auto; }
.tab { padding: 6px 14px; background: #1e1e1e; border: 1px solid #3e3e42; border-radius: 4px 4px 0 0; color: #999; cursor: pointer; font-size: 12px; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.tab.active { color: #fff; border-bottom: 2px solid #007acc; }
.tab-close { font-size: 14px; }
.tab-close:hover { color: #f44747; }
.tab.add { background: transparent; border: 1px dashed #555; color: #007acc; }
.code-area { flex: 1; width: 100%; background: #1e1e1e; color: #d4d4d4; border: none; padding: 16px; font-family: 'Consolas', 'Monaco', monospace; font-size: 14px; line-height: 1.6; resize: none; outline: none; }
.statusbar { display: flex; justify-content: space-between; padding: 4px 14px; background: #007acc; color: #fff; font-size: 11px; }
</style>
