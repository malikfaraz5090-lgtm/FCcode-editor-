import { createRouter, createWebHashHistory } from 'vue-router'
import HomeScreen from '../views/HomeScreen.vue'
import EditorScreen from '../views/EditorScreen.vue'
import SettingsScreen from '../views/SettingsScreen.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeScreen
  },
  {
    path: '/editor/:id',
    name: 'Editor',
    component: EditorScreen
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsScreen
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
