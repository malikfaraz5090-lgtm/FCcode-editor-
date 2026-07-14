import { createRouter, createWebHashHistory } from 'vue-router'

// Lazy load pages for better performance
const HomeScreen = () => import('../views/HomeScreen.vue')
const EditorScreen = () => import('../views/EditorScreen.vue')
const SettingsScreen = () => import('../views/SettingsScreen.vue')

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

// Error handling
router.onError((error) => {
  console.error('Router error:', error)
})

export default router
