<template>
  <div class="home-screen">
    <!-- TOP BAR -->
    <header class="top-bar">
      <div class="bar-left">
        <div class="logo-small">
          <span>F</span>
        </div>
        <h1 class="bar-title">Faraz Code Editor</h1>
      </div>
      <div class="bar-right">
        <button class="icon-btn" @click="goToSettings" title="Settings">
          ⚙️
        </button>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="home-content">
      <!-- CREATE PROJECT BUTTON -->
      <div class="create-section">
        <button class="create-btn" @click="showCreateDialog = true">
          <span class="create-icon">+</span>
          <span class="create-label">Create New Project</span>
        </button>
      </div>

      <!-- PROJECTS LIST -->
      <section class="projects-section" v-if="projectStore.sortedProjects.length > 0">
        <div class="section-header">
          <h2>My Projects</h2>
          <span class="project-count">{{ projectStore.sortedProjects.length }} projects</span>
        </div>

        <div class="projects-list">
          <div 
            v-for="project in projectStore.sortedProjects" 
            :key="project.id"
            class="project-card"
            :style="{ borderLeftColor: project.color }"
          >
            <div class="card-main" @click="openProject(project.id)">
              <div class="card-icon" :style="{ background: project.color }">
                {{ project.type === 'web' ? '🌐' : '📱' }}
              </div>
              <div class="card-info">
                <h3 class="card-title">{{ project.name }}</h3>
                <p class="card-desc" v-if="project.description">{{ project.description }}</p>
                <div class="card-meta">
                  <span class="meta-item">📁 {{ project.files.length }} files</span>
                  <span class="meta-item">🕐 {{ formatDate(project.updatedAt) }}</span>
                  <span class="meta-item" :style="{ color: project.color }">{{ project.language.toUpperCase() }}</span>
                </div>
              </div>
            </div>
            <div class="card-actions">
              <button class="action-btn" @click.stop="openProject(project.id)" title="Edit">
                ✏️
              </button>
              <button class="action-btn" @click.stop="duplicateProject(project.id)" title="Duplicate">
                📋
              </button>
              <button class="action-btn" @click.stop="confirmDelete(project)" title="Delete">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- EMPTY STATE -->
      <div v-else class="empty-state">
        <div class="empty-icon">📂</div>
        <h2>No Projects Yet</h2>
        <p>Click the button above to create your first project!</p>
      </div>
    </main>

    <!-- CREATE PROJECT DIALOG -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
      <div class="create-dialog">
        <h2 class="dialog-title">Create New Project</h2>
        
        <div class="dialog-form">
          <div class="form-group">
            <label>Project Name *</label>
            <input 
              v-model="newProject.name" 
              type="text" 
              placeholder="My Awesome Project"
              class="form-input"
              ref="nameInput"
            >
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <input 
              v-model="newProject.description" 
              type="text" 
              placeholder="What is this project about?"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label>Project Type</label>
            <select v-model="newProject.type" class="form-select">
              <option value="web">Web (HTML/CSS/JS)</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="php">PHP</option>
            </select>
          </div>

          <div class="form-group">
            <label>Main Language</label>
            <select v-model="newProject.language" class="form-select">
              <option value="html">HTML</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="php">PHP</option>
            </select>
          </div>

          <div class="form-group">
            <label>Theme Color</label>
            <div class="color-options">
              <button 
                v-for="color in projectColors" 
                :key="color"
                class="color-dot"
                :class="{ active: newProject.color === color }"
                :style="{ background: color }"
                @click="newProject.color = color"
              ></button>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button class="btn-cancel" @click="showCreateDialog = false">Cancel</button>
          <button 
            class="btn-create" 
            @click="createNewProject"
            :disabled="!newProject.name.trim()"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../stores/projectStore'

const router = useRouter()
const projectStore = useProjectStore()

const showCreateDialog = ref(false)
const nameInput = ref(null)

const newProject = reactive({
  name: '',
  description: '',
  type: 'web',
  language: 'html',
  color: '#007acc'
})

const projectColors = [
  '#007acc', '#4ec9b0', '#f44747', '#cca700',
  '#3794ff', '#b180d7', '#d16969', '#608b4e',
  '#e91e63', '#9c27b0', '#ff5722', '#795548'
]

// Watch dialog open to focus input
watch(showCreateDialog, async (val) => {
  if (val) {
    await nextTick()
    nameInput.value?.focus()
  }
})

function createNewProject() {
  if (!newProject.name.trim()) return
  
  const project = projectStore.createProject({
    name: newProject.name.trim(),
    description: newProject.description.trim(),
    type: newProject.type,
    language: newProject.language,
    color: newProject.color
  })
  
  // Reset form
  newProject.name = ''
  newProject.description = ''
  newProject.type = 'web'
  newProject.language = 'html'
  newProject.color = '#007acc'
  
  showCreateDialog.value = false
  
  // Open editor
  router.push(`/editor/${project.id}`)
}

function openProject(id) {
  router.push(`/editor/${id}`)
}

function duplicateProject(id) {
  projectStore.duplicateProject(id)
}

function confirmDelete(project) {
  if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
    projectStore.deleteProject(project.id)
  }
}

function goToSettings() {
  router.push('/settings')
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) return 'Just now'
    return `${hours}h ago`
  }
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

// Auto-focus when dialog opens
watch(showCreateDialog, async (val) => {
  if (val) {
    await nextTick()
    nameInput.value?.focus()
  }
})
</script>

<style scoped>
.home-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #cccccc;
}

/* Top Bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-small {
  width: 32px;
  height: 32px;
  background: #007acc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 16px;
}

.bar-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #2d2d30;
  border: 1px solid #3e3e42;
  color: #ccc;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #37373d;
  border-color: #007acc;
}

/* Home Content */
.home-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
}

/* Create Button */
.create-section {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #007acc, #005a9e);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(0, 122, 204, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 122, 204, 0.5);
}

.create-icon {
  font-size: 24px;
  font-weight: 300;
}

/* Projects Section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  color: #fff;
}

.project-count {
  font-size: 12px;
  color: #999;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #252526;
  border-left: 4px solid #007acc;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.project-card:hover {
  background: #2a2d2e;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.card-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  cursor: pointer;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}

.card-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  font-size: 11px;
  color: #888;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #2d2d30;
  border: 1px solid #3e3e42;
  color: #ccc;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #37373d;
  border-color: #007acc;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h2 {
  font-size: 20px;
  color: #fff;
  margin-bottom: 8px;
}

.empty-state p {
  color: #999;
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.create-dialog {
  background: #252526;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 450px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.dialog-title {
  font-size: 20px;
  color: #fff;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-input, .form-select {
  width: 100%;
  padding: 10px 12px;
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
}

.form-input:focus, .form-select:focus {
  border-color: #007acc;
  outline: none;
}

.color-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-dot.active {
  border-color: white;
  transform: scale(1.2);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.btn-cancel, .btn-create {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #3e3e42;
  color: #ccc;
}

.btn-cancel:hover {
  background: #4e4e52;
}

.btn-create {
  background: #007acc;
  color: white;
}

.btn-create:hover:not(:disabled) {
  background: #005a9e;
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
