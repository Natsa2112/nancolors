import { hexToRgb, rgbToHex } from './convert'
import type { RGB } from '../types'

type CvdType = 'protanopia' | 'deuteranopia' | 'tritanopia'

const CVD_MATRICES: Record<CvdType, number[][]> = {
  protanopia: [
    [0.112, 0.885, 0.003],
    [0.112, 0.885, 0.003],
    [0.004, 0.000, 0.996],
  ],
  deuteranopia: [
    [0.292, 0.708, 0.000],
    [0.292, 0.708, 0.000],
    [0.000, 0.042, 0.958],
  ],
  tritanopia: [
    [0.950, 0.050, 0.000],
    [0.000, 0.433, 0.567],
    [0.000, 0.433, 0.567],
  ],
}

function applyMatrix(rgb: RGB, matrix: number[][]): RGB {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const nr = matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b
  const ng = matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b
  const nb = matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b

  return {
    r: Math.round(Math.max(0, Math.min(255, nr * 255))),
    g: Math.round(Math.max(0, Math.min(255, ng * 255))),
    b: Math.round(Math.max(0, Math.min(255, nb * 255))),
  }
}

export function simulateCvd(hex: string, type: CvdType): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const matrix = CVD_MATRICES[type]
  const simulated = applyMatrix(rgb, matrix)
  return rgbToHex(simulated)
}

export function simulateAll(hex: string): Record<CvdType, string | null> {
  return {
    protanopia: simulateCvd(hex, 'protanopia'),
    deuteranopia: simulateCvd(hex, 'deuteranopia'),
    tritanopia: simulateCvd(hex, 'tritanopia'),
  }
}
