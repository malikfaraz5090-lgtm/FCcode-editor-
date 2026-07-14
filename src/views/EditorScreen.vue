<template>
  <div class="editor-screen">
    <!-- Activity Bar -->
    <div class="activity-bar">
      <button 
        class="activity-button" 
        :class="{ active: activePanel === 'explorer' }"
        @click="togglePanel('explorer')"
      >
        <span class="material-icons">folder</span>
      </button>
      <button 
        class="activity-button" 
        :class="{ active: activePanel === 'search' }"
        @click="togglePanel('search')"
      >
        <span class="material-icons">search</span>
      </button>
      <button 
        class="activity-button" 
        :class="{ active: activePanel === 'git' }"
        @click="togglePanel('git')"
      >
        <span class="material-icons">source_control</span>
      </button>
      <button 
        class="activity-button" 
        :class="{ active: activePanel === 'preview' }"
        @click="togglePanel('preview')"
      >
        <span class="material-icons">visibility</span>
      </button>
    </div>

    <!-- Sidebar -->
    <div class="sidebar" v-show="activePanel">
      <div class="sidebar-header">
        <h3>{{ panelTitle }}</h3>
        <div class="sidebar-actions">
          <button class="icon-button" v-if="activePanel === 'explorer'" @click="createNewFile">
            <span class="material-icons">note_add</span>
          </button>
          <button class="icon-button" v-if="activePanel === 'explorer'" @click="createNewFolder">
            <span class="material-icons">create_new_folder</span>
          </button>
          <button class="icon-button" @click="activePanel = null">
            <span class="material-icons">close</span>
          </button>
        </div>
      </div>
      
      <div class="sidebar-content">
        <!-- File Explorer -->
        <div v-if="activePanel === 'explorer'" class="file-explorer">
          <div class="file-tree">
            <div 
              v-for="file in projectFiles" 
              :key="file.id"
              class="file-item"
              :class="{ active: editorStore.activeFile?.id === file.id }"
              @click="openFileInEditor(file)"
            >
              <span class="material-icons file-icon">{{ getFileIcon(file.name) }}</span>
              <span class="file-name">{{ file.name }}</span>
            </div>
          </div>
        </div>

        <!-- Search Panel -->
        <div v-if="activePanel === 'search'" class="search-panel">
          <div class="search-input-container">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search in files..."
              class="search-input"
            >
            <button class="icon-button" @click="performSearch">
              <span class="material-icons">search</span>
            </button>
          </div>
          <div class="search-results" v-if="searchResults.length > 0">
            <div 
              v-for="result in searchResults" 
              :key="result.id"
              class="search-result"
            >
              <span class="result-file">{{ result.file }}</span>
              <span class="result-line">{{ result.line }}</span>
            </div>
          </div>
        </div>

        <!-- Preview Panel -->
        <div v-if="activePanel === 'preview'" class="preview-panel">
          <div class="preview-toolbar">
            <select v-model="previewMode" class="preview-select">
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="desktop">Desktop</option>
            </select>
            <button class="icon-button" @click="toggleFullscreen">
              <span class="material-icons">fullscreen</span>
            </button>
          </div>
          <div class="preview-frame" :class="previewMode">
            <iframe 
              ref="previewFrame" 
              :srcdoc="previewContent"
              sandbox="allow-scripts allow-same-origin"
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Editor Area -->
    <div class="editor-main">
      <!-- Tabs -->
      <div class="editor-tabs" v-if="editorStore.openFiles.length > 0">
        <div class="tabs-container">
          <div 
            v-for="file in editorStore.openFiles" 
            :key="file.id"
            class="tab"
            :class="{ active: editorStore.activeFile?.id === file.id }"
            @click="editorStore.setActiveFile(file)"
          >
            <span class="tab-icon material-icons">{{ getFileIcon(file.name) }}</span>
            <span class="tab-name">{{ file.name }}</span>
            <button class="tab-close" @click.stop="closeFile(file.id)">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>
        <div class="tab-actions">
          <button class="icon-button" @click="saveFile">
            <span class="material-icons">save</span>
          </button>
        </div>
      </div>

      <!-- Monaco Editor Container -->
      <div class="editor-container" ref="editorContainer">
        <div id="monaco-editor" ref="monacoEditor"></div>
      </div>

      <!-- Status Bar -->
      <div class="status-bar">
        <div class="status-left">
          <span class="status-item">{{ editorStore.activeFile?.language || 'Plain Text' }}</span>
          <span class="status-item">UTF-8</span>
          <span class="status-item">Ln {{ currentLine }}, Col {{ currentColumn }}</span>
        </div>
        <div class="status-right">
          <span class="status-item">{{ editorStore.editorSettings.tabSize }} Spaces</span>
          <span class="status-item">UTF-8</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../stores/projectStore';
