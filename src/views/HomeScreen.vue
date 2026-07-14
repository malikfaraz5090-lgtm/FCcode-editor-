<template>
  <div class="home-screen">
    <!-- Top App Bar -->
    <header class="app-bar">
      <div class="app-bar-left">
        <div class="logo-container">
          <svg class="logo-icon" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="6" fill="var(--accent-color)"/>
            <text x="16" y="18" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="monospace">F</text>
            <text x="16" y="26" text-anchor="middle" fill="#fff" font-size="8" font-family="monospace">CE</text>
          </svg>
          <h1 class="app-title">Faraz Code Editor</h1>
        </div>
      </div>
      <div class="app-bar-right">
        <button class="icon-button" @click="navigateTo('/search')" aria-label="Search">
          <span class="material-icons">search</span>
        </button>
        <button class="icon-button" @click="navigateTo('/settings')" aria-label="Settings">
          <span class="material-icons">settings</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="home-content">
      <!-- Create New Project -->
      <div class="create-section">
        <button class="create-button" @click="showCreateDialog = true">
          <span class="material-icons">add_circle</span>
          <span class="create-text">Create New Project</span>
        </button>
      </div>

      <!-- Recent Projects -->
      <section class="projects-section" v-if="projectStore.filteredProjects.length > 0">
        <div class="section-header">
          <h2 class="section-title">Recent Projects</h2>
          <div class="sort-controls">
            <button 
              class="sort-button" 
              :class="{ active: projectStore.sortBy === 'name' }"
              @click="projectStore.sortBy = 'name'"
            >
              Name
            </button>
            <button 
              class="sort-button" 
              :class="{ active: projectStore.sortBy === 'lastModified' }"
              @click="projectStore.sortBy = 'lastModified'"
            >
              Date
            </button>
          </div>
        </div>

        <div class="projects-grid">
          <TransitionGroup name="project-card">
            <div 
              v-for="project in projectStore.filteredProjects" 
              :key="project.id"
              class="project-card"
              :style="{ borderLeftColor: project.color }"
              @click="openProject(project)"
            >
              <div class="card-header">
                <div class="card-icon" :style="{ background: project.color }">
                  <span class="material-icons">{{ getProjectIcon(project.icon) }}</span>
                </div>
                <div class="card-actions">
                  <button 
                    class="card-action-btn"
                    :class="{ active: project.isFavorite }"
                    @click.stop="projectStore.toggleFavorite(project.id)"
                  >
                    <span class="material-icons">{{ project.isFavorite ? 'star' : 'star_border' }}</span>
                  </button>
                  <button class="card-action-btn" @click.stop="showProjectMenu(project, $event)">
                    <span class="material-icons">more_vert</span>
                  </button>
                </div>
              </div>
              
              <div class="card-body">
                <h3 class="card-title">{{ project.name }}</h3>
                <div class="card-meta">
                  <span class="meta-item">
                    <span class="material-icons">schedule</span>
                    {{ formatDate(project.lastModified) }}
                  </span>
                  <span class="meta-item">
                    <span class="material-icons">description</span>
                    {{ getFileCount(project.id) }} files
                  </span>
                </div>
              </div>

              <div class="card-footer">
                <button class="footer-btn" @click.stop="openProject(project)">
                  <span class="material-icons">open_in_new</span>
                  Open
                </button>
                <button class="footer-btn" @click.stop="duplicateProject(project.id)">
                  <span class="material-icons">content_copy</span>
                  Duplicate
                </button>
                <button class="footer-btn danger" @click.stop="confirmDelete(project)">
                  <span class="material-icons">delete</span>
                  Delete
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </section>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <span class="material-icons empty-icon">folder_open</span>
        <h2>No Projects Yet</h2>
        <p>Create your first project to get started</p>
      </div>
    </main>

    <!-- Create Project Dialog -->
    <Teleport to="body">
      <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
        <div class="dialog">
          <h2 class="dialog-title">Create New Project</h2>
          <div class="dialog-content">
            <div class="input-group">
              <label>Project Name</label>
              <input 
                v-model="newProject.name" 
                type="text" 
                placeholder="My Awesome Project"
                @keyup.enter="createNewProject"
              >
            </div>
            <div class="input-group">
              <label>Project Color</label>
              <div class="color-picker">
                <button 
                  v-for="color in projectColors" 
                  :key="color"
                  class="color-option"
                  :class="{ selected: newProject.color === color }"
                  :style="{ background: color }"
                  @click="newProject.color = color"
                ></button>
              </div>
            </div>
          </div>
          <div class="dialog-actions">
            <button class="btn-secondary" @click="showCreateDialog = false">Cancel</button>
            <button class="btn-primary" @click="createNewProject" :disabled="!newProject.name">
              Create Project
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Context Menu -->
    <Teleport to="body">
      <div 
        v-if="contextMenu.show" 
        class="context-menu"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      >
        <button class="menu-item" @click="renameProject(contextMenu.project)">
          <span class="material-icons">edit</span> Rename
        </button>
        <button class="menu-item" @click="duplicateProject(contextMenu.project.id)">
          <span class="material-icons">content_copy</span> Duplicate
        </button>
        <button class="menu-item" @click="toggleFavorite(contextMenu.project.id)">
          <span class="material-icons">star</span> Favorite
        </button>
        <button class="menu-item danger" @click="confirmDelete(contextMenu.project)">
          <span class="material-icons">delete</span> Delete
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../stores/projectStore';
import { Capacitor } from '@capacitor/core';

