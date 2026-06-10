import { atom } from 'nanostores'
import type { RGB, HSL, OKLCH } from '../lib/types'
import { DEFAULT_COLOR, DEFAULT_RGB, DEFAULT_HSL, DEFAULT_OKLCH } from '../lib/constants'
import { hexToRgb, rgbToHsl, rgbToOklch, normalizeHex, isValidHex } from '../lib/color/convert'
import { relativeLuminance } from '../lib/color/luminance'

export const $hex = atom<string>(DEFAULT_COLOR)
export const $rgb = atom<RGB>(DEFAULT_RGB)
export const $hsl = atom<HSL>(DEFAULT_HSL)
export const $oklch = atom<OKLCH>(DEFAULT_OKLCH)
export const $luminance = atom<number | null>(null)
export const $error = atom<string | null>(null)

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
