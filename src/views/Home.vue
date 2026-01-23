<template>
  <div class="home">
    <Hero />
    <TopPicks />
    <Simulcast />
    <Premium />
  </div>
</template>

<script setup>
import Hero from '../components/Hero.vue'
import TopPicks from '../components/TopPicks.vue'
import Simulcast from '../components/Simulcast.vue'
import Premium from '../components/Premium.vue'
</script>

<style scoped>
.home {
  width: 100%;
}
</style>
