import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('main', () => {
  const projects = ref([])
  const settings = ref({
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true
  })

  function loadProjects() {
    const data = localStorage.getItem('faraz_projects')
    if (data) projects.value = JSON.parse(data)
  }

  function saveProjects() {
    localStorage.setItem('faraz_projects', JSON.stringify(projects.value))
  }

  function createProject(data) {
    const p = {
      id: Date.now(),
      name: data.name,
      color: data.color || '#007acc',
      type: data.type || 'web',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [
        { id: 1, name: 'index.html', language: 'html', content: '<h1>Hello World</h1>' },
        { id: 2, name: 'style.css', language: 'css', content: 'body { color: red; }' },
        { id: 3, name: 'script.js', language: 'javascript', content: 'console.log("Hi")' }
      ]
    }
    projects.value.unshift(p)
    saveProjects()
    return p
  }

  function deleteProject(id) {
    projects.value = projects.value.filter(p => p.id !== id)
    saveProjects()
  }

  function getProject(id) {
    return projects.value.find(p => p.id === id)
  }

  function updateProjectFiles(id, files) {
    const p = projects.value.find(p => p.id === id)
    if (p) { p.files = files; p.updatedAt = new Date().toISOString(); saveProjects() }
  }

  function loadSettings() {
    const s = localStorage.getItem('faraz_settings')
    if (s) settings.value = { ...settings.value, ...JSON.parse(s) }
  }

  function saveSettings() {
    localStorage.setItem('faraz_settings', JSON.stringify(settings.value))
  }

  loadSettings()

  return { projects, settings, loadProjects, createProject, deleteProject, getProject, updateProjectFiles, saveSettings }
})
