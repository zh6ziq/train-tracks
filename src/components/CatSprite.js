// A chunky side-view cat drawn from a breed's traits (see src/data/breeds.js).
// Renders a <g> centred on (0, 0), facing +x, roughly 32 units wide, so it can sit
// inside the board SVG or inside a badge's own <svg viewBox="-22 -25 44 44">.
import { h, computed, defineComponent } from 'vue'

export const COLORS = {
  black: '#2f2e35',
  seal: '#3f2c22',
  brown: '#6f4628',
  chocolate: '#6b4331',
  cinnamon: '#a9663b',
  ruddy: '#bb6e37',
  red: '#e38c3f',
  orange: '#f39a3a',
  golden: '#dcaa5f',
  tan: '#c69d6d',
  fawn: '#dcc3a3',
  cream: '#f3dfba',
  white: '#f8f5ef',
  silver: '#d2d6db',
  grey: '#a3a7ab',
  blue: '#8795a6',
  lilac: '#c3b2ba',
  pink: '#f2c4b6',
}
const EYES = { green: '#7cc24e', gold: '#f2c230', copper: '#e07b2a', blue: '#4aa3e8', aqua: '#4fc9c0', hazel: '#b7a93c' }
const OUT = '#2b2620'
const NOSE = '#e8898a'
const INNER_EAR = '#f0a3a0'
const WHITE = COLORS.white

const BODIES = {
  normal: { rx: 10, ry: 6, leg: 5, lw: 2.6, hr: 7 },
  slim: { rx: 10, ry: 5, leg: 6.5, lw: 2.3, hr: 6.6 },
  cobby: { rx: 9.5, ry: 7, leg: 4, lw: 3, hr: 7.3 },
  large: { rx: 11.5, ry: 7, leg: 5.5, lw: 3, hr: 7.6 },
  dwarf: { rx: 10, ry: 6, leg: 2.2, lw: 2.8, hr: 7 },
  small: { rx: 8.5, ry: 5, leg: 4.5, lw: 2.3, hr: 6.2 },
}

const SPOTS = [
  [-0.62, -0.3], [-0.22, -0.52], [0.22, -0.4], [0.6, -0.18], [-0.45, 0.22], [0.02, 0.05], [0.42, 0.3], [-0.85, 0.05],
]
const SPECKLES = [
  [-0.7, -0.4], [-0.5, 0.1], [-0.3, -0.6], [-0.1, -0.1], [0.1, 0.35], [0.25, -0.45], [0.45, 0.05], [0.65, -0.3],
  [-0.85, 0.2], [-0.2, 0.45], [0.8, 0.15], [0.05, -0.75],
]

let seq = 0

