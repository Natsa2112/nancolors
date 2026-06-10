declare module 'culori/fn' {
  interface RgbColor {
    r: number
    g: number
    b: number
    mode: 'rgb'
    alpha?: number
  }

  interface HslColor {
    h: number
    s: number
    l: number
    mode: 'hsl'
    alpha?: number
  }

  interface OklabColor {
    l: number
    a: number
    b: number
    mode: 'oklab'
    alpha?: number
  }

  export function parseHex(hex: string): RgbColor | undefined
  export function converter(mode: string): (color: any) => any
  export function convertRgbToHsl(color: RgbColor): HslColor
  export function convertHslToRgb(color: HslColor): RgbColor
  export function convertRgbToOklab(color: RgbColor): OklabColor
  export function convertOklabToRgb(color: OklabColor): RgbColor
  export function formatHex(color: RgbColor): string
  export function formatRgb(color: RgbColor): string
  export function formatHsl(color: HslColor): string
}
