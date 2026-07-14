<template>
  <div class="editor-page">
    <header class="editor-header">
      <button @click="$router.back()" class="back-btn">← Back</button>
      <h1>{{ project?.name || 'Editor' }}</h1>
    </header>
    <div class="editor-content">
      <textarea v-model="code" class="code-area" placeholder="Write your code here..."></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '../stores/projectStore'

const route = useRoute()
const projectStore = useProjectStore()
const project = ref(null)
const code = ref('')

onMounted(() => {
  const id = parseInt(route.params.id)
  project.value = projectStore.getProject(id)
  if (project.value?.files[0]) {
    code.value = project.value.files[0].content
  }
})
</script>

<style scoped>
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
  color: #ccc;
}

.back-btn {
  padding: 6px 12px;
  background: #2d2d30;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  color: #ccc;
  cursor: pointer;
}

.editor-content {
  flex: 1;
  padding: 0;
}

.code-area {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  padding: 20px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  resize: none;
  outline: none;
}
</style>
