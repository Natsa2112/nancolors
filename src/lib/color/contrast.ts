import type { ContrastScore } from '../types'
import { WCAG_THRESHOLDS } from '../constants'
import { relativeLuminance } from './luminance'

export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export type WcagLevel = 'AAA' | 'AA' | 'FAIL'

export function wcagLevel(ratio: number, isLarge: boolean): WcagLevel {
  if (ratio >= WCAG_THRESHOLDS.AAA_NORMAL) return 'AAA'
  if (isLarge && ratio >= WCAG_THRESHOLDS.AAA_LARGE) return 'AAA'
  if (ratio >= WCAG_THRESHOLDS.AA_NORMAL) return 'AA'
  if (isLarge && ratio >= WCAG_THRESHOLDS.AA_LARGE) return 'AA'
  return 'FAIL'
}

export function meetsAaLarge(ratio: number): boolean {
  return ratio >= WCAG_THRESHOLDS.AA_LARGE
}

export function meetsAaNormal(ratio: number): boolean {
  return ratio >= WCAG_THRESHOLDS.AA_NORMAL
}

export function meetsAaaLarge(ratio: number): boolean {
  return ratio >= WCAG_THRESHOLDS.AAA_LARGE
}

export function meetsAaaNormal(ratio: number): boolean {
  return ratio >= WCAG_THRESHOLDS.AAA_NORMAL
}

export function scoreContrast(
  label: string,
  foreground: string,
  background: string,
): ContrastScore | null {
  const fgLum = relativeLuminance(foreground)
  const bgLum = relativeLuminance(background)
  if (fgLum === null || bgLum === null) return null
  const ratio = contrastRatio(fgLum, bgLum)
  return {
    label,
    foreground,
    background,
    ratio: Math.round(ratio * 100) / 100,
    aaLarge: meetsAaLarge(ratio),
    aaNormal: meetsAaNormal(ratio),
    aaaLarge: meetsAaaLarge(ratio),
    aaaNormal: meetsAaaNormal(ratio),
  }
}
