import { useStore } from '@nanostores/react'
import { $palettes } from '../../stores/palettes.store'
import { $activeTab } from '../../stores/tabs.store'
import { $previewPalette } from '../../stores/preview.store'
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
  const activePalette = useStore($previewPalette)

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex)
    showToast(`Copiado ${hex}`)
  }

  function togglePreview(type: HarmonyType) {
    $previewPalette.set(activePalette === type ? null : type)
  }

  return (
    <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} style={{ display: activeTab !== tab ? 'none' : undefined }}>
      {HARMONY_TYPES.map((type) => {
        const colors = palettes[type]
        const isActive = activePalette === type
        return (
          <div key={type} className="palette-card mt-4">
            <div className="palette-card__header">
              <span className="palette-card__title">{HARMONY_LABELS[type]}</span>
              <span className="palette-card__count">{colors.length} colores</span>
            </div>
            <div className="palette-grid-row">
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
              <button
                className={`palette-card__preview-btn ${isActive ? 'palette-card__preview-btn--active' : ''}`}
                onClick={() => togglePreview(type)}
                aria-pressed={isActive}
                aria-label={`${isActive ? 'Quitar de' : 'Aplicar en'} preview: ${HARMONY_LABELS[type]}`}
                title={isActive ? 'Quitar de preview' : 'Aplicar en preview'}
              >
                {isActive ? 'En preview' : 'Preview'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
