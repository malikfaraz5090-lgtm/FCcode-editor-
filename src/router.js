import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/editor/:id', component: () => import('./views/Editor.vue') },
    { path: '/preview/:id', component: () => import('./views/Preview.vue') }
  ]
})

export default router
