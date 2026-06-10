import { computed } from 'nanostores'
import { $hex } from './color.store'
import { generateSemantic } from '../lib/color/semantic'
import type { SemanticRoles } from '../lib/types'

export const $semantic = computed($hex, (hex): SemanticRoles => {
  const result = generateSemantic(hex)
  if (!result) {
    return {
      secondary: '#000000',
      tertiary: '#000000',
      background: '#ffffff',
      surface: '#f5f5f5',
      card: '#ffffff',
      button: '#000000',
      buttonHover: '#333333',
      text: '#000000',
      link: '#0000ff',
      success: '#22C55E',
      warning: '#F97316',
      error: '#EF4444',
    }
  }
  return result
})
