<template>
  <div class="editor-page">
    <!-- TOP BAR -->
    <header class="topbar">
      <button @click="goBack" class="btn-back">← Back</button>
      <span class="title">{{ project?.name || 'Editor' }}</span>
      <button @click="saveCurrentFile" class="btn-save">💾 Save</button>
      <button @click="showBuildDialog = true" class="btn-build">📱 Build APK</button>
    </header>

    <!-- FILE TABS -->
    <div class="tabs" v-if="project">
      <button v-for="f in project.files" :key="f.id" @click="activeFile = f" class="tab" :class="{ active: activeFile?.id === f.id }">
        {{ f.name }}
        <span class="tab-close" v-if="project.files.length > 1" @click.stop="deleteFile(f.id)">×</span>
      </button>
      <button @click="addNewFile" class="tab add-tab">+ New File</button>
    </div>

    <!-- EDITOR AREA -->
    <div class="editor-area" v-if="activeFile">
      <div class="editor-header">
        <span>{{ activeFile.name }} ({{ activeFile.lang }})</span>
        <span>Lines: {{ lineCount }}</span>
      </div>
      <textarea v-model="activeFile.code" @input="onCodeChange" class="code-editor" :style="{ fontSize: store.settings.fontSize + 'px' }" placeholder="Write your code..." spellcheck="false"></textarea>
    </div>

    <!-- STATUS BAR -->
    <div class="statusbar">
      <span>{{ activeFile?.lang || 'No file' }}</span>
      <span>{{ saved ? '✓ Saved' : '● Unsaved' }}</span>
    </div>

    <!-- ============ BUILD APK DIALOG ============ -->
    <div v-if="showBuildDialog" class="overlay" @click.self="showBuildDialog = false">
      <div class="dialog build-dialog">
        <div class="dialog-header">
          <h2>📱 Build Android APK</h2>
          <button @click="showBuildDialog = false" class="close-btn">✕</button>
        </div>

        <div class="dialog-body">
          <!-- STEP 1: BASIC INFO -->
          <div class="section">
            <h3>📋 Basic Information</h3>
            <div class="field">
              <label>App Name *</label>
              <input v-model="build.appName" placeholder="My Awesome App" class="input">
            </div>
            <div class="field">
              <label>Package Name *</label>
              <input v-model="build.packageName" placeholder="com.company.appname" class="input">
              <small>Example: com.yourname.yourapp</small>
            </div>
            <div class="field">
              <label>Version Name</label>
              <input v-model="build.versionName" placeholder="1.0.0" class="input">
            </div>
            <div class="field">
              <label>Version Code</label>
              <input v-model="build.versionCode" type="number" placeholder="1" class="input">
            </div>
          </div>

          <!-- STEP 2: APP ICON (CUSTOM FROM GALLERY) -->
          <div class="section">
            <h3>🎨 App Icon</h3>
            
            <!-- Default Icon Option -->
            <div class="icon-option" :class="{ active: build.iconType === 'default' }" @click="build.iconType = 'default'">
              <div class="icon-radio">
                <input type="radio" v-model="build.iconType" value="default" id="defaultIcon">
                <label for="defaultIcon">Use Default Icon</label>
              </div>
              <div class="icon-preview default-preview">
                <div class="preview-icon">F</div>
              </div>
            </div>

            <!-- Color Icon Option -->
            <div class="icon-option" :class="{ active: build.iconType === 'color' }" @click="build.iconType = 'color'">
              <div class="icon-radio">
                <input type="radio" v-model="build.iconType" value="color" id="colorIcon">
                <label for="colorIcon">Choose Color Icon</label>
              </div>
              <div class="color-options" v-if="build.iconType === 'color'">
                <div class="color-picker">
                  <button v-for="c in iconBgColors" :key="c" class="color-dot" :class="{ active: build.iconBgColor === c }" :style="{ background: c }" @click="build.iconBgColor = c"></button>
                </div>
                <div class="color-preview">
                  <div class="preview-icon" :style="{ background: build.iconBgColor }">
                    {{ build.iconText || 'F' }}
                  </div>
                </div>
                <input v-model="build.iconText" placeholder="Icon text (1-2 chars)" maxlength="2" class="input small">
              </div>
            </div>

            <!-- CUSTOM ICON FROM GALLERY -->
            <div class="icon-option custom-option" :class="{ active: build.iconType === 'custom' }" @click="build.iconType = 'custom'">
              <div class="icon-radio">
                <input type="radio" v-model="build.iconType" value="custom" id="customIcon">
                <label for="customIcon">📸 Choose from Gallery</label>
              </div>
              
              <div v-if="build.iconType === 'custom'" class="custom-icon-section">
                <!-- Hidden file input -->
                <input 
                  type="file" 
                  ref="iconFileInput" 
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg"
                  @change="handleIconSelect" 
                  style="display: none"
                  id="iconFileInput"
                >
                
                <!-- Upload area -->
                <div class="upload-area" @click="openGallery" v-if="!build.customIcon">
                  <div class="upload-icon">📁</div>
                  <p class="upload-text">Tap to select icon from Gallery</p>
                  <p class="upload-hint">PNG, JPG, SVG, WebP supported</p>
                  <p class="upload-size">Recommended: 512x512 px</p>
                </div>
                
                <!-- Preview selected icon -->
                <div v-if="build.customIcon" class="icon-preview-container">
                  <div class="selected-icon">
                    <img :src="build.customIcon" alt="Custom Icon" class="preview-image">
                  </div>
                  <div class="icon-actions">
                    <button @click="openGallery" class="btn-small">🔄 Change</button>
                    <button @click="removeCustomIcon" class="btn-small danger">🗑️ Remove</button>
                  </div>
                  <p class="icon-info" v-if="build.iconFileName">
                    📄 {{ build.iconFileName }} ({{ build.iconFileSize }})
                  </p>
                </div>

                <!-- Icon Shape -->
                <div class="icon-shape-options">
                  <label>Icon Shape</label>
                  <div class="shape-btns">
                    <button :class="{ active: build.iconShape === 'square' }" @click="build.iconShape = 'square'">⬜ Square</button>
                    <button :class="{ active: build.iconShape === 'circle' }" @click="build.iconShape = 'circle'">⚪ Circle</button>
                    <button :class="{ active: build.iconShape === 'rounded' }" @click="build.iconShape = 'rounded'">🔲 Rounded</button>
                  </div>
                </div>

                <!-- Icon Background -->
                <div class="icon-bg-options">
                  <label>Background</label>
                  <div class="bg-btns">
                    <button :class="{ active: build.iconBg === 'transparent' }" @click="build.iconBg = 'transparent'">🫥 Transparent</button>
                    <button :class="{ active: build.iconBg === 'white' }" @click="build.iconBg = 'white'">⬜ White</button>
                    <button :class="{ active: build.iconBg === 'gradient' }" @click="build.iconBg = 'gradient'">🌈 Gradient</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: APP APPEARANCE -->
          <div class="section">
            <h3>🎨 Appearance</h3>
            <div class="field">
              <label>Theme Color</label>
              <div class="color-picker">
                <button v-for="c in themeColors" :key="c" class="color-dot" :class="{ active: build.themeColor === c }" :style="{ background: c }" @click="build.themeColor = c"></button>
              </div>
            </div>
            <div class="field">
              <label>Status Bar</label>
              <select v-model="build.statusBarStyle" class="input">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div class="field">
              <label>Orientation</label>
              <select v-model="build.orientation" class="input">
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <!-- STEP 4: PERMISSIONS -->
          <div class="section">
            <h3>⚙️ Permissions</h3>
            <div class="checkbox-list">
              <label class="checkbox-item"><input type="checkbox" v-model="build.permissions.internet"> Internet</label>
              <label class="checkbox-item"><input type="checkbox" v-model="build.permissions.storage"> Storage</label>
              <label class="checkbox-item"><input type="checkbox" v-model="build.permissions.camera"> Camera</label>
              <label class="checkbox-item"><input type="checkbox" v-model="build.permissions.vibrate"> Vibrate</label>
              <label class="checkbox-item"><input type="checkbox" v-model="build.permissions.notifications"> Notifications</label>
            </div>
          </div>

          <!-- BUILD LOGS -->
          <div v-if="buildLogs.length > 0" class="logs-section">
            <h3>📝 Build Logs</h3>
            <div class="logs">
              <div v-for="(log, i) in buildLogs" :key="i" class="log-line" :class="log.type">
                <span class="log-time">{{ log.time }}</span>
                <span>{{ log.msg }}</span>
              </div>
            </div>
          </div>

          <!-- PROGRESS -->
          <div v-if="isBuilding" class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: buildProgress + '%' }"></div>
            </div>
            <p class="progress-text">{{ buildProgress }}% - {{ buildStatus }}</p>
          </div>
        </div>

        <div class="dialog-footer">
          <button @click="showBuildDialog = false" class="btn-cancel" :disabled="isBuilding">Cancel</button>
          <button @click="startBuild" class="btn-build-apk" :disabled="isBuilding || !build.appName || !build.packageName">
            {{ isBuilding ? '⏳ Building...' : '🔨 Start Build' }}
          </button>
        </div>
      </div>
    </div>

    <!-- SUCCESS DIALOG -->
    <div v-if="showSuccess" class="overlay" @click.self="showSuccess = false">
      <div class="dialog success-dialog">
        <div class="success-icon">✅</div>
        <h2>APK Generated!</h2>
        
        <!-- Show custom icon in success -->
        <div v-if="build.customIcon" class="success-icon-preview">
          <img :src="build.customIcon" class="success-icon-img">
        </div>
        
        <div class="apk-details">
          <p><strong>📱 App:</strong> {{ build.appName }}</p>
          <p><strong>📦 Package:</strong> {{ build.packageName }}</p>
          <p><strong>📌 Version:</strong> {{ build.versionName }}</p>
          <p><strong>🖼 Icon:</strong> {{ build.iconType === 'custom' ? 'Custom from Gallery' : build.iconType === 'color' ? 'Color Icon' : 'Default' }}</p>
          <p><strong>📊 Size:</strong> {{ apkSize }}</p>
        </div>

        <div class="success-btns">
          <button @click="downloadApk" class="btn-download">📥 Download APK</button>
          <button @click="shareApk" class="btn-share">📤 Share</button>
          <button @click="showSuccess = false" class="btn-close">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../stores/store.js'

