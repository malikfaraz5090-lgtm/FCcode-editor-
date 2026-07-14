import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeScreen.vue'),
    meta: { transition: 'fade' },
  },
  {
    path: '/editor/:projectId',
    name: 'Editor',
    component: () => import('../views/EditorScreen.vue'),
    meta: { transition: 'slide-left' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsScreen.vue'),
    meta: { transition: 'slide-left' },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/SearchScreen.vue'),
    meta: { transition: 'slide-left' },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
