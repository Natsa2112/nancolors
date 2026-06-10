import { parseHex } from 'culori/fn'

export function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number | null {
  const c = parseHex(hex)
  if (!c) return null
  const r = linearize(c.r)
  const g = linearize(c.g)
  const b = linearize(c.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
