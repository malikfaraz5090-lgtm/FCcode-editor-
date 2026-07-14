import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Dexie from 'dexie';

const db = new Dexie('FarazCodeEditorDB');

db.version(1).stores({
  projects: '++id, name, lastModified, isFavorite, color, icon',
  files: '++id, projectId, name, path, content, language, lastModified',
  folders: '++id, projectId, name, path',
  settings: 'key',
});

export const useProjectStore = defineStore('projects', () => {
  const projects = ref([]);
  const currentProject = ref(null);
  const recentProjects = ref([]);
  const searchQuery = ref('');
  const sortBy = ref('lastModified');
  const sortOrder = ref('desc');

  const filteredProjects = computed(() => {
    let filtered = [...projects.value];
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => {
      const modifier = sortOrder.value === 'desc' ? -1 : 1;
      if (sortBy.value === 'name') {
        return modifier * a.name.localeCompare(b.name);
      } else if (sortBy.value === 'lastModified') {
        return modifier * (new Date(a.lastModified) - new Date(b.lastModified));
      }
      return 0;
    });
    
    return filtered;
  });

  async function loadProjects() {
    try {
      const allProjects = await db.projects.toArray();
      projects.value = allProjects;
      recentProjects.value = allProjects
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 5);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  async function createProject(name, color = '#007acc', icon = 'code') {
    const project = {
      name,
      color,
      icon,
      isFavorite: false,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    try {
      const id = await db.projects.add(project);
      project.id = id;
      projects.value.unshift(project);
      
      // Create default files
      await createDefaultFiles(id);
      
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async function createDefaultFiles(projectId) {
    const defaultFiles = [
      { projectId, name: 'index.html', path: '/', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>', language: 'html', lastModified: new Date().toISOString() },
      { projectId, name: 'style.css', path: '/', content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}', language: 'css', lastModified: new Date().toISOString() },
      { projectId, name: 'script.js', path: '/', content: 'console.log("Hello from Faraz Code Editor!");', language: 'javascript', lastModified: new Date().toISOString() },
    ];
    
    await db.files.bulkAdd(defaultFiles);
  }

  async function deleteProject(id) {
    try {
      await db.projects.delete(id);
      await db.files.where('projectId').equals(id).delete();
      await db.folders.where('projectId').equals(id).delete();
      projects.value = projects.value.filter(p => p.id !== id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  async function duplicateProject(id) {
    const project = projects.value.find(p => p.id === id);
    if (!project) return;
    
    const newProject = {
      ...project,
      id: undefined,
      name: `${project.name} (Copy)`,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    const newId = await db.projects.add(newProject);
    newProject.id = newId;
    projects.value.unshift(newProject);
    
    const files = await db.files.where('projectId').equals(id).toArray();
    const newFiles = files.map(f => ({
      ...f,
      id: undefined,
      projectId: newId,
    }));
    
    if (newFiles.length > 0) {
      await db.files.bulkAdd(newFiles);
    }
    
    return newProject;
  }

  async function renameProject(id, newName) {
    await db.projects.update(id, { name: newName, lastModified: new Date().toISOString() });
    const project = projects.value.find(p => p.id === id);
    if (project) project.name = newName;
  }

  async function toggleFavorite(id) {
    const project = projects.value.find(p => p.id === id);
    if (project) {
      project.isFavorite = !project.isFavorite;
      await db.projects.update(id, { isFavorite: project.isFavorite });
    }
  }

  async function getProjectFiles(projectId) {
    return await db.files.where('projectId').equals(projectId).toArray();
  }

  async function getProjectFolders(projectId) {
    return await db.folders.where('projectId').equals(projectId).toArray();
  }

  async function createFile(projectId, name, path, content = '', language = '') {
    const file = {
      projectId,
      name,
      path: path || '/',
      content,
      language: language || detectLanguage(name),
      lastModified: new Date().toISOString(),
    };
    
    const id = await db.files.add(file);
    file.id = id;
    return file;
  }

  async function updateFile(id, updates) {
    updates.lastModified = new Date().toISOString();
    await db.files.update(id, updates);
  }

  async function deleteFile(id) {
    await db.files.delete(id);
  }

  async function createFolder(projectId, name, path) {
    const folder = { projectId, name, path: path || '/' };
    const id = await db.folders.add(folder);
    folder.id = id;
    return folder;
  }

  function detectLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
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
    };
    return map[ext] || 'plaintext';
  }

  return {
    projects,
    currentProject,
    recentProjects,
    searchQuery,
    sortBy,
    sortOrder,
    filteredProjects,
    loadProjects,
    createProject,
    deleteProject,
    duplicateProject,
    renameProject,
    toggleFavorite,
    getProjectFiles,
    getProjectFolders,
    createFile,
    updateFile,
    deleteFile,
    createFolder,
    detectLanguage,
  };
});
