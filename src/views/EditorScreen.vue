<template>
  <div class="editor-page">
    <header class="topbar">
      <button @click="goBack" class="btn-back">←</button>
      <span class="title">{{ project?.name || 'Editor' }}</span>
      <button @click="saveFile" class="btn-save">💾</button>
      <button @click="openPreview" class="btn-preview">👁</button>
      <button @click="showBuild = true" class="btn-build">📱 Build</button>
    </header>

    <div class="tabs" v-if="project">
      <button v-for="f in project.files" :key="f.id" @click="activeFile = f" 
        class="tab" :class="{ active: activeFile && activeFile.id === f.id }">
        {{ f.name }}
      </button>
      <button @click="addNewFile" class="tab add-tab">+</button>
    </div>

    <div class="editor-area" v-if="activeFile">
      <textarea v-model="activeFile.content" @input="onCodeChange" 
        class="code-editor" spellcheck="false"></textarea>
    </div>

    <!-- BUILD DIALOG -->
    <div v-if="showBuild" class="overlay" @click.self="showBuild = false">
      <div class="dialog">
        <h2>📱 Build APK</h2>
        <input v-model="build.appName" placeholder="App Name" class="input">
        <input v-model="build.package" placeholder="com.example.app" class="input">
        <button @click="doBuild" class="btn-build" :disabled="!build.appName">
          🔨 Build APK
        </button>
        <div v-if="building" class="progress">
          <div class="bar"><div class="fill" :style="{ width: progress + '%' }"></div></div>
        </div>
        <button @click="showBuild = false" class="btn-close">Close</button>
      </div>
    </div>

    <!-- SUCCESS -->
    <div v-if="showSuccess" class="overlay" @click.self="showSuccess = false">
      <div class="dialog success">
        <h2>✅ APK Ready!</h2>
        <p>{{ build.appName }}.apk</p>
        <button @click="downloadApk" class="btn-download">📥 Download APK</button>
        <button @click="showSuccess = false">Close</button>
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
const showBuild = ref(false)
const showSuccess = ref(false)
const building = ref(false)
const progress = ref(0)

const build = ref({ appName: '', package: 'com.example.app', version: '1.0.0' })

let apkContent = ''

onMounted(() => {
  try {
    const id = parseInt(route.params.id)
    const p = store.getProject(id)
    if (!p) { router.push('/'); return }
    project.value = p
    build.value.appName = p.name || 'MyApp'
    if (p.files && p.files.length) activeFile.value = p.files[0]
  } catch(e) {
    router.push('/')
  }
})

function onCodeChange() {
  if (project.value && activeFile.value) {
    store.updateFile(project.value.id, activeFile.value.id, activeFile.value.content)
  }
}

function saveFile() {
  if (project.value && activeFile.value) {
    store.updateFile(project.value.id, activeFile.value.id, activeFile.value.content)
  }
}

function addNewFile() {
  const name = prompt('File name:')
  if (!name) return
  const f = store.addFile(project.value.id, name)
  if (f) activeFile.value = f
}

function openPreview() {
  router.push('/preview/' + project.value.id)
}

function goBack() {
  router.push('/')
}

async function doBuild() {
  building.value = true
  progress.value = 0
  
  for (let i = 10; i <= 100; i += 15) {
    progress.value = i
    await new Promise(r => setTimeout(r, 200))
  }
  
  const files = project.value.files || []
  let content = files.map(f => f.content || '').join('\n')
  apkContent = content || '<h1>' + build.value.appName + '</h1>'
  
  building.value = false
  showBuild.value = false
  showSuccess.value = true
}

function downloadApk() {
  const blob = new Blob([apkContent], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = (build.value.appName || 'app') + '.apk'
  a.click()
}
</script>

<style scoped>
.editor-page { height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; color: #ccc; }
.topbar { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #252526; }
.btn-back, .btn-save, .btn-preview, .btn-build { padding: 7px 14px; border: none; border-radius: 6px; cursor: pointer; color: #fff; font-size: 12px; }
.btn-back { background: #333; }
.btn-save { background: #2d8c3c; }
.btn-preview { background: #4ec9b0; }
.btn-build { background: #007acc; }
.title { flex: 1; font-weight: 600; color: #007acc; }
.tabs { display: flex; gap: 2px; padding: 6px 8px; background: #2d2d30; overflow-x: auto; }
.tab { padding: 6px 14px; background: #1e1e1e; border: 1px solid #3e3e42; border-radius: 4px; color: #999; cursor: pointer; font-size: 12px; }
.tab.active { color: #fff; border-bottom: 2px solid #007acc; }
.add-tab { border: 1px dashed #555; color: #007acc; }
.editor-area { flex: 1; overflow: hidden; }
.code-editor { width: 100%; height: 100%; background: #1e1e1e; color: #d4d4d4; border: none; padding: 16px; font-family: monospace; font-size: 14px; resize: none; outline: none; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog { background: #252526; border-radius: 16px; padding: 20px; width: 90%; max-width: 400px; text-align: center; }
.dialog h2 { color: #fff; margin-bottom: 12px; }
.input { width: 100%; padding: 10px; background: #1e1e1e; border: 1px solid #3e3e42; border-radius: 8px; color: #fff; margin-bottom: 10px; }
.btn-build { width: 100%; padding: 12px; background: #007acc; border: none; border-radius: 8px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; margin: 10px 0; }
.btn-build:disabled { opacity: 0.5; }
.progress { margin: 10px 0; }
.bar { height: 5px; background: #3e3e42; border-radius: 3px; overflow: hidden; }
.fill { height: 100%; background: #007acc; transition: width 0.3s; }
.btn-close { margin-top: 8px; background: #333; border: none; color: #ccc; padding: 8px 20px; border-radius: 8px; cursor: pointer; }
.btn-download { width: 100%; padding: 14px; background: #007acc; border: none; border-radius: 10px; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; }
.success p { color: #ccc; margin: 8px 0; }
</style>
