<template>
  <div id="app-root">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup>
import { onMounted, onErrorCaptured } from 'vue'

onMounted(() => {
  // Remove splash screen
  const splash = document.getElementById('splash')
  if (splash) {
    setTimeout(() => {
      splash.style.opacity = '0'
      splash.style.transition = 'opacity 0.3s'
      setTimeout(() => splash.remove(), 300)
    }, 1500)
  }
})

// Global error handler
onErrorCaptured((err, instance, info) => {
  console.error('App Error:', err)
  return false
})

// Catch unhandled errors
window.onerror = function(msg, url, line) {
  console.error('Global Error:', msg)
  return false
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 100%; height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1e1e1e; color: #ccc; overflow: hidden;
}
#app-root { width: 100%; height: 100%; }
</style>
