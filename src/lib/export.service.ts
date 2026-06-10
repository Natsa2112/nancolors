import type { RGB, HSL, OKLCH } from './types'

function formatName(name: string): string {
  return name.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function palettesToCSS(
  palettes: Record<string, string[]>,
  prefix: string
): string[] {
  const lines: string[] = []
  for (const [type, colors] of Object.entries(palettes)) {
    colors.forEach((c, i) => {
      lines.push(`  ${prefix}${formatName(type)}-${i + 1}: ${c};`)
    })
  }
  return lines
}

export function toCSSVariables(
  hex: string,
  light: Record<string, string[]>,
  dark?: Record<string, string[]>
): string {
  const lines: string[] = [':root {', `  --color-base: ${hex};`]
  lines.push(...palettesToCSS(light, '--color-'))
  lines.push('}')

  if (dark && Object.keys(dark).length > 0) {
    lines.push('', '[data-theme="dark"] {')
    lines.push(...palettesToCSS(dark, '--color-'))
    lines.push('}')
  }

  return lines.join('\n')
}

export function toTailwindConfig(
  hex: string,
  light: Record<string, string[]>,
  dark?: Record<string, string[]>
): string {
  const colors: Record<string, Record<string, string>> = {}
  const all = {
    base: [hex],
    ...light,
    ...(dark ? Object.fromEntries(
      Object.entries(dark).map(([k, v]) => [`${k}-dark`, v])
    ) : {}),
  }
  for (const [type, cols] of Object.entries(all)) {
    const entry: Record<string, string> = {}
    cols.forEach((c, i) => { entry[String(i + 1)] = c })
    colors[type] = entry
  }
  return JSON.stringify({ theme: { extend: { colors } } }, null, 2)
}

export function toJSON(
  hex: string,
  rgb: RGB,
  hsl: HSL,
  oklch: OKLCH,
  light: Record<string, string[]>,
  dark?: Record<string, string[]>
): string {
  return JSON.stringify({
    base: { hex, rgb, hsl, oklch },
    themes: {
      light: { palettes: light },
      ...(dark && Object.keys(dark).length > 0 ? { dark: { palettes: dark } } : {}),
    },
  }, null, 2)
}

export function toSVG(
  hex: string,
  light: Record<string, string[]>,
  dark?: Record<string, string[]>
): string {
  const darkColors = dark ? Object.values(dark).flat() : []
  const lightColors = Object.values(light).flat()
  const allColors = [hex, ...lightColors, ...darkColors]
  const swatches = allColors
    .map(
      (color, i) =>
        `  <rect x="${i * 40}" y="0" width="40" height="40" fill="${color}" rx="4" />`
    )
    .join('\n')

  return [
    `<svg xmlns="http://www.w3.org/2000/svg"`,
    `     viewBox="0 0 ${allColors.length * 40} 40"`,
    `     width="${allColors.length * 40}" height="40">`,
    swatches,
    `</svg>`,
  ].join('\n')
}
