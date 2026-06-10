import { useStore } from '@nanostores/react'
import { $palettes } from '../../stores/palettes.store'
import { $activeTab } from '../Tabs'
import { showToast } from '../../stores/toast.store'
import { HARMONY_TYPES } from '../../lib/constants'
import type { HarmonyType } from '../../lib/types'

const HARMONY_LABELS: Record<HarmonyType, string> = {
  complementary: 'Complementaria',
  analogous: 'Análoga',
  triadic: 'Triádica',
  monochromatic: 'Monocromática',
  splitComplementary: 'Split-Complementaria',
  tetradic: 'Tetrádica',
}

interface Props {
  tab: string
}

export default function PaletteGenerator({ tab }: Props) {
  const activeTab = useStore($activeTab)
  const palettes = useStore($palettes)

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex)
    showToast(`Copiado ${hex}`)
  }

  return (
    <div style={{ display: activeTab !== tab ? 'none' : undefined }}>
      {HARMONY_TYPES.map((type) => {
        const colors = palettes[type]
        return (
          <div key={type} className="palette-card mt-4">
            <div className="palette-card__header">
              <span className="palette-card__title">{HARMONY_LABELS[type]}</span>
              <span className="palette-card__count">{colors.length} colores</span>
            </div>
            <div className="palette-grid">
              {colors.map((color, i) => (
                <button
                  key={i}
                  className="palette-grid__swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => copyHex(color)}
                  title={`Copiar ${color}`}
                  aria-label={`Copiar ${color}`}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
