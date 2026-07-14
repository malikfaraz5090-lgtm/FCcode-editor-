cat > src/views/HomeScreen.vue << 'EOF'
<template>
  <div class="home-screen">
    <!-- Header -->
    <header class="app-bar">
      <div class="app-bar-left">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="6" fill="#007acc"/>
            <text x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="monospace">F</text>
          </svg>
          <h1 class="app-title">Faraz Code Editor</h1>
        </div>
      </div>
      <div class="app-bar-right">
        <button class="icon-btn" @click="$router.push('/settings')" title="Settings">
          <span>⚙️</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="home-content">
      <!-- Create Project -->
      <div class="create-section">
        <button class="create-btn" @click="showCreateDialog = true">
          <span class="create-icon">+</span>
          <span class="create-text">Create New Project</span>
        </button>
      </div>

      <!-- Search & Sort -->
      <div class="controls-bar" v-if="projectStore.projects.length > 0">
        <div class="search-box">
          <span>🔍</span>
          <input 
            v-model="projectStore.searchQuery" 
            type="text" 
            placeholder="Search projects..."
            class="search-input"
          >
        </div>
        <div class="sort-btns">
          <button 
            class="sort-btn" 
            :class="{ active: projectStore.sortBy === 'name' }"
            @click="projectStore.sortBy = 'name'"
          >
            Name
          </button>
          <button 
            class="sort-btn" 
            :class="{ active: projectStore.sortBy === 'lastModified' }"
            @click="projectStore.sortBy = 'lastModified'"
          >
            Date
          </button>
        </div>
      </div>

      <!-- Projects Grid -->
      <div class="projects-section" v-if="projectStore.filteredProjects.length > 0">
        <div class="projects-grid">
          <div 
            v-for="project in projectStore.filteredProjects" 
            :key="project.id"
            class="project-card"
            :style="{ borderLeft: `4px solid ${project.color}` }"
            @click="openProject(project)"
          >
            <div class="card-top">
              <div class="card-icon" :style="{ background: project.color }">
                <span>{{ project.icon === 'code' ? '📁' : '📂' }}</span>
              </div>
              <div class="card-actions">
                <button 
                  class="action-btn"
                  :class="{ active: project.isFavorite }"
                  @click.stop="projectStore.toggleFavorite(project.id)"
                  title="Favorite"
                >
                  {{ project.isFavorite ? '⭐' : '☆' }}
                </button>
                <button 
                  class="action-btn"
                  @click.stop="showContextMenu(project, $event)"
                  title="More"
                >
                  ⋮
                </button>
              </div>
            </div>
            
            <div class="card-body">
              <h3 class="card-title">{{ project.name }}</h3>
              <p class="card-date">{{ formatDate(project.lastModified) }}</p>
            </div>

            <div class="card-footer">
              <button class="footer-btn" @click.stop="openProject(project)">
                Open
              </button>
              <button class="footer-btn" @click.stop="duplicateProject(project.id)">
                Copy
              </button>
              <button class="footer-btn danger" @click.stop="confirmDelete(project)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📁</div>
        <h2>No Projects Yet</h2>
        <p>Create your first project to start coding!</p>
        <button class="create-btn" @click="showCreateDialog = true">
          Create Project
        </button>
      </div>
    </main>

    <!-- Create Project Dialog -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
      <div class="dialog">
        <h2 class="dialog-title">Create New Project</h2>
        <div class="dialog-body">
          <div class="form-group">
            <label>Project Name</label>
            <input 
              v-model="newProject.name" 
              type="text" 
              placeholder="My Awesome Project"
              class="form-input"
              @keyup.enter="createProject"
              ref="nameInput"
            >
          </div>
          <div class="form-group">
            <label>Theme Color</label>
            <div class="color-options">
              <button 
                v-for="color in colors" 
                :key="color"
                class="color-dot"
                :class="{ selected: newProject.color === color }"
                :style="{ background: color }"
                @click="newProject.color = color"
              ></button>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="showCreateDialog = false">Cancel</button>
          <button class="btn-create" @click="createProject" :disabled="!newProject.name.trim()">
            Create
          </button>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div 
      v-if="contextMenu.show" 
      class="context-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
    >
      <button class="menu-item" @click="renameProject(contextMenu.project)">
        ✏️ Rename
      </button>
      <button class="menu-item" @click="duplicateProject(contextMenu.project.id)">
        📋 Duplicate
      </button>
      <button class="menu-item" @click="exportProject(contextMenu.project.id)">
        📤 Export
      </button>
      <button class="menu-item danger" @click="confirmDelete(contextMenu.project)">
        🗑️ Delete
      </button>
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
  color: '#007acc',
  icon: 'code'
})

