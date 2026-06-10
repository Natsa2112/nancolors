import { describe, it, expect } from 'vitest'
import { generateSemantic } from '../../../lib/color/semantic'

describe('generateSemantic', () => {
  it('returns 12 roles for valid hex', () => {
    const result = generateSemantic('#ff6b35')
    expect(result).not.toBeNull()
    expect(result!.background).toBeDefined()
    expect(result!.text).toBeDefined()
    expect(result!.button).toBeDefined()
    expect(result!.success).toBe('#22C55E')
    expect(result!.error).toBe('#EF4444')
    expect(result!.warning).toBe('#F97316')
  })

  it('returns null for invalid hex', () => {
    expect(generateSemantic('#ZZZ')).toBeNull()
  })

  it('generates dark background for dark color', () => {
    const result = generateSemantic('#1a1a2e')
    expect(result).not.toBeNull()
    expect(result!.background).toBeDefined()
    expect(result!.text).toBeDefined()
  })

  it('generates light background for light color', () => {
    const result = generateSemantic('#ffe4d6')
    expect(result).not.toBeNull()
    expect(result!.background).toBeDefined()
    expect(result!.text).toBeDefined()
  })

  it('button is derived from base color', () => {
    const result = generateSemantic('#ff6b35')
    expect(result).not.toBeNull()
    expect(result!.button).toBeDefined()
  })
})
