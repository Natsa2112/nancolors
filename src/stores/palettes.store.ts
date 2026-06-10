import { computed } from 'nanostores'
import { $hex } from './color.store'
import { generateHarmony } from '../lib/color/harmonies'
import type { HarmonyType, Palettes } from '../lib/types'

export const $currentHarmony = $hex

export const $palettes = computed($hex, (hex): Palettes => {
  const types: HarmonyType[] = [
    'complementary',
    'analogous',
    'triadic',
    'monochromatic',
    'splitComplementary',
    'tetradic',
  ]

  const result: Palettes = {
    complementary: [],
    analogous: [],
    triadic: [],
    monochromatic: [],
    splitComplementary: [],
    tetradic: [],
  }

  for (const type of types) {
    const colors = generateHarmony(hex, type)
    result[type] = colors.filter((c): c is string => c !== null)
  }

  return result
})
