import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('main', () => {
  const projects = ref([])

  function load() {
    const d = localStorage.getItem('fce_projects')
    if (d) projects.value = JSON.parse(d)
  }

  function save() {
    localStorage.setItem('fce_projects', JSON.stringify(projects.value))
  }

  function create(data) {
    const p = {
      id: Date.now(),
      name: data.name || 'Untitled',
      color: data.color || '#007acc',
      files: [
        { id: 1, name: 'index.html', lang: 'html', code: '<!DOCTYPE html>\n<html>\n<head>\n  <title>App</title>\n</head>\n<body>\n  <h1>Hello!</h1>\n</body>\n</html>' },
        { id: 2, name: 'style.css', lang: 'css', code: 'body { font-family: Arial; margin: 20px; }\nh1 { color: #007acc; }' },
        { id: 3, name: 'script.js', lang: 'javascript', code: 'console.log("Ready!");' }
      ],
      createdAt: new Date().toISOString()
    }
    projects.value.unshift(p)
    save()
    return p
  }

  function getProject(id) {
    return projects.value.find(p => p.id === id)
  }

  function deleteProject(id) {
    projects.value = projects.value.filter(p => p.id !== id)
    save()
  }

  function updateFile(projectId, fileId, code) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) {
      const f = p.files.find(f => f.id === fileId)
      if (f) { f.code = code; save() }
    }
  }

  function addFile(projectId, name) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) {
      const ext = name.split('.').pop()
      const map = { html: 'html', css: 'css', js: 'javascript', json: 'json', py: 'python', java: 'java', txt: 'text' }
      const f = { id: Date.now(), name, lang: map[ext] || 'text', code: '' }
      p.files.push(f)
      save()
      return f
    }
  }

  function deleteFile(projectId, fileId) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) { p.files = p.files.filter(f => f.id !== fileId); save() }
  }

  load()
  return { projects, load, create, getProject, deleteProject, updateFile, addFile, deleteFile }
})
