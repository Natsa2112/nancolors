import { useStore } from '@nanostores/react'
import { $hex } from '../../stores/color.store'
import { $activeTab } from '../Tabs'
import { simulateAll } from '../../lib/color/cvd'

const CVD_LABELS: Record<string, string> = {
  normal: 'Visión normal',
  protanopia: 'Protanopia (rojo)',
  deuteranopia: 'Deuteranopia (verde)',
  tritanopia: 'Tritanopia (azul)',
}

interface Props {
  tab: string
}

export default function CvdPanel({ tab }: Props) {
  const activeTab = useStore($activeTab)
  if (activeTab !== tab) return null

  const hex = useStore($hex)
  const simulated = simulateAll(hex)

  return (
    <div>
      <h3 className="text-sm text-bold mt-4 mb-2">Simulación CVD</h3>
      <p className="text-xs text-muted mb-3">
        Brettel-Viénot-Mollon: protanopia, deuteranopia, tritanopia.
      </p>
      <div className="semantic-list__grid">
        {(['normal', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map((type) => (
          <div key={type} className="semantic-card">
            <div
              className="semantic-card__swatch"
              style={{ backgroundColor: type === 'normal' ? hex : simulated[type] ?? '#000' }}
            />
            <div className="semantic-card__info">
              <div className="semantic-card__label">{CVD_LABELS[type]}</div>
              <div className="semantic-card__value">
                {type === 'normal' ? hex : simulated[type]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
