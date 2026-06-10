import { useStore } from '@nanostores/react'
import { $hex, $error, setHex } from '../../stores/color.store'
import { normalizeHex, isValidHex } from '../../lib/color/convert'
import { useRef } from 'react'

function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
  const raw = e.target.value
  const normalized = normalizeHex(raw)
  if (isValidHex(normalized)) {
    setHex(normalized)
  }
}

function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
  const raw = e.target.value
  const normalized = normalizeHex(raw)
  if (!isValidHex(normalized) && raw.length > 0) {
    setHex(raw)
  }
}

function handleNativePicker(e: React.ChangeEvent<HTMLInputElement>) {
  setHex(e.target.value)
}

export default function ColorPicker() {
  const hex = useStore($hex)
  const error = useStore($error)
  const nativeInputRef = useRef<HTMLInputElement>(null)

  function handleSwatchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      nativeInputRef.current?.click()
    }
  }

  return (
    <div className="color-picker">
      <div className="color-picker__preview">
        <div
          className="color-swatch color-swatch--lg"
          style={{ backgroundColor: hex }}
          role="button"
          tabIndex={0}
          aria-label={`Abrir selector de color. Color actual: ${hex}`}
          onClick={() => nativeInputRef.current?.click()}
          onKeyDown={handleSwatchKeyDown}
        >
          <input
            ref={nativeInputRef}
            type="color"
            value={hex}
            onChange={handleNativePicker}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="hex-input">Color en hexadecimal</label>
          <input
            id="hex-input"
            className="input input--mono color-picker__hex-input"
            type="text"
            value={hex}
            onChange={handleInput}
            onBlur={handleBlur}
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
