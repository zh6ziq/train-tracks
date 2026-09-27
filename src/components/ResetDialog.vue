<script setup>
import BaseDialog from './BaseDialog.vue'

const emit = defineEmits(['confirm', 'close'])
</script>

<template>
  <BaseDialog
    title="Start again?"
    message="This clears all the track you've laid on this puzzle."
    tone="warn"
    @close="emit('close')"
  >
    <template #icon><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" /></template>
    <button class="danger" @click="emit('confirm')">Clear puzzle</button>
    <button @click="emit('close')">Keep playing</button>
  </BaseDialog>
</template>

<style scoped>
.danger {
  background: var(--bad);
  border-color: var(--bad);
  color: var(--on-accent);
}
</style>
