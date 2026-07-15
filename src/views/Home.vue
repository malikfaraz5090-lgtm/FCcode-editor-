<template>
  <div class="home">
    <header class="header">
      <span class="logo">🚀 Faraz Code Editor</span>
    </header>
    
    <div class="content">
      <button class="create-btn" @click="showForm = true">+ Create New Project</button>
      
      <div v-if="store.projects.length" class="list">
        <div v-for="p in store.projects" :key="p.id" class="card" @click="openProject(p.id)">
          <div class="card-left" :style="{ borderLeftColor: p.color }">
            <span class="card-icon" :style="{ background: p.color }">{{ p.name[0] }}</span>
            <div>
              <div class="card-name">{{ p.name }}</div>
              <div class="card-meta">{{ p.files.length }} files</div>
            </div>
          </div>
          <button class="del-btn" @click.stop="delProject(p.id)">🗑️</button>
        </div>
      </div>
      
      <div v-else class="empty">No projects. Create one!</div>
    </div>
    
    <!-- Create Dialog -->
    <div v-if="showForm" class="overlay" @click.self="showForm = false">
      <div class="dialog">
        <h2>Create Project</h2>
        <input v-model="form.name" placeholder="Project name" class="input" autofocus>
        <div class="colors">
          <button v-for="c in colors" :key="c" class="color" :class="{ active: form.color === c }" :style="{ background: c }" @click="form.color = c"></button>
        </div>
        <div class="btns">
          <button class="btn" @click="showForm = false">Cancel</button>
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
const showForm = ref(false)
const form = reactive({ name: '', color: '#007acc' })
const colors = ['#007acc', '#4ec9b0', '#f44747', '#cca700', '#3794ff', '#b180d7', '#e91e63']

function createProject() {
  if (!form.name) return
  const p = store.create({ ...form })
  form.name = ''; form.color = '#007acc'
  showForm.value = false
  router.push('/editor/' + p.id)
}

function openProject(id) { router.push('/editor/' + id) }
function delProject(id) { if (confirm('Delete?')) store.deleteProject(id) }
</script>

<style scoped>
.home { height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; }
.header { padding: 14px 20px; background: #252526; border-bottom: 1px solid #3e3e42; }
.logo { font-size: 16px; font-weight: 700; color: #007acc; }
.content { flex: 1; overflow-y: auto; padding: 20px; }
.create-btn { display: block; margin: 0 auto 20px; padding: 14px 30px; background: #007acc; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; }
.list { display: flex; flex-direction: column; gap: 8px; }
.card { display: flex; justify-content: space-between; align-items: center; padding: 14px; background: #252526; border-radius: 10px; cursor: pointer; border-left: 4px solid #007acc; }
.card:hover { background: #2a2d2e; }
.card-left { display: flex; align-items: center; gap: 12px; flex: 1; }
.card-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 18px; }
.card-name { font-weight: 600; color: #fff; }
.card-meta { font-size: 11px; color: #888; }
.del-btn { background: none; border: none; font-size: 18px; cursor: pointer; }
.empty { text-align: center; padding: 40px; color: #666; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.dialog { background: #252526; padding: 24px; border-radius: 14px; width: 90%; max-width: 380px; }
.dialog h2 { color: #fff; margin-bottom: 14px; }
.input { width: 100%; padding: 10px; background: #1e1e1e; border: 1px solid #3e3e42; border-radius: 8px; color: #fff; font-size: 14px; margin-bottom: 12px; }
.colors { display: flex; gap: 8px; margin-bottom: 16px; }
.color { width: 30px; height: 30px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
.color.active { border-color: #fff; transform: scale(1.2); }
.btns { display: flex; gap: 8px; justify-content: flex-end; }
.btn { padding: 8px 18px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; background: #3e3e42; color: #ccc; }
.btn.primary { background: #007acc; color: #fff; }
.btn:disabled { opacity: 0.5; }
</style>
