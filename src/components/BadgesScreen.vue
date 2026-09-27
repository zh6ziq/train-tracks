<script setup>
import BadgeCollection from './BadgeCollection.vue'

defineProps({
  counts: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['back'])
</script>

<template>
  <section class="screen">
    <header class="bar">
      <button class="icon-btn" aria-label="Back to menu" @click="emit('back')">
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <div class="title"><strong>Badges</strong></div>
      <span class="spacer" />
    </header>

    <BadgeCollection :counts="counts" />
  </section>
</template>
