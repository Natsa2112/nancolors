import { describe, it, expect } from 'vitest'
import {
  lighten,
  darken,
  saturate,
  desaturate,
  adjustHue,
  mix,
} from '../../../lib/color/manipulation'

describe('lighten', () => {
  it('lightens a color', () => {
    const result = lighten('#ff6b35', 20)
    expect(result).not.toBeNull()
    expect(result).toBeDefined()
  })

  it('does not exceed 100% lightness', () => {
    const result = lighten('#ffffff', 20)
    expect(result).toBe('#ffffff')
  })

  it('returns null for invalid hex', () => {
    expect(lighten('#ZZZ', 20)).toBeNull()
  })
})

describe('darken', () => {
  it('darkens a color', () => {
    const result = darken('#ff6b35', 20)
    expect(result).not.toBeNull()
  })

  it('does not go below 0% lightness', () => {
    const result = darken('#000000', 20)
    expect(result).toBe('#000000')
  })
})

describe('saturate', () => {
  it('saturates a color', () => {
    const result = saturate('#999', 20)
    expect(result).not.toBeNull()
  })

  it('does not exceed 100% saturation', () => {
    const result = saturate('#ff0000', 50)
    expect(result).not.toBeNull()
  })
})

describe('desaturate', () => {
  it('desaturates a color', () => {
    const result = desaturate('#ff6b35', 30)
    expect(result).not.toBeNull()
  })
})

describe('adjustHue', () => {
  it('rotates hue by 180 for complementary', () => {
    const result = adjustHue('#ff0000', 180)
    expect(result?.toLowerCase()).toBe('#00ffff')
  })

  it('wraps around 360', () => {
    const result = adjustHue('#ff0000', 360)
    expect(result?.toLowerCase()).toBe('#ff0000')
  })

  it('handles negative degrees', () => {
    const result = adjustHue('#00ffff', -180)
    expect(result?.toLowerCase()).toBe('#ff0000')
  })
})

describe('mix', () => {
  it('mixes red and blue equally', () => {
    const result = mix('#ff0000', '#0000ff', 0.5)
    expect(result).not.toBeNull()
  })

  it('at weight 0 returns first color', () => {
    const result = mix('#ff0000', '#0000ff', 0)
    expect(result?.toLowerCase()).toBe('#ff0000')
  })

  it('at weight 1 returns second color', () => {
    const result = mix('#ff0000', '#0000ff', 1)
    expect(result?.toLowerCase()).toBe('#0000ff')
  })

  it('returns null if either color is invalid', () => {
    expect(mix('#ff0000', '#ZZZ', 0.5)).toBeNull()
  })
})
