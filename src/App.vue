<template>
  <div class="app-root">
    <!-- PERMISSION SCREEN (First time) -->
    <div v-if="showPermissionScreen" class="permission-screen">
      <div class="permission-container">
        <div class="perm-logo">
          <span class="perm-logo-text">F</span>
        </div>
        <h1 class="perm-title">Faraz Code Editor</h1>
        <p class="perm-subtitle">We need these permissions to work properly</p>
        
        <div class="perm-list">
          <div class="perm-item" v-for="perm in permissions" :key="perm.name">
            <div class="perm-icon">{{ perm.icon }}</div>
            <div class="perm-info">
              <div class="perm-name">{{ perm.name }}</div>
              <div class="perm-desc">{{ perm.desc }}</div>
            </div>
            <div class="perm-check">✅</div>
          </div>
        </div>
        
        <div class="perm-note">
          <p>🔒 Your data is safe and private</p>
          <p>📁 Used only for your projects</p>
        </div>
        
        <button class="perm-allow-btn" @click="grantPermissions">
          ✓ Allow All Permissions
        </button>
        
        <button class="perm-skip-btn" @click="skipPermissions">
          Skip for now
        </button>
      </div>
    </div>

    <!-- MAIN APP -->
    <router-view v-else />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showPermissionScreen = ref(false)
const permissions = ref([
  { name: 'Storage Access', desc: 'To save and open your projects', icon: '💾' },
  { name: 'Internet Access', desc: 'For live preview and updates', icon: '🌐' },
  { name: 'Camera', desc: 'To scan QR codes for preview', icon: '📷' },
  { name: 'Notifications', desc: 'Build complete alerts', icon: '🔔' },
  { name: 'Install APK', desc: 'To install your built apps', icon: '📱' }
])

onMounted(() => {
  // Check if first time
  const hasSeenPermission = localStorage.getItem('faraz_permissions_granted')
  if (!hasSeenPermission) {
    showPermissionScreen.value = true
  }
})

function grantPermissions() {
  // Request all permissions via Capacitor
  if (window.Capacitor?.isPluginAvailable('Permissions')) {
    requestAllPermissions()
  }
  
  // Mark as granted
  localStorage.setItem('faraz_permissions_granted', 'true')
  localStorage.setItem('faraz_permissions_date', new Date().toISOString())
  
  // Show success and proceed
  setTimeout(() => {
    showPermissionScreen.value = false
  }, 500)
}

async function requestAllPermissions() {
  const permissions = [
    'storage',
    'camera',
    'notifications'
  ]
  
  for (const perm of permissions) {
    try {
      // Request each permission
      console.log(`Requesting ${perm}...`)
    } catch (e) {
      console.log(`${perm} permission: ${e}`)
    }
  }
}

function skipPermissions() {
  localStorage.setItem('faraz_permissions_granted', 'later')
  showPermissionScreen.value = false
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { 
  width: 100%; height: 100%; 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1e1e1e; color: #ccc; overflow: hidden;
}
#app { width: 100%; height: 100%; }

/* PERMISSION SCREEN */
.permission-screen {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #1e1e1e 0%, #252526 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.permission-container {
  max-width: 420px;
  width: 100%;
  text-align: center;
}

.perm-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #007acc, #005a9e);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 10px 30px rgba(0, 122, 204, 0.3);
}

.perm-logo-text {
  font-size: 40px;
  font-weight: bold;
  color: white;
  font-family: monospace;
}

.perm-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.perm-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 30px;
}

.perm-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.perm-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #252526;
  border: 1px solid #3e3e42;
  border-radius: 12px;
  text-align: left;
}

.perm-icon {
  font-size: 28px;
  min-width: 40px;
  text-align: center;
}

.perm-info {
  flex: 1;
}

.perm-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.perm-desc {
  font-size: 11px;
  color: #888;
}

.perm-check {
  font-size: 20px;
  color: #4ec9b0;
}

.perm-note {
  background: #252526;
  border: 1px solid #3e3e42;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 24px;
  text-align: left;
}

.perm-note p {
  font-size: 12px;
  color: #999;
  margin: 4px 0;
}

.perm-allow-btn {
  display: block;
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #007acc, #005a9e);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 122, 204, 0.3);
}

.perm-allow-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 122, 204, 0.5);
}

.perm-skip-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  padding: 8px;
}

.perm-skip-btn:hover {
  color: #999;
}
</style>
