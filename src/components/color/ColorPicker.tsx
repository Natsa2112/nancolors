import { useState, useEffect, useRef } from 'react'
import { useStore } from '@nanostores/react'
import { $hex, $error, setHex } from '../../stores/color.store'
import ColorPickerPopover from './ColorPickerPopover'

export default function ColorPicker() {
  const hex = useStore($hex)
  const error = useStore($error)
  const [inputValue, setInputValue] = useState(hex.replace(/^#/, ''))
  const [open, setOpen] = useState(false)
  const isFocused = useRef(false)
  const swatchRef = useRef<HTMLDivElement>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!isFocused.current) {
      setInputValue(hex.replace(/^#/, ''))
    }
  }, [hex])

  function handleSwatchClick() {
    if (swatchRef.current) {
      setTriggerRect(swatchRef.current.getBoundingClientRect())
    }
    setOpen(true)
  }

  function handleSwatchKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSwatchClick()
    }
  }

  function handlePopoverChange(color: string) {
    setHex(color)
  }

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

  return (
    <div className="color-picker">
      <div className="color-picker__preview">
        <div
          ref={swatchRef}
          className="color-picker__swatch"
          style={{ backgroundColor: hex }}
          role="button"
          tabIndex={0}
          aria-label={`Color actual: ${hex}. Click para abrir selector`}
          onClick={handleSwatchClick}
          onKeyDown={handleSwatchKey}
        />
        <div>
          <label className="sr-only" htmlFor="hex-input">
            Color en hexadecimal
          </label>
          <div className="color-picker__hex-wrapper">
            <span className="color-picker__hex-prefix" aria-hidden="true">
              #
            </span>
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

      {open && (
        <ColorPickerPopover
          color={hex}
          onChange={handlePopoverChange}
          onClose={() => setOpen(false)}
          triggerRect={triggerRect}
        />
      )}
    </div>
  )
}
