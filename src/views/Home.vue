<template>
  <div class="home">
    <header class="header">
      <span class="logo"><span style="background: linear-gradient(135deg, #00d2ff, #007acc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;">Faraz Code Editor</span></span>
      <button class="icon-btn" @click="$router.push('/settings')">⚙️</button>
    </header>

    <div class="content">
      <button class="create-btn" @click="showDialog = true">+ Create New Project</button>

      <div v-if="store.projects.length" class="project-list">
        <div v-for="p in store.projects" :key="p.id" class="card" @click="openProject(p.id)">
          <div class="card-left" :style="{ borderLeftColor: p.color }">
            <span class="card-icon" :style="{ background: p.color }">{{ p.name[0]?.toUpperCase() }}</span>
            <div>
              <div class="card-name">{{ p.name }}</div>
              <div class="card-meta">{{ p.files.length }} files · {{ new Date(p.updatedAt).toLocaleDateString() }}</div>
            </div>
          </div>
          <button class="del-btn" @click.stop="delProject(p.id)">🗑️</button>
        </div>
      </div>

      <div v-else class="empty">No projects yet. Create one!</div>
    </div>

    <!-- Dialog -->
    <div v-if="showDialog" class="overlay" @click.self="showDialog = false">
      <div class="dialog">
        <h2>Create Project</h2>
        <input v-model="form.name" placeholder="Project name" class="input" autofocus>
        <select v-model="form.type" class="input">
          <option value="web">🌐 Web (HTML/CSS/JS)</option>
          <option value="python">🐍 Python</option>
          <option value="java">☕ Java</option>
          <option value="cpp">⚙️ C++</option>
        </select>
        <div class="colors">
          <button v-for="c in colors" :key="c" class="color" :class="{ active: form.color === c }" :style="{ background: c }" @click="form.color = c"></button>
        </div>
        <div class="btns">
          <button class="btn" @click="showDialog = false">Cancel</button>
          <button class="btn primary" @click="createProject" :disabled="!form.name">Create</button>
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
const showDialog = ref(false)
const form = reactive({ name: '', type: 'web', color: '#007acc' })
const colors = ['#007acc', '#4ec9b0', '#f44747', '#cca700', '#3794ff', '#b180d7']

function createProject() {
  if (!form.name.trim()) return
  const p = store.createProject({ ...form })
  form.name = ''; form.type = 'web'; form.color = '#007acc'
  showDialog.value = false
  router.push('/editor/' + p.id)
}

function openProject(id) { router.push('/editor/' + id) }
function delProject(id) { if (confirm('Delete project?')) store.deleteProject(id) }
</script>

<style scoped>
.home { height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #252526; border-bottom: 1px solid #3e3e42; }
.logo { font-size: 16px; font-weight: 600; color: #007acc; }
.icon-btn { background: none; border: none; font-size: 24px; cursor: pointer; padding: 8px; border-radius: 8px; color: #ccc; }
.icon-btn:hover { background: #333; }
.content { flex: 1; overflow-y: auto; padding: 20px; }
.create-btn { display: block; margin: 0 auto 20px; padding: 14px 28px; background: #007acc; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; }
.create-btn:hover { background: #005a9e; }
.project-list { display: flex; flex-direction: column; gap: 8px; }
.card { display: flex; justify-content: space-between; align-items: center; padding: 14px; background: #252526; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.card:hover { background: #2a2d2e; }
.card-left { display: flex; align-items: center; gap: 12px; flex: 1; }
.card-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; }
.card-name { font-weight: 600; color: #fff; font-size: 15px; }
.card-meta { font-size: 11px; color: #888; margin-top: 2px; }
.del-btn { background: none; border: none; font-size: 18px; cursor: pointer; padding: 8px; }
.empty { text-align: center; padding: 40px; color: #666; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.dialog { background: #252526; padding: 24px; border-radius: 12px; width: 90%; max-width: 400px; }
.dialog h2 { color: #fff; margin-bottom: 16px; }
.input { width: 100%; padding: 10px; margin-bottom: 12px; background: #1e1e1e; border: 1px solid #3e3e42; border-radius: 8px; color: #fff; font-size: 14px; }
.colors { display: flex; gap: 8px; margin-bottom: 16px; }
.color { width: 30px; height: 30px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
.color.active { border-color: #fff; transform: scale(1.2); }
.btns { display: flex; gap: 8px; justify-content: flex-end; }
.btn { padding: 8px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; background: #3e3e42; color: #ccc; }
.btn.primary { background: #007acc; color: #fff; }
.btn:disabled { opacity: 0.5; }
</style>