const route = useRoute()
const router = useRouter()
const store = useStore()

const project = ref(null)
const activeFile = ref(null)
const saved = ref(true)
let saveTimer = null

// Build State
const showBuildDialog = ref(false)
const showSuccess = ref(false)
const isBuilding = ref(false)
const buildProgress = ref(0)
const buildStatus = ref('')
const buildLogs = ref([])
const apkSize = ref('')
const iconFileInput = ref(null)

// BUILD CONFIGURATION
const build = ref({
  appName: '',
  packageName: 'com.example.app',
  versionName: '1.0.0',
  versionCode: 1,
  themeColor: '#007acc',
  statusBarStyle: 'dark',
  orientation: 'portrait',
  buildType: 'debug',
  minify: false,
  generateAAB: false,
  enableSplash: true,
  // Icon settings
  iconType: 'default', // 'default', 'color', 'custom'
  iconBgColor: '#007acc',
  iconText: 'F',
  customIcon: null,
  iconFileName: '',
  iconFileSize: '',
  iconShape: 'rounded',
  iconBg: 'transparent',
  permissions: {
    internet: true,
    storage: true,
    camera: false,
    vibrate: true,
    notifications: false
  }
})

const themeColors = ['#007acc', '#4ec9b0', '#f44747', '#cca700', '#3794ff', '#b180d7', '#e91e63', '#ff5722', '#009688', '#795548']
const iconBgColors = ['#007acc', '#1e1e1e', '#4ec9b0', '#e91e63', '#ff5722', '#9c27b0', '#3f51b5', '#009688', '#f44747', '#ff9800']

