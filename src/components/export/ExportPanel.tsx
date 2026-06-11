import { useState, useMemo } from 'react'
import { useStore } from '@nanostores/react'
import { $hex, $rgb, $hsl, $oklch } from '../../stores/color.store'
import { $palettes } from '../../stores/palettes.store'
import { $previewPalette } from '../../stores/preview.store'
import { $activeTab } from '../../stores/tabs.store'
import { showToast } from '../../stores/toast.store'
import { toCSSVariables, toTailwindConfig, toJSON, toSVG } from '../../lib/export.service'
import { buildShareUrl } from '../../lib/share'
import { darken } from '../../lib/color/manipulation'
import type { ExportFormat } from '../../lib/types'

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'css', label: 'CSS' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'json', label: 'JSON' },
  { id: 'svg', label: 'SVG' },
]

interface Props {
  tab: string
}

export default function ExportPanel({ tab }: Props) {
  const activeTab = useStore($activeTab)
  const hex = useStore($hex)
  const rgb = useStore($rgb)
  const hsl = useStore($hsl)
  const oklch = useStore($oklch)
  const palettes = useStore($palettes)
  const activePalette = useStore($previewPalette)
  const [format, setFormat] = useState<ExportFormat>('css')

  const filteredPalettes = useMemo(() => {
    if (!activePalette) return {}
    const colors = palettes[activePalette]
    if (!colors) return {}
    return { [activePalette]: colors }
  }, [palettes, activePalette])

  const darkPalettes = useMemo(() => {
    const result: Record<string, string[]> = {}
    for (const [type, colors] of Object.entries(filteredPalettes)) {
      result[type] = colors.map((c) => darken(c, 70) ?? c)
    }
    return result
  }, [filteredPalettes])

  const themeLabel = activePalette ? `Exportar ${activePalette}` : 'Exportar paletas'

  function getCode(): string {
    const light = filteredPalettes as unknown as Record<string, string[]>
    const dark = darkPalettes as unknown as Record<string, string[]>
    switch (format) {
      case 'css':
        return toCSSVariables(hex, light, dark)
      case 'tailwind':
        return toTailwindConfig(hex, light, dark)
      case 'json':
        return toJSON(hex, rgb, hsl, oklch, light, dark)
      case 'svg':
        return toSVG(hex, light, dark)
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(getCode())
    showToast('Código copiado')
  }

  function copyShareUrl() {
    navigator.clipboard.writeText(buildShareUrl(hex))
    showToast('URL de compartir copiada')
  }

  return (
    <div
      id={`panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`tab-${tab}`}
      className="export-panel"
      style={{ display: activeTab !== tab ? 'none' : undefined }}
    >
      <div className="export-panel__card">
        <div className="export-panel__header">
          <h3 className="export-panel__title">{themeLabel}</h3>
          <div
            className="export-panel__formats"
            role="radiogroup"
            aria-label="Formato de exportación"
          >
            {FORMATS.map((f) => (
              <button
                key={f.id}
                className="export-panel__format-btn"
                role="radio"
                aria-checked={format === f.id}
                onClick={() => setFormat(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="export-panel__code-wrapper">
          <pre className="export-panel__code">
            <code>{getCode()}</code>
          </pre>
          <button className="export-panel__copy-btn" onClick={copyCode} title="Copiar código">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="3"
                width="10"
                height="10"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M12 2H5a1 1 0 00-1 1v1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Copiar
          </button>
        </div>

        <div className="export-panel__share">
          <span className="export-panel__share-label">Compartir color</span>
          <div className="export-panel__share-row">
            <code className="export-panel__share-url">{buildShareUrl(hex)}</code>
            <button className="export-panel__share-btn" onClick={copyShareUrl} title="Copiar URL">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect
                  x="3"
                  y="3"
                  width="10"
                  height="10"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M12 2H5a1 1 0 00-1 1v1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Copiar URL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
