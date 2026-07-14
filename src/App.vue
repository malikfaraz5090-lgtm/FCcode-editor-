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
    
    <!-- Main App -->
    <router-view v-else v-slot="{ Component }">
      <transition name="page-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showSplash = ref(true)

onMounted(() => {
  // 2 seconds splash screen
  setTimeout(() => {
    showSplash.value = false
  }, 2500)
})
</script>

<style scoped>
.app-root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #1e1e1e;
}

/* Splash Screen */
.splash-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e1e 0%, #252526 100%);
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
  font-family: 'Courier New', monospace;
}

.splash-title {
  font-size: 28px;
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
  width: 200px;
  height: 3px;
  background: #333;
  border-radius: 3px;
  margin: 0 auto;
  overflow: hidden;
}

.loader-bar {
  height: 100%;
  background: linear-gradient(90deg, #007acc, #4ec9b0);
  border-radius: 3px;
  animation: loading 2s ease-in-out infinite;
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
.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.3s ease;
}

.page-slide-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.page-slide-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}
</style>
