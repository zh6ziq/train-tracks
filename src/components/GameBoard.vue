<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { N, E, S, W, DIRS, givenCells, trackRoute } from '../game/rules.js'
import CatSprite from './CatSprite.js'

const props = defineProps({
  game: { type: Object, required: true },
  flashCell: { type: Number, default: -1 },
  cat: { type: Object, default: null },
  catIsNew: { type: Boolean, default: false },
})
const emit = defineEmits(['arrived'])

const CELL = 40
const LEFT = 44 // room for the A entry
const TOP = 36 // room for column counts
const RIGHT = 36 // room for row counts
const BOTTOM = 44 // room for the B exit

const n = computed(() => props.game.level.n)
const width = computed(() => LEFT + n.value * CELL + RIGHT)
const height = computed(() => TOP + n.value * CELL + BOTTOM)
const cells = computed(() => Array.from({ length: n.value * n.value }, (_, i) => i))
const given = computed(() => givenCells(props.game.level))

const cx = (i) => LEFT + (i % n.value) * CELL + CELL / 2
const cy = (i) => TOP + Math.floor(i / n.value) * CELL + CELL / 2

function edgePoint(i, bit) {
  const x = cx(i)
  const y = cy(i)
  const h = CELL / 2
  if (bit === N) return [x, y - h]
  if (bit === E) return [x + h, y]
  if (bit === S) return [x, y + h]
  return [x - h, y]
}

// One SVG path for all track: straight pieces, curves, and half pieces while drawing.
const trackPath = computed(() => {
  const { masks } = props.game.state
  let d = ''
  for (let i = 0; i < masks.length; i++) {
    const m = masks[i]
    if (!m) continue
    const bits = DIRS.filter((dir) => m & dir.bit).map((dir) => dir.bit)
    if (bits.length === 2) {
      const [x1, y1] = edgePoint(i, bits[0])
      const [x2, y2] = edgePoint(i, bits[1])
      const straight = m === (N | S) || m === (E | W)
      d += straight ? `M${x1} ${y1}L${x2} ${y2}` : `M${x1} ${y1}Q${cx(i)} ${cy(i)} ${x2} ${y2}`
    } else {
      for (const b of bits) {
        const [x, y] = edgePoint(i, b)
        d += `M${cx(i)} ${cy(i)}L${x} ${y}`
      }
    }
  }
  // Short stubs outside the grid for the entry (A) and exit (B).
  const { a, b } = props.game.level
  const ay = TOP + a * CELL + CELL / 2
  const bx = LEFT + b * CELL + CELL / 2
  const gridBottom = TOP + n.value * CELL
  d += `M${LEFT - 24} ${ay}L${LEFT} ${ay}M${bx} ${gridBottom}L${bx} ${gridBottom + 24}`
  return d
})

// ---- The cat's ride from A to B once the puzzle is solved ----
// One continuous path in riding order, using the same geometry as the drawn track.
const routePath = computed(() => {
  if (!props.game.state.solved) return ''
  const { a, b } = props.game.level
  const ay = TOP + a * CELL + CELL / 2
  let d = `M${LEFT - 24} ${ay}L${LEFT} ${ay}`
  for (const { i, from, out } of trackRoute(props.game.level, props.game.state.masks)) {
    const [x2, y2] = edgePoint(i, out)
    const straight = (from | out) === (N | S) || (from | out) === (E | W)
    d += straight ? `L${x2} ${y2}` : `Q${cx(i)} ${cy(i)} ${x2} ${y2}`
  }
  const bx = LEFT + b * CELL + CELL / 2
  return d + `L${bx} ${TOP + n.value * CELL + 24}`
})

const route = ref(null)
const ride = ref(null) // { x, y, angle, flip, bob } while the cat is on the board
const bubble = ref(false)
let frame = 0
let timer = 0

const CAT_SCALE = 0.95
const catTransform = computed(() => {
  const r = ride.value
  if (!r) return ''
  const flip = r.flip ? ' scale(1 -1)' : ''
  return `translate(${r.x} ${r.y}) rotate(${r.angle})${flip} translate(0 ${r.bob}) scale(${CAT_SCALE})`
})

// Final resting spot: standing upright just past the grid, above the B label.
const restX = () => LEFT + props.game.level.b * CELL + CELL / 2
const restY = () => TOP + n.value * CELL + 12

const bubbleText = computed(() => (props.cat ? props.cat.name : ''))
const bubbleBox = computed(() => {
  const label = bubbleText.value + (props.catIsNew ? '  NEW!' : '')
  const w = Math.min(width.value - 8, label.length * 6.4 + 18)
  const hgt = 20
  const x = Math.max(4, Math.min(width.value - 4 - w, restX() - w / 2))
  const y = restY() - 17 - hgt - 6
  const t = Math.max(x + 12, Math.min(x + w - 12, restX()))
  const r = 10
  const b = y + hgt
  const d =
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w - r} ${b}H${t + 5}l-5 6l-5 -6H${x + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
  return { x, y, w, h: hgt, tail: t, d }
})

