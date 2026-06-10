import { atom } from 'nanostores'
import type { HarmonyType } from '../lib/types'

export const $previewPalette = atom<HarmonyType | null>(null)