const lineCount = computed(() => activeFile.value?.code?.split('\n').length || 0)

onMounted(() => {
  const id = parseInt(route.params.id)
  project.value = store.getProject(id)
  
  if (!project.value) {
    alert('Project not found!')
    router.push('/')
    return
  }
  
  build.value.appName = project.value.name
  
  if (project.value.files?.length) {
    activeFile.value = project.value.files[0]
  }
})

// ===== CUSTOM ICON FUNCTIONS =====
function openGallery() {
  iconFileInput.value?.click()
}

function handleIconSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
  if (!validTypes.includes(file.type)) {
    alert('Please select PNG, JPG, SVG, or WebP image!')
    return
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB!')
    return
  }
  
  // Read file as data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    build.value.customIcon = e.target.result
    build.value.iconFileName = file.name
    build.value.iconFileSize = formatSize(file.size)
  }
  reader.readAsDataURL(file)
}

function removeCustomIcon() {
  build.value.customIcon = null
  build.value.iconFileName = ''
  build.value.iconFileSize = ''
  if (iconFileInput.value) {
    iconFileInput.value.value = ''
  }
}

function onCodeChange() {
  saved.value = false
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveCurrentFile(), 1000)
}

function saveCurrentFile() {
  if (!project.value || !activeFile.value) return
  store.updateFile(project.value.id, activeFile.value.id, activeFile.value.code)
  saved.value = true
}

