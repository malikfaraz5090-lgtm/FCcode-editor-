import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProjectStore = defineStore('projects', () => {
  const projects = ref([])
  const settings = ref({ theme: 'vs-dark', fontSize: 14, tabSize: 2, wordWrap: 'on', autoSave: true })

  function init() {
    const p = localStorage.getItem('fce_projects')
    if (p) projects.value = JSON.parse(p)
    const s = localStorage.getItem('fce_settings')
    if (s) settings.value = { ...settings.value, ...JSON.parse(s) }
  }

  function saveProjects() { localStorage.setItem('fce_projects', JSON.stringify(projects.value)) }
  function saveSettings() { localStorage.setItem('fce_settings', JSON.stringify(settings.value)) }

  function createProject(data) {
    const project = {
      id: Date.now(),
      name: data.name || 'Untitled',
      description: data.description || '',
      color: data.color || '#007acc',
      type: data.type || 'web',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [
        { id: Date.now()+1, name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>' },
        { id: Date.now()+2, name: 'style.css', language: 'css', content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f0f0f0;\n}\nh1 {\n  color: #333;\n  text-align: center;\n  margin-top: 50px;\n}' },
        { id: Date.now()+3, name: 'script.js', language: 'javascript', content: 'console.log("Hello from Faraz Code Editor!");\ndocument.querySelector("h1").addEventListener("click", function() {\n  alert("Welcome!");\n});' }
      ]
    }
    projects.value.unshift(project)
    saveProjects()
    return project
  }

  function getProject(id) { return projects.value.find(p => p.id === id) }
  
  function deleteProject(id) {
    projects.value = projects.value.filter(p => p.id !== id)
    saveProjects()
  }

  function duplicateProject(id) {
    const p = projects.value.find(p => p.id === id)
    if (p) {
      const copy = JSON.parse(JSON.stringify(p))
      copy.id = Date.now()
      copy.name = p.name + ' (Copy)'
      copy.createdAt = new Date().toISOString()
      copy.updatedAt = new Date().toISOString()
      projects.value.unshift(copy)
      saveProjects()
    }
  }

  function updateFile(projectId, fileId, content) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) {
      const f = p.files.find(f => f.id === fileId)
      if (f) { f.content = content; p.updatedAt = new Date().toISOString(); saveProjects() }
    }
  }

  function addFile(projectId, name) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) {
      const ext = name.split('.').pop()?.toLowerCase()
      const langMap = { html: 'html', css: 'css', js: 'javascript', json: 'json', md: 'markdown', py: 'python', java: 'java', c: 'c', cpp: 'cpp', php: 'php', xml: 'xml', txt: 'text' }
      const f = { id: Date.now(), name, language: langMap[ext] || 'text', content: '' }
      p.files.push(f)
      p.updatedAt = new Date().toISOString()
      saveProjects()
      return f
    }
    return null
  }

  function deleteFile(projectId, fileId) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) { p.files = p.files.filter(f => f.id !== fileId); p.updatedAt = new Date().toISOString(); saveProjects() }
  }

  init()
  return { projects, settings, createProject, getProject, deleteProject, duplicateProject, updateFile, addFile, deleteFile, saveSettings }
})
