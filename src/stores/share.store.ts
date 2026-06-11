import { atom } from 'nanostores'

export const $shareUrl = atom<string>('')
export const $shareCopied = atom<boolean>(false)
export const $shareError = atom<string | null>(null)

let copyTimeout: ReturnType<typeof setTimeout> | null = null

export function generateShareUrl(hex: string): void {
  if (typeof window === 'undefined') return
  const encoded = lzStringCompress(hex)
  if (!encoded) {
    $shareError.set('No se pudo generar la URL')
    return
  }
  $shareUrl.set(`${window.location.origin}/?c=${encoded}`)
  $shareError.set(null)
}

export async function copyShareUrl(hex: string): Promise<void> {
  const encoded = lzStringCompress(hex)
  if (!encoded) {
    $shareError.set('No se pudo generar la URL')
    return
  }
  const url =
    typeof window !== 'undefined' ? `${window.location.origin}/?c=${encoded}` : `/?c=${encoded}`

  try {
    await navigator.clipboard.writeText(url)
    $shareCopied.set(true)
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => $shareCopied.set(false), 2000)
  } catch {
    $shareError.set('No se pudo copiar al portapapeles')
  }
}

function lzStringCompress(hex: string): string | null {
  try {
    // @ts-expect-error – lz-string is CJS
    if (typeof lzString?.compressToEncodedURIComponent === 'function') {
      return lzString.compressToEncodedURIComponent(hex)
    }
    return hex
  } catch {
    return null
  }
}
