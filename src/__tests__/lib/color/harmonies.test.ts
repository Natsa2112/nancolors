import { describe, it, expect } from 'vitest'
import {
  complementary,
  analogous,
  triadic,
  monochromatic,
  splitComplementary,
  tetradic,
  generateHarmony,
} from '../../../lib/color/harmonies'

const testHex = '#ff6b35'

describe('complementary', () => {
  const result = complementary(testHex)
  it('returns 2 colors', () => {
    expect(result).toHaveLength(2)
  })
  it('first color is the original', () => {
    expect(result[0]).toBe(testHex)
  })
})

describe('analogous', () => {
  const result = analogous(testHex)
  it('returns 3 colors', () => {
    expect(result).toHaveLength(3)
  })
  it('middle color is the original', () => {
    expect(result[1]).toBe(testHex)
  })
})

describe('triadic', () => {
  const result = triadic(testHex)
  it('returns 3 colors', () => {
    expect(result).toHaveLength(3)
  })
  it('first color is the original', () => {
    expect(result[0]).toBe(testHex)
  })
})

describe('monochromatic', () => {
  const result = monochromatic(testHex)
  it('returns 5 colors', () => {
    expect(result).toHaveLength(5)
  })
  it('middle color is the original', () => {
    expect(result[2]).toBe(testHex)
  })
})

describe('splitComplementary', () => {
  const result = splitComplementary(testHex)
  it('returns 3 colors', () => {
    expect(result).toHaveLength(3)
  })
  it('first color is the original', () => {
    expect(result[0]).toBe(testHex)
  })
})

describe('tetradic', () => {
  const result = tetradic(testHex)
  it('returns 4 colors', () => {
    expect(result).toHaveLength(4)
  })
  it('first color is the original', () => {
    expect(result[0]).toBe(testHex)
  })
})

describe('generateHarmony', () => {
  it('generates complementary', () => {
    expect(generateHarmony(testHex, 'complementary')).toHaveLength(2)
  })
  it('generates triadic', () => {
    expect(generateHarmony(testHex, 'triadic')).toHaveLength(3)
  })
  it('generates monochromatic', () => {
    expect(generateHarmony(testHex, 'monochromatic')).toHaveLength(5)
  })
})
