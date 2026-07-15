<template>
  <div class="editor-page">
    <!-- TOP BAR -->
    <header class="topbar">
      <button @click="goBack" class="btn-back">← Back</button>
      <span class="title">{{ project?.name || 'Editor' }}</span>
      <button @click="saveFile" class="btn-save">💾 Save</button>
      <button @click="openPreview" class="btn-preview">👁 Preview</button>
      <button @click="showBuildDialog = true" class="btn-build-apk">📱 Build APK</button>
    </header>

    <!-- FILE TABS -->
    <div class="tabs" v-if="project">
      <button 
        v-for="f in project.files" 
        :key="f.id" 
        @click="activeFile = f" 
        class="tab" 
        :class="{ active: activeFile && activeFile.id === f.id }"
      >
        {{ f.name }}
        <span class="tab-close" v-if="project.files.length > 1" @click.stop="removeFile(f.id)">×</span>
      </button>
      <button @click="addNewFile" class="tab add-tab">+ New File</button>
    </div>

    <!-- CODE EDITOR -->
    <div class="editor-area" v-if="activeFile">
      <textarea 
        v-model="activeFile.content" 
        @input="onCodeChange" 
        class="code-editor" 
        placeholder="Write your code here..."
        spellcheck="false"
      ></textarea>
    </div>

    <!-- NO FILE -->
    <div v-else-if="project" class="no-file">
      <p>📂 Select a file or create a new one</p>
    </div>

    <!-- STATUS BAR -->
    <div class="statusbar" v-if="activeFile">
      <span>{{ activeFile.language || 'text' }}</span>
      <span>Lines: {{ lineCount }}</span>
      <span>{{ saved ? '✓ Saved' : '● Modified' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '../stores/projectStore.js'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()

const project = ref(null)
const activeFile = ref(null)
const saved = ref(true)
let saveTimer = null

const lineCount = computed(() => {
  if (!activeFile.value || !activeFile.value.content) return 0
  return activeFile.value.content.split('\n').length
})

onMounted(() => {
  // Get project ID from URL
  const id = parseInt(route.params.id)
  console.log('Opening project ID:', id)
  console.log('Available projects:', store.projects)
  
  // Load project
  const p = store.getProject(id)
  console.log('Found project:', p)
  
  if (p) {
    project.value = p
    // Open first file
    if (p.files && p.files.length > 0) {
      activeFile.value = p.files[0]
      console.log('Opened file:', activeFile.value.name)
    }
  } else {
    alert('Project not found! Going back to home.')
    router.push('/')
  }
})

function onCodeChange() {
  saved.value = false
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveFile(), 1000)
}

function saveFile() {
  if (!project.value || !activeFile.value) return
  store.updateFile(project.value.id, activeFile.value.id, activeFile.value.content)
  saved.value = true
}

function addNewFile() {
  const name = prompt('Enter file name (e.g., app.js):')
  if (!name) return
  const newFile = store.addFile(project.value.id, name)
  if (newFile) {
    activeFile.value = newFile
  }
}

function removeFile(fileId) {
  if (!confirm('Delete this file?')) return
  store.deleteFile(project.value.id, fileId)
  if (activeFile.value && activeFile.value.id === fileId) {
    activeFile.value = project.value.files[0] || null
  }
}

function openPreview() {
  if (!saved.value) saveFile()
  router.push('/preview/' + project.value.id)
}

function goBack() {
  if (!saved.value) saveFile()
  router.push('/')
}

// Build dialog
const showBuildDialog = ref(false)
const buildConfig = ref({
  appName: '',
  package: 'com.example.app',
  version: '1.0.0'
})
</script>

<style scoped>
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
  flex-wrap: wrap;
}

.btn-back {
  background: #333;
  border: none;
  color: #fff;
  padding: 7px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.title {
  flex: 1;
  font-weight: 600;
  color: #007acc;
  font-size: 14px;
  min-width: 80px;
}

.btn-save {
  background: #2d8c3c;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.btn-preview {
  background: #4ec9b0;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.btn-build-apk {
  background: #007acc;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.tabs {
  display: flex;
  gap: 2px;
  padding: 6px 8px;
  background: #2d2d30;
  overflow-x: auto;
  border-bottom: 1px solid #3e3e42;
}

.tab {
  padding: 6px 14px;
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 4px 4px 0 0;
  color: #999;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab.active {
  color: #fff;
  border-bottom: 2px solid #007acc;
}

.tab-close {
  font-size: 14px;
  color: #999;
}

.tab-close:hover {
  color: #f44747;
}

.add-tab {
  background: transparent;
  border: 1px dashed #555;
  color: #007acc;
  font-weight: bold;
}

.editor-area {
  flex: 1;
  overflow: hidden;
}

.code-editor {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  padding: 16px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.code-editor::placeholder {
  color: #555;
}

.no-file {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}

.statusbar {
  display: flex;
  justify-content: space-between;
  padding: 4px 14px;
  background: #007acc;
  color: #fff;
  font-size: 11px;
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 3px;
}
</style>
