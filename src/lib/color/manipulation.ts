import { parseHex, convertRgbToHsl, convertHslToRgb } from 'culori/fn'
import type { RGB, HSL } from '../types'
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from './convert'

export function lighten(hex: string, amount: number): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const hsl = rgbToHsl(rgb)
  hsl.l = Math.min(100, hsl.l + amount)
  return rgbToHex(hslToRgb(hsl))
}

export function darken(hex: string, amount: number): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const hsl = rgbToHsl(rgb)
  hsl.l = Math.max(0, hsl.l - amount)
  return rgbToHex(hslToRgb(hsl))
}

export function saturate(hex: string, amount: number): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const hsl = rgbToHsl(rgb)
  hsl.s = Math.min(100, hsl.s + amount)
  return rgbToHex(hslToRgb(hsl))
}

export function desaturate(hex: string, amount: number): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const hsl = rgbToHsl(rgb)
  hsl.s = Math.max(0, hsl.s - amount)
  return rgbToHex(hslToRgb(hsl))
}

export function adjustHue(hex: string, degrees: number): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const hsl = rgbToHsl(rgb)
  hsl.h = ((hsl.h + degrees) % 360 + 360) % 360
  return rgbToHex(hslToRgb(hsl))
}

export function mix(hex1: string, hex2: string, weight = 0.5): string | null {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  if (!rgb1 || !rgb2) return null
  const t = Math.max(0, Math.min(1, weight))
  const result: RGB = {
    r: Math.round(rgb1.r + (rgb2.r - rgb1.r) * t),
    g: Math.round(rgb1.g + (rgb2.g - rgb1.g) * t),
    b: Math.round(rgb1.b + (rgb2.b - rgb1.b) * t),
  }
  return rgbToHex(result)
}
