// Generates puzzles into src/data/levels.json.
//
//   npm run levels          -> 300 levels (100 each of 6×6, 8×8, 10×10)
//   npm run levels -- 30    -> 30 levels (quick test)
//
// Each puzzle: draw a random track from A to B, write down the row/column counts,
// then keep revealing pieces of the real track until the solver finds exactly one answer.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { N, E, S, W, DIRS, lineCounts, isSolved, encodeMasks } from '../src/game/rules.js'
import { solve } from './solver.js'

const PACKS = [
  { name: 'Easy', n: 6, minLen: 12, maxLen: 22 },
  { name: 'Medium', n: 8, minLen: 22, maxLen: 38 },
  { name: 'Hard', n: 10, minLen: 34, maxLen: 58 },
]

const total = Number(process.argv[2]) || 300
const perPack = Math.ceil(total / PACKS.length)

// Seeded random numbers so the same command always produces the same levels.
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20260927)
const randInt = (k) => Math.floor(rng() * k)
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Random self-avoiding walk from the left edge to the bottom edge.
function randomPath(n, minLen, maxLen) {
  for (;;) {
    const start = randInt(n)
    const path = [[start, 0]]
    const used = new Set([start * n])
    let steps = 0

    const walk = () => {
      if (++steps > 5000) return false
      const [r, c] = path[path.length - 1]
      if (r === n - 1 && path.length >= minLen && rng() < 0.5) return true
      if (path.length >= maxLen) return false
      for (const d of shuffle(DIRS.slice())) {
        const nr = r + d.dr
        const nc = c + d.dc
        if (nr < 0 || nr >= n || nc < 0 || nc >= n || used.has(nr * n + nc)) continue
        path.push([nr, nc])
        used.add(nr * n + nc)
        if (walk()) return true
        path.pop()
        used.delete(nr * n + nc)
      }
      return false
    }
    if (walk()) return path
  }
}

function pathToMasks(n, path) {
  const masks = new Array(n * n).fill(0)
  masks[path[0][0] * n] |= W
  const [lr, lc] = path[path.length - 1]
  masks[lr * n + lc] |= S
  for (let k = 1; k < path.length; k++) {
    const [r1, c1] = path[k - 1]
    const [r2, c2] = path[k]
    const d = DIRS.find((d) => d.dr === r2 - r1 && d.dc === c2 - c1)
    masks[r1 * n + c1] |= d.bit
    masks[r2 * n + c2] |= d.opp
  }
  return masks
}

function makePuzzle(pack) {
  const { n } = pack
  const path = randomPath(n, pack.minLen, pack.maxLen)
  const truth = pathToMasks(n, path)
  const { rows, cols } = lineCounts(n, truth)
  const level = { n, rows, cols, a: path[0][0], b: path[path.length - 1][1], givens: [] }

  const trackCells = path.map(([r, c]) => r * n + c)
  const isGiven = (i) => level.givens.some(([g]) => g === i)
  const reveal = (i) => level.givens.push([i, truth[i]])

  // Every puzzle starts with at least one visible piece.
  reveal(trackCells[1 + randInt(trackCells.length - 2)])

  for (;;) {
    const { solutions, aborted } = solve(level)
    if (!aborted && solutions.length === 1) break
    // Reveal a real piece where another answer disagrees, so that answer is ruled out.
    const other = solutions.find((s) => s.some((m, i) => m !== truth[i]))
    let choices = trackCells.filter((i) => !isGiven(i) && (!other || other[i] !== truth[i]))
    if (!choices.length) choices = trackCells.filter((i) => !isGiven(i))
    reveal(choices[randInt(choices.length)])
  }

  if (!isSolved(level, truth)) throw new Error('generator produced an invalid track')
  level.givens.sort((x, y) => x[0] - y[0])
  level.sol = encodeMasks(truth)
  return level
}

const levels = []
for (const pack of PACKS) {
  const started = Date.now()
  const batch = []
  for (let k = 0; k < perPack; k++) {
    const p = makePuzzle(pack)
    batch.push({ ...p, _score: p.givens.length / p.sol.replace(/0/g, '').length })
    process.stdout.write(`\r${pack.name}: ${k + 1}/${perPack}`)
  }
  // More revealed pieces = easier, so those come first.
  batch.sort((x, y) => y._score - x._score)
  batch.forEach(({ _score, ...p }, k) => levels.push({ id: `${pack.name.toLowerCase()}-${k + 1}`, pack: pack.name, ...p }))
  console.log(`  (${((Date.now() - started) / 1000).toFixed(1)}s)`)
}

const out = fileURLToPath(new URL('../src/data/levels.json', import.meta.url))
writeFileSync(out, JSON.stringify(levels))
console.log(`Wrote ${levels.length} levels to src/data/levels.json`)
