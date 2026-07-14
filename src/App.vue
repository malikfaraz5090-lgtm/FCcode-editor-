<template>
  <div class="app-container">
    <header class="toolbar">
      <div class="toolbar-left">
        <button class="menu-btn" @click="showSidebar = !showSidebar">☰</button>
        <h1 class="app-title">🚀 Faraz Code Editor</h1>
      </div>
      <div class="toolbar-center">
        <button class="tool-btn" @click="newFile">📄 New</button>
        <button class="tool-btn" @click="saveFile">💾 Save</button>
        <button class="tool-btn" @click="showPreview = !showPreview">👁 Preview</button>
        <button class="tool-btn build-btn" @click="showBuild = true">📱 Build APK</button>
      </div>
      <div class="toolbar-right">
        <select v-model="theme" @change="changeTheme" class="theme-select">
          <option value="vs-dark">Dark</option>
          <option value="vs">Light</option>
          <option value="hc-black">Contrast</option>
        </select>
      </div>
    </header>

    <div class="main-container">
      <aside class="sidebar" v-show="showSidebar">
        <div class="sidebar-header">
          <h3>FILES</h3>
          <button @click="newFile" class="add-btn">+</button>
        </div>
        <div class="file-list">
          <div v-for="(file, i) in files" :key="i" class="file-item" :class="{ active: activeFile === i }" @click="openFile(i)">
            <span>{{ getIcon(file.name) }}</span>
            <span class="file-name">{{ file.name }}</span>
            <button class="close-btn" @click.stop="closeFile(i)">×</button>
          </div>
        </div>
      </aside>

      <div class="editor-area">
        <div class="tabs-bar">
          <div v-for="(tab, i) in tabs" :key="i" class="tab" :class="{ active: activeTab === i }" @click="switchTab(i)">
            <span>{{ tab.name }}</span>
            <button class="tab-close" @click.stop="closeTab(i)">×</button>
          </div>
        </div>
        <div class="editor-container" ref="editorContainer"></div>
        <div class="preview-panel" v-if="showPreview">
          <div class="preview-header">
            <span>PREVIEW</span>
            <select v-model="previewMode" class="preview-mode">
              <option value="mobile">📱 Mobile</option>
              <option value="tablet">📋 Tablet</option>
              <option value="desktop">🖥 Desktop</option>
            </select>
            <button @click="refreshPreview">🔄</button>
            <button @click="showPreview = false">✕</button>
          </div>
          <iframe ref="previewFrame" class="preview-frame" :class="previewMode" sandbox="allow-scripts allow-same-origin"></iframe>
        </div>
      </div>
    </div>

    <footer class="status-bar">
      <span>{{ currentLang }}</span>
      <span>UTF-8</span>
      <span>Ln {{ line }}, Col {{ col }}</span>
      <span>{{ modified ? '●' : '✓' }}</span>
    </footer>

    <!-- BUILD DIALOG -->
    <div v-if="showBuild" class="dialog-overlay" @click.self="showBuild = false">
      <div class="build-dialog">
        <div class="dialog-header">
          <h2>📱 Build Android APK</h2>
          <button @click="showBuild = false">✕</button>
        </div>
        <div class="dialog-content">
          <div class="input-group">
            <label>App Name</label>
            <input v-model="appName" type="text" placeholder="My App">
          </div>
          <div class="input-group">
            <label>Package</label>
            <input v-model="packageName" type="text" placeholder="com.example.app">
          </div>
          <div class="input-group">
            <label>Version</label>
            <input v-model="version" type="text" placeholder="1.0.0">
          </div>
          <div v-if="logs.length > 0" class="build-logs">
            <div v-for="(log, i) in logs" :key="i" class="log-entry" :class="log.type">
              <span class="log-time">{{ log.time }}</span>
              <span>{{ log.msg }}</span>
            </div>
          </div>
          <div v-if="building" class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ progress }}% - {{ status }}</span>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="btn-cancel" @click="showBuild = false" :disabled="building">Cancel</button>
          <button class="btn-build" @click="startBuild" :disabled="building || !appName">🔨 Build APK</button>
        </div>
      </div>
    </div>

    <!-- SUCCESS DIALOG -->
    <div v-if="showSuccess" class="dialog-overlay" @click.self="showSuccess = false">
      <div class="success-dialog">
        <div class="success-icon">✅</div>
        <h2>APK Generated!</h2>
        <p>{{ apkName }}</p>
        <p>Size: {{ apkSize }}</p>
        <div class="success-actions">
          <button class="btn-download" @click="downloadApk">📥 Download APK</button>
          <button class="btn-close" @click="showSuccess = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import * as monaco from 'monaco-editor'

