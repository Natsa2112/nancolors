import { computed } from 'nanostores'
import { $semantic } from './semantic.store'
import { scoreContrast } from '../lib/color/contrast'
import type { ContrastInfo, SemanticRoles } from '../lib/types'

const PAIRS: { label: string; fg: keyof SemanticRoles; bg: keyof SemanticRoles }[] = [
  { label: 'Texto sobre fondo', fg: 'text', bg: 'background' },
  { label: 'Texto sobre surface', fg: 'text', bg: 'surface' },
  { label: 'Texto sobre card', fg: 'text', bg: 'card' },
  { label: 'Botón texto', fg: 'text', bg: 'button' },
  { label: 'Link sobre fondo', fg: 'link', bg: 'background' },
]

export const $contrast = computed($semantic, (semantic): ContrastInfo => {
  const scores = PAIRS.map(({ label, fg, bg }) => {
    const fgColor = semantic[fg]
    const bgColor = semantic[bg]
    return scoreContrast(label, fgColor, bgColor)
  }).filter((s): s is ContrastInfo['scores'][number] => s !== null)

  const aaLarge = scores.length > 0 && scores.every((s) => s.aaLarge)
  const aaNormal = scores.length > 0 && scores.every((s) => s.aaNormal)
  const aaaLarge = scores.length > 0 && scores.every((s) => s.aaaLarge)
  const aaaNormal = scores.length > 0 && scores.every((s) => s.aaaNormal)

  return { aaLarge, aaNormal, aaaLarge, aaaNormal, scores }
})
