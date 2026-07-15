<template>
  <div class="preview">
    <header class="topbar">
      <button @click="$router.back()" class="btn-back">← Back</button>
      <span class="title">Preview</span>
      <select v-model="mode" class="mode">
        <option value="full">Full</option>
        <option value="mobile">Mobile</option>
        <option value="tablet">Tablet</option>
      </select>
      <button @click="refresh" class="btn-refresh">🔄</button>
    </header>
    <div class="frame-container" :class="mode">
      <iframe ref="frame" class="frame" sandbox="allow-scripts allow-same-origin"></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '../stores/store.js'

const route = useRoute()
const store = useStore()
const frame = ref(null)
const mode = ref('full')

onMounted(() => {
  const id = parseInt(route.params.id)
  const project = store.getProject(id)
  if (!project) return
  
  const html = project.files.find(f => f.name.endsWith('.html'))
  const css = project.files.find(f => f.name.endsWith('.css'))
  const js = project.files.find(f => f.name.endsWith('.js'))
  
  let code = html?.code || '<h1>No HTML</h1>'
  if (css) code = code.replace('</head>', `<style>${css.code}</style></head>`)
  if (js) code = code.replace('</body>', `<script>${js.code}<\/script></body>`)
  
  const doc = frame.value.contentDocument || frame.value.contentWindow.document
  doc.open()
  doc.write(code)
  doc.close()
})

function refresh() {
  if (frame.value) frame.value.contentWindow.location.reload()
}
</script>

<style scoped>
.preview { height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; }
.topbar { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #252526; border-bottom: 1px solid #3e3e42; }
.btn-back { background: #333; border: none; color: #fff; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.title { flex: 1; font-weight: 600; color: #007acc; }
.mode { padding: 4px 8px; background: #2d2d30; border: 1px solid #3e3e42; border-radius: 4px; color: #ccc; font-size: 12px; }
.btn-refresh { background: #333; border: none; color: #fff; padding: 6px 10px; border-radius: 4px; cursor: pointer; }
.frame-container { flex: 1; overflow: auto; background: #333; display: flex; justify-content: center; }
.frame-container.mobile .frame { width: 375px; }
.frame-container.tablet .frame { width: 768px; }
.frame { width: 100%; height: 100%; border: none; background: #fff; }
</style>
