cat > src/stores/projectStore.js << 'EOF'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Dexie from 'dexie'

const db = new Dexie('FarazCodeEditorDB')

db.version(2).stores({
  projects: '++id, name, lastModified, isFavorite, color, icon',
  files: '++id, projectId, name, path, content, language, lastModified',
  folders: '++id, projectId, name, path',
  settings: 'key'
})

export const useProjectStore = defineStore('projects', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const searchQuery = ref('')
  const sortBy = ref('lastModified')
  const sortOrder = ref('desc')
  const isLoading = ref(false)

  const filteredProjects = computed(() => {
    let filtered = [...projects.value]
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query)
      )
    }
    
    filtered.sort((a, b) => {
      const modifier = sortOrder.value === 'desc' ? -1 : 1
      if (sortBy.value === 'name') {
        return modifier * a.name.localeCompare(b.name)
      } else {
        return modifier * (new Date(a.lastModified) - new Date(b.lastModified))
      }
    })
    
    return filtered
  })

  const favoriteProjects = computed(() => 
    projects.value.filter(p => p.isFavorite)
  )

  async function initialize() {
    isLoading.value = true
    try {
      await loadProjects()
      await loadSettings()
    } catch (error) {
      console.error('Failed to initialize:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function loadProjects() {
    try {
      projects.value = await db.projects.toArray()
    } catch (error) {
      console.error('Failed to load projects:', error)
      projects.value = []
    }
  }

  async function loadSettings() {
    try {
      const settings = await db.settings.get('editorSettings')
      if (settings) {
        // Load settings
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  async function createProject(name, color = '#007acc', icon = 'code') {
    const project = {
      name,
      color,
      icon,
      isFavorite: false,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    
    try {
      const id = await db.projects.add(project)
      project.id = id
      projects.value.unshift(project)
      
      // Create default files
      await createDefaultFiles(id)
      
      return project
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  async function createDefaultFiles(projectId) {
    const defaultFiles = [
      {
        projectId,
        name: 'index.html',
        path: '/',
        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Project</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>',
        language: 'html',
        lastModified: new Date().toISOString()
      },
      {
        projectId,
        name: 'style.css',
        path: '/',
        content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}',
        language: 'css',
        lastModified: new Date().toISOString()
      },
      {
        projectId,
        name: 'script.js',
        path: '/',
        content: '// Your JavaScript code here\nconsole.log("Hello from Faraz Code Editor!");\n\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("Page loaded!");\n});',
        language: 'javascript',
        lastModified: new Date().toISOString()
      },
      {
        projectId,
        name: 'README.md',
        path: '/',
        content: '# My Project\n\nCreated with **Faraz Code Editor**\n\n## Getting Started\n\n1. Edit files\n2. Preview changes\n3. Export your project',
        language: 'markdown',
        lastModified: new Date().toISOString()
      }
    ]
    
    await db.files.bulkAdd(defaultFiles)
  }

  async function deleteProject(id) {
    try {
      await db.projects.delete(id)
      await db.files.where('projectId').equals(id).delete()
      await db.folders.where('projectId').equals(id).delete()
      projects.value = projects.value.filter(p => p.id !== id)
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }

  async function duplicateProject(id) {
    const project = projects.value.find(p => p.id === id)
    if (!project) return null
    
    const newProject = {
      ...project,
      id: undefined,
      name: `${project.name} (Copy)`,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    
    try {
      const newId = await db.projects.add(newProject)
      newProject.id = newId
      projects.value.unshift(newProject)
      
      const files = await db.files.where('projectId').equals(id).toArray()
      const newFiles = files.map(f => ({
        ...f,
        id: undefined,
        projectId: newId
      }))
      
      if (newFiles.length > 0) {
        await db.files.bulkAdd(newFiles)
      }
      
      return newProject
    } catch (error) {
      console.error('Failed to duplicate project:', error)
      throw error
    }
  }

  async function renameProject(id, newName) {
    await db.projects.update(id, { 
      name: newName, 
      lastModified: new Date().toISOString() 
    })
    const project = projects.value.find(p => p.id === id)
    if (project) project.name = newName
  }

  async function toggleFavorite(id) {
    const project = projects.value.find(p => p.id === id)
    if (project) {
      project.isFavorite = !project.isFavorite
      await db.projects.update(id, { isFavorite: project.isFavorite })
    }
  }

  async function updateProjectColor(id, color) {
    await db.projects.update(id, { color })
    const project = projects.value.find(p => p.id === id)
    if (project) project.color = color
  }

  async function getProjectFiles(projectId) {
    return await db.files.where('projectId').equals(projectId).toArray()
  }

  async function getProjectFolders(projectId) {
    return await db.folders.where('projectId').equals(projectId).toArray()
  }

  async function createFile(projectId, name, path, content = '') {
    const language = detectLanguage(name)
    const file = {
      projectId,
      name,
      path: path || '/',
      content,
      language,
      lastModified: new Date().toISOString()
    }
    
    const id = await db.files.add(file)
    file.id = id
    return file
  }

  async function updateFile(id, updates) {
    updates.lastModified = new Date().toISOString()
    await db.files.update(id, updates)
  }

  async function deleteFile(id) {
    await db.files.delete(id)
  }

  async function renameFile(id, newName) {
    const language = detectLanguage(newName)
    await db.files.update(id, { 
      name: newName, 
      language,
      lastModified: new Date().toISOString() 
    })
  }

  async function createFolder(projectId, name, path) {
    const folder = { projectId, name, path: path || '/' }
    const id = await db.folders.add(folder)
    folder.id = id
    return folder
  }

  async function deleteFolder(id) {
    await db.folders.delete(id)
  }

  function detectLanguage(filename) {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const map = {
      html: 'html', htm: 'html',
      css: 'css',
      js: 'javascript', mjs: 'javascript',
      jsx: 'javascriptreact',
      ts: 'typescript', tsx: 'typescriptreact',
      json: 'json',
      md: 'markdown', markdown: 'markdown',
      py: 'python',
      java: 'java',
      kt: 'kotlin', kts: 'kotlin',
      c: 'c', h: 'c',
      cpp: 'cpp', cc: 'cpp', cxx: 'cpp',
      php: 'php',
      xml: 'xml', svg: 'xml',
      vue: 'vue',
      txt: 'plaintext',
      yaml: 'yaml', yml: 'yaml',
      sql: 'sql',
      sh: 'shell', bash: 'shell',
    }
    return map[ext] || 'plaintext'
  }

  async function exportProject(projectId) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return null
    
    const files = await db.files.where('projectId').equals(projectId).toArray()
    
    return {
      project: { ...project, id: undefined },
      files: files.map(f => ({ ...f, id: undefined, projectId: undefined }))
    }
  }

  async function importProject(data) {
    const project = {
      ...data.project,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    
    const projectId = await db.projects.add(project)
    project.id = projectId
    projects.value.unshift(project)
    
    if (data.files && data.files.length > 0) {
      const files = data.files.map(f => ({
        ...f,
        projectId
      }))
      await db.files.bulkAdd(files)
    }
    
    return project
  }

  return {
    projects,
    currentProject,
    searchQuery,
    sortBy,
    sortOrder,
    isLoading,
    filteredProjects,
    favoriteProjects,
    initialize,
    loadProjects,
    createProject,
    deleteProject,
    duplicateProject,
    renameProject,
    toggleFavorite,
    updateProjectColor,
    getProjectFiles,
    getProjectFolders,
    createFile,
    updateFile,
    deleteFile,
    renameFile,
    createFolder,
    deleteFolder,
    detectLanguage,
    exportProject,
    importProject
  }
})
EOF
