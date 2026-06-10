export const WCAG_THRESHOLDS = {
  AA_LARGE: 3,
  AA_NORMAL: 4.5,
  AAA_LARGE: 4.5,
  AAA_NORMAL: 7,
} as const

export const DEFAULT_COLOR = '#ff6b35'

export const DEFAULT_RGB = { r: 255, g: 107, b: 53 } as const
export const DEFAULT_HSL = { h: 16, s: 100, l: 60 } as const
export const DEFAULT_OKLCH = { l: 0.65, c: 0.18, h: 40 } as const

export const COLOR_FORMATS = ['hex', 'rgb', 'hsl', 'oklch'] as const

export const HARMONY_TYPES = [
  'complementary',
  'analogous',
  'triadic',
  'monochromatic',
  'splitComplementary',
  'tetradic',
] as const

export const EXPORT_FORMATS = ['css', 'tailwind', 'json', 'svg'] as const

export const HARMONY_COLORS_COUNT: Record<string, number> = {
  complementary: 2,
  analogous: 3,
  triadic: 3,
  monochromatic: 5,
  splitComplementary: 3,
  tetradic: 4,
}
