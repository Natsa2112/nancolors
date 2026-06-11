import { useState, useRef } from 'react'
import { useStore } from '@nanostores/react'
import { $palettes } from '../../stores/palettes.store'
import { $activeTab } from '../../stores/tabs.store'
import { $previewPalette } from '../../stores/preview.store'
import { showToast } from '../../stores/toast.store'
import { HARMONY_TYPES } from '../../lib/constants'
import type { HarmonyType } from '../../lib/types'
import ColorPickerPopover from './ColorPickerPopover'

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
    <div
      id={`panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`tab-${tab}`}
      style={{ display: activeTab !== tab ? 'none' : undefined }}
    >
      <div className="stagger" key={activeTab}>
      {HARMONY_TYPES.map((type) => {
        const colors = palettes[type]
        const isActive = activePalette === type
        return (
          <div key={type} className="palette-card mt-4">
            <div className="palette-card__header">
              <span className="palette-card__title">{HARMONY_LABELS[type]}</span>
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
              <div className="palette-card__actions">
                <span className="palette-card__count">{colors.length} colores</span>
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
          </div>
        )
      })}
      </div>

      <CustomPalette />
    </div>
  )
}

const DEFAULT_COLORS = ['#000000', '#000000', '#000000', '#000000', '#000000']

function CustomPalette() {
  const [colors, setColors] = useState<string[]>([...DEFAULT_COLORS])

  function handleColorChange(index: number, value: string) {
    const next = [...colors]
    next[index] = value
    setColors(next)
  }

  return (
    <div className="palette-card mt-4">
      <div className="palette-card__header">
        <span className="palette-card__title">Personalizada</span>
      </div>
      <div className="palette-grid-row">
        <div className="palette-grid">
          {colors.map((color, i) => (
            <CustomSwatch key={i} index={i} color={color} onChange={handleColorChange} />
          ))}
        </div>
        <div className="palette-card__actions">
          <span className="palette-card__count">{colors.length} colores</span>
        </div>
      </div>
    </div>
  )
}

function CustomSwatch({
  index,
  color,
  onChange,
}: {
  index: number
  color: string
  onChange: (i: number, v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const swatchRef = useRef<HTMLDivElement>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)

  function handleClick() {
    if (swatchRef.current) {
      setTriggerRect(swatchRef.current.getBoundingClientRect())
    }
    setOpen(true)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div className="custom-palette__item" ref={swatchRef}>
      <div
        className="palette-grid__swatch custom-palette__swatch"
        style={{ backgroundColor: color }}
        role="button"
        tabIndex={0}
        aria-label={`Color personalizado ${index + 1}: ${color}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      />
      <span className="custom-palette__hex">{color}</span>
      {open && (
        <ColorPickerPopover
          color={color}
          onChange={(v) => onChange(index, v)}
          onClose={() => setOpen(false)}
          triggerRect={triggerRect}
        />
      )}
    </div>
  )
}
