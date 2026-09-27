<script setup>
import BaseDialog from './BaseDialog.vue'

defineProps({
  hints: { type: Number, default: 0 },
  hasNext: { type: Boolean, default: false },
  catName: { type: String, default: '' },
})
const emit = defineEmits(['next', 'close', 'levels'])
</script>

<template>
  <BaseDialog
    title="All aboard!"
    :message="hints ? `Solved with ${hints} hint${hints > 1 ? 's' : ''}.` : 'Solved without hints.'"
    @close="emit('close')"
  >
    <template #icon><path d="M5 12.5l4.5 4.5L19 7.5" /></template>
    <p v-if="catName" class="cat-line">You met a <b>{{ catName }}</b>!</p>
    <button v-if="hasNext" class="primary" @click="emit('next')">Next puzzle</button>
    <button @click="emit('levels')">Level list</button>
  </BaseDialog>
</template>

<style scoped>
.cat-line {
  margin: -4px 0 8px;
  color: var(--ink);
}
</style>
