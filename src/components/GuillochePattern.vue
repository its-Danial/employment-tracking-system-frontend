<script setup lang="ts">
import { computed } from 'vue'

/**
 * Fine-line security pattern, like the print on passports and banknotes.
 * The seed (usually the company name) shapes it, so every company gets its own.
 * Strokes use currentColor, set the colour with a text-* class.
 */
const {
  seed,
  variant = 'rosette',
  animate = false,
} = defineProps<{
  seed: string
  variant?: 'rosette' | 'band'
  animate?: boolean
}>()

const SIZE = 600
const BAND_WIDTH = 1200
const BAND_HEIGHT = 40
const STEPS = 720

/** Small seeded random generator (mulberry32), same seed always gives the same pattern */
function createRandom(text: string) {
  let state = [...text].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 2654435761), 7)
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T,>(random: () => number, options: T[]) =>
  options[Math.floor(random() * options.length)]!

const toPath = (points: [number, number][]) =>
  points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + 'Z'

/** Woven rings: each ring is many wavy circles, each one shifted a little, gently swelling */
function rosette(random: () => number) {
  const centre = SIZE / 2
  const rings = [
    { radius: 62, amplitude: 10, lines: 10 },
    { radius: 128, amplitude: 15, lines: 14 },
    { radius: 200, amplitude: 17, lines: 18 },
    { radius: 268, amplitude: 13, lines: 20 },
  ]
  return rings.flatMap(({ radius, amplitude, lines }) => {
    const waves = pick(random, [12, 15, 18, 21, 24])
    const swells = pick(random, [3, 4, 5, 6])
    return Array.from({ length: lines }, (_, line) => {
      const phase = (line / lines) * Math.PI * 2
      const points: [number, number][] = []
      for (let step = 0; step < STEPS; step++) {
        const angle = (step / STEPS) * Math.PI * 2
        const swell = 0.7 + 0.3 * Math.cos(swells * angle)
        const r = radius + amplitude * swell * Math.sin(waves * angle + phase)
        points.push([centre + r * Math.cos(angle), centre + r * Math.sin(angle)])
      }
      return toPath(points)
    })
  })
}

/** Interlaced waves running the full width, for thin strips */
function band(random: () => number) {
  const waves = pick(random, [14, 18, 22])
  const lines = 9
  return Array.from({ length: lines }, (_, line) => {
    const phase = (line / lines) * Math.PI * 2
    const points = Array.from({ length: STEPS / 2 + 1 }, (_, step) => {
      const x = (step / (STEPS / 2)) * BAND_WIDTH
      const angle = (x / BAND_WIDTH) * Math.PI * 2 * waves
      return `${x.toFixed(1)} ${(BAND_HEIGHT / 2 + (BAND_HEIGHT / 2.6) * Math.sin(angle + phase)).toFixed(1)}`
    })
    return `M${points.join('L')}`
  })
}

const paths = computed(() => {
  const random = createRandom(seed || 'ets')
  return variant === 'band' ? band(random) : rosette(random)
})

const viewBox = computed(() =>
  variant === 'band' ? `0 0 ${BAND_WIDTH} ${BAND_HEIGHT}` : `0 0 ${SIZE} ${SIZE}`
)
</script>

<template>
  <svg
    :viewBox
    :preserveAspectRatio="variant === 'band' ? 'none' : 'xMidYMid meet'"
    fill="none"
    stroke="currentColor"
    aria-hidden="true"
    focusable="false"
    :class="['guilloche', { 'guilloche-animate': animate }]"
  >
    <path
      v-for="(path, index) in paths"
      :key="index"
      :d="path"
      pathLength="1"
      :vector-effect="variant === 'band' ? 'non-scaling-stroke' : undefined"
      :style="{ '--delay': `${(index % 40) * 20}ms` }"
    />
  </svg>
</template>

<style scoped>
.guilloche path {
  stroke-width: 0.6;
}

/* The one entrance on the login page: the print draws itself in */
@media (prefers-reduced-motion: no-preference) {
  .guilloche-animate path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: draw 2.4s cubic-bezier(0.65, 0, 0.35, 1) var(--delay) forwards;
  }
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
