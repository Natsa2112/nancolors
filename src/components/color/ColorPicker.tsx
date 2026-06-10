import { useStore } from '@nanostores/react'
import { $hex, $error, setHex } from '../../stores/color.store'
import { normalizeHex, isValidHex } from '../../lib/color/convert'

function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
  const raw = e.target.value
  const normalized = normalizeHex(raw)
  if (isValidHex(normalized)) {
    setHex(normalized)
  }
}

function handleNativePicker(e: React.ChangeEvent<HTMLInputElement>) {
  setHex(e.target.value)
}

export default function ColorPicker() {
  const hex = useStore($hex)
  const error = useStore($error)

  return (
    <div className="color-picker">
      <div className="color-picker__preview">
        <label className="color-swatch color-swatch--lg" style={{ backgroundColor: hex }} role="img" aria-label={`Color actual: ${hex}`}>
          <input
            type="color"
            value={hex}
            onChange={handleNativePicker}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </label>
        <div>
          <label className="sr-only" htmlFor="hex-input">Color en hexadecimal</label>
          <input
            id="hex-input"
            className="input input--mono color-picker__hex-input"
            type="text"
            value={hex}
            onChange={handleInput}
            maxLength={7}
            spellCheck={false}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'hex-error' : undefined}
          />
          {error && (
            <p id="hex-error" className="text-xs text-muted mt-1" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