function arrive(flip = false) {
  // Upright, facing whichever way the cat was heading.
  ride.value = { x: restX(), y: restY(), angle: flip ? 180 : 0, flip, bob: 0 }
  bubble.value = true
  timer = setTimeout(() => emit('arrived'), 1400)
}

function startRide() {
  if (!props.cat) return emit('arrived')
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const path = route.value
  if (reduce || !path) return arrive()
  const len = path.getTotalLength()
  const duration = Math.min(4500, Math.max(1800, len * 6))
  const settle = 250 // time to turn upright at the end
  const start = performance.now()
  let flip = false
  let end = null // where the ride finished, to settle upright from

  const step = (now) => {
    const t = Math.min(1, (now - start) / duration)
    if (t < 1) {
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
      const at = e * len
      const p = path.getPointAtLength(at)
      const q = path.getPointAtLength(Math.min(len, at + 2))
      const back = at + 2 > len ? path.getPointAtLength(at - 2) : p
      const dx = q.x - back.x
      const dy = q.y - back.y
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI
      // Flip when heading left so the cat never rides upside-down (with a little hysteresis).
      if (dx < -0.3) flip = true
      else if (dx > 0.3) flip = false
      ride.value = { x: p.x, y: p.y, angle, flip, bob: Math.sin(now / 55) * 0.6 }
    } else {
      end ??= { ...ride.value }
      const u = Math.min(1, (now - start - duration) / settle)
      const x = end.x + (restX() - end.x) * u
      const y = end.y + (restY() - end.y) * u
      const upright = end.flip ? (end.angle < 0 ? -180 : 180) : 0 // turn the short way
      ride.value = { x, y, angle: end.angle + (upright - end.angle) * u, flip: end.flip, bob: 0 }
      if (u >= 1) return arrive(end.flip)
    }
    frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

watch(
  () => props.game.state.solved,
  (solved) => {
    // Wait a tick so the route path has rendered before measuring it.
    if (solved) requestAnimationFrame(startRide)
  },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  clearTimeout(timer)
})

function countClass(have, want) {
  if (have > want) return 'over'
  if (have === want) return 'done'
  return ''
}

// ---- Input: drag between cells to lay or remove track, tap to mark X ----
const svg = ref(null)
let drag = null

function cellAt(e) {
  const pt = svg.value.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(svg.value.getScreenCTM().inverse())
  const c = Math.floor((p.x - LEFT) / CELL)
  const r = Math.floor((p.y - TOP) / CELL)
  if (r < 0 || r >= n.value || c < 0 || c >= n.value) return -1
  return r * n.value + c
}

function onDown(e) {
  const i = cellAt(e)
  if (i < 0 || props.game.state.solved) return
  try {
    svg.value.setPointerCapture(e.pointerId) // keep getting moves even if the finger leaves the board
  } catch {
    // Pointer already gone; the drag still works without capture.
  }
  drag = { start: i, last: i, mode: null, moved: false }
  props.game.beginStroke()
}

function onMove(e) {
  if (!drag) return
  const target = cellAt(e)
  if (target < 0) return
  // Walk one cell at a time towards the finger so fast swipes don't skip cells.
  while (drag.last !== target) {
    const size = n.value
    const dr = Math.floor(target / size) - Math.floor(drag.last / size)
    const dc = (target % size) - (drag.last % size)
    if (Math.abs(dr) === Math.abs(dc)) return // exactly diagonal: wait for a clearer direction
    const bit = Math.abs(dr) > Math.abs(dc) ? (dr > 0 ? S : N) : dc > 0 ? E : W
    if (drag.mode === null) drag.mode = props.game.hasEdge(drag.last, bit) ? 'erase' : 'draw'
    props.game.strokeEdge(drag.last, bit, drag.mode === 'draw')
    drag.moved = true
    drag.last = props.game.neighbour(drag.last, bit)
  }
}

function onUp() {
  if (!drag) return
  const { moved, start } = drag
  drag = null
  props.game.endStroke(moved)
  if (!moved) props.game.tap(start)
}
</script>

<template>
  <svg
    ref="svg"
    class="board"
    :class="{ solved: game.state.solved }"
    :viewBox="`0 0 ${width} ${height}`"
    role="img"
    :aria-label="`Train tracks puzzle, ${n} by ${n}`"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <defs>
      <!-- Two thin rails: a wide line with a narrower line cut out of the middle. -->
      <mask id="rail-mask" maskUnits="userSpaceOnUse" x="0" y="0" :width="width" :height="height">
        <path :d="trackPath" stroke="white" stroke-width="20" fill="none" />
        <path :d="trackPath" stroke="black" stroke-width="14" fill="none" />
      </mask>
    </defs>

    <!-- Cells -->
    <rect
      v-for="i in cells"
      :key="i"
      :x="LEFT + (i % n) * CELL"
      :y="TOP + Math.floor(i / n) * CELL"
      :width="CELL"
      :height="CELL"
      class="cell"
      :class="{ given: given.has(i), flash: i === flashCell }"
    />
    <rect :x="LEFT" :y="TOP" :width="n * CELL" :height="n * CELL" class="frame" />

    <!-- Track: ballast bed, sleepers, then rails on top -->
    <path :d="trackPath" class="ballast" />
    <path :d="trackPath" class="sleepers" />
    <rect :width="width" :height="height" class="rails" mask="url(#rail-mask)" />

    <!-- Marks: X (no track) and dot (maybe track) -->
    <template v-for="i in cells" :key="`x${i}`">
      <path
        v-if="game.state.marks[i] === 1"
        class="xmark"
        :d="`M${cx(i) - 6} ${cy(i) - 6}L${cx(i) + 6} ${cy(i) + 6}M${cx(i) + 6} ${cy(i) - 6}L${cx(i) - 6} ${cy(i) + 6}`"
      />
      <circle v-else-if="game.state.marks[i] === 2" class="maybe" :cx="cx(i)" :cy="cy(i)" r="4.5" />
    </template>

    <!-- Column counts (top) and row counts (right) -->
    <text
      v-for="(want, c) in game.level.cols"
      :key="`c${c}`"
      :x="LEFT + c * CELL + CELL / 2"
      :y="TOP - 12"
      class="count"
      :class="countClass(game.counts.value.cols[c], want)"
    >{{ want }}</text>
    <text
      v-for="(want, r) in game.level.rows"
      :key="`r${r}`"
      :x="LEFT + n * CELL + RIGHT / 2"
      :y="TOP + r * CELL + CELL / 2 + 6"
      class="count"
      :class="countClass(game.counts.value.rows[r], want)"
    >{{ want }}</text>

    <!-- The cat's ride and the name popup when it arrives -->
    <path v-if="routePath" ref="route" :d="routePath" class="route" />
    <g v-if="ride && cat" :transform="catTransform" class="rider">
      <CatSprite :breed="cat" />
    </g>
    <g v-if="bubble && cat" class="bubble" :style="{ transformOrigin: `${bubbleBox.tail}px ${bubbleBox.y + bubbleBox.h}px` }">
      <path :d="bubbleBox.d" />
      <text :x="bubbleBox.x + bubbleBox.w / 2" :y="bubbleBox.y + 14">
        {{ bubbleText }}<tspan v-if="catIsNew" class="new" dx="6">NEW!</tspan>
      </text>
    </g>

    <!-- Entry and exit labels -->
    <text :x="12" :y="TOP + game.level.a * CELL + CELL / 2 + 5" class="endpoint">A</text>
    <text :x="LEFT + game.level.b * CELL + CELL / 2" :y="TOP + n * CELL + 38" class="endpoint">B</text>
  </svg>
</template>

<style scoped>
.board {
  display: block;
  width: 100%;
  height: auto;
  max-height: 100%;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.cell {
  fill: var(--cell);
  stroke: var(--grid);
  stroke-width: 1;
}
.cell.given {
  fill: var(--given);
}
.cell.flash {
  animation: flash 1.2s ease-out;
}
@keyframes flash {
  0%,
  40% {
    fill: var(--hint);
  }
}
.frame {
  fill: none;
  stroke: var(--frame);
  stroke-width: 2;
}
.ballast,
.sleepers {
  fill: none;
  stroke-linecap: butt;
  pointer-events: none;
}
.ballast {
  stroke: var(--ballast);
  stroke-width: 28;
}
.sleepers {
  stroke: var(--sleeper);
  stroke-width: 26;
  stroke-dasharray: 3.5 6.5;
  stroke-dashoffset: -3;
}
.rails {
  fill: var(--rail);
  pointer-events: none;
  transition: fill 0.4s;
}
.solved .rails {
  fill: var(--accent);
}
.xmark {
  stroke: var(--bad);
  stroke-width: 2.5;
  stroke-linecap: round;
  pointer-events: none;
}
.maybe {
  fill: var(--maybe);
  pointer-events: none;
}
.count {
  font: 600 17px var(--font);
  text-anchor: middle;
  fill: var(--ink);
  transition: fill 0.2s;
}
.count.done {
  fill: var(--ok);
}
.count.over {
  fill: var(--bad);
}
.route {
  fill: none;
  stroke: none;
}
.rider {
  pointer-events: none;
}
.bubble {
  pointer-events: none;
  animation: bubble-pop 0.35s cubic-bezier(0.2, 1.5, 0.4, 1);
}
.bubble path {
  fill: var(--surface);
  stroke: var(--accent);
  stroke-width: 1.5;
  stroke-linejoin: round;
}
.bubble text {
  font: 700 11px var(--font);
  text-anchor: middle;
  fill: var(--ink);
}
.bubble .new {
  fill: var(--accent);
  font-size: 9px;
}
@keyframes bubble-pop {
  from {
    opacity: 0;
    transform: scale(0.4);
  }
}
.endpoint {
  font: 700 15px var(--font);
  text-anchor: middle;
  fill: var(--accent);
}
</style>
