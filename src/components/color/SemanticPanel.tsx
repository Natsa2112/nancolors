import { useStore } from '@nanostores/react'
import { $semantic } from '../../stores/semantic.store'
import { $activeTab } from '../Tabs'
import { showToast } from '../../stores/toast.store'

const ROLE_LABELS: Record<string, string> = {
  secondary: 'Secundario',
  tertiary: 'Terciario',
  background: 'Fondo',
  surface: 'Superficie',
  card: 'Tarjeta',
  button: 'Botón',
  buttonHover: 'Botón (hover)',
  text: 'Texto',
  link: 'Enlace',
  success: 'Éxito',
  warning: 'Advertencia',
  error: 'Error',
}

const ROLE_ORDER = [
  'background', 'surface', 'card',
  'text', 'link',
  'secondary', 'tertiary', 'button', 'buttonHover',
  'success', 'warning', 'error',
]

interface Props {
  tab: string
}

export default function SemanticPanel({ tab }: Props) {
  const activeTab = useStore($activeTab)
  const semantic = useStore($semantic)

  function copyHex(hex: string, label: string) {
    navigator.clipboard.writeText(hex)
    showToast(`Copiado ${label}: ${hex}`)
  }

  return (
    <div style={{ display: activeTab !== tab ? 'none' : undefined }}>
      <div className="semantic-list">
        <div className="semantic-list__header">
          <span className="semantic-list__title">Roles semánticos</span>
        </div>
        <div className="semantic-list__grid">
          {ROLE_ORDER.map((role) => (
            <div key={role} className="semantic-card">
              <div
                className="semantic-card__swatch"
                style={{ backgroundColor: semantic[role as keyof typeof semantic] }}
              />
              <div className="semantic-card__info">
                <div className="semantic-card__label">{ROLE_LABELS[role] || role}</div>
                <div className="semantic-card__value">{semantic[role as keyof typeof semantic]}</div>
              </div>
              <button
                className="semantic-card__action"
                onClick={() => copyHex(semantic[role as keyof typeof semantic], ROLE_LABELS[role] || role)}
                aria-label={`Copiar ${ROLE_LABELS[role] || role}`}
              >
                Copiar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