import { useEditorStore } from '../stores/editorStore';
import * as monaco from 'monaco-editor';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const editorStore = useEditorStore();

const activePanel = ref('explorer');
const searchQuery = ref('');
const searchResults = ref([]);
const previewMode = ref('mobile');
const previewContent = ref('');
const currentLine = ref(1);
const currentColumn = ref(1);
const monacoEditorRef = ref(null);
const editorContainer = ref(null);
let editor = null;
let autoSaveTimer = null;

const projectFiles = computed(() => {
  // Get files from store
  return [];
});

const panelTitle = computed(() => {
  const titles = {
    explorer: 'Explorer',
    search: 'Search',
    git: 'Source Control',
    preview: 'Preview',
  };
  return titles[activePanel.value] || '';
});

onMounted(async () => {
  const projectId = route.params.projectId;
  await loadProject(projectId);
  await initMonacoEditor();
  
  // Load initial files
  const files = await projectStore.getProjectFiles(projectId);
  if (files.length > 0) {
    editorStore.openFile(files[0]);
  }
});

async function loadProject(projectId) {
  const project = projectStore.projects.find(p => p.id === parseInt(projectId));
  if (project) {
    projectStore.currentProject = project;
  }
}

async function initMonacoEditor() {
  await nextTick();
  
  if (editorContainer.value) {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
      value: editorStore.activeFile?.content || '',
      language: editorStore.activeFile?.language || 'plaintext',
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: editorStore.editorSettings.fontSize,
      fontFamily: editorStore.editorSettings.fontFamily,
      tabSize: editorStore.editorSettings.tabSize,
      wordWrap: editorStore.editorSettings.wordWrap,
      minimap: { enabled: editorStore.editorSettings.minimap },
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      formatOnPaste: true,
      formatOnType: true,
      suggest: {
        showKeywords: true,
        showSnippets: true,
      },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: true,
    });

    // Add event listeners
    editor.onDidChangeModelContent(() => {
      if (editorStore.activeFile && editorStore.editorSettings.autoSave) {
        handleAutoSave();
      }
    });

    editor.onDidChangeCursorPosition((e) => {
      currentLine.value = e.position.lineNumber;
      currentColumn.value = e.position.column;
    });

    // Keyboard shortcuts
    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => saveFile(),
    });
  }
}

function togglePanel(panel) {
  activePanel.value = activePanel.value === panel ? null : panel;
}

function openFileInEditor(file) {
  editorStore.openFile(file);
  if (editor) {
    editor.setValue(file.content);
    const language = monaco.editor.getModels()[0];
    if (language) {
      monaco.editor.setModelLanguage(language, file.language || 'plaintext');
    }
  }
}

function closeFile(fileId) {
  editorStore.closeFile(fileId);
}

async function saveFile() {
  if (editorStore.activeFile && editor) {
    const content = editor.getValue();
    editorStore.updateActiveFileContent(content);
    
    try {
      await projectStore.updateFile(editorStore.activeFile.id, { content });
      showNotification('File saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save file', 'error');
    }
  }
}

