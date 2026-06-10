import { describe, it, expect } from 'vitest'
import { relativeLuminance } from '../../../lib/color/luminance'
import {
  contrastRatio,
  wcagLevel,
  scoreContrast,
  meetsAaNormal,
  meetsAaaNormal,
} from '../../../lib/color/contrast'

describe('relativeLuminance', () => {
  it('white has luminance 1', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 2)
  })

  it('black has luminance 0', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 2)
  })

  it('returns null for invalid hex', () => {
    expect(relativeLuminance('#ZZZ')).toBeNull()
  })

  it('#FF6B35 has positive luminance', () => {
    const lum = relativeLuminance('#FF6B35')
    expect(lum).not.toBeNull()
    expect(lum!).toBeGreaterThan(0)
    expect(lum!).toBeLessThan(1)
  })
})

describe('contrastRatio', () => {
  it('black on white is 21:1', () => {
    const lWhite = relativeLuminance('#ffffff')!
    const lBlack = relativeLuminance('#000000')!
    expect(contrastRatio(lWhite, lBlack)).toBeCloseTo(21, 0)
  })

  it('same colors have ratio 1:1', () => {
    const l = relativeLuminance('#ff6b35')!
    expect(contrastRatio(l, l)).toBeCloseTo(1, 1)
  })

  it('is commutative', () => {
    const l1 = relativeLuminance('#ff6b35')!
    const l2 = relativeLuminance('#ffffff')!
    expect(contrastRatio(l1, l2)).toBeCloseTo(contrastRatio(l2, l1), 5)
  })
})

describe('wcagLevel', () => {
  it('21:1 is AAA normal', () => {
    expect(wcagLevel(21, false)).toBe('AAA')
  })

  it('4.5:1 is AA normal', () => {
    expect(wcagLevel(4.5, false)).toBe('AA')
  })

  it('3:1 large text is AA large but FAIL normal', () => {
    expect(wcagLevel(3, true)).toBe('AA')
    expect(wcagLevel(3, false)).toBe('FAIL')
  })

  it('below 3:1 is FAIL', () => {
    expect(wcagLevel(2, true)).toBe('FAIL')
    expect(wcagLevel(2, false)).toBe('FAIL')
  })

  it('7:1 is AAA normal', () => {
    expect(wcagLevel(7, false)).toBe('AAA')
  })

  it('4.5:1 large text is AAA', () => {
    expect(wcagLevel(4.5, true)).toBe('AAA')
  })
})

describe('meets helpers', () => {
  it('meetsAaNormal at 4.5', () => {
    expect(meetsAaNormal(4.5)).toBe(true)
    expect(meetsAaNormal(4.49)).toBe(false)
  })

  it('meetsAaaNormal at 7', () => {
    expect(meetsAaaNormal(7)).toBe(true)
    expect(meetsAaaNormal(6.99)).toBe(false)
  })
})

describe('scoreContrast', () => {
  it('scores black on white', () => {
    const score = scoreContrast('test', '#000000', '#ffffff')
    expect(score).not.toBeNull()
    expect(score!.aaNormal).toBe(true)
    expect(score!.aaaNormal).toBe(true)
    expect(score!.ratio).toBeGreaterThan(20)
  })

  it('returns null on invalid color', () => {
    const score = scoreContrast('test', '#ZZZ', '#ffffff')
    expect(score).toBeNull()
  })
})
