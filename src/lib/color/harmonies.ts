import type { HarmonyType } from '../types'
import { hexToHsl, hslToHex } from './convert'
import { adjustHue } from './manipulation'

function hueShift(hex: string, degrees: number): string | null {
  return adjustHue(hex, degrees)
}

function lighten(hex: string, amount: number): string | null {
  const hsl = hexToHsl(hex)
  if (!hsl) return null
  hsl.l = Math.min(100, hsl.l + amount)
  return hslToHex(hsl)
}

function darken(hex: string, amount: number): string | null {
  const hsl = hexToHsl(hex)
  if (!hsl) return null
  hsl.l = Math.max(0, hsl.l - amount)
  return hslToHex(hsl)
}

export function complementary(hex: string): (string | null)[] {
  return [hex, hueShift(hex, 180)]
}

export function analogous(hex: string): (string | null)[] {
  return [hueShift(hex, -30), hex, hueShift(hex, 30)]
}

export function triadic(hex: string): (string | null)[] {
  return [hex, hueShift(hex, 120), hueShift(hex, 240)]
}

export function monochromatic(hex: string): (string | null)[] {
  return [darken(hex, 40), darken(hex, 20), hex, lighten(hex, 20), lighten(hex, 40)]
}

export function splitComplementary(hex: string): (string | null)[] {
  return [hex, hueShift(hex, 150), hueShift(hex, 210)]
}

export function tetradic(hex: string): (string | null)[] {
  return [hex, hueShift(hex, 90), hueShift(hex, 180), hueShift(hex, 270)]
}

export function generateHarmony(hex: string, type: HarmonyType): (string | null)[] {
  const map: Record<HarmonyType, (h: string) => (string | null)[]> = {
    complementary,
    analogous,
    triadic,
    monochromatic,
    splitComplementary,
    tetradic,
  }
  return map[type](hex)
}
