<template>
  <div class="home">
    <header class="header">
      <div class="logo">🚀 Faraz Code Editor</div>
      <button class="btn-icon" @click="$router.push('/settings')">⚙️</button>
    </header>

    <div class="content">
      <button class="create-btn" @click="showForm = true">+ Create New Project</button>

      <div v-if="store.projects.length > 0" class="list">
        <div v-for="p in store.projects" :key="p.id" class="card" @click="openProject(p.id)">
          <div class="card-left" :style="{ borderColor: p.color }">
            <div class="card-icon" :style="{ background: p.color }">{{ p.name[0] }}</div>
            <div class="card-info">
              <div class="card-name">{{ p.name }}</div>
              <div class="card-meta">{{ p.files.length }} files · {{ new Date(p.updatedAt).toLocaleDateString() }}</div>
            </div>
          </div>
          <div class="card-btns">
            <button @click.stop="copyProject(p.id)">📋</button>
            <button @click.stop="delProject(p.id)">🗑️</button>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <p>No projects yet. Create one to start!</p>
      </div>
    </div>

    <!-- Form Dialog -->
    <div v-if="showForm" class="overlay" @click.self="showForm = false">
      <div class="dialog">
        <h2>Create New Project</h2>
        <input v-model="form.name" placeholder="Project name..." class="input">
        <select v-model="form.type" class="input">
          <option value="web">Web (HTML/CSS/JS)</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <div class="colors">
          <button v-for="c in colors" :key="c" class="color" :class="{ active: form.color === c }" :style="{ background: c }" @click="form.color = c"></button>
        </div>
        <div class="btns">
          <button class="btn" @click="showForm = false">Cancel</button>
          <button class="btn primary" @click="create" :disabled="!form.name">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../stores/store.js'

const store = useStore()
const router = useRouter()

const showForm = ref(false)
const form = reactive({ name: '', type: 'web', color: '#007acc' })
const colors = ['#007acc', '#4ec9b0', '#f44747', '#cca700', '#3794ff', '#b180d7', '#e91e63', '#ff5722']

function create() {
  if (!form.name) return
  const p = store.createProject({ ...form })
  form.name = ''; form.type = 'web'; form.color = '#007acc'
  showForm.value = false
  router.push('/editor/' + p.id)
}

function openProject(id) { router.push('/editor/' + id) }
function delProject(id) { if (confirm('Delete?')) store.deleteProject(id) }
function copyProject(id) {
  const p = store.getProject(id)
  if (p) store.createProject({ name: p.name + ' Copy', type: p.type, color: p.color })
}
</script>

<style scoped>
.home { height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #252526; border-bottom: 1px solid #333; }
.logo { font-size: 16px; font-weight: 600; color: #007acc; }
.btn-icon { background: none; border: none; font-size: 24px; cursor: pointer; color: #ccc; padding: 8px; border-radius: 8px; }
.btn-icon:hover { background: #333; }
.content { flex: 1; overflow-y: auto; padding: 20px; }
.create-btn { display: block; width: 100%; max-width: 300px; margin: 0 auto 20px; padding: 14px; background: #007acc; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.create-btn:hover { background: #005a9e; }
.list { display: flex; flex-direction: column; gap: 8px; }
.card { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #252526; border-radius: 8px; border-left: 4px solid #007acc; cursor: pointer; }
.card:hover { background: #2a2d2e; }
.card-left { display: flex; align-items: center; gap: 12px; flex: 1; }
.card-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; }
.card-name { font-size: 14px; font-weight: 600; color: #fff; }
.card-meta { font-size: 11px; color: #888; margin-top: 2px; }
.card-btns { display: flex; gap: 4px; }
.card-btns button { background: #333; border: none; border-radius: 6px; padding: 6px 8px; cursor: pointer; font-size: 14px; }
.card-btns button:hover { background: #444; }
.empty { text-align: center; padding: 40px; color: #666; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.dialog { background: #252526; padding: 24px; border-radius: 12px; width: 90%; max-width: 400px; }
.dialog h2 { color: #fff; margin-bottom: 16px; font-size: 18px; }
.input { width: 100%; padding: 10px; margin-bottom: 12px; background: #1e1e1e; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; }
.colors { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.color { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
.color.active { border-color: #fff; transform: scale(1.2); }
.btns { display: flex; gap: 8px; justify-content: flex-end; }
.btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn { background: #333; color: #ccc; }
.btn.primary { background: #007acc; color: #fff; }
.btn:disabled { opacity: 0.5; }
</style>
