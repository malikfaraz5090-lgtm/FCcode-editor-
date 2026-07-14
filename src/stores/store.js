import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('main', () => {
  const projects = ref([])
  const settings = ref({
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    autoSave: true
  })

  function init() {
    const p = localStorage.getItem('faraz_projects')
    if (p) projects.value = JSON.parse(p)
    const s = localStorage.getItem('faraz_settings')
    if (s) settings.value = { ...settings.value, ...JSON.parse(s) }
  }

  function saveProjects() {
    localStorage.setItem('faraz_projects', JSON.stringify(projects.value))
  }

  function saveSettings() {
    localStorage.setItem('faraz_settings', JSON.stringify(settings.value))
  }

  function createProject(data) {
    const project = {
      id: Date.now(),
      name: data.name || 'Untitled',
      color: data.color || '#007acc',
      type: data.type || 'web',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [
        { id: Date.now()+1, name: 'index.html', lang: 'html', code: '<!DOCTYPE html>\n<html>\n<head>\n  <title>App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>' },
        { id: Date.now()+2, name: 'style.css', lang: 'css', code: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}' },
        { id: Date.now()+3, name: 'script.js', lang: 'javascript', code: '// Your code here\nconsole.log("App loaded!");\n\ndocument.querySelector("h1").addEventListener("click", function() {\n  alert("Hello from Faraz Code Editor!");\n});' }
      ]
    }
    projects.value.unshift(project)
    saveProjects()
    return project
  }

  function getProject(id) {
    return projects.value.find(p => p.id === id)
  }

  function deleteProject(id) {
    projects.value = projects.value.filter(p => p.id !== id)
    saveProjects()
  }

  function updateFile(projectId, fileId, code) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) {
      const f = p.files.find(f => f.id === fileId)
      if (f) {
        f.code = code
        p.updatedAt = new Date().toISOString()
        saveProjects()
        return true
      }
    }
    return false
  }

  function addFile(projectId, name) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) {
      const ext = name.split('.').pop().toLowerCase()
      const langMap = { html: 'html', css: 'css', js: 'javascript', json: 'json', py: 'python', java: 'java', cpp: 'cpp', php: 'php', txt: 'text' }
      const file = { id: Date.now(), name, lang: langMap[ext] || 'text', code: '' }
      p.files.push(file)
      p.updatedAt = new Date().toISOString()
      saveProjects()
      return file
    }
    return null
  }

  function deleteFile(projectId, fileId) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) {
      p.files = p.files.filter(f => f.id !== fileId)
      p.updatedAt = new Date().toISOString()
      saveProjects()
    }
  }

  init()

  return { projects, settings, createProject, getProject, deleteProject, updateFile, addFile, deleteFile, saveSettings }
})
