<template>
  <div class="preview-page">
    <header class="topbar">
      <button @click="$router.back()" class="btn-back">← Back</button>
      <span class="title">Live Preview</span>
      <select v-model="mode" class="mode-select">
        <option value="full">🖥 Full</option>
        <option value="mobile">📱 Mobile</option>
        <option value="tablet">📋 Tablet</option>
      </select>
      <button @click="refresh" class="btn-refresh">🔄</button>
    </header>
    <div class="frame-container" :class="mode">
      <iframe ref="previewFrame" class="preview-frame" sandbox="allow-scripts allow-same-origin allow-forms allow-modals"></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '../stores/projectStore.js'

const route = useRoute()
const store = useProjectStore()
const previewFrame = ref(null)
const mode = ref('full')

onMounted(() => {
  const id = parseInt(route.params.id)
  const project = store.getProject(id)
  if (!project) return

  const htmlFile = project.files.find(f => f.name.endsWith('.html') || f.name.endsWith('.htm'))
  const cssFile = project.files.find(f => f.name.endsWith('.css'))
  const jsFile = project.files.find(f => f.name.endsWith('.js'))

  let code = htmlFile?.content || '<html><body><h1>No HTML file found</h1></body></html>'

  if (cssFile) {
    code = code.replace('</head>', `<style>${cssFile.content}</style></head>`)
  }

  if (jsFile) {
    code = code.replace('</body>', `<script>${jsFile.content}<\/script></body>`)
  }

  const doc = previewFrame.value?.contentDocument || previewFrame.value?.contentWindow?.document
  if (doc) {
    doc.open()
    doc.write(code)
    doc.close()
  }
})

function refresh() {
  if (previewFrame.value) {
    previewFrame.value.contentWindow?.location?.reload()
  }
}
</script>

<style scoped>
.preview-page { height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; }
.topbar { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #252526; border-bottom: 1px solid #3e3e42; }
.btn-back { background: #333; border: none; color: #fff; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.title { flex: 1; font-weight: 600; color: #007acc; }
.mode-select { padding: 4px 8px; background: #2d2d30; border: 1px solid #3e3e42; border-radius: 4px; color: #ccc; font-size: 12px; }
.btn-refresh { background: #333; border: none; color: #fff; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.frame-container { flex: 1; overflow: auto; background: #333; display: flex; justify-content: center; }
.frame-container.mobile .preview-frame { width: 375px; }
.frame-container.tablet .preview-frame { width: 768px; }
.preview-frame { width: 100%; height: 100%; border: none; background: #fff; }
</style>
