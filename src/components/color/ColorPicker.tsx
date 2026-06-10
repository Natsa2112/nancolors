import { useState, useEffect, useRef } from 'react'
import { useStore } from '@nanostores/react'
import { $hex, $error, setHex } from '../../stores/color.store'

function stripHash(h: string): string {
  return h.replace(/^#/, '')
}

function handleNativePicker(e: React.ChangeEvent<HTMLInputElement>) {
  setHex(e.target.value)
}

export default function ColorPicker() {
  const hex = useStore($hex)
  const error = useStore($error)
  const nativeInputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState(stripHash(hex))
  const isFocused = useRef(false)

  useEffect(() => {
    if (!isFocused.current) {
      setInputValue(stripHash(hex))
    }
  }, [hex])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
    setInputValue(raw)
    if (raw.length === 6) {
      setHex(`#${raw}`)
    }
  }

  function handleFocus() {
    isFocused.current = true
  }

  function handleBlur() {
    isFocused.current = false
    if (inputValue.length > 0) {
      setHex(`#${inputValue}`)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      setHex(`#${inputValue}`)
    }
  }

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
          <div className="color-picker__hex-wrapper">
            <span className="color-picker__hex-prefix" aria-hidden="true">#</span>
            <input
              id="hex-input"
              type="text"
              className="color-picker__hex-input"
              value={inputValue}
              onChange={handleInput}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              maxLength={6}
              spellCheck={false}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'hex-error' : undefined}
            />
          </div>
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
