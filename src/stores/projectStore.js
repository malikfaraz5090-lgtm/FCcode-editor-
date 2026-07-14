import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProjectStore = defineStore('projects', () => {
  const projects = ref([])
  const currentProject = ref(null)

  // Load projects from localStorage
  function loadProjects() {
    const saved = localStorage.getItem('faraz_projects')
    if (saved) {
      projects.value = JSON.parse(saved)
    }
  }

  // Save projects to localStorage
  function saveProjects() {
    localStorage.setItem('faraz_projects', JSON.stringify(projects.value))
  }

  // Create new project
  function createProject(projectData) {
    const project = {
      id: Date.now(),
      name: projectData.name,
      description: projectData.description || '',
      language: projectData.language || 'html',
      type: projectData.type || 'web',
      color: projectData.color || '#007acc',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [
        {
          id: Date.now() + 1,
          name: 'index.html',
          language: 'html',
          content: getDefaultContent('html', projectData.name)
        },
        {
          id: Date.now() + 2,
          name: 'style.css',
          language: 'css',
          content: getDefaultContent('css', projectData.name)
        },
        {
          id: Date.now() + 3,
          name: 'script.js',
          language: 'javascript',
          content: getDefaultContent('javascript', projectData.name)
        }
      ]
    }
    
    projects.value.unshift(project)
    saveProjects()
    return project
  }

  // Delete project
  function deleteProject(id) {
    projects.value = projects.value.filter(p => p.id !== id)
    saveProjects()
  }

  // Duplicate project
  function duplicateProject(id) {
    const project = projects.value.find(p => p.id === id)
    if (project) {
      const copy = JSON.parse(JSON.stringify(project))
      copy.id = Date.now()
      copy.name = project.name + ' (Copy)'
      copy.createdAt = new Date().toISOString()
      copy.updatedAt = new Date().toISOString()
      projects.value.unshift(copy)
      saveProjects()
    }
  }

  // Rename project
  function renameProject(id, newName) {
    const project = projects.value.find(p => p.id === id)
    if (project) {
      project.name = newName
      project.updatedAt = new Date().toISOString()
      saveProjects()
    }
  }

  // Get project by ID
  function getProject(id) {
    return projects.value.find(p => p.id === id)
  }

  // Update project files
  function updateProjectFiles(projectId, files) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.files = files
      project.updatedAt = new Date().toISOString()
      saveProjects()
    }
  }

  // Get sorted projects
  const sortedProjects = computed(() => {
    return [...projects.value].sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    )
  })

  // Default content based on language
  function getDefaultContent(language, projectName) {
    const templates = {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Welcome to ${projectName}</h1>
    <p>Start editing to see magic happen!</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

h1 {
  color: #333;
  margin-bottom: 10px;
}`,
      
      javascript: `// ${projectName} - Main JavaScript File
console.log('${projectName} loaded!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('App is ready!');
});`
    }
    return templates[language] || ''
  }

  // Initialize
  loadProjects()

  return {
    projects,
    currentProject,
    sortedProjects,
    loadProjects,
    createProject,
    deleteProject,
    duplicateProject,
    renameProject,
    getProject,
    updateProjectFiles
  }
})
