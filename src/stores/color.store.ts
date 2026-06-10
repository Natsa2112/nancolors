import { atom, computed } from 'nanostores'
import type { RGB, HSL, OKLCH, Palettes, SemanticRoles, ContrastInfo, ColorState } from '../lib/types'
import { DEFAULT_COLOR, DEFAULT_RGB, DEFAULT_HSL, DEFAULT_OKLCH } from '../lib/constants'
import {
  hexToRgb,
  rgbToHsl,
  rgbToOklch,
  normalizeHex,
  isValidHex,
} from '../lib/color/convert'
import { relativeLuminance } from '../lib/color/luminance'

export const $hex = atom<string>(DEFAULT_COLOR)

export const $rgb = atom<RGB>(DEFAULT_RGB)
export const $hsl = atom<HSL>(DEFAULT_HSL)
export const $oklch = atom<OKLCH>(DEFAULT_OKLCH)
export const $luminance = atom<number | null>(null)

export const $palettes = atom<Palettes>({
  complementary: [],
  analogous: [],
  triadic: [],
  monochromatic: [],
  splitComplementary: [],
  tetradic: [],
})

export const $semantic = atom<SemanticRoles>({
  secondary: '',
  tertiary: '',
  background: '',
  surface: '',
  card: '',
  button: '',
  buttonHover: '',
  text: '',
  link: '',
  success: '',
  warning: '',
  error: '',
})

export const $contrast = atom<ContrastInfo>({
  aaLarge: false,
  aaNormal: false,
  aaaLarge: false,
  aaaNormal: false,
  scores: [],
})

export const $activeTab = atom<string>('palettes')
export const $error = atom<string | null>(null)
export const $isGenerating = atom<boolean>(false)

export const $colorState = computed(
  [$hex, $rgb, $hsl, $oklch, $luminance, $palettes, $semantic, $contrast, $activeTab, $error, $isGenerating],
  (hex, rgb, hsl, oklch, luminance, palettes, semantic, contrast, activeTab, error, isGenerating): ColorState => ({
    hex,
    rgb,
    hsl,
    oklch,
    luminance: luminance ?? 0,
    palettes,
    semantic,
    contrast,
    activeTab,
    isGenerating,
    error,
  })
)

export function setHex(hex: string): void {
  const normalized = normalizeHex(hex)

  if (!isValidHex(normalized)) {
    $error.set(`Color inválido: "${hex}"`)
    return
  }

  $hex.set(normalized)
  $error.set(null)

  const rgb = hexToRgb(normalized)
  if (!rgb) {
    $error.set(`No se pudo convertir: "${hex}"`)
    return
  }
  $rgb.set(rgb)

  const hsl = rgbToHsl(rgb)
  $hsl.set(hsl)

  const oklch = rgbToOklch(rgb)
  $oklch.set(oklch)

  const luminance = relativeLuminance(normalized)
  $luminance.set(luminance)
}