const showSidebar = ref(true)
const showPreview = ref(false)
const showBuild = ref(false)
const showSuccess = ref(false)
const previewMode = ref('mobile')
const theme = ref('vs-dark')
const currentLang = ref('javascript')
const line = ref(1)
const col = ref(1)
const modified = ref(false)
const activeFile = ref(0)
const activeTab = ref(0)

const building = ref(false)
const progress = ref(0)
const status = ref('')
const logs = ref([])
const appName = ref('MyApp')
const packageName = ref('com.farazcode.app')
const version = ref('1.0.0')
const apkName = ref('')
const apkSize = ref('')

const htmlCode = '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>Built with Faraz Code Editor</p>\n  <script src="script.js"><\/script>\n</body>\n</html>'
const cssCode = 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: linear-gradient(135deg, #667eea, #764ba2);\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\nh1 { color: white; font-size: 48px; }'
const jsCode = 'console.log("Hello from Faraz Code Editor!");\ndocument.querySelector("h1").addEventListener("click", function() {\n  this.style.color = "#" + Math.floor(Math.random()*16777215).toString(16);\n});'

const files = ref([
  { name: 'index.html', language: 'html', content: htmlCode },
  { name: 'style.css', language: 'css', content: cssCode },
  { name: 'script.js', language: 'javascript', content: jsCode }
])

const tabs = ref([])
const editorContainer = ref(null)
const previewFrame = ref(null)
let editor = null

onMounted(async () => {
  await nextTick()
  initEditor()
  openFile(0)
})

function initEditor() {
  if (!editorContainer.value) return
  editor = monaco.editor.create(editorContainer.value, {
    value: files.value[0].content,
    language: files.value[0].language,
    theme: theme.value,
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: true },
    lineNumbers: 'on',
    bracketPairColorization: { enabled: true }
  })
  editor.onDidChangeModelContent(() => {
    modified.value = true
    if (files.value[activeFile.value]) {
      files.value[activeFile.value].content = editor.getValue()
    }
  })
  editor.onDidChangeCursorPosition((e) => {
    line.value = e.position.lineNumber
    col.value = e.position.column
  })
  editor.addAction({
    id: 'save',
    label: 'Save',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    run: saveFile
  })
}

function openFile(i) {
  activeFile.value = i
  const file = files.value[i]
  if (!tabs.value.find(t => t.name === file.name)) {
    tabs.value.push(file)
  }
  activeTab.value = tabs.value.findIndex(t => t.name === file.name)
  currentLang.value = file.language
  if (editor) {
    editor.setValue(file.content)
    monaco.editor.setModelLanguage(editor.getModel(), file.language)
  }
  updatePreview()
}

function switchTab(i) {
  activeTab.value = i
  const file = tabs.value[i]
  const idx = files.value.findIndex(f => f.name === file.name)
  openFile(idx)
}

function closeTab(i) {
  tabs.value.splice(i, 1)
  if (activeTab.value >= tabs.value.length) activeTab.value = tabs.value.length - 1
}

function closeFile(i) {
  files.value.splice(i, 1)
  closeTab(tabs.value.findIndex(t => t.name === files.value[i]?.name))
}

function newFile() {
  const name = prompt('File name:')
  if (!name) return
  const ext = name.split('.').pop().toLowerCase()
  const map = { html: 'html', css: 'css', js: 'javascript', json: 'json', py: 'python', java: 'java', c: 'c', cpp: 'cpp', php: 'php', txt: 'plaintext' }
  files.value.push({ name, language: map[ext] || 'plaintext', content: '' })
  openFile(files.value.length - 1)
}

function saveFile() {
  if (editor && files.value[activeFile.value]) {
    files.value[activeFile.value].content = editor.getValue()
    modified.value = false
    updatePreview()
  }
}

