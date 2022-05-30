<template>
  <v-app>
    <v-main>
      <HomeView/>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import HomeView from "@/views/HomeView.vue";
</script>
<style>
html {
  overflow-y: hidden !important;
  line-height: 0 !important;
}

</style>
