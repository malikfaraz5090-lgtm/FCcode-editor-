cat > src/main.js << 'EOF'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/global.css'
import './styles/themes.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

// Remove splash screen
setTimeout(() => {
  const splash = document.getElementById('splashScreen')
  if (splash) {
    splash.style.opacity = '0'
    setTimeout(() => splash.remove(), 500)
  }
}, 2500)

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
EOF
