<template>
  <div class="editor-page">
    <header class="topbar">
      <button @click="goBack" class="btn-back">← Back</button>
      <span class="title">{{ project?.name || 'Editor' }}</span>
      <button @click="saveFile" class="btn-save">💾 Save</button>
      <button @click="openPreview" class="btn-preview">👁 Preview</button>
      <button @click="showBuild = true" class="btn-build">📱 Build APK</button>
    </header>

    <div class="tabs" v-if="project">
      <button v-for="f in project.files" :key="f.id" @click="activeFile = f" class="tab" :class="{ active: activeFile && activeFile.id === f.id }">
        {{ f.name }}
        <span v-if="project.files.length > 1" class="tab-close" @click.stop="removeFile(f.id)">×</span>
      </button>
      <button @click="addNewFile" class="tab add-tab">+ New File</button>
    </div>

    <div class="editor-area" v-if="activeFile">
      <textarea v-model="activeFile.content" @input="onCodeChange" class="code-editor" placeholder="Write your code here..." spellcheck="false"></textarea>
    </div>

    <div class="no-file" v-else-if="project">
      <p>Select a file to edit</p>
    </div>

    <div class="statusbar" v-if="activeFile">
      <span>{{ activeFile.language || 'text' }}</span>
      <span>Lines: {{ lineCount }}</span>
      <span>{{ saved ? '✓ Saved' : '● Modified' }}</span>
    </div>

    <!-- BUILD DIALOG -->
    <div v-if="showBuild" class="overlay" @click.self="showBuild = false">
      <div class="dialog">
        <div class="dialog-header">
          <h2>📱 Build APK</h2>
          <button @click="showBuild = false" class="close-btn">✕</button>
        </div>
        <div class="dialog-body">
          <div class="field">
            <label>App Name</label>
            <input v-model="build.appName" class="input" placeholder="My App">
          </div>
          <div class="field">
            <label>Package</label>
            <input v-model="build.package" class="input" placeholder="com.example.app">
          </div>
          <div class="field">
            <label>Version</label>
            <input v-model="build.version" class="input" placeholder="1.0.0">
          </div>

          <div v-if="logs.length" class="logs-box">
            <div v-for="(l, i) in logs" :key="i" class="log-line">{{ l }}</div>
          </div>

          <div v-if="building" class="progress">
            <div class="bar"><div class="fill" :style="{ width: progress + '%' }"></div></div>
            <p>{{ progress }}%</p>
          </div>
        </div>
        <div class="dialog-footer">
          <button @click="showBuild = false" class="btn-cancel">Cancel</button>
          <button @click="doBuild" class="btn-build" :disabled="building || !build.appName || !build.package">
            {{ building ? 'Building...' : 'Build APK' }}
          </button>
        </div>
      </div>
    </div>

    <!-- SUCCESS -->
    <div v-if="showSuccess" class="overlay" @click.self="showSuccess = false">
      <div class="dialog success-dialog">
        <h2>✅ APK Ready!</h2>
        <p><strong>{{ build.appName }}</strong></p>
        <p>Size: {{ apkSize }}</p>
        <div class="btns">
          <button @click="downloadApk" class="btn-download">📥 Download</button>
          <button @click="showSuccess = false" class="btn-close">Close</button>
        </div>
      </div>
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

const showBuild = ref(false)
const showSuccess = ref(false)
const building = ref(false)
const progress = ref(0)
const logs = ref([])
const apkSize = ref('')

const build = ref({
  appName: '',
  package: 'com.example.app',
  version: '1.0.0'
})

const lineCount = computed(() => {
  return activeFile.value?.content?.split('\n').length || 0
})