function handleAutoSave() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    saveFile();
  }, editorStore.editorSettings.autoSaveDelay);
}

function createNewFile() {
  const name = prompt('Enter file name:');
  if (name) {
    const language = projectStore.detectLanguage(name);
    projectStore.createFile(projectStore.currentProject.id, name, '/', '', language);
  }
}

function createNewFolder() {
  const name = prompt('Enter folder name:');
  if (name) {
    projectStore.createFolder(projectStore.currentProject.id, name, '/');
  }
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    html: 'html', htm: 'html',
    css: 'css',
    js: 'javascript', jsx: 'javascript',
    ts: 'code', tsx: 'code',
    json: 'data_object',
    md: 'article',
    py: 'code',
    java: 'code',
    kt: 'code',
    c: 'code',
    cpp: 'code',
    php: 'code',
    xml: 'code',
    svg: 'image',
    vue: 'code',
    txt: 'description',
    default: 'description',
  };
  return icons[ext] || icons.default;
}

function performSearch() {
  // Implement search functionality
}

function toggleFullscreen() {
  // Implement fullscreen toggle
}

function showNotification(message, type) {
  // Implement notification system
}

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
  }
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
});
</script>

<style scoped>
.editor-screen {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
}

/* Activity Bar */
.activity-bar {
  width: 48px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
  gap: 4px;
}

.activity-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all 0.2s;
  position: relative;
}

.activity-button:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.activity-button.active {
  color: white;
}

.activity-button.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 24px;
  background: white;
  border-radius: 0 2px 2px 0;
}

/* Sidebar */
.sidebar {
  width: 300px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3 {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.sidebar-actions {
  display: flex;
  gap: 4px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

/* File Explorer */
.file-explorer {
  padding: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s;
  font-size: 13px;
}

.file-item:hover {
  background: var(--bg-hover);
}

.file-item.active {
  background: var(--bg-active);
}

.file-icon {
  font-size: 16px;
  color: var(--accent-color);
}

/* Editor Main */
.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Tabs */
.editor-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.tabs-container {
  display: flex;
  overflow-x: auto;
  flex: 1;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  border-right: 1px solid var(--border-color);
  min-width: 120px;
  transition: background 0.2s;
  white-space: nowrap;
}

.tab:hover {
  background: var(--bg-hover);
}

.tab.active {
  background: var(--bg-primary);
  border-bottom: 2px solid var(--accent-color);
}

.tab-icon {
  font-size: 14px;
}

.tab-close {
  opacity: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: all 0.2s;
}

.tab:hover .tab-close {
  opacity: 0.7;
}

.tab-close:hover {
  opacity: 1;
  background: var(--bg-active);
}

.tab-close .material-icons {
  font-size: 14px;
}

.tab-actions {
  padding: 0 8px;
}

/* Editor Container */
.editor-container {
  flex: 1;
  overflow: hidden;
}

#monaco-editor {
  width: 100%;
  height: 100%;
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  height: 24px;
  background: var(--accent-color);
  color: white;
  font-size: 12px;
}

.status-left,
.status-right {
  display: flex;
  gap: 16px;
}

.status-item {
  opacity: 0.9;
}

/* Search Panel */
.search-panel {
  padding: 12px;
}

.search-input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.search-input {
  flex: 1;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.search-results {
  margin-top: 12px;
}

.search-result {
  padding: 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.search-result:hover {
  background: var(--bg-hover);
}

/* Preview Panel */
.preview-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
}

.preview-select {
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-primary);
}

.preview-frame {
  flex: 1;
  overflow: hidden;
}

.preview-frame.mobile {
  max-width: 375px;
  margin: 0 auto;
}

.preview-frame.tablet {
  max-width: 768px;
  margin: 0 auto;
}

.preview-frame iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

@media (max-width: 768px) {
  .activity-bar {
    width: 40px;
  }
  
  .sidebar {
    width: 250px;
  }
}
</style>
