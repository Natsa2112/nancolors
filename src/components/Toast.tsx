import { useStore } from '@nanostores/react'
import { $toasts } from '../stores/toast.store'

export default function Toast() {
  const toasts = useStore($toasts)

  if (toasts.length === 0) return null

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.message}
        </div>
      ))}
    </div>
  )
}