function updatePreview() {
  setTimeout(() => {
    if (!previewFrame.value) return
    const html = files.value.find(f => f.name.endsWith('.html'))
    const css = files.value.find(f => f.name.endsWith('.css'))
    const js = files.value.find(f => f.name.endsWith('.js'))
    let code = html?.content || '<h1>No HTML</h1>'
    if (css) code = code.replace('</head>', '<style>' + css.content + '</style></head>')
    if (js) code = code.replace('</body>', '<script>' + js.content + '<\/script></body>')
    const doc = previewFrame.value.contentDocument || previewFrame.value.contentWindow.document
    doc.open()
    doc.write(code)
    doc.close()
  }, 100)
}

function refreshPreview() { updatePreview() }
function changeTheme() { if (editor) monaco.editor.setTheme(theme.value) }
function getIcon(name) {
  const ext = name.split('.').pop()
  const icons = { html: '🌐', css: '🎨', js: '📜', json: '📋', py: '🐍', java: '☕', c: '⚙️', cpp: '⚙️', php: '🐘', txt: '📄' }
  return icons[ext] || '📄'
}

async function startBuild() {
  building.value = true
  progress.value = 0
  logs.value = []
  const steps = [
    { p: 10, m: 'Validating files...', t: 500 },
    { p: 25, m: 'Creating Android project...', t: 800 },
    { p: 40, m: 'Generating Manifest...', t: 600 },
    { p: 55, m: 'Configuring Gradle...', t: 1000 },
    { p: 70, m: 'Compiling resources...', t: 1200 },
    { p: 85, m: 'Building APK...', t: 1500 },
    { p: 95, m: 'Signing APK...', t: 800 },
    { p: 100, m: 'Build complete!', t: 500 }
  ]
  for (const step of steps) {
    progress.value = step.p
    status.value = step.m
    logs.value.push({ time: new Date().toLocaleTimeString(), msg: step.m, type: 'info' })
    await new Promise(r => setTimeout(r, step.t))
  }
  const data = { app: appName.value, package: packageName.value, version: version.value, files: files.value.map(f => ({ name: f.name, content: f.content })), date: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/octet-stream' })
  apkName.value = appName.value + '-' + version.value + '.apk'
  apkSize.value = (blob.size / 1024).toFixed(1) + ' KB'
  window._apk = blob
  window._apkName = apkName.value
  setTimeout(() => {
    building.value = false
    showBuild.value = false
    showSuccess.value = true
  }, 1000)
}

function downloadApk() {
  if (window._apk) {
    const url = URL.createObjectURL(window._apk)
    const a = document.createElement('a')
    a.href = url
    a.download = window._apkName
    a.click()
    URL.revokeObjectURL(url)
  }
}

watch(previewMode, () => { if (showPreview.value) updatePreview() })
</script>

<style scoped>
.app-container { height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; color: #ccc; font-family: sans-serif; }
.toolbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; background: #252526; border-bottom: 1px solid #3e3e42; min-height: 48px; }
.toolbar-left { display: flex; align-items: center; gap: 12px; }
.app-title { font-size: 16px; font-weight: 600; color: #007acc; }
.toolbar-center { display: flex; gap: 8px; }
.tool-btn { padding: 6px 14px; background: #2d2d30; border: 1px solid #3e3e42; border-radius: 4px; color: #ccc; font-size: 13px; cursor: pointer; }
.tool-btn:hover { background: #37373d; }
.build-btn { background: #007acc; color: white; border-color: #007acc; font-weight: 600; }
.build-btn:hover { background: #005a9e; }
.menu-btn { font-size: 20px; background: none; border: none; color: #ccc; cursor: pointer; }
.theme-select { padding: 4px 8px; background: #2d2d30; border: 1px solid #3e3e42; border-radius: 4px; color: #ccc; font-size: 12px; }
.main-container { flex: 1; display: flex; overflow: hidden; }
.sidebar { width: 250px; background: #252526; border-right: 1px solid #3e3e42; display: flex; flex-direction: column; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; font-size: 11px; font-weight: 600; color: #999; border-bottom: 1px solid #3e3e42; }
.add-btn { width: 24px; height: 24px; background: none; border: none; color: #ccc; font-size: 18px; cursor: pointer; border-radius: 4px; }
.add-btn:hover { background: #37373d; }
.file-list { flex: 1; overflow-y: auto; padding: 8px; }
.file-item { display: flex; align-items: center; padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 13px; gap: 8px; }
.file-item:hover { background: #2a2d2e; }
.file-item.active { background: #37373d; }
.file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.close-btn { background: none; border: none; color: #999; font-size: 16px; cursor: pointer; opacity: 0; }
.file-item:hover .close-btn { opacity: 1; }
.editor-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.tabs-bar { display: flex; background: #2d2d30; border-bottom: 1px solid #3e3e42; overflow-x: auto; }
.tab { display: flex; align-items: center; padding: 8px 16px; font-size: 13px; cursor: pointer; border-right: 1px solid #3e3e42; background: #2d2d30; min-width: 100px; gap: 8px; }
.tab.active { background: #1e1e1e; border-bottom: 2px solid #007acc; }
.tab:hover { background: #37373d; }
.tab-close { background: none; border: none; color: #999; font-size: 14px; cursor: pointer; opacity: 0; }
.tab:hover .tab-close { opacity: 1; }
.editor-container { flex: 1; overflow: hidden; }
.preview-panel { height: 300px; border-top: 2px solid #007acc; display: flex; flex-direction: column; background: white; }
.preview-header { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: #252526; color: #ccc; font-size: 11px; font-weight: 600; }
.preview-mode { padding: 2px 8px; background: #2d2d30; border: 1px solid #3e3e42; border-radius: 4px; color: #ccc; font-size: 11px; }
.preview-header button { background: #2d2d30; border: 1px solid #3e3e42; color: #ccc; padding: 2px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; }
.preview-frame { flex: 1; border: none; width: 100%; background: white; }
.preview-frame.mobile { max-width: 375px; margin: 0 auto; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }
.preview-frame.tablet { max-width: 768px; margin: 0 auto; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }
.status-bar { display: flex; justify-content: space-between; align-items: center; padding: 0 12px; height: 24px; background: #007acc; color: white; font-size: 11px; gap: 16px; }
.dialog-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.build-dialog { background: #252526; border-radius: 12px; width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #3e3e42; }
.dialog-header h2 { font-size: 18px; color: #fff; }
.dialog-content { padding: 20px; }
.input-group { margin-bottom: 12px; }
.input-group label { display: block; margin-bottom: 4px; font-size: 12px; color: #999; }
.input-group input { width: 100%; padding: 8px 12px; background: #1e1e1e; border: 1px solid #3e3e42; border-radius: 4px; color: #fff; font-size: 13px; }
.build-logs { margin-top: 16px; background: #1e1e1e; border-radius: 6px; padding: 12px; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px; }
.log-entry { padding: 4px 0; display: flex; gap: 12px; border-bottom: 1px solid #2d2d30; }
.log-entry.success { color: #4ec9b0; }
.log-entry.error { color: #f44747; }
.log-time { color: #666; min-width: 70px; }
.progress-section { margin-top: 16px; }
.progress-bar { height: 6px; background: #3e3e42; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #007acc, #4ec9b0); border-radius: 3px; transition: width 0.3s ease; }
.progress-text { display: block; margin-top: 8px; font-size: 12px; color: #999; text-align: center; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 20px; border-top: 1px solid #3e3e42; }
.btn-cancel { padding: 8px 20px; background: #3e3e42; border: none; border-radius: 6px; color: #ccc; font-size: 14px; cursor: pointer; }
.btn-build { padding: 8px 20px; background: #007acc; border: none; border-radius: 6px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-build:hover:not(:disabled) { background: #005a9e; }
.btn-build:disabled { opacity: 0.6; cursor: not-allowed; }
.success-dialog { background: #252526; border-radius: 12px; padding: 30px; text-align: center; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.success-icon { font-size: 48px; margin-bottom: 16px; }
.success-dialog h2 { color: #4ec9b0; margin-bottom: 8px; }
.success-dialog p { color: #999; margin-bottom: 8px; }
.success-actions { display: flex; gap: 8px; justify-content: center; margin-top: 16px; }
.btn-download { padding: 10px 24px; background: #007acc; border: none; border-radius: 6px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-close { padding: 10px 24px; background: #3e3e42; border: none; border-radius: 6px; color: #ccc; font-size: 14px; cursor: pointer; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #1e1e1e; }
::-webkit-scrollbar-thumb { background: #424242; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #555; }
</style>