const colors = ['#007acc', '#4ec9b0', '#f44747', '#cca700', '#3794ff', '#b180d7', '#d16969', '#608b4e']

const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  project: null
})

onMounted(() => {
  document.addEventListener('click', () => {
    contextMenu.show = false
  })
})

async function createProject() {
  if (!newProject.name.trim()) return
  
  const project = await projectStore.createProject(
    newProject.name.trim(),
    newProject.color,
    newProject.icon
  )
  
  showCreateDialog.value = false
  newProject.name = ''
  newProject.color = '#007acc'
  
  openProject(project)
}

function openProject(project) {
  projectStore.currentProject = project
  router.push(`/editor/${project.id}`)
}

async function duplicateProject(id) {
  await projectStore.duplicateProject(id)
  contextMenu.show = false
}

function confirmDelete(project) {
  if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
    projectStore.deleteProject(project.id)
  }
  contextMenu.show = false
}

async function renameProject(project) {
  const newName = prompt('Enter new name:', project.name)
  if (newName && newName.trim()) {
    await projectStore.renameProject(project.id, newName.trim())
  }
  contextMenu.show = false
}

async function exportProject(id) {
  const data = await projectStore.exportProject(id)
  if (data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.project.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  contextMenu.show = false
}

function showContextMenu(project, event) {
  contextMenu.show = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.project = project
  event.stopPropagation()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes} min ago`
    }
    return `${hours} hours ago`
  }
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Auto-focus input when dialog opens
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
  background: var(--bg-primary);
}

.app-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.app-bar-left .logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-highlight);
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 18px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: var(--bg-hover);
}

.home-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.create-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: var(--accent-color);
  color: white;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: var(--shadow-md);
}

.create-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.create-icon {
  font-size: 22px;
  font-weight: 300;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  padding: 8px 12px;
  border-radius: 8px;
  flex: 1;
  border: 1px solid var(--border-color);
}

.search-box input {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.sort-btns {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: 6px;
}

.sort-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.sort-btn.active {
  background: var(--accent-color);
  color: white;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.project-card {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.project-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 16px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: var(--bg-active);
}

.action-btn.active {
  color: #ffd700;
}

.card-body {
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-highlight);
  margin-bottom: 4px;
}

.card-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-footer {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.footer-btn {
  flex: 1;
  padding: 6px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.footer-btn:hover {
  background: var(--bg-active);
  color: var(--text-primary);
}

.footer-btn.danger:hover {
  background: rgba(244, 71, 71, 0.1);
  color: #f44747;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h2 {
  font-size: 20px;
  color: var(--text-highlight);
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 420px;
  box-shadow: var(--shadow-lg);
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-highlight);
}

.dialog-body {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
}

.form-input:focus {
  border-color: var(--accent-color);
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
  transition: all 0.2s;
  cursor: pointer;
}

.color-dot.selected {
  border-color: white;
  transform: scale(1.2);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-cancel, .btn-create {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-cancel:hover {
  background: var(--bg-hover);
}

.btn-create {
  background: var(--accent-color);
  color: white;
}

.btn-create:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 4px;
  min-width: 160px;
  box-shadow: var(--shadow-lg);
  z-index: 2000;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  border-radius: 4px;
  font-size: 13px;
  color: var(--text-primary);
  transition: background 0.2s;
}

.menu-item:hover {
  background: var(--bg-hover);
}

.menu-item.danger:hover {
  background: rgba(244, 71, 71, 0.1);
  color: #f44747;
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .controls-bar {
    flex-direction: column;
  }
}
</style>
EOF
