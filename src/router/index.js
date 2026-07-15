import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'Home', component: () => import('../views/HomeScreen.vue') },
    { path: '/editor/:id', name: 'Editor', component: () => import('../views/EditorScreen.vue') },
    { path: '/preview/:id', name: 'Preview', component: () => import('../views/PreviewScreen.vue') },
    { path: '/settings', name: 'Settings', component: () => import('../views/SettingsScreen.vue') }
  ]
})

export default router