const router = useRouter();
const projectStore = useProjectStore();

const showCreateDialog = ref(false);
const newProject = reactive({
  name: '',
  color: '#007acc',
  icon: 'code',
});

const projectColors = [
  '#007acc', '#4ec9b0', '#f44747', '#cca700', 
  '#3794ff', '#b180d7', '#d16969', '#608b4e'
];

const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  project: null,
});

onMounted(async () => {
  await projectStore.loadProjects();
});

function navigateTo(path) {
  router.push(path);
}

async function createNewProject() {
  if (!newProject.name.trim()) return;
  
  const project = await projectStore.createProject(
    newProject.name,
    newProject.color,
    newProject.icon
  );
  
  showCreateDialog.value = false;
  newProject.name = '';
  newProject.color = '#007acc';
  
  openProject(project);
}

function openProject(project) {
  projectStore.currentProject = project;
  router.push(`/editor/${project.id}`);
}

async function duplicateProject(id) {
  await projectStore.duplicateProject(id);
  contextMenu.show = false;
}

async function confirmDelete(project) {
  if (confirm(`Delete project "${project.name}"? This action cannot be undone.`)) {
    await projectStore.deleteProject(project.id);
  }
  contextMenu.show = false;
}

function showProjectMenu(project, event) {
  contextMenu.show = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.project = project;
  
  setTimeout(() => {
    document.addEventListener('click', () => {
      contextMenu.show = false;
    }, { once: true });
  }, 100);
}

function getProjectIcon(icon) {
  const icons = {
    code: 'code',
    web: 'language',
    mobile: 'phone_android',
    game: 'sports_esports',
    data: 'storage',
    default: 'folder',
  };
  return icons[icon] || icons.default;
}

function getFileCount(projectId) {
  return 0; // Will be implemented with actual file count
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

// Close context menu when clicking outside
document.addEventListener('click', () => {
  if (contextMenu.show) {
    contextMenu.show = false;
  }
});
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
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  z-index: 100;
}

.app-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-highlight);
}

.app-bar-right {
  display: flex;
  gap: 4px;
}

.icon-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.icon-button:hover {
  background: var(--bg-hover);
}

.icon-button .material-icons {
  font-size: 20px;
  color: var(--text-secondary);
}

.home-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.create-section {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: var(--accent-color);
  color: white;
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: var(--shadow-md);
}

.create-button:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.create-button .material-icons {
  font-size: 24px;
}

.projects-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-highlight);
}

.sort-controls {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  padding: 2px;
}

.sort-button {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.sort-button.active {
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
  border-radius: var(--radius-md);
  border-left: 4px solid var(--accent-color);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  background: var(--bg-hover);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon .material-icons {
  font-size: 24px;
  color: white;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.card-action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.card-action-btn:hover {
  background: var(--bg-active);
}

.card-action-btn.active .material-icons {
  color: #ffd700;
}

.card-action-btn .material-icons {
  font-size: 18px;
  color: var(--text-secondary);
}

.card-body {
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-highlight);
  margin-bottom: 8px;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.meta-item .material-icons {
  font-size: 14px;
}

.card-footer {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.footer-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.footer-btn:hover {
  background: var(--bg-active);
  color: var(--text-primary);
}

.footer-btn.danger:hover {
  background: rgba(244, 71, 71, 0.1);
  color: var(--error-color);
}

.footer-btn .material-icons {
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--text-secondary);
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
}

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  min-width: 400px;
  max-width: 90vw;
  box-shadow: var(--shadow-lg);
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-highlight);
}

.dialog-content {
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-primary);
}

.input-group input:focus {
  border-color: var(--accent-color);
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-option.selected {
  border-color: white;
  transform: scale(1.15);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 4px;
  min-width: 180px;
  box-shadow: var(--shadow-lg);
  z-index: 2000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-primary);
  transition: background 0.2s;
}

.menu-item:hover {
  background: var(--bg-hover);
}

.menu-item .material-icons {
  font-size: 18px;
}

.menu-item.danger:hover {
  background: rgba(244, 71, 71, 0.1);
  color: var(--error-color);
}

/* Transitions */
.project-card-enter-active,
.project-card-leave-active {
  transition: all 0.3s ease;
}

.project-card-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.project-card-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .dialog {
    min-width: auto;
    width: 90vw;
  }
}
</style>
