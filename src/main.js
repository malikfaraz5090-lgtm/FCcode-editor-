import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './styles/global.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

setTimeout(() => {
  const splash = document.getElementById('splash')
  if (splash) { splash.style.opacity = '0'; splash.style.transition = 'opacity 0.3s'; setTimeout(() => splash.remove(), 300); }
}, 2000)
