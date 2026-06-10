import { useState } from 'react'
import { useStore } from '@nanostores/react'
import { $hex, $rgb, $hsl, $oklch } from '../../stores/color.store'
import { $palettes } from '../../stores/palettes.store'
import { $activeTab } from '../Tabs'
import { toCSSVariables, toTailwindConfig, toJSON, toSVG } from '../../lib/export.service'
import { buildShareUrl } from '../../lib/share'
import type { ExportFormat } from '../../lib/types'

function useCopy() {
  const [copied, setCopied] = useState(false)
  return {
    copied,
    copy: async (text: string) => {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    },
  }
}

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
  if (activeTab !== tab) return null

  const hex = useStore($hex)
  const rgb = useStore($rgb)
  const hsl = useStore($hsl)
  const oklch = useStore($oklch)
  const palettes = useStore($palettes)
  const [format, setFormat] = useState<ExportFormat>('css')
  const { copied, copy } = useCopy()

  function getCode(): string {
    const p = palettes as unknown as Record<string, string[]>
    switch (format) {
      case 'css':
        return toCSSVariables(hex, p)
      case 'tailwind':
        return toTailwindConfig(hex, p)
      case 'json':
        return toJSON(hex, rgb, hsl, oklch, p)
      case 'svg':
        return toSVG(hex, p)
    }
  }

  const shareUrl = buildShareUrl(hex)

  return (
    <div>
      <div className="export-bar">
        <div className="export-bar__group">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              className="export-btn"
              aria-selected={format === f.id}
              onClick={() => setFormat(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          className="export-btn"
          onClick={() => copy(shareUrl)}
          title="Copiar URL para compartir"
        >
          {copied ? '✓ Copiado' : 'Compartir'}
        </button>
      </div>

      <div className="export-output">
        <textarea
          className="export-output__code"
          readOnly
          value={getCode()}
          rows={8}
          aria-label="Código exportado"
        />
        <button
          className={`copy-btn ${copied ? 'copy-btn--copied' : ''}`}
          onClick={() => copy(getCode())}
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
