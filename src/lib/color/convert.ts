import {
  parseHex,
  convertRgbToHsl,
  convertHslToRgb,
  convertRgbToOklab,
  convertOklabToRgb,
} from 'culori/fn'
import type { RGB, HSL, OKLCH } from '../types'

function to255(v: number): number {
  return Math.round(v * 255)
}

function from255(v: number): number {
  return v / 255
}

function toDeg(v: number): number {
  return ((v % 360) + 360) % 360
}

function toPercent(v: number): number {
  return v * 100
}

function fromPercent(v: number): number {
  return v / 100
}

export function hexToRgb(hex: string): RGB | null {
  const c = parseHex(hex)
  if (!c) return null
  return { r: to255(c.r), g: to255(c.g), b: to255(c.b) }
}

export function rgbToHex(rgb: RGB): string {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const hex = (
    (1 << 24) |
    (Math.round(r * 255) << 16) |
    (Math.round(g * 255) << 8) |
    Math.round(b * 255)
  )
    .toString(16)
    .slice(1)
  return `#${hex}`
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = from255(rgb.r)
  const g = from255(rgb.g)
  const b = from255(rgb.b)
  const result = convertRgbToHsl({ r, g, b, mode: 'rgb' })
  return {
    h: toDeg(result.h),
    s: toPercent(result.s),
    l: toPercent(result.l),
  }
}

export function hslToRgb(hsl: HSL): RGB {
  const result = convertHslToRgb({
    h: toDeg(hsl.h),
    s: fromPercent(hsl.s),
    l: fromPercent(hsl.l),
    mode: 'hsl',
  })
  return { r: to255(result.r), g: to255(result.g), b: to255(result.b) }
}

export function rgbToOklch(rgb: RGB): OKLCH {
  const r = from255(rgb.r)
  const g = from255(rgb.g)
  const b = from255(rgb.b)
  const lab = convertRgbToOklab({ r, g, b, mode: 'rgb' })
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b)
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI
  h = toDeg(h)
  return { l: lab.l, c, h }
}

export function oklchToRgb(oklch: OKLCH): RGB {
  const a = oklch.c * Math.cos((oklch.h * Math.PI) / 180)
  const b = oklch.c * Math.sin((oklch.h * Math.PI) / 180)
  const result = convertOklabToRgb({ l: oklch.l, a, b, mode: 'oklab' })
  return { r: to255(result.r), g: to255(result.g), b: to255(result.b) }
}

export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHsl(rgb)
}

export function hexToOklch(hex: string): OKLCH | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToOklch(rgb)
}

export function hslToHex(hsl: HSL): string {
  const rgb = hslToRgb(hsl)
  return rgbToHex(rgb)
}

export function oklchToHex(oklch: OKLCH): string {
  const rgb = oklchToRgb(oklch)
  return rgbToHex(rgb)
}

export function formatHex(hex: string): string {
  return hex.toLowerCase()
}

export function formatRgb(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

export function formatHsl(hsl: HSL): string {
  return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`
}

export function formatOklch(oklch: OKLCH): string {
  return `oklch(${oklch.l.toFixed(3)} ${oklch.c.toFixed(3)} ${Math.round(oklch.h)})`
}

export function normalizeHex(hex: string): string {
  const h = hex.trim().replace(/^#/, '')
  if (h.length === 3) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
  }
  return `#${h.toLowerCase()}`
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
export function isValidHex(hex: string): boolean {
  return HEX_RE.test(hex.trim())
}
