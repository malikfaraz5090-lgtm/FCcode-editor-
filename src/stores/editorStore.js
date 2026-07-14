import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useEditorStore = defineStore('editor', () => {
  const openFiles = ref([]);
  const activeFile = ref(null);
  const editorSettings = ref({
    theme: 'vs-dark',
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    tabSize: 2,
    wordWrap: 'on',
    minimap: true,
    autoSave: true,
    autoSaveDelay: 1000,
  });

  const activeFileContent = computed(() => activeFile.value?.content || '');

  function openFile(file) {
    const existing = openFiles.value.find(f => f.id === file.id);
    if (!existing) {
      openFiles.value.push(file);
    }
    activeFile.value = file;
  }

  function closeFile(fileId) {
    const index = openFiles.value.findIndex(f => f.id === fileId);
    if (index !== -1) {
      openFiles.value.splice(index, 1);
      if (activeFile.value?.id === fileId) {
        activeFile.value = openFiles.value[index] || openFiles.value[index - 1] || null;
      }
    }
  }

  function setActiveFile(file) {
    activeFile.value = file;
  }

  function updateActiveFileContent(content) {
    if (activeFile.value) {
      activeFile.value.content = content;
    }
  }

  function updateSetting(key, value) {
    editorSettings.value[key] = value;
  }

  return {
    openFiles,
    activeFile,
    editorSettings,
    activeFileContent,
    openFile,
    closeFile,
    setActiveFile,
    updateActiveFileContent,
    updateSetting,
  };
});
