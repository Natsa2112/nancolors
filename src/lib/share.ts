import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

export function encodePalette(hex: string): string {
  return compressToEncodedURIComponent(hex)
}

export function decodePalette(encoded: string): string | null {
  try {
    const result = decompressFromEncodedURIComponent(encoded)
    return result || null
  } catch {
    return null
  }
}

export function buildShareUrl(hex: string): string {
  const encoded = encodePalette(hex)
  return `${window.location.origin}/?c=${encoded}`
}

export function isValidShareParam(param: string | null): param is string {
  if (!param || typeof param !== 'string') return false
  return param.length > 0 && param.length < 500
}