function darken(hex, amount) {
  const n = parseInt(hex.slice(1), 16)
  const f = (v) => Math.round(v * (1 - amount))
  const r = f(n >> 16)
  const g = f((n >> 8) & 255)
  const b = f(n & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

const ellipseD = (cx, cy, rx, ry) =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`

// Ellipse with a bumpy edge, for fluffy or wavy fur.
function fluffD(cx, cy, rx, ry, n, bump) {
  const pt = (a, grow) => [cx + (rx + grow) * Math.cos(a), cy + (ry + grow) * Math.sin(a)]
  let d = ''
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI * 2
    const [x, y] = pt(a, 0)
    if (k === 0) {
      d += `M${x} ${y}`
      continue
    }
    const [qx, qy] = pt(a - Math.PI / n, bump * 2)
    d += `Q${qx} ${qy} ${x} ${y}`
  }
  return d + 'Z'
}

function earD(style, x, by, s, k) {
  // s = -1 for the left ear, +1 for the right; "outer" is the side away from the face centre.
  const w = { small: 2.3, large: 3.5 }[style] ?? 2.8
  const tall = { small: 3.6, large: 8, tufted: 6.5 }[style] ?? 5.5
  const inner = [x - s * w * k, by + 1.5 * k]
  const outer = [x + s * w * k, by + 1.5 * k]
  if (style === 'fold') {
    return `M${inner[0]} ${inner[1]}Q${x - s * 0.5 * k} ${by - 3.2 * k} ${x + s * 3 * k} ${by - 1.2 * k}L${x + s * 1.6 * k} ${by + 1.6 * k}Z`
  }
  if (style === 'curl') {
    return (
      `M${inner[0]} ${inner[1]}Q${x - s * 1.2 * k} ${by - 6 * k} ${x + s * 1.8 * k} ${by - 6.4 * k}` +
      `Q${x + s * 4.2 * k} ${by - 5.6 * k} ${x + s * 3.6 * k} ${by - 3.6 * k}` +
      `Q${x + s * 2 * k} ${by - 4.2 * k} ${outer[0]} ${outer[1]}Z`
    )
  }
  const tip = [x + s * 1.1 * k, by - tall * k]
  return `M${inner[0]} ${inner[1]}L${tip[0]} ${tip[1]}L${outer[0]} ${outer[1]}Z`
}

function innerEarD(style, x, by, s, k) {
  if (style === 'fold' || style === 'curl') return null
  const w = ({ small: 2.3, large: 3.5 }[style] ?? 2.8) * 0.5
  const tall = ({ small: 3.6, large: 8, tufted: 6.5 }[style] ?? 5.5) * 0.6
  return `M${x - s * w * k} ${by + 0.8 * k}L${x + s * 0.7 * k} ${by - tall * k}L${x + s * w * k} ${by + 0.8 * k}Z`
}

export default defineComponent({
  name: 'CatSprite',
  props: {
    breed: { type: Object, required: true },
  },
  setup(props) {
    const uid = `cat${++seq}`

    const shape = computed(() => {
      const t = props.breed
      const B = BODIES[t.body] || BODIES.normal
      const coat = COLORS[t.coat] || COLORS.grey
      const accent = COLORS[t.accent] || darken(coat, 0.45)
      const accent2 = COLORS[t.accent2] || COLORS.black
      const p = t.pattern
      const points = p === 'colorpoint' || p === 'mitted'
      const hairless = t.fur === 'hairless'

      const cx = -2
      const cy = 2
      const { rx, ry, leg, lw, hr } = B
      const hx = cx + rx - 1.5
      const hy = cy - ry - 1.5
      const k = hr / 7

      const bodyD =
        t.fur === 'long'
          ? fluffD(cx, cy, rx, ry, 16, 0.9)
          : t.fur === 'semi'
            ? fluffD(cx, cy, rx, ry, 14, 0.45)
            : t.fur === 'rex' || t.fur === 'wire'
              ? fluffD(cx, cy, rx, ry, 22, 0.35)
              : ellipseD(cx, cy, rx, ry)

      let headD
      if (t.face === 'flat') headD = ellipseD(hx, hy, hr * 1.1, hr * 0.92)
      else if (t.face === 'wedge')
        headD =
          `M${hx - hr} ${hy - hr * 0.5}Q${hx} ${hy - hr * 1.2} ${hx + hr} ${hy - hr * 0.5}` +
          `Q${hx + hr * 0.6} ${hy + hr * 0.62} ${hx} ${hy + hr * 1.05}Q${hx - hr * 0.6} ${hy + hr * 0.62} ${hx - hr} ${hy - hr * 0.5}Z`
      else headD = ellipseD(hx, hy, hr, hr)

      // Colours of each part.
      const legColor = points ? accent : p === 'bicolor' || p === 'calico' ? WHITE : coat
      const tailColor = points || p === 'van' || p === 'calico' ? accent : coat
      const earColor = points || p === 'van' ? accent : coat
      const whitePaws = p === 'mitted' || p === 'bicolor'

      // Tail
      const bx = cx - rx + 1.5
      const by = cy - 1
      let tailD = null
      let tailW = { semi: 3.4, long: 4.2, hairless: 1.8 }[t.fur] ?? 2.6
      if (t.tail === 'plume') tailW = 5
      if (t.tail === 'full' || t.tail === 'plume')
        tailD = `M${bx} ${by}C${bx - 5} ${by - 1} ${bx - 7} ${by - 7} ${bx - 4} ${by - 11}`
      else if (t.tail === 'bob') {
        tailD = `M${bx} ${by}Q${bx - 3} ${by - 1} ${bx - 3.4} ${by - 3.2}`
        tailW += 1
      }
      const tailRings = ['tabby', 'classic', 'spotted', 'rosette'].includes(p) || p === 'tortie'

      // Legs: two far (darker, drawn first) and two near.
      const top = cy + ry - 3
      const legs = [
        { x: cx - rx + 6, far: true },
        { x: cx + rx - 2.5, far: true },
        { x: cx - rx + 3.5, far: false },
        { x: cx + rx - 5, far: false },
      ].map(({ x, far }) => ({
        x: x - lw / 2,
        y: top,
        w: lw,
        h: leg + 3,
        fill: far ? darken(legColor, 0.18) : legColor,
      }))

      return { t, coat, accent, accent2, p, hairless, cx, cy, rx, ry, hx, hy, hr, k, bodyD, headD, legColor, tailColor, earColor, whitePaws, tailD, tailW, tailRings, legs, lw, leg }
    })

    return () => {
      const s = shape.value
      const { t, coat, accent, accent2, p, cx, cy, rx, ry, hx, hy, hr, k } = s
      const kids = []
      const stroke = { stroke: OUT, 'stroke-width': 0.9, 'stroke-linejoin': 'round' }

      // Clip paths so patterns stay inside the body and head.
      kids.push(
        h('defs', [
          h('clipPath', { id: `${uid}-body` }, [h('path', { d: s.bodyD })]),
          h('clipPath', { id: `${uid}-head` }, [h('path', { d: s.headD })]),
        ]),
      )

      // Tail
      if (s.tailD) {
        kids.push(h('path', { d: s.tailD, fill: 'none', stroke: OUT, 'stroke-width': s.tailW + 1.8, 'stroke-linecap': 'round' }))
        kids.push(h('path', { d: s.tailD, fill: 'none', stroke: s.tailColor, 'stroke-width': s.tailW, 'stroke-linecap': 'round' }))
        if (s.tailRings)
          kids.push(
            h('path', {
              d: s.tailD,
              fill: 'none',
              stroke: accent,
              'stroke-width': s.tailW,
              'stroke-dasharray': p === 'tortie' ? '4 3' : '1.6 1.9',
            }),
          )
        if (p === 'ticked' || p === 'shaded')
          kids.push(h('path', { d: s.tailD, fill: 'none', stroke: accent, 'stroke-width': s.tailW, 'stroke-dasharray': '0 13 6', 'stroke-linecap': 'round' }))
      }

      // Legs and paws
      for (const l of s.legs) {
        kids.push(h('rect', { x: l.x, y: l.y, width: l.w, height: l.h, rx: l.w / 2, fill: l.fill, ...stroke }))
        if (s.whitePaws)
          kids.push(h('rect', { x: l.x, y: l.y + l.h - 2, width: l.w, height: 2, rx: 1, fill: WHITE, ...stroke }))
      }

      // Body
      kids.push(h('path', { d: s.bodyD, fill: coat, ...stroke }))
      const body = []
      const at = (fx, fy) => [cx + fx * rx, cy + fy * ry]
      if (p === 'tabby') {
        for (let i = 0; i < 5; i++) {
          const x = cx - rx * 0.72 + i * rx * 0.36
          body.push(h('path', { d: `M${x} ${cy - ry - 1}q1.6 ${ry * 0.6} -0.4 ${ry * 1.35}`, fill: 'none', stroke: accent, 'stroke-width': 1.5, 'stroke-linecap': 'round' }))
        }
      } else if (p === 'classic') {
        body.push(h('path', { d: `M${cx - rx} ${cy - ry + 1.5}Q${cx} ${cy - ry - 0.5} ${cx + rx} ${cy - ry + 1.5}`, fill: 'none', stroke: accent, 'stroke-width': 2.4 }))
        body.push(h('ellipse', { cx: cx - 1, cy: cy + 0.8, rx: rx * 0.42, ry: ry * 0.5, fill: 'none', stroke: accent, 'stroke-width': 1.7 }))
        body.push(h('ellipse', { cx: cx - 1, cy: cy + 0.8, rx: 1.5, ry: 1.1, fill: accent }))
      } else if (p === 'spotted') {
        for (const [fx, fy] of SPOTS) {
          const [x, y] = at(fx, fy)
          body.push(h('ellipse', { cx: x, cy: y, rx: 1.4, ry: 1.1, fill: accent }))
        }
      } else if (p === 'rosette') {
        for (const [fx, fy] of SPOTS) {
          const [x, y] = at(fx, fy)
          body.push(h('ellipse', { cx: x, cy: y, rx: 1.9, ry: 1.5, fill: darken(coat, 0.2), stroke: accent, 'stroke-width': 0.9 }))
        }
      } else if (p === 'ticked' || p === 'shaded') {
        body.push(h('ellipse', { cx, cy: cy - ry * 0.95, rx: rx * 1.1, ry: ry * 0.8, fill: accent, opacity: p === 'shaded' ? 0.4 : 0.3 }))
        body.push(h('ellipse', { cx: cx + 1, cy: cy + ry * 0.9, rx: rx * 0.8, ry: ry * 0.5, fill: WHITE, opacity: 0.45 }))
      } else if (p === 'roan') {
        for (const [fx, fy] of SPECKLES) {
          const [x, y] = at(fx, fy)
          body.push(h('circle', { cx: x, cy: y, r: 0.55, fill: accent, opacity: 0.75 }))
        }
      } else if (p === 'colorpoint' || p === 'mitted') {
        body.push(h('ellipse', { cx, cy: cy - ry, rx: rx * 1.1, ry: ry * 0.7, fill: accent, opacity: 0.18 }))
        if (p === 'mitted') body.push(h('ellipse', { cx: cx + rx * 0.35, cy: cy + ry * 0.85, rx: rx * 0.75, ry: ry * 0.5, fill: WHITE }))
      } else if (p === 'bicolor') {
        body.push(h('ellipse', { cx: cx + 1, cy: cy + ry * 0.85, rx: rx * 0.9, ry: ry * 0.7, fill: WHITE }))
      } else if (p === 'van') {
        body.push(h('ellipse', { cx: cx - rx * 0.3, cy: cy - ry * 0.55, rx: 2.4, ry: 1.6, fill: accent }))
      } else if (p === 'tortie') {
        body.push(h('ellipse', { cx: cx - rx * 0.45, cy: cy - ry * 0.3, rx: rx * 0.32, ry: ry * 0.6, fill: accent }))
        body.push(h('ellipse', { cx: cx + rx * 0.35, cy: cy + ry * 0.35, rx: rx * 0.3, ry: ry * 0.45, fill: accent }))
        body.push(h('ellipse', { cx: cx + rx * 0.1, cy: cy - ry * 0.75, rx: rx * 0.18, ry: ry * 0.3, fill: accent }))
      } else if (p === 'calico') {
        body.push(h('ellipse', { cx: cx - rx * 0.4, cy: cy - ry * 0.55, rx: rx * 0.38, ry: ry * 0.55, fill: accent }))
        body.push(h('ellipse', { cx: cx + rx * 0.3, cy: cy - ry * 0.6, rx: rx * 0.3, ry: ry * 0.45, fill: accent2 }))
      }
      if (t.fur === 'hairless') {
        for (const [fx, fy] of [[-0.35, -0.4], [0.05, -0.5], [0.4, -0.35]])
          body.push(h('path', { d: `M${cx + fx * rx - 1.6} ${cy + fy * ry}q1.6 -1.1 3.2 0`, fill: 'none', stroke: darken(coat, 0.3), 'stroke-width': 0.6, 'stroke-linecap': 'round' }))
      }
      if (t.fur === 'rex' || t.fur === 'wire') {
        for (const [fx, fy] of [[-0.55, -0.1], [-0.1, 0.25], [0.3, -0.2], [0.6, 0.3]])
          body.push(h('path', { d: `M${cx + fx * rx} ${cy + fy * ry}a1 1 0 1 1 1.2 1.1`, fill: 'none', stroke: darken(coat, 0.25), 'stroke-width': 0.6, 'stroke-linecap': 'round' }))
      }
      if (body.length) kids.push(h('g', { 'clip-path': `url(#${uid}-body)` }, body))
      kids.push(h('path', { d: s.bodyD, fill: 'none', ...stroke }))

      // Chest ruff for fluffy breeds
      if (t.fur === 'long' || t.fur === 'semi') {
        const big = t.fur === 'long' ? 1.25 : 1.1
        const ruffColor = p === 'bicolor' || p === 'mitted' || p === 'calico' ? WHITE : coat
        kids.push(h('path', { d: fluffD(hx - 0.5, hy + hr * 0.35, hr * big, hr * big * 0.9, 14, t.fur === 'long' ? 1 : 0.6), fill: ruffColor, ...stroke }))
      }

      // Ears (behind the head)
      const earBy = hy - hr * 0.55
      for (const sgn of [-1, 1]) {
        const ex = hx + sgn * hr * 0.55
        const color = p === 'tortie' && sgn < 0 ? accent : p === 'calico' ? (sgn < 0 ? accent : accent2) : s.earColor
        kids.push(h('path', { d: earD(t.ears, ex, earBy, sgn, k), fill: color, ...stroke }))
        const inner = innerEarD(t.ears, ex, earBy, sgn, k)
        if (inner) kids.push(h('path', { d: inner, fill: INNER_EAR }))
        if (t.ears === 'tufted') {
          const tipX = ex + sgn * 1.1 * k
          const tipY = earBy - 6.5 * k
          kids.push(h('path', { d: `M${tipX} ${tipY}l${sgn * 0.6} -2.6`, stroke: OUT, 'stroke-width': 0.9, 'stroke-linecap': 'round' }))
        }
      }

      // Head
      kids.push(h('path', { d: s.headD, fill: coat, ...stroke }))
      const head = []
      const mLines = () => {
        for (const dx of [-1.6, 0, 1.6])
          head.push(h('path', { d: `M${hx + dx * k} ${hy - hr * 1.05}l0 ${hr * 0.5}`, stroke: accent, 'stroke-width': 1, 'stroke-linecap': 'round', opacity: p === 'ticked' ? 0.55 : 1 }))
      }
      if (p === 'tabby' || p === 'classic' || p === 'ticked') {
        mLines()
        for (const sgn of [-1, 1])
          head.push(h('path', { d: `M${hx + sgn * hr} ${hy + hr * 0.15}l${-sgn * hr * 0.32} 0.3`, stroke: accent, 'stroke-width': 0.9, 'stroke-linecap': 'round' }))
      } else if (p === 'spotted' || p === 'rosette') {
        mLines()
      } else if (p === 'shaded') {
        head.push(h('ellipse', { cx: hx, cy: hy - hr, rx: hr, ry: hr * 0.55, fill: accent, opacity: 0.35 }))
      } else if (p === 'roan') {
        head.push(h('ellipse', { cx: hx, cy: hy + hr * 0.2, rx: hr * 0.72, ry: hr * 0.55, fill: '#8e8a86' }))
      } else if (p === 'colorpoint' || p === 'mitted') {
        head.push(h('ellipse', { cx: hx, cy: hy + hr * 0.35, rx: hr * 0.78, ry: hr * 0.78, fill: accent, opacity: 0.92 }))
        if (p === 'mitted') head.push(h('ellipse', { cx: hx, cy: hy + hr * 1.05, rx: hr * 0.5, ry: hr * 0.3, fill: WHITE }))
      } else if (p === 'bicolor') {
        head.push(h('path', { d: `M${hx - hr * 0.95} ${hy + hr * 1.1}L${hx - hr * 0.15} ${hy - hr * 0.3}L${hx + hr * 0.15} ${hy - hr * 0.3}L${hx + hr * 0.95} ${hy + hr * 1.1}Z`, fill: WHITE }))
      } else if (p === 'van') {
        head.push(h('ellipse', { cx: hx, cy: hy - hr * 0.95, rx: hr, ry: hr * 0.6, fill: accent }))
        head.push(h('rect', { x: hx - 0.7 * k, y: hy - hr * 1.6, width: 1.4 * k, height: hr, fill: WHITE }))
      } else if (p === 'tortie') {
        head.push(h('ellipse', { cx: hx - hr * 0.55, cy: hy - hr * 0.3, rx: hr * 0.6, ry: hr * 0.75, fill: accent }))
      } else if (p === 'calico') {
        head.push(h('ellipse', { cx: hx - hr * 0.6, cy: hy - hr * 0.6, rx: hr * 0.6, ry: hr * 0.55, fill: accent }))
        head.push(h('ellipse', { cx: hx + hr * 0.65, cy: hy - hr * 0.6, rx: hr * 0.5, ry: hr * 0.5, fill: accent2 }))
      }
      if (t.fur === 'hairless')
        head.push(h('path', { d: `M${hx - 1.8 * k} ${hy - hr * 0.62}q1.8 -0.9 3.6 0`, fill: 'none', stroke: darken(coat, 0.3), 'stroke-width': 0.6, 'stroke-linecap': 'round' }))
      if (head.length) kids.push(h('g', { 'clip-path': `url(#${uid}-head)` }, head))
      kids.push(h('path', { d: s.headD, fill: 'none', ...stroke }))

      // Face
      const flat = t.face === 'flat'
      const er = (flat ? 1.95 : t.face === 'wedge' ? 1.45 : 1.7) * k
      const ey = hy - 0.3 * k
      for (const sgn of [-1, 1]) {
        const ex = hx + sgn * 2.6 * k
        const eyeColor = t.eyes === 'odd' ? (sgn < 0 ? EYES.blue : EYES.gold) : EYES[t.eyes] || EYES.green
        kids.push(h('ellipse', { cx: ex, cy: ey, rx: er, ry: t.face === 'wedge' ? er * 0.8 : er, fill: eyeColor, stroke: OUT, 'stroke-width': 0.5 }))
        kids.push(h('ellipse', { cx: ex, cy: ey, rx: 0.5 * k, ry: er * 0.75, fill: OUT }))
        kids.push(h('circle', { cx: ex + 0.45 * k, cy: ey - 0.55 * k, r: 0.38 * k, fill: '#fff' }))
      }
      const ny = hy + (flat ? 1.5 : 2.1) * k
      const nw = (flat ? 0.75 : 1) * k
      kids.push(h('path', { d: `M${hx - nw} ${ny}L${hx + nw} ${ny}L${hx} ${ny + nw}Z`, fill: NOSE, stroke: OUT, 'stroke-width': 0.4, 'stroke-linejoin': 'round' }))
      kids.push(
        h('path', {
          d: `M${hx} ${ny + nw}q-0.8 0.95 -1.7 0.3M${hx} ${ny + nw}q0.8 0.95 1.7 0.3`,
          fill: 'none',
          stroke: OUT,
          'stroke-width': 0.5,
          'stroke-linecap': 'round',
        }),
      )
      if (!s.hairless)
        kids.push(
          h('path', {
            d: `M${hx - 2.6 * k} ${ny + 0.6}l-5 -0.8M${hx - 2.6 * k} ${ny + 1.2}l-5 0.6M${hx + 2.6 * k} ${ny + 0.6}l5 -0.8M${hx + 2.6 * k} ${ny + 1.2}l5 0.6`,
            stroke: OUT,
            'stroke-width': 0.35,
            opacity: 0.55,
          }),
        )

      return h('g', { class: 'cat-sprite' }, kids)
    }
  },
})
