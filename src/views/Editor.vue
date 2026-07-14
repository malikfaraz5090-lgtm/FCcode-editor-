<template>
  <div class="editor-page">
    <!-- Header -->
    <header class="topbar">
      <button class="btn-back" @click="goBack">← Back</button>
      <span class="title">{{ project?.name || 'Loading...' }}</span>
      
      <!-- File Tabs -->
      <div class="tabs" v-if="project">
        <button 
          v-for="(f, i) in project.files" 
          :key="i" 
          class="tab" 
          :class="{ active: activeFile === i }" 
          @click="openFile(i)"
        >
          {{ f.name }}
        </button>
      </div>
      
      <button class="btn-save" @click="saveFile">💾 Save</button>
    </header>

    <!-- Editor Area -->
    <div class="editor-container" ref="editorRef"></div>

    <!-- Status Bar -->
    <div class="statusbar" v-if="project">
      <span>{{ project.files[activeFile]?.language || 'text' }}</span>
      <span>Ln {{ line }}, Col {{ col }}</span>
      <span>{{ modified ? '●' : '✓' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../stores/store.js'
import * as monaco from 'monaco-editor'

const route = useRoute()
const router = useRouter()
const store = useStore()

const project = ref(null)
const activeFile = ref(0)
const editorRef = ref(null)
const line = ref(1)
const col = ref(1)
const modified = ref(false)

let editor = null

onMounted(async () => {
  // ID ko number mein convert karo
  const id = parseInt(route.params.id)
  console.log('Loading project ID:', id)
  
  // Project load karo
  project.value = store.getProject(id)
  console.log('Project loaded:', project.value)
  
  if (!project.value) {
    alert('Project not found!')
    router.push('/')
    return
  }
  
  // Editor initialize karo
  await nextTick()
  
  if (editorRef.value && project.value.files.length > 0) {
    const firstFile = project.value.files[0]
    
    editor = monaco.editor.create(editorRef.value, {
      value: firstFile.content || '',
      language: firstFile.language || 'plaintext',
      theme: store.settings.theme || 'vs-dark',
      fontSize: store.settings.fontSize || 14,
      automaticLayout: true,
      minimap: { enabled: true },
      lineNumbers: 'on',
      wordWrap: store.settings.wordWrap ? 'on' : 'off',
      tabSize: store.settings.tabSize || 2,
      scrollBeyondLastLine: false,
      smoothScrolling: true
    })
    
    // Cursor position track karo
    editor.onDidChangeCursorPosition((e) => {
      line.value = e.position.lineNumber
      col.value = e.position.column
    })
    
    // Changes track karo
    editor.onDidChangeModelContent(() => {
      modified.value = true
      // Auto-save content
      if (project.value && project.value.files[activeFile.value]) {
        project.value.files[activeFile.value].content = editor.getValue()
      }
    })
    
    // Keyboard shortcut for save
    editor.addAction({
      id: 'save',
      label: 'Save',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: saveFile
    })
    
    console.log('Editor initialized successfully!')
  }
})

function openFile(i) {
  activeFile.value = i
  if (editor && project.value && project.value.files[i]) {
    const file = project.value.files[i]
    editor.setValue(file.content || '')
    monaco.editor.setModelLanguage(editor.getModel(), file.language || 'plaintext')
  }
}

function saveFile() {
  if (editor && project.value) {
    const content = editor.getValue()
    project.value.files[activeFile.value].content = content
    store.updateProjectFiles(project.value.id, project.value.files)
    modified.value = false
    alert('✅ File saved!')
  }
}

function goBack() {
  if (modified.value) {
    if (confirm('You have unsaved changes. Save before leaving?')) {
      saveFile()
    }
  }
  router.push('/')
}

// Theme change watch karo
watch(() => store.settings.theme, (newTheme) => {
  if (editor) {
    monaco.editor.setTheme(newTheme)
  }
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
  gap: 12px;
  padding: 8px 12px;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
  min-height: 44px;
}

.btn-back {
  background: none;
  border: none;
  color: #ccc;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.btn-back:hover {
  background: #333;
}

.title {
  font-weight: 600;
  color: #007acc;
  font-size: 14px;
  min-width: 100px;
}

.tabs {
  display: flex;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
}

.tab {
  padding: 6px 12px;
  background: #2d2d30;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  color: #ccc;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.tab.active {
  background: #007acc;
  color: white;
  border-color: #007acc;
}

.tab:hover {
  background: #37373d;
}

.btn-save {
  padding: 6px 14px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}

.btn-save:hover {
  background: #005a9e;
}

.editor-container {
  flex: 1;
  overflow: hidden;
}

.statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  height: 24px;
  background: #007acc;
  color: white;
  font-size: 11px;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
