cat > src/stores/editorStore.js << 'EOF'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const openFiles = ref([])
  const activeFile = ref(null)
  const editorInstance = ref(null)
  const isModified = ref(false)
  
  const settings = ref({
    theme: 'vs-dark',
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    tabSize: 2,
    wordWrap: 'on',
    minimap: true,
    autoSave: true,
    autoSaveDelay: 1000,
    lineNumbers: 'on',
    bracketPairColorization: true,
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    renderWhitespace: 'selection',
    formatOnPaste: true,
    formatOnType: true
  })

  const activeFileLanguage = computed(() => 
    activeFile.value?.language || 'plaintext'
  )

  const hasOpenFiles = computed(() => 
    openFiles.value.length > 0
  )

  function openFile(file) {
    const existing = openFiles.value.find(f => f.id === file.id)
    if (!existing) {
      openFiles.value.push({ ...file })
    }
    activeFile.value = file
    isModified.value = false
  }

  function closeFile(fileId) {
    const index = openFiles.value.findIndex(f => f.id === fileId)
    if (index !== -1) {
      openFiles.value.splice(index, 1)
      if (activeFile.value?.id === fileId) {
        activeFile.value = openFiles.value[index] || openFiles.value[index - 1] || null
      }
    }
  }

  function closeAllFiles() {
    openFiles.value = []
    activeFile.value = null
  }

  function closeOtherFiles(fileId) {
    openFiles.value = openFiles.value.filter(f => f.id === fileId)
    activeFile.value = openFiles.value[0] || null
  }

  function setActiveFile(file) {
    activeFile.value = file
  }

  function setEditorInstance(instance) {
    editorInstance.value = instance
  }

  function updateFileContent(fileId, content) {
    const file = openFiles.value.find(f => f.id === fileId)
    if (file) {
      file.content = content
      isModified.value = true
    }
  }

  function markAsSaved() {
    isModified.value = false
  }

  function updateSetting(key, value) {
    settings.value[key] = value
    // Apply settings to editor
    if (editorInstance.value) {
      const editor = editorInstance.value
      switch(key) {
        case 'fontSize':
          editor.updateOptions({ fontSize: value })
          break
        case 'wordWrap':
          editor.updateOptions({ wordWrap: value })
          break
        case 'minimap':
          editor.updateOptions({ minimap: { enabled: value } })
          break
        case 'tabSize':
          editor.updateOptions({ tabSize: value })
          break
      }
    }
  }

  return {
    openFiles,
    activeFile,
    editorInstance,
    isModified,
    settings,
    activeFileLanguage,
    hasOpenFiles,
    openFile,
    closeFile,
    closeAllFiles,
    closeOtherFiles,
    setActiveFile,
    setEditorInstance,
    updateFileContent,
    markAsSaved,
    updateSetting
  }
})
EOF
