import { useState, useEffect, useRef, useCallback } from 'react'
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from '../../lib/color/convert'
import type { HSL } from '../../lib/types'

interface Props {
  color: string
  onChange: (color: string) => void
  onClose: () => void
  triggerRect: DOMRect | null
}

const CANVAS_SIZE = 160
const SLIDER_W = 160
const SLIDER_H = 14

function hslToString(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`
}

function hsvToHsl(h: number, sv: number, v: number): { h: number; s: number; l: number } {
  const l = v * (1 - sv / 2)
  const s = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHsv(h: number, s: number, l: number): { sv: number; v: number } {
  const v = l + (s * Math.min(l, 100 - l)) / 100
  const sv = v === 0 ? 0 : 2 * (1 - l / v)
  return { sv: Math.min(sv, 1), v: v / 100 }
}

export default function ColorPickerPopover({ color, onChange, onClose, triggerRect }: Props) {
  const rgb = hexToRgb(color)!
  const initialHsl = rgbToHsl(rgb)
  const [hsl, setHsl] = useState<HSL>(initialHsl)
  const [hexInput, setHexInput] = useState(color.replace(/^#/, ''))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sliderRef = useRef<HTMLCanvasElement>(null)
  const isDragging = useRef(false)
  const isDraggingSlider = useRef(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHexInput(color.replace(/^#/, ''))
    const rgb2 = hexToRgb(color)
    if (rgb2) setHsl(rgbToHsl(rgb2))
  }, [color])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const update = useCallback(
    (h: number, s: number, l: number) => {
      const newHsl = { h, s, l }
      setHsl(newHsl)
      const rgb2 = hslToRgb(newHsl)
      const hex2 = rgbToHex(rgb2)
      onChange(hex2)
    },
    [onChange],
  )

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width,
      h = canvas.height

    ctx.fillStyle = hslToString(hsl.h, 100, 50)
    ctx.fillRect(0, 0, w, h)

    const wg = ctx.createLinearGradient(0, 0, w, 0)
    wg.addColorStop(0, '#fff')
    wg.addColorStop(1, 'transparent')
    ctx.fillStyle = wg
    ctx.fillRect(0, 0, w, h)

    const bg = ctx.createLinearGradient(0, 0, 0, h)
    bg.addColorStop(0, 'transparent')
    bg.addColorStop(1, '#000')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)

    const { sv, v } = hslToHsv(hsl.h, hsl.s, hsl.l)
    const ix = sv * w,
      iy = (1 - v) * h
    ctx.beginPath()
    ctx.arc(ix, iy, 5, 0, Math.PI * 2)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(ix, iy, 4, 0, Math.PI * 2)
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1
    ctx.stroke()
  }, [hsl])

  const drawSlider = useCallback(() => {
    const canvas = sliderRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width,
      h = canvas.height
    const grad = ctx.createLinearGradient(0, 0, w, 0)
    grad.addColorStop(0, '#f00')
    grad.addColorStop(0.17, '#ff0')
    grad.addColorStop(0.33, '#0f0')
    grad.addColorStop(0.5, '#0ff')
    grad.addColorStop(0.67, '#00f')
    grad.addColorStop(0.83, '#f0f')
    grad.addColorStop(1, '#f00')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    const ix = (hsl.h / 360) * w
    ctx.beginPath()
    ctx.moveTo(ix, 0)
    ctx.lineTo(ix, h)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(ix, 0)
    ctx.lineTo(ix, h)
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1
    ctx.stroke()
  }, [hsl])

  useEffect(() => {
    drawCanvas()
    drawSlider()
  }, [drawCanvas, drawSlider])

  function onCanvasDown(e: React.MouseEvent) {
    isDragging.current = true
    pickCanvas(e.clientX, e.clientY)
  }
  function onCanvasMove(e: React.MouseEvent) {
    if (!isDragging.current) return
    pickCanvas(e.clientX, e.clientY)
  }
  function pickCanvas(cx: number, cy: number) {
    const c = canvasRef.current
    if (!c) return
    const r = c.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (cx - r.left) / r.width))
    const y = Math.max(0, Math.min(1, (cy - r.top) / r.height))
    const { h, s, l } = hsvToHsl(hsl.h, x, 1 - y)
    update(h, s, l)
  }

  function onSliderDown(e: React.MouseEvent) {
    isDraggingSlider.current = true
    pickSlider(e.clientX)
  }
  function onSliderMove(e: React.MouseEvent) {
    if (!isDraggingSlider.current) return
    pickSlider(e.clientX)
  }
  function pickSlider(cx: number) {
    const s = sliderRef.current
    if (!s) return
    const r = s.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (cx - r.left) / r.width))
    const h = Math.round(x * 360)
    update(h, hsl.s, hsl.l)
  }

  useEffect(() => {
    const up = () => {
      isDragging.current = false
      isDraggingSlider.current = false
    }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
    setHexInput(raw)
    if (raw.length === 6) {
      const hex2 = `#${raw}`
      const rgb2 = hexToRgb(hex2)
      if (rgb2) {
        setHsl(rgbToHsl(rgb2))
        onChange(hex2)
      }
    }
  }

  function handleHexBlur() {
    if (hexInput.length > 0) {
      const hex2 = `#${hexInput}`
      const rgb2 = hexToRgb(hex2)
      if (rgb2) {
        setHsl(rgbToHsl(rgb2))
        onChange(hex2)
      }
    }
  }

  const pos = triggerRect
    ? { top: triggerRect.bottom + 4, left: Math.max(4, triggerRect.left - 40) }
    : { top: 0, left: 0 }

  return (
    <div ref={popoverRef} className="color-picker-popover" style={{ top: pos.top, left: pos.left }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="color-picker-popover__canvas"
        onMouseDown={onCanvasDown}
        onMouseMove={onCanvasMove}
        onMouseUp={() => {
          isDragging.current = false
        }}
      />
      <canvas
        ref={sliderRef}
        width={SLIDER_W}
        height={SLIDER_H}
        className="color-picker-popover__slider"
        onMouseDown={onSliderDown}
        onMouseMove={onSliderMove}
        onMouseUp={() => {
          isDraggingSlider.current = false
        }}
      />
      <div className="color-picker-popover__footer">
        <div className="color-picker-popover__preview" style={{ backgroundColor: color }} />
        <div className="color-picker-popover__hex-wrapper">
          <span className="color-picker-popover__hash">#</span>
          <input
            type="text"
            className="color-picker-popover__hex-input"
            value={hexInput}
            onChange={handleHexInput}
            onBlur={handleHexBlur}
            maxLength={6}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
