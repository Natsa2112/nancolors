// @ts-ignore – lz-string is CJS, handled by vite.ssr.noExternal
import lzString from 'lz-string'

export function encodePalette(hex: string): string {
  if (typeof lzString?.compressToEncodedURIComponent !== 'function') return hex
  return lzString.compressToEncodedURIComponent(hex)
}

export function decodePalette(encoded: string): string | null {
  if (typeof lzString?.decompressFromEncodedURIComponent !== 'function') return null
  try {
    const result = lzString.decompressFromEncodedURIComponent(encoded)
    return result || null
  } catch {
    return null
  }
}

export function buildShareUrl(hex: string): string {
  const encoded = encodePalette(hex)
  if (typeof window === 'undefined') return `/?c=${encoded}`
  return `${window.location.origin}/?c=${encoded}`
}

export function isValidShareParam(param: string | null): param is string {
  if (!param || typeof param !== 'string') return false
  return param.length > 0 && param.length < 500
}
