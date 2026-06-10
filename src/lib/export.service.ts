import type { RGB, HSL, OKLCH } from './types'

export function toCSSVariables(
  hex: string,
  palettes: Record<string, string[]>
): string {
  const lines: string[] = [':root {', `  --color-base: ${hex};`]

  const formatCssName = (name: string) =>
    name.replace(/([A-Z])/g, '-$1').toLowerCase()

  for (const [type, colors] of Object.entries(palettes)) {
    colors.forEach((c, i) => {
      lines.push(`  --color-${formatCssName(type)}-${i + 1}: ${c};`)
    })
  }

  lines.push('}')
  return lines.join('\n')
}

export function toTailwindConfig(
  hex: string,
  palettes: Record<string, string[]>
): string {
  const palettesObj: Record<string, Record<string, string>> = {}
  const p: Record<string, string[]> = { ...palettes, base: [hex] }

  for (const [type, colors] of Object.entries(p)) {
    const entry: Record<string, string> = {}
    colors.forEach((c, i) => {
      entry[String(i + 1)] = c
    })
    palettesObj[type] = entry
  }

  return JSON.stringify({ theme: { extend: { colors: palettesObj } } }, null, 2)
}

export function toJSON(
  hex: string,
  rgb: RGB,
  hsl: HSL,
  oklch: OKLCH,
  palettes: Record<string, string[]>
): string {
  return JSON.stringify({ base: { hex, rgb, hsl, oklch }, palettes }, null, 2)
}

export function toSVG(hex: string, palettes: Record<string, string[]>): string {
  const allColors = [hex, ...Object.values(palettes).flat()]
  const swatches = allColors
    .map(
      (color, i) =>
        `<rect x="${i * 40}" y="0" width="40" height="40" fill="${color}" rx="4" />`
    )
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${allColors.length * 40} 40" width="${allColors.length * 40}" height="40">
  ${swatches}
</svg>`
}
