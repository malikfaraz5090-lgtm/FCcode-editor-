<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useStore } from './stores/store.js'

const store = useStore()

onMounted(() => {
  store.loadProjects()
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; font-family: sans-serif; background: #1e1e1e; color: #ccc; }
#app { width: 100%; height: 100%; }
</style>
