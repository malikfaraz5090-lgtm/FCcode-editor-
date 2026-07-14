<template>
  <div class="app-root">
    <!-- Splash Screen -->
    <div v-if="showSplash" class="splash-screen">
      <div class="splash-content">
        <div class="splash-logo">
          <span class="logo-text">F</span>
        </div>
        <h1 class="splash-title">Faraz Code Editor</h1>
        <p class="splash-subtitle">Professional Code Editor</p>
        <div class="splash-loader">
          <div class="loader-bar"></div>
        </div>
      </div>
    </div>
    
    <!-- Main App - Show only when loaded -->
    <router-view v-else v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showSplash = ref(true)

onMounted(() => {
  // Show splash for 2 seconds then load app
  setTimeout(() => {
    showSplash.value = false
  }, 2000)
})
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1e1e1e;
  color: #cccccc;
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;
}

#app {
  width: 100%;
  height: 100%;
}

/* Splash Screen */
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e1e1e;
  z-index: 9999;
  transition: opacity 0.3s ease;
}

.splash-content {
  text-align: center;
}

.splash-logo {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #007acc, #005a9e);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  animation: logoPulse 2s infinite;
  box-shadow: 0 10px 40px rgba(0, 122, 204, 0.4);
}

.logo-text {
  font-size: 52px;
  font-weight: bold;
  color: white;
  font-family: monospace;
}

.splash-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.splash-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 32px;
}

.splash-loader {
  width: 160px;
  height: 3px;
  background: #333;
  border-radius: 3px;
  margin: 0 auto;
  overflow: hidden;
}

.loader-bar {
  height: 100%;
  background: #007acc;
  border-radius: 3px;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes loading {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Selection */
::selection {
  background: #264f78;
  color: #fff;
}
</style>
