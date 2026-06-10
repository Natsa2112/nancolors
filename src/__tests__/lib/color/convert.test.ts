import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  hexToOklch,
  oklchToHex,
  formatHex,
  formatRgb,
  formatHsl,
  normalizeHex,
  isValidHex,
} from '../../../lib/color/convert'

describe('hexToRgb', () => {
  it('converts #FF6B35 to RGB', () => {
    expect(hexToRgb('#FF6B35')).toEqual({ r: 255, g: 107, b: 53 })
  })

  it('returns null for invalid hex', () => {
    expect(hexToRgb('#ZZZZZZ')).toBeNull()
  })

  it('handles 3-digit hex', () => {
    expect(hexToRgb('#f60')).toEqual({ r: 255, g: 102, b: 0 })
  })

  it('handles lowercase hex', () => {
    expect(hexToRgb('#ff6b35')).toEqual({ r: 255, g: 107, b: 53 })
  })

  it('handles black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('handles white', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
  })
})

describe('rgbToHex', () => {
  it('converts RGB to hex', () => {
    expect(rgbToHex({ r: 255, g: 107, b: 53 })).toBe('#ff6b35')
  })

  it('converts black', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
  })

  it('converts white', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
  })
})

describe('rgb <-> hsl roundtrip', () => {
  it('converts #FF6B35 RGB to HSL', () => {
    const hsl = rgbToHsl({ r: 255, g: 107, b: 53 })
    expect(hsl.h).toBeCloseTo(16, 0)
    expect(hsl.s).toBeCloseTo(100, 0)
    expect(hsl.l).toBeCloseTo(60, 0)
  })

  it('roundtrips RGB -> HSL -> RGB', () => {
    const original = { r: 100, g: 200, b: 50 }
    const hsl = rgbToHsl(original)
    const result = hslToRgb(hsl)
    expect(result.r).toBeCloseTo(original.r, 0)
    expect(result.g).toBeCloseTo(original.g, 0)
    expect(result.b).toBeCloseTo(original.b, 0)
  })

  it('roundtrips via hexToHsl -> hslToHex', () => {
    const original = '#ff6b35'
    const hsl = hexToHsl(original)
    expect(hsl).not.toBeNull()
    const result = hslToHex(hsl!)
    expect(result).toBe(original.toLowerCase())
  })
})

describe('hexToOklch', () => {
  it('converts #FF6B35 to OKLCH', () => {
    const oklch = hexToOklch('#FF6B35')
    expect(oklch).not.toBeNull()
    expect(oklch!.l).toBeCloseTo(0.7, 1)
    expect(oklch!.c).toBeGreaterThan(0)
    expect(oklch!.h).toBeGreaterThan(0)
  })

  it('returns null for invalid hex', () => {
    expect(hexToOklch('#ZZZZZZ')).toBeNull()
  })
})

describe('oklchToHex', () => {
  it('roundtrips hex -> oklch -> hex', () => {
    const original = '#ff6b35'
    const oklch = hexToOklch(original)
    expect(oklch).not.toBeNull()
    const result = oklchToHex(oklch!)
    expect(result).toBe(original)
  })
})

describe('format functions', () => {
  it('formatHex() lowercases', () => {
    expect(formatHex('#FF6B35')).toBe('#ff6b35')
  })

  it('formatRgb() formats string', () => {
    expect(formatRgb({ r: 255, g: 107, b: 53 })).toBe('rgb(255, 107, 53)')
  })

  it('formatHsl() formats string', () => {
    expect(formatHsl({ h: 16, s: 100, l: 60 })).toBe('hsl(16, 100%, 60%)')
  })
})

describe('normalizeHex', () => {
  it('expands 3-digit hex', () => {
    expect(normalizeHex('#f60')).toBe('#ff6600')
  })

  it('normalizes 6-digit hex', () => {
    expect(normalizeHex('FF6B35')).toBe('#ff6b35')
  })

  it('handles hashless hex', () => {
    expect(normalizeHex('fff')).toBe('#ffffff')
  })
})

describe('isValidHex', () => {
  it('accepts valid 6-digit', () => {
    expect(isValidHex('#FF6B35')).toBe(true)
  })

  it('accepts valid 3-digit', () => {
    expect(isValidHex('#f60')).toBe(true)
  })

  it('rejects invalid', () => {
    expect(isValidHex('#ZZZZZZ')).toBe(false)
  })

  it('rejects empty', () => {
    expect(isValidHex('')).toBe(false)
  })
})
