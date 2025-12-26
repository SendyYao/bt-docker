<template>
  <router-view />
</template>

<style lang="css">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  /* padding: 20px; */
  --un-bg-opacity: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
<script setup>
import {RouterView} from "vue-router";
</script>