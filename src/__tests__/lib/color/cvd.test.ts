import { describe, it, expect } from 'vitest'
import { simulateCvd, simulateAll } from '../../../lib/color/cvd'

describe('simulateCvd', () => {
  it('simulates protanopia', () => {
    const result = simulateCvd('#ff0000', 'protanopia')
    expect(result).not.toBeNull()
    expect(result).toBeDefined()
  })

  it('simulates deuteranopia', () => {
    const result = simulateCvd('#00ff00', 'deuteranopia')
    expect(result).not.toBeNull()
  })

  it('simulates tritanopia', () => {
    const result = simulateCvd('#0000ff', 'tritanopia')
    expect(result).not.toBeNull()
  })

  it('returns null for invalid hex', () => {
    expect(simulateCvd('#ZZZ', 'protanopia')).toBeNull()
  })
})

describe('simulateAll', () => {
  it('returns all 3 CVD types', () => {
    const result = simulateAll('#ff6b35')
    expect(result.protanopia).not.toBeNull()
    expect(result.deuteranopia).not.toBeNull()
    expect(result.tritanopia).not.toBeNull()
  })
})
