import { useStore } from '@nanostores/react'
import { $previewPalette } from '../../stores/preview.store'
import { $palettes } from '../../stores/palettes.store'
import { showToast } from '../../stores/toast.store'
import type { HarmonyType } from '../../lib/types'

const LABELS: Record<HarmonyType, string> = {
  complementary: 'Complementaria',
  analogous: 'Análoga',
  triadic: 'Triádica',
  monochromatic: 'Monocromática',
  splitComplementary: 'Split-Complementaria',
  tetradic: 'Tetrádica',
}

export default function PreviewPaletteBar() {
  const activePalette = useStore($previewPalette)
  const palettes = useStore($palettes)
  const colors = activePalette ? (palettes[activePalette] ?? []) : []

  if (!activePalette || colors.length === 0) return null

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex)
    showToast(`Copiado ${hex}`)
  }

  return (
    <div className="preview-palette-bar">
      <span className="preview-palette-bar__label">{LABELS[activePalette]}</span>
      <div className="preview-palette-bar__swatches">
        {colors.map((color, i) => (
          <button
            key={i}
            className="preview-palette-bar__swatch"
            onClick={() => copyHex(color)}
            title={`Copiar ${color}`}
            aria-label={`Copiar ${color}`}
          >
            <span
              className="preview-palette-bar__swatch-color"
              style={{ backgroundColor: color }}
            />
            <span className="preview-palette-bar__hex">{color}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
