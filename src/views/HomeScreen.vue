<template>
  <div class="home">
    <header class="header">
      <div class="header-left">
        <div class="logo-icon">F</div>
        <span class="logo-text">Faraz Code Editor</span>
      </div>
      <button class="settings-btn" @click="$router.push('/settings')" title="Settings">
        ⚙️
      </button>
    </header>
    
    <div class="content">
      <div class="hero-section">
        <h1 class="hero-title">Professional Code Editor</h1>
        <p class="hero-subtitle">Create, edit, and preview your projects</p>
        <button class="create-btn" @click="showDialog = true">
          <span class="create-icon">+</span>
          Create New Project
        </button>
      </div>
      
      <div v-if="store.projects.length" class="projects-section">
        <div class="section-header">
          <h2>Your Projects</h2>
          <span class="count">{{ store.projects.length }} projects</span>
        </div>
        
        <div class="project-grid">
          <div v-for="p in store.projects" :key="p.id" class="project-card" @click="openProject(p.id)">
            <div class="card-top">
              <div class="card-icon" :style="{ background: p.color }">
                {{ p.name[0]?.toUpperCase() }}
              </div>
              <div class="card-actions">
                <button @click.stop="duplicateProject(p.id)" title="Duplicate" class="action-btn">📋</button>
                <button @click.stop="deleteProject(p.id)" title="Delete" class="action-btn">🗑️</button>
              </div>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ p.name }}</h3>
              <p class="card-type">{{ p.type?.toUpperCase() }} Project</p>
            </div>
            <div class="card-footer">
              <span>📁 {{ p.files.length }} files</span>
              <span>🕐 {{ formatDate(p.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">📂</div>
        <h2>No Projects Yet</h2>
        <p>Create your first project and start coding!</p>
      </div>
    </div>

    <!-- CREATE DIALOG -->
    <div v-if="showDialog" class="overlay" @click.self="showDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h2>Create New Project</h2>
          <button @click="showDialog = false" class="close-btn">✕</button>
        </div>
        <div class="dialog-body">
          <div class="field">
            <label>Project Name *</label>
            <input v-model="form.name" placeholder="My Awesome Project" class="input" autofocus @keyup.enter="createProject">
          </div>
          <div class="field">
            <label>Description</label>
            <input v-model="form.description" placeholder="What's this project about?" class="input">
          </div>
          <div class="field">
            <label>Project Type</label>
            <select v-model="form.type" class="input">
              <option value="web">🌐 Web (HTML/CSS/JS)</option>
              <option value="python">🐍 Python</option>
              <option value="java">☕ Java</option>
              <option value="cpp">⚙️ C++</option>
              <option value="php">🐘 PHP</option>
            </select>
          </div>
          <div class="field">
            <label>Theme Color</label>
            <div class="color-picker">
              <button v-for="c in colors" :key="c" class="color-dot" :class="{ active: form.color === c }" :style="{ background: c }" @click="form.color = c"></button>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button @click="showDialog = false" class="btn-cancel">Cancel</button>
          <button @click="createProject" class="btn-create" :disabled="!form.name">Create Project</button>
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
const form = reactive({ name: '', description: '', type: 'web', color: '#007acc' })
const colors = ['#007acc', '#4ec9b0', '#f44747', '#cca700', '#3794ff', '#b180d7', '#e91e63', '#ff5722', '#009688', '#795548']

function createProject() {
  if (!form.name.trim()) return
  const p = store.createProject({ ...form })
  form.name = ''; form.description = ''; form.type = 'web'; form.color = '#007acc'
  showDialog.value = false
  router.push('/editor/' + p.id)
}
function openProject(id) { router.push('/editor/' + id) }
function deleteProject(id) { if (confirm('Delete this project?')) store.deleteProject(id) }
function duplicateProject(id) { store.duplicateProject(id) }
function formatDate(d) {
  const date = new Date(d)
  const now = new Date()
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return diff + 'd ago'
  return date.toLocaleDateString()
}
</script>

<style scoped>
.home { height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 14px 24px; background: #252526; border-bottom: 1px solid #3e3e42; }
.header-left { display: flex; align-items: center; gap: 12px; }
.logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #007acc, #005a9e); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 18px; font-family: monospace; }
.logo-text { font-size: 17px; font-weight: 700; color: #fff; }
.settings-btn { background: #2d2d30; border: 1px solid #3e3e42; color: #ccc; font-size: 20px; width: 40px; height: 40px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.settings-btn:hover { background: #37373d; border-color: #007acc; }
.content { flex: 1; overflow-y: auto; padding: 24px; }
.hero-section { text-align: center; padding: 40px 20px; }
.hero-title { font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 8px; }
.hero-subtitle { color: #888; margin-bottom: 28px; font-size: 15px; }
.create-btn { display: inline-flex; align-items: center; gap: 10px; padding: 15px 32px; background: linear-gradient(135deg, #007acc, #005a9e); color: #fff; border: none; border-radius: 14px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 6px 25px rgba(0,122,204,0.4); transition: all 0.3s; }
.create-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 35px rgba(0,122,204,0.6); }
.create-icon { font-size: 22px; font-weight: 300; }
.projects-section { margin-top: 20px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h2 { font-size: 18px; color: #fff; }
.count { font-size: 12px; color: #888; background: #252526; padding: 4px 12px; border-radius: 20px; }
.project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.project-card { background: #252526; border-radius: 14px; padding: 18px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.project-card:hover { border-color: #007acc; background: #2a2d2e; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.4); }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.card-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 20px; }
.card-actions { display: flex; gap: 4px; }
.action-btn { background: #333; border: none; border-radius: 8px; padding: 6px 8px; cursor: pointer; font-size: 14px; transition: background 0.2s; }
.action-btn:hover { background: #444; }
.card-body { margin-bottom: 12px; }
.card-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px; }
.card-type { font-size: 11px; color: #007acc; }
.card-footer { display: flex; justify-content: space-between; font-size: 11px; color: #888; padding-top: 12px; border-top: 1px solid #333; }
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
.empty-state h2 { color: #fff; margin-bottom: 8px; }
.empty-state p { color: #888; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(6px); }
.dialog { background: #252526; border-radius: 18px; width: 92%; max-width: 460px; box-shadow: 0 25px 80px rgba(0,0,0,0.6); overflow: hidden; }
.dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #3e3e42; }
.dialog-header h2 { color: #fff; font-size: 19px; }
.close-btn { background: none; border: none; color: #999; font-size: 22px; cursor: pointer; }
.dialog-body { padding: 20px 24px; }
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 13px; color: #aaa; margin-bottom: 6px; font-weight: 500; }
.input { width: 100%; padding: 11px 14px; background: #1e1e1e; border: 1px solid #3e3e42; border-radius: 10px; color: #fff; font-size: 14px; transition: border-color 0.2s; }
.input:focus { border-color: #007acc; outline: none; }
select.input { cursor: pointer; }
.color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
.color-dot { width: 30px; height: 30px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
.color-dot.active { border-color: #fff; transform: scale(1.2); box-shadow: 0 0 12px rgba(255,255,255,0.3); }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #3e3e42; }
.btn-cancel { padding: 10px 22px; background: #3e3e42; border: none; border-radius: 10px; color: #ccc; font-size: 14px; cursor: pointer; }
.btn-create { padding: 10px 22px; background: linear-gradient(135deg, #007acc, #005a9e); border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-create:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
