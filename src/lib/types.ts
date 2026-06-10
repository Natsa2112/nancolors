export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

export interface OKLCH {
  l: number
  c: number
  h: number
}

export interface ContrastScore {
  label: string
  foreground: string
  background: string
  ratio: number
  aaLarge: boolean
  aaNormal: boolean
  aaaLarge: boolean
  aaaNormal: boolean
}

export interface Palettes {
  complementary: string[]
  analogous: string[]
  triadic: string[]
  monochromatic: string[]
  splitComplementary: string[]
  tetradic: string[]
}

export interface SemanticRoles {
  secondary: string
  tertiary: string
  background: string
  surface: string
  card: string
  button: string
  buttonHover: string
  text: string
  link: string
  success: string
  warning: string
  error: string
}

export interface ContrastInfo {
  aaLarge: boolean
  aaNormal: boolean
  aaaLarge: boolean
  aaaNormal: boolean
  scores: ContrastScore[]
}

export type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'monochromatic'
  | 'splitComplementary'
  | 'tetradic'

export type ExportFormat = 'css' | 'tailwind' | 'json' | 'svg'
