import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/editor/:id', component: () => import('./views/Editor.vue') },
    { path: '/settings', component: () => import('./views/Settings.vue') }
  ]
})

export default router
