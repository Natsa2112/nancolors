import type { SemanticRoles } from '../types'
import { hexToHsl, hslToHex, hexToRgb, rgbToHex } from './convert'

function shiftHue(hex: string, degrees: number, satDelta = 0, lightDelta = 0): string | null {
  const hsl = hexToHsl(hex)
  if (!hsl) return null
  hsl.h = ((hsl.h + degrees) % 360 + 360) % 360
  hsl.s = Math.max(0, Math.min(100, hsl.s + satDelta))
  hsl.l = Math.max(0, Math.min(100, hsl.l + lightDelta))
  return hslToHex(hsl)
}

export function generateSemantic(hex: string): SemanticRoles | null {
  const hsl = hexToHsl(hex)
  if (!hsl) return null

  const isLight = hsl.l > 60
  const isDark = hsl.l < 25
  const isColorful = hsl.s > 30

  const bg: string = isDark
    ? hslToHex({ h: hsl.h, s: Math.min(100, hsl.s * 0.3), l: 5 })
    : hslToHex({ h: hsl.h, s: Math.min(100, hsl.s * 0.15), l: isLight ? 97 : 95 })

  const surface: string = hslToHex({
    h: hsl.h,
    s: Math.min(100, hsl.s * 0.2),
    l: isDark ? 15 : isLight ? 92 : 90,
  })

  const text: string = isDark
    ? hslToHex({ h: hsl.h, s: Math.min(100, hsl.s * 0.1), l: 90 })
    : hslToHex({ h: hsl.h, s: Math.min(100, hsl.s * 0.05), l: 10 })

  const secondary: string = shiftHue(hex, 30, -10, isLight ? -10 : 10) ?? hex
  const tertiary: string = shiftHue(hex, -30, -15, isLight ? -15 : 15) ?? hex

  const card: string = isDark
    ? hslToHex({ h: hsl.h, s: Math.min(100, hsl.s * 0.15), l: 18 })
    : '#ffffff'

  const button: string = isColorful ? hex : hslToHex({ h: hsl.h, s: 60, l: 50 })
  const buttonHover: string = hslToHex({
    h: hsl.h,
    s: isColorful ? hsl.s : 60,
    l: Math.max(0, (isColorful ? hsl.l : 50) - 8),
  })

  const link: string = isColorful
    ? shiftHue(hex, 200, 10, -5) ?? hex
    : hslToHex({ h: 210, s: 80, l: 50 })

  const success: string = '#22C55E'
  const warning: string = '#F97316'
  const error: string = '#EF4444'

  return {
    secondary,
    tertiary,
    background: bg,
    surface,
    card,
    button,
    buttonHover,
    text,
    link,
    success,
    warning,
    error,
  }
}