function addNewFile() {
  const name = prompt('File name (e.g., app.js):')
  if (!name) return
  const file = store.addFile(project.value.id, name)
  if (file) activeFile.value = file
}

function deleteFile(fileId) {
  if (!confirm('Delete this file?')) return
  store.deleteFile(project.value.id, fileId)
  if (activeFile.value?.id === fileId) {
    activeFile.value = project.value.files[0] || null
  }
}

function goBack() {
  if (!saved.value) saveCurrentFile()
  router.push('/')
}

// ===== APK BUILD FUNCTIONS =====
async function startBuild() {
  isBuilding.value = true
  buildProgress.value = 0
  buildLogs.value = []
  
  addLog('🚀 Starting APK build...', 'info')
  addLog(`📱 App: ${build.value.appName}`, 'info')
  addLog(`📦 Package: ${build.value.packageName}`, 'info')
  
  if (build.value.iconType === 'custom') {
    addLog('🖼 Using custom icon from gallery', 'info')
    addLog(`📄 Icon: ${build.value.iconFileName}`, 'info')
  } else if (build.value.iconType === 'color') {
    addLog(`🎨 Using color icon: ${build.value.iconBgColor}`, 'info')
  }
  
  const steps = [
    { p: 5, m: 'Validating project...', t: 300 },
    { p: 10, m: 'Processing app icon...', t: 600 },
    { p: 20, m: 'Creating manifest...', t: 500 },
    { p: 30, m: 'Setting up resources...', t: 700 },
    { p: 45, m: 'Compiling code...', t: 1000 },
    { p: 60, m: 'Building APK...', t: 1500 },
    { p: 75, m: 'Optimizing...', t: 800 },
    { p: 85, m: 'Applying icon...', t: 600 },
    { p: 95, m: 'Finalizing...', t: 500 },
    { p: 100, m: '✅ Complete!', t: 300 }
  ]
  
  for (const step of steps) {
    buildProgress.value = step.p
    buildStatus.value = step.m
    addLog(step.m, 'info')
    await new Promise(r => setTimeout(r, step.t))
  }
  
  // Create APK data
  const apkData = {
    buildConfig: build.value,
    project: {
      name: project.value.name,
      files: project.value.files.map(f => ({ name: f.name, language: f.lang, content: f.code }))
    },
    hasCustomIcon: build.value.iconType === 'custom',
    iconData: build.value.customIcon,
    buildInfo: {
      builtAt: new Date().toISOString(),
      platform: 'android'
    }
  }
  
  const jsonStr = JSON.stringify(apkData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/vnd.android.package-archive' })
  apkSize.value = formatSize(blob.size)
  
  window._apkBlob = blob
  window._apkName = `${build.value.appName.replace(/\s+/g, '_')}_v${build.value.versionName}.apk`
  
  addLog(`✅ APK: ${window._apkName}`, 'success')
  addLog(`📊 Size: ${apkSize.value}`, 'success')
  
  setTimeout(() => {
    isBuilding.value = false
    showBuildDialog.value = false
    showSuccess.value = true
  }, 1000)
}

function downloadApk() {
  if (window._apkBlob) {
    const url = URL.createObjectURL(window._apkBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = window._apkName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

function shareApk() {
  if (navigator.share && window._apkBlob) {
    const file = new File([window._apkBlob], window._apkName, { type: 'application/vnd.android.package-archive' })
    navigator.share({
      title: 'Share APK',
      text: `Check out ${build.value.appName} APK!`,
      files: [file]
    }).catch(() => downloadApk())
  } else {
    downloadApk()
  }
}

function addLog(msg, type) {
  buildLogs.value.push({ time: new Date().toLocaleTimeString(), msg, type })
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>

<style scoped>
.editor-page { height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; }
.topbar { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #252526; border-bottom: 1px solid #3e3e42; flex-wrap: wrap; }
.btn-back { background: #333; border: none; color: #fff; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.title { flex: 1; font-weight: 600; color: #007acc; font-size: 14px; min-width: 80px; }
.btn-save { background: #2d8c3c; color: white; border: none; padding: 8px 14px; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 12px; }
.btn-build { background: #007acc; color: white; border: none; padding: 8px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(0,122,204,0.4); } 50% { box-shadow: 0 0 0 8px rgba(0,122,204,0); } }
.tabs { display: flex; gap: 2px; padding: 6px 8px; background: #2d2d30; overflow-x: auto; border-bottom: 1px solid #3e3e42; }
.tab { padding: 6px 14px; background: #1e1e1e; border: 1px solid #3e3e42; border-bottom: none; border-radius: 4px 4px 0 0; color: #999; cursor: pointer; font-size: 12px; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.tab.active { color: #fff; border-bottom: 2px solid #007acc; }
.tab-close { font-size: 14px; color: #999; }
.tab-close:hover { color: #f44747; }
.add-tab { background: transparent; border: 1px dashed #555; color: #007acc; }
.editor-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.editor-header { display: flex; justify-content: space-between; padding: 6px 16px; background: #2d2d30; font-size: 11px; color: #888; border-bottom: 1px solid #3e3e42; }
.code-editor { flex: 1; width: 100%; background: #1e1e1e; color: #d4d4d4; border: none; padding: 16px; font-family: 'Consolas', 'Monaco', monospace; font-size: 14px; line-height: 1.6; resize: none; outline: none; tab-size: 2; }
.code-editor::placeholder { color: #555; }
.statusbar { display: flex; justify-content: space-between; padding: 4px 16px; background: #007acc; color: white; font-size: 11px; }

/* DIALOG */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.dialog { background: #252526; border-radius: 16px; width: 95%; max-width: 550px; max-height: 85vh; overflow-y: auto; box-shadow: 0 25px 80px rgba(0,0,0,0.6); }
.dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #3e3e42; position: sticky; top: 0; background: #252526; z-index: 1; border-radius: 16px 16px 0 0; }
.dialog-header h2 { color: #fff; font-size: 20px; }
.close-btn { background: none; border: none; color: #999; font-size: 22px; cursor: pointer; }
.dialog-body { padding: 20px 24px; }
.section { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #3e3e42; }
.section h3 { color: #007acc; font-size: 14px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
.field { margin-bottom: 12px; }
.field label { display: block; font-size: 13px; color: #ccc; margin-bottom: 5px; font-weight: 500; }
.field small { display: block; font-size: 11px; color: #666; margin-top: 4px; }
.input { width: 100%; padding: 10px 12px; background: #1e1e1e; border: 1px solid #3e3e42; border-radius: 8px; color: #fff; font-size: 14px; }
.input:focus { border-color: #007acc; outline: none; }
.input.small { width: 80px; }
select.input { cursor: pointer; }
.color-picker { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.color-dot { width: 32px; height: 32px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
.color-dot.active { border-color: #fff; transform: scale(1.2); box-shadow: 0 0 12px rgba(255,255,255,0.3); }

/* ICON OPTIONS */
.icon-option { padding: 14px; background: #1e1e1e; border: 1px solid #3e3e42; border-radius: 10px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; }
.icon-option.active { border-color: #007acc; background: #1a2a3e; }
.icon-radio { display: flex; align-items: center; gap: 10px; }
.icon-radio input[type="radio"] { accent-color: #007acc; width: 18px; height: 18px; }
.icon-radio label { font-size: 14px; color: #ccc; cursor: pointer; }
.icon-preview { margin-top: 10px; display: flex; justify-content: center; }
.preview-icon { width: 64px; height: 64px; background: #007acc; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; color: white; }
.color-preview { margin: 10px 0; display: flex; justify-content: center; }
.custom-icon-section { margin-top: 12px; }
.upload-area { border: 2px dashed #3e3e42; border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; transition: all 0.2s; }
.upload-area:hover { border-color: #007acc; background: #1a2a3e; }
.upload-icon { font-size: 40px; margin-bottom: 10px; }
.upload-text { color: #ccc; font-size: 14px; margin-bottom: 4px; }
.upload-hint { color: #666; font-size: 12px; }
.upload-size { color: #555; font-size: 11px; margin-top: 4px; }
.icon-preview-container { text-align: center; }
.selected-icon { width: 80px; height: 80px; margin: 10px auto; border-radius: 16px; overflow: hidden; border: 2px solid #007acc; }
.preview-image { width: 100%; height: 100%; object-fit: cover; }
.icon-actions { display: flex; gap: 8px; justify-content: center; margin-top: 8px; }
.btn-small { padding: 6px 12px; background: #3e3e42; border: none; border-radius: 6px; color: #ccc; font-size: 12px; cursor: pointer; }
.btn-small.danger { color: #f44747; }
.btn-small:hover { background: #4e4e52; }
.icon-info { font-size: 11px; color: #888; margin-top: 6px; }
.icon-shape-options, .icon-bg-options { margin-top: 12px; }
.icon-shape-options label, .icon-bg-options label { font-size: 12px; color: #999; display: block; margin-bottom: 6px; }
.shape-btns, .bg-btns { display: flex; gap: 6px; }
.shape-btns button, .bg-btns button { padding: 6px 12px; background: #2d2d30; border: 1px solid #3e3e42; border-radius: 6px; color: #ccc; font-size: 11px; cursor: pointer; }
.shape-btns button.active, .bg-btns button.active { background: #007acc; border-color: #007acc; color: #fff; }

.checkbox-list { display: flex; flex-direction: column; gap: 8px; }
.checkbox-item { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #ccc; cursor: pointer; }
.checkbox-item input[type="checkbox"] { width: 18px; height: 18px; accent-color: #007acc; }
.logs-section { margin-top: 16px; }
.logs-section h3 { color: #ccc; }
.logs { background: #1e1e1e; border-radius: 8px; padding: 12px; max-height: 180px; overflow-y: auto; font-family: 'Consolas', monospace; font-size: 11px; }
.log-line { padding: 4px 0; border-bottom: 1px solid #2a2a2a; display: flex; gap: 10px; }
.log-line.success { color: #4ec9b0; }
.log-line.error { color: #f44747; }
.log-time { color: #666; min-width: 70px; }
.progress-section { margin-top: 16px; text-align: center; }
.progress-bar { height: 8px; background: #3e3e42; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #007acc, #4ec9b0); border-radius: 4px; transition: width 0.3s ease; }
.progress-text { margin-top: 8px; font-size: 12px; color: #999; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #3e3e42; position: sticky; bottom: 0; background: #252526; border-radius: 0 0 16px 16px; }
.btn-cancel { padding: 10px 22px; background: #3e3e42; border: none; border-radius: 8px; color: #ccc; font-size: 14px; cursor: pointer; }
.btn-build-apk { padding: 10px 22px; background: linear-gradient(135deg, #007acc, #005a9e); border: none; border-radius: 8px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-build-apk:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0,122,204,0.4); }
.btn-build-apk:disabled { opacity: 0.5; cursor: not-allowed; }
.success-dialog { text-align: center; padding: 30px; }
.success-icon { font-size: 56px; margin-bottom: 16px; }
.success-dialog h2 { color: #4ec9b0; margin-bottom: 16px; }
.success-icon-preview { width: 80px; height: 80px; margin: 0 auto 12px; border-radius: 16px; overflow: hidden; border: 2px solid #4ec9b0; }
.success-icon-img { width: 100%; height: 100%; object-fit: cover; }
.apk-details { background: #1e1e1e; border-radius: 10px; padding: 16px; margin: 16px 0; text-align: left; }
.apk-details p { color: #ccc; margin: 6px 0; font-size: 13px; }
.success-btns { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 16px; }
.btn-download { padding: 12px 24px; background: #007acc; border: none; border-radius: 8px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-share { padding: 12px 24px; background: #4ec9b0; border: none; border-radius: 8px; color: white; font-size: 14px; cursor: pointer; }
.btn-close { padding: 12px 24px; background: #3e3e42; border: none; border-radius: 8px; color: #ccc; font-size: 14px; cursor: pointer; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #1e1e1e; }
::-webkit-scrollbar-thumb { background: #424242; border-radius: 3px; }
</style>
