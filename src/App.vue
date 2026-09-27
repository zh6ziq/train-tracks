<script setup>
import { ref, computed } from 'vue'
import levels from './data/levels.json'
import { isLevelSolved, solvedCount, catCounts } from './game/storage.js'
import MainMenu from './components/MainMenu.vue'
import LevelSelect from './components/LevelSelect.vue'
import GameScreen from './components/GameScreen.vue'
import BadgesScreen from './components/BadgesScreen.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'

const screen = ref('menu') // 'menu' | 'levels' | 'badges' | 'game'
const current = ref(0)
const solved = ref(solvedCount())
const badges = ref(catCounts())

const level = computed(() => levels[current.value])
// Number of the level inside its pack, e.g. "Medium 12".
const numberInPack = computed(() => levels.slice(0, current.value + 1).filter((l) => l.pack === level.value.pack).length)

function go(to) {
  solved.value = solvedCount()
  badges.value = catCounts()
  screen.value = to
}

function play(index) {
  current.value = index
  go('game')
}

function continueGame() {
  const next = levels.findIndex((l) => !isLevelSolved(l.id))
  play(next < 0 ? 0 : next)
}
</script>

<template>
  <MainMenu
    v-if="screen === 'menu'"
    :solved="solved"
    :total="levels.length"
    @continue="continueGame"
    @badges="go('badges')"
    @levels="go('levels')"
  />
  <BadgesScreen v-else-if="screen === 'badges'" :counts="badges" @back="go('menu')" />
  <LevelSelect
    v-else-if="screen === 'levels'"
    :levels="levels"
    :initial-pack="level.pack"
    @back="go('menu')"
    @play="play"
  />
  <GameScreen
    v-else
    :key="level.id"
    :level="level"
    :number="numberInPack"
    :has-next="current < levels.length - 1"
    @back="go('levels')"
    @next="play(current + 1)"
  />
  <UpdatePrompt />
</template>