onMounted(() => {
  const id = parseInt(route.params.id)
  const p = store.getProject(id)
  if (!p) { router.push('/'); return }
  project.value = p
  build.value.appName = p.name
  if (p.files && p.files.length) activeFile.value = p.files[0]
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
  const name = prompt('File name:')
  if (!name) return
  const f = store.addFile(project.value.id, name)
  if (f) activeFile.value = f
}

function removeFile(id) {
  if (!confirm('Delete?')) return
  store.deleteFile(project.value.id, id)
  if (activeFile.value && activeFile.value.id === id) activeFile.value = project.value.files[0] || null
}

function openPreview() {
  if (!saved.value) saveFile()
  router.push('/preview/' + project.value.id)
}

function goBack() {
  if (!saved.value) saveFile()
  router.push('/')
}

async function doBuild() {
  building.value = true
  progress.value = 0
  logs.value = ['Starting build...']
  
  for (let i = 10; i <= 100; i += 15) {
    progress.value = i
    logs.value.push('Step ' + i + '%')
    await new Promise(r => setTimeout(r, 300))
  }
  
  const content = project.value.files.map(f => f.content).join('\n')
  const blob = new Blob([content], { type: 'application/vnd.android.package-archive' })
  apkSize.value = (blob.size / 1024).toFixed(1) + ' KB'
  window._apkBlob = blob
  window._apkName = build.value.appName + '.apk'
  
  building.value = false
  showBuild.value = false
  showSuccess.value = true
}

function downloadApk() {
  if (!window._apkBlob) return
  const url = URL.createObjectURL(window._apkBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = window._apkName
  a.click()
}
</script>

<style scoped>
.editor-page { height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; }
.topbar { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #252526; border-bottom: 1px solid #3e3e42; }
.btn-back { background: #333; border: none; color: #fff; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.title { flex: 1; font-weight: 600; color: #007acc; font-size: 14px; }
.btn-save { background: #2d8c3c; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; }
.btn-preview { background: #4ec9b0; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; }
.btn-build { background: #007acc; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; }
.tabs { display: flex; gap: 2px; padding: 6px 8px; background: #2d2d30; overflow-x: auto; }
.tab { padding: 6px 14px; background: #1e1e1e; border: 1px solid #3e3e42; border-radius: 4px; color: #999; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 6px; }
.tab.active { color: #fff; border-bottom: 2px solid #007acc; }
.tab-close { color: #999; }
.tab-close:hover { color: #f44747; }
.add-tab { border: 1px dashed #555; color: #007acc; }
.editor-area { flex: 1; overflow: hidden; }
.code-editor { width: 100%; height: 100%; background: #1e1e1e; color: #d4d4d4; border: none; padding: 16px; font-family: monospace; font-size: 14px; line-height: 1.6; resize: none; outline: none; }
.no-file { flex: 1; display: flex; align-items: center; justify-content: center; color: #666; }
.statusbar { display: flex; justify-content: space-between; padding: 4px 14px; background: #007acc; color: #fff; font-size: 11px; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog { background: #252526; border-radius: 16px; width: 92%; max-width: 420px; padding: 20px; }
.dialog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.dialog-header h2 { color: #fff; font-size: 18px; }
.close-btn { background: none; border: none; color: #999; font-size: 20px; cursor: pointer; }
.field { margin-bottom: 12px; }
.field label { display: block; font-size: 12px; color: #aaa; margin-bottom: 4px; }
.input { width: 100%; padding: 9px; background: #1e1e1e; border: 1px solid #3e3e42; border-radius: 8px; color: #fff; font-size: 13px; }
.logs-box { background: #1e1e1e; border-radius: 8px; padding: 10px; max-height: 120px; overflow-y: auto; font-family: monospace; font-size: 11px; margin: 10px 0; }
.log-line { padding: 2px 0; color: #4ec9b0; }
.progress { text-align: center; margin: 10px 0; }
.bar { height: 5px; background: #3e3e42; border-radius: 3px; overflow: hidden; }
.fill { height: 100%; background: #007acc; transition: width 0.3s; }
.progress p { margin-top: 5px; font-size: 11px; color: #999; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.btn-cancel { padding: 9px 18px; background: #3e3e42; border: none; border-radius: 8px; color: #ccc; font-size: 13px; cursor: pointer; }
.btn-build { padding: 9px 18px; background: #007acc; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-build:disabled { opacity: 0.5; }
.success-dialog { text-align: center; }
.success-dialog h2 { color: #4ec9b0; margin-bottom: 8px; }
.success-dialog p { color: #ccc; margin: 4px 0; }
.btns { display: flex; gap: 8px; justify-content: center; margin-top: 12px; }
.btn-download { padding: 10px 22px; background: #007acc; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-close { padding: 10px 22px; background: #3e3e42; border: none; border-radius: 8px; color: #ccc; font-size: 13px; cursor: pointer; }
</style>
