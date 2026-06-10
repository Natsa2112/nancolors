import { atom } from 'nanostores'
import { useStore } from '@nanostores/react'

export const $activeTab = atom('palettes')

const TABS = [
  { id: 'palettes', label: 'Paletas' },
  { id: 'semantic', label: 'Semántico' },
  { id: 'contrast', label: 'Contraste' },
  { id: 'preview', label: 'Preview' },
  { id: 'export', label: 'Exportar' },
]

export default function Tabs() {
  const active = useStore($activeTab)

  return (
    <div className="tabs" role="tablist" aria-label="Herramientas de color">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className="tab"
          role="tab"
          aria-selected={active === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          onClick={() => $activeTab.set(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
