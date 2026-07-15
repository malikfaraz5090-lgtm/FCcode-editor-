<template>
  <div class="home-premium">
    <!-- PREMIUM HEADER -->
    <header class="header-premium glass-dark">
      <div class="header-left">
        <div class="logo-premium gradient-blue">
          <span class="logo-text">F</span>
        </div>
        <div>
          <h1 class="app-title text-gradient">Faraz Code Editor</h1>
          <p class="app-subtitle">Professional · Premium · Powerful</p>
        </div>
      </div>
      <button @click="$router.push('/settings')" class="btn-settings glass">
        <span>⚙️</span>
      </button>
    </header>

    <!-- HERO SECTION -->
    <div class="hero-premium">
      <div class="hero-content">
        <h2 class="hero-title">Create Amazing Apps</h2>
        <p class="hero-desc">Professional code editor with real APK builder</p>
        <button @click="showDialog = true" class="btn-create btn-premium gradient-blue">
          <span class="btn-icon">+</span>
          Create New Project
        </button>
      </div>
      <div class="hero-stats glass">
        <div class="stat">
          <span class="stat-number">{{ store.projects.length }}</span>
          <span class="stat-label">Projects</span>
        </div>
        <div class="stat">
          <span class="stat-number">HTML</span>
          <span class="stat-label">CSS JS</span>
        </div>
        <div class="stat">
          <span class="stat-number">APK</span>
          <span class="stat-label">Export</span>
        </div>
      </div>
    </div>

    <!-- PROJECTS -->
    <div class="projects-section" v-if="store.projects.length">
      <h3 class="section-title">Your Projects</h3>
      <div class="project-grid">
        <div v-for="p in store.projects" :key="p.id" class="project-card card-premium" @click="openProject(p.id)">
          <div class="card-top">
            <div class="project-icon" :style="{ background: p.color }">
              {{ p.name[0]?.toUpperCase() }}
            </div>
            <div class="project-actions">
              <button @click.stop="store.duplicateProject(p.id)" class="action-btn">📋</button>
              <button @click.stop="store.deleteProject(p.id)" class="action-btn">🗑️</button>
            </div>
          </div>
          <h4 class="project-name">{{ p.name }}</h4>
          <p class="project-type badge-premium">{{ p.type || 'web' }}</p>
          <div class="project-meta">
            <span>📁 {{ p.files.length }} files</span>
            <span>🕐 {{ p.updatedAt?.split('T')[0] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-else class="empty-premium glass">
      <div class="empty-icon">🚀</div>
      <h3>Start Your Journey</h3>
      <p>Create your first project and build something amazing!</p>
    </div>

    <!-- CREATE DIALOG -->
    <div v-if="showDialog" class="overlay-premium" @click.self="showDialog = false">
      <div class="dialog-premium glass-dark">
        <div class="dialog-header">
          <h2>Create New Project</h2>
          <button @click="showDialog = false" class="close-btn">✕</button>
        </div>
        <div class="dialog-body">
          <input v-model="form.name" placeholder="Project Name" class="input-premium" autofocus>
          <select v-model="form.type" class="input-premium">
            <option value="web">🌐 Web App</option>
            <option value="python">🐍 Python</option>
            <option value="java">☕ Java</option>
            <option value="cpp">⚙️ C++</option>
            <option value="php">🐘 PHP</option>
          </select>
          <div class="color-picker">
            <button v-for="c in colors" :key="c" class="color-dot" :class="{ active: form.color === c }" :style="{ background: c }" @click="form.color = c"></button>
          </div>
        </div>
        <div class="dialog-footer">
          <button @click="showDialog = false" class="btn-cancel">Cancel</button>
          <button @click="createProject" class="btn-create gradient-blue" :disabled="!form.name">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../stores/projectStore.js'

const store = useProjectStore()
const router = useRouter()
const showDialog = ref(false)
const form = reactive({ name: '', type: 'web', color: '#007acc' })
const colors = ['#007acc', '#4ec9b0', '#f44747', '#e91e63', '#ff5722', '#9c27b0', '#3f51b5', '#009688']

function createProject() {
  if (!form.name) return
  const p = store.createProject({ ...form })
  form.name = ''; form.type = 'web'; form.color = '#007acc'
  showDialog.value = false
  router.push('/editor/' + p.id)
}
function openProject(id) { router.push('/editor/' + id) }
</script>

<style scoped>
.home-premium { height: 100vh; display: flex; flex-direction: column; background: #0a0a0f; color: #fff; overflow: hidden; }
.header-premium { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; }
.header-left { display: flex; align-items: center; gap: 14px; }
.logo-premium { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.logo-text { font-size: 22px; font-weight: 800; color: #fff; }
.app-title { font-size: 18px; margin: 0; }
.app-subtitle { font-size: 10px; color: #888; margin: 0; }
.btn-settings { width: 44px; height: 44px; border-radius: 14px; border: none; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.hero-premium { padding: 30px 24px; display: flex; gap: 20px; flex-wrap: wrap; align-items: center; }
.hero-content { flex: 1; }
.hero-title { font-size: 28px; margin: 0 0 8px; }
.hero-desc { color: #888; margin: 0 0 20px; font-size: 14px; }
.btn-create { display: inline-flex; align-items: center; gap: 8px; }
.btn-icon { font-size: 20px; }
.hero-stats { display: flex; gap: 20px; padding: 20px; border-radius: 16px; }
.stat { text-align: center; }
.stat-number { display: block; font-size: 24px; font-weight: 700; color: #00d2ff; }
.stat-label { font-size: 10px; color: #888; }
.projects-section { flex: 1; overflow-y: auto; padding: 0 24px 24px; }
.section-title { font-size: 16px; margin-bottom: 16px; color: #aaa; }
.project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.project-card { cursor: pointer; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.project-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
.project-actions { display: flex; gap: 4px; }
.action-btn { background: rgba(255,255,255,0.05); border: none; border-radius: 8px; padding: 6px 8px; cursor: pointer; font-size: 14px; }
.project-name { font-size: 15px; margin: 0 0 4px; }
.project-type { display: inline-block; margin-bottom: 8px; }
.project-meta { display: flex; justify-content: space-between; font-size: 11px; color: #888; }
.empty-premium { text-align: center; padding: 60px 20px; margin: 20px; border-radius: 20px; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-premium h3 { margin: 0 0 8px; }
.empty-premium p { color: #888; margin: 0; }
.overlay-premium { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(10px); }
.dialog-premium { width: 92%; max-width: 420px; border-radius: 20px; padding: 24px; }
.dialog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.dialog-header h2 { font-size: 18px; margin: 0; }
.close-btn { background: none; border: none; color: #999; font-size: 20px; cursor: pointer; }
.dialog-body { display: flex; flex-direction: column; gap: 12px; }
.input-premium { padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 14px; }
.input-premium:focus { border-color: #007acc; outline: none; }
.color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
.color-dot { width: 30px; height: 30px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
.color-dot.active { border-color: #fff; transform: scale(1.2); }
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.btn-cancel { padding: 10px 20px; background: rgba(255,255,255,0.05); border: none; border-radius: 10px; color: #ccc; cursor: pointer; }
.btn-create { padding: 10px 20px; border: none; border-radius: 10px; color: #fff; font-weight: 600; cursor: pointer; }
.btn-create:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
