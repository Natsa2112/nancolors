import { describe, it, expect, beforeEach } from 'vitest'
import { $hex, $rgb, $hsl, $oklch, $luminance, $error, setHex } from '../../stores/color.store'

beforeEach(() => {
  setHex('#FF6B35')
})

describe('color.store', () => {
  it('initializes with default values after setHex', () => {
    expect($hex.get()).toBe('#ff6b35')
    expect($rgb.get()).toEqual({ r: 255, g: 107, b: 53 })
    expect($hsl.get().h).toBeCloseTo(16, 0)
    expect($hsl.get().s).toBeCloseTo(100, 0)
    expect($hsl.get().l).toBeCloseTo(60, 0)
  })

  it('computes luminance', () => {
    const lum = $luminance.get()
    expect(lum).not.toBeNull()
    expect(lum!).toBeGreaterThan(0)
    expect(lum!).toBeLessThan(1)
  })

  it('computes OKLCH', () => {
    const oklch = $oklch.get()
    expect(oklch.l).toBeGreaterThan(0)
    expect(oklch.c).toBeGreaterThan(0)
  })

  it('sets error for invalid hex', () => {
    setHex('#ZZZ')
    expect($error.get()).not.toBeNull()
  })

  it('clears error on valid hex', () => {
    setHex('#ZZZ')
    expect($error.get()).not.toBeNull()
    setHex('#000000')
    expect($error.get()).toBeNull()
  })

  it('normalizes 3-digit hex', () => {
    setHex('#f60')
    expect($hex.get()).toBe('#ff6600')
  })

  it('handles hashless hex', () => {
    setHex('ff6b35')
    expect($hex.get()).toBe('#ff6b35')
  })

  it('updates RGB on new color', () => {
    setHex('#000000')
    expect($rgb.get()).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('updates HSL on new color', () => {
    setHex('#ffffff')
    expect($hsl.get().l).toBeCloseTo(100, 0)
  })
})
