<script setup>
import { ref, watch, computed } from 'vue'
import { createGame } from '../game/state.js'
import GameBoard from './GameBoard.vue'
import WinDialog from './WinDialog.vue'
import ResetDialog from './ResetDialog.vue'
import { randomBreed } from '../data/breeds.js'
import { catCounts, recordCat } from '../game/storage.js'

const props = defineProps({
  level: { type: Object, required: true },
  number: { type: Number, required: true },
  hasNext: { type: Boolean, default: false },
})
const emit = defineEmits(['back', 'next'])

const game = createGame(props.level)
const showWin = ref(false)
const showReset = ref(false)
const flashCell = ref(-1)
const message = ref('')

// A random cat rides the finished track. The badge is saved as soon as the puzzle is
// solved, so leaving mid-ride doesn't lose it; the win dialog waits for the cat to reach B.
const cat = randomBreed()
const catIsNew = ref(false)
const catName = ref('')

watch(
  () => game.state.solved,
  (solved) => {
    if (!solved) return
    catIsNew.value = !catCounts()[cat.id]
    recordCat(cat.id)
  },
)

function catArrived() {
  catName.value = cat.name
  showWin.value = true
}

const canUndo = computed(() => game.state.history.length > 0 && !game.state.solved)

function useHint() {
  const result = game.hint()
  if (!result) return
  flashCell.value = -1
  requestAnimationFrame(() => (flashCell.value = result.cell))
  message.value = { removed: 'Removed a wrong piece', added: 'Added a correct piece', unmarked: 'That X hides track' }[result.kind]
  setTimeout(() => (message.value = ''), 1800)
}

function resetPuzzle() {
  game.reset()
  showReset.value = false
}
</script>

<template>
  <section class="screen game">
    <header class="bar">
      <button class="icon-btn" aria-label="Back to levels" @click="emit('back')">
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <div class="title">
        <strong>{{ level.pack }} {{ number }}</strong>
        <span>{{ level.n }}×{{ level.n }}</span>
      </div>
      <span class="spacer" />
    </header>

    <p class="goal">Connect <b>A</b> to <b>B</b>. Numbers show how many track pieces go in each row and column.</p>

    <div class="board-wrap">
      <GameBoard :game="game" :flash-cell="flashCell" :cat="cat" :cat-is-new="catIsNew" @arrived="catArrived" />
    </div>

    <p class="toast" :class="{ show: message }" aria-live="polite">{{ message }}</p>

    <nav class="tools">
      <button :disabled="!canUndo" @click="game.undo">Undo</button>
      <button :disabled="game.state.solved" @click="useHint">Hint</button>
      <button :disabled="game.state.solved" @click="showReset = true">Reset</button>
    </nav>

    <ResetDialog v-if="showReset" @confirm="resetPuzzle" @close="showReset = false" />

    <WinDialog
      v-if="showWin"
      :hints="game.state.hintsUsed"
      :has-next="hasNext"
      :cat-name="catName"
      @next="emit('next')"
      @close="showWin = false"
      @levels="emit('back')"
    />
  </section>
</template>

<style scoped>
.game {
  gap: 10px;
}
.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}
.title span {
  font-size: 13px;
  color: var(--muted);
}
.goal {
  margin: 0;
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}
.board-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.toast {
  margin: 0;
  min-height: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--accent);
  opacity: 0;
  transition: opacity 0.2s;
}
.toast.show {
  opacity: 1;
}
.tools {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
</style>
