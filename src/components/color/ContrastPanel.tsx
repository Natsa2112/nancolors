import { useStore } from '@nanostores/react'
import { $contrast } from '../../stores/contrast.store'
import { $activeTab } from '../../stores/tabs.store'

function gaugeColor(ratio: number): string {
  if (ratio >= 7) return 'var(--color-success)'
  if (ratio >= 4.5) return 'var(--color-info)'
  if (ratio >= 3) return 'var(--color-warning)'
  return 'var(--color-error)'
}

function Gauge({ ratio }: { ratio: number }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const maxRatio = 21
  const offset = circumference * (1 - Math.min(ratio, maxRatio) / maxRatio)

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <circle className="contrast-score__gauge-bg" cx="24" cy="24" r={radius} />
      <circle
        className="contrast-score__gauge-fill"
        cx="24"
        cy="24"
        r={radius}
        stroke={gaugeColor(ratio)}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text x="24" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">
        {ratio.toFixed(1)}
      </text>
    </svg>
  )
}

function Badge({ label, pass }: { label: string; pass: boolean }) {
  return (
    <span className={`contrast-badge ${pass ? 'contrast-badge--aa' : 'contrast-badge--fail'}`}>
      {label}: {pass ? '✓' : '✗'}
    </span>
  )
}

interface Props {
  tab: string
}

export default function ContrastPanel({ tab }: Props) {
  const activeTab = useStore($activeTab)
  const contrast = useStore($contrast)

  return (
    <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} style={{ display: activeTab !== tab ? 'none' : undefined }}>
      <div className="contrast-summary">
        <Badge label="AA Large" pass={contrast.aaLarge} />
        <Badge label="AA Normal" pass={contrast.aaNormal} />
        <Badge label="AAA Large" pass={contrast.aaaLarge} />
        <Badge label="AAA Normal" pass={contrast.aaaNormal} />
      </div>

      <div>
        {contrast.scores.map((score, i) => (
          <div key={i} className="contrast-score mt-2">
            <div className="contrast-score__gauge">
              <Gauge ratio={score.ratio} />
            </div>
            <div className="contrast-score__info">
              <div className="contrast-score__label">{score.label}</div>
              <div className="contrast-score__detail">
                <span>{score.foreground}</span>
                <span>sobre</span>
                <span>{score.background}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
