import { useEffect, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { $hex } from '../../stores/color.store'
import { $semantic } from '../../stores/semantic.store'
import { $contrast } from '../../stores/contrast.store'
import { $palettes } from '../../stores/palettes.store'
import { $activeTab } from '../../stores/tabs.store'
import { $previewPalette } from '../../stores/preview.store'
import type { SemanticRoles, ContrastInfo, Palettes, HarmonyType } from '../../lib/types'
import { darken, lighten } from '../../lib/color/manipulation'

function getPaletteColors(palettes: Palettes, active: HarmonyType | null): string[] {
  if (!active) return []
  return palettes[active] ?? []
}

const CSS_VARS: Record<
  string,
  (hex: string, s: SemanticRoles, c: ContrastInfo, palette: string[]) => string
> = {
  '--p-color-bg': (_, s) => s.background,
  '--p-color-text': (_, s) => s.text,
  '--p-color-navbar-bg': (_, s, __, p) => p[4] ?? p[3] ?? s.surface,
  '--p-color-navbar-text': (_, s) => s.text,
  '--p-color-hero-bg': (hex, _, __, p) => p[0] ?? hex,
  '--p-color-hero-text': (_, s) => s.text,
  '--p-color-card-bg': (_, s, __, p) => p[2] ?? s.card,
  '--p-color-card-text': (_, s) => s.text,
  '--p-color-card-border': (_, s) => s.surface,
  '--p-color-btn-bg': (_, s, __, p) => p[1] ?? s.button,
  '--p-color-btn-text': (_, s) => s.text,
}

interface Props {
  tab: string
}

export default function LivePreview({ tab }: Props) {
  const activeTab = useStore($activeTab)
  const hex = useStore($hex)
  const semantic = useStore($semantic)
  const contrast = useStore($contrast)
  const palettes = useStore($palettes)
  const activePalette = useStore($previewPalette)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const valuesRef = useRef({
    hex,
    semantic,
    contrast,
    palette: getPaletteColors(palettes, activePalette),
    dark: false,
  })
  const [previewDark, setPreviewDark] = useState(false)

  valuesRef.current = {
    hex,
    semantic,
    contrast,
    palette: getPaletteColors(palettes, activePalette),
    dark: previewDark,
  }

  useEffect(() => {
    let running = true
    const el = containerRef.current
    if (!el) return

    function darkSemantic(s: SemanticRoles): SemanticRoles {
      const darkBg = darken(s.background, 75) ?? '#111'
      const darkSurface = lighten(darkBg, 5) ?? '#1a1a1a'
      const darkCard = lighten(darkBg, 8) ?? '#222'
      return {
        ...s,
        background: darkBg,
        surface: darkSurface,
        card: darkCard,
        text: lighten(s.text, 85) ?? '#eee',
      }
    }

    function update() {
      if (!el || !running) return
      const { hex: h, semantic: s, contrast: c, palette: p, dark } = valuesRef.current
      const target = dark ? darkSemantic(s) : s
      for (const [name, fn] of Object.entries(CSS_VARS)) {
        el.style.setProperty(name, fn(h, target, c, p))
      }
      rafRef.current = requestAnimationFrame(update)
    }

    rafRef.current = requestAnimationFrame(update)
    return () => {
      running = false
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [activeTab, tab])

  return (
    <div
      id={`panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`tab-${tab}`}
      style={{ display: activeTab !== tab ? 'none' : undefined }}
    >
      <div className="preview" ref={containerRef}>
        <div className="preview__toolbar">
          <span className="preview__dot" aria-hidden="true" />
          <span className="preview__dot" aria-hidden="true" />
          <span className="preview__dot" aria-hidden="true" />
        </div>
        <div className="preview__body">
          <PreviewNavbar previewDark={previewDark} onToggle={() => setPreviewDark(!previewDark)} />
          <PreviewHero />
          <PreviewStats />
          <PreviewCharts />
          <PreviewCards />
          <PreviewTestimonials />
          <PreviewFaq />
          <PreviewButtons />
          <PreviewForm />
          <PreviewFooter />
        </div>
      </div>
    </div>
  )
}

function PreviewNavbar({ previewDark, onToggle }: { previewDark: boolean; onToggle: () => void }) {
  return (
    <nav className="preview-navbar" aria-label="Previsualización de navegación">
      <div className="preview-navbar__brand">
        <span className="preview-navbar__logo-icon">N</span>
        <span className="preview-navbar__logo">NaN</span>
      </div>
      <div className="preview-navbar__center">
        <a className="preview-navbar__link" href="#">
          Inicio
        </a>
        <a className="preview-navbar__link" href="#">
          Productos
        </a>
        <a className="preview-navbar__link" href="#">
          Contacto
        </a>
      </div>
      <button
        className={`preview-navbar__theme-btn ${previewDark ? 'preview-navbar__theme-btn--dark' : ''}`}
        onClick={onToggle}
        aria-pressed={previewDark}
        aria-label={previewDark ? 'Modo claro' : 'Modo oscuro'}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </nav>
  )
}

function PreviewHero() {
  return (
    <section className="preview-hero">
      <h2 className="preview-hero__title">Título Principal</h2>
      <p className="preview-hero__subtitle">
        Subtítulo descriptivo que explica el valor de tu producto o servicio.
      </p>
      <span className="preview-hero__cta">Comenzar</span>
    </section>
  )
}

function PreviewStats() {
  return (
    <div className="preview-stats">
      <div className="preview-stat">
        <span className="preview-stat__value">12K+</span>
        <span className="preview-stat__label">Usuarios</span>
      </div>
      <div className="preview-stat">
        <span className="preview-stat__value">99.9%</span>
        <span className="preview-stat__label">Uptime</span>
      </div>
      <div className="preview-stat">
        <span className="preview-stat__value">50+</span>
        <span className="preview-stat__label">Países</span>
      </div>
      <div className="preview-stat">
        <span className="preview-stat__value">4.9</span>
        <span className="preview-stat__label">Valoración</span>
      </div>
    </div>
  )
}

function PreviewCharts() {
  const barRef = useRef<HTMLCanvasElement>(null)
  const lineRef = useRef<HTMLCanvasElement>(null)
  const pieRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    let running = true

    function getColor(varName: string, fallback: string): string {
      if (typeof document === 'undefined') return fallback
      const el = document.querySelector('.preview')
      if (!el) return fallback
      return getComputedStyle(el).getPropertyValue(varName).trim() || fallback
    }

    function drawBar() {
      const canvas = barRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const w = canvas.width,
        h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const _text = getColor('--p-color-card-text', '#000')
      const bar = getColor('--p-color-btn-bg', '#3b82f6')
      const border = getColor('--p-color-card-border', '#e5e7eb')
      const data = [35, 55, 40, 70, 60, 85]
      const pad = 24,
        bw = (w - pad * 2) / data.length - 4
      ctx.strokeStyle = border
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(pad, 10)
      ctx.lineTo(pad, h - 20)
      ctx.lineTo(w - 10, h - 20)
      ctx.stroke()
      data.forEach((v, i) => {
        const x = pad + i * (bw + 4)
        const bh = (v / 100) * (h - 40)
        ctx.fillStyle = bar
        ctx.beginPath()
        ctx.roundRect(x, h - 20 - bh, bw, bh, [3, 3, 0, 0])
        ctx.fill()
        ctx.fillStyle = text
        ctx.font = '9px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`${v}%`, x + bw / 2, h - 6)
      })
    }

    function drawLine() {
      const canvas = lineRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const w = canvas.width,
        h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const line = getColor('--p-color-btn-bg', '#3b82f6')
      const _text = getColor('--p-color-card-text', '#000')
      const border = getColor('--p-color-card-border', '#e5e7eb')
      const data = [20, 35, 30, 55, 50, 75, 90]
      const pad = 24
      ctx.strokeStyle = border
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(pad, h - 20)
      ctx.lineTo(w - 10, h - 20)
      ctx.stroke()
      const points = data.map((v, i) => ({
        x: pad + (i / (data.length - 1)) * (w - pad - 10),
        y: h - 20 - (v / 100) * (h - 40),
      }))
      ctx.beginPath()
      ctx.moveTo(points[0].x, h - 20)
      points.forEach((p) => ctx.lineTo(p.x, p.y))
      ctx.lineTo(points[points.length - 1].x, h - 20)
      ctx.closePath()
      const grad = ctx.createLinearGradient(0, 10, 0, h - 20)
      grad.addColorStop(0, line + '40')
      grad.addColorStop(1, line + '05')
      ctx.fillStyle = grad
      ctx.fill()
      ctx.beginPath()
      points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
      ctx.strokeStyle = line
      ctx.lineWidth = 2.5
      ctx.lineJoin = 'round'
      ctx.stroke()
      points.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.strokeStyle = line
        ctx.lineWidth = 2
        ctx.stroke()
      })
      ctx.fillStyle = text
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul']
      points.forEach((p, i) => ctx.fillText(labels[i], p.x, h - 5))
    }

    function drawPie() {
      const canvas = pieRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const w = canvas.width,
        h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const colors = [
        getColor('--p-color-btn-bg', '#3b82f6'),
        getColor('--p-color-hero-bg', '#8b5cf6'),
        getColor('--p-color-card-border', '#e5e7eb'),
        getColor('--p-color-text', '#6b7280'),
      ]
      const _text = getColor('--p-color-card-text', '#000')
      const data = [45, 25, 18, 12]
      const cx = w / 2,
        cy = h / 2,
        r = Math.min(cx, cy) - 16
      let start = -Math.PI / 2
      data.forEach((v, i) => {
        const angle = (v / 100) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, r, start, start + angle)
        ctx.closePath()
        ctx.fillStyle = colors[i % colors.length]
        ctx.fill()
        const mid = start + angle / 2
        const lx = cx + Math.cos(mid) * (r * 0.65)
        const ly = cy + Math.sin(mid) * (r * 0.65)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${v}%`, lx, ly)
        start += angle
      })
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = getColor('--p-color-card-bg', '#fff')
      ctx.fill()
    }

    function loop() {
      if (!running) return
      drawBar()
      drawLine()
      drawPie()
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      running = false
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  return (
    <div className="preview-charts">
      <div className="preview-chart">
        <span className="preview-chart__title">Ingresos mensuales</span>
        <canvas ref={barRef} width={160} height={120} className="preview-chart__canvas" />
      </div>
      <div className="preview-chart">
        <span className="preview-chart__title">Crecimiento</span>
        <canvas ref={lineRef} width={160} height={120} className="preview-chart__canvas" />
      </div>
      <div className="preview-chart">
        <span className="preview-chart__title">Distribución</span>
        <canvas ref={pieRef} width={160} height={120} className="preview-chart__canvas" />
      </div>
    </div>
  )
}

function PreviewTestimonials() {
  return (
    <div className="preview-testimonials">
      <blockquote className="preview-testimonial">
        <p className="preview-testimonial__text">
          "Una herramienta increíble, transformó nuestra forma de trabajar."
        </p>
        <div className="preview-testimonial__author">
          <span className="preview-testimonial__avatar" aria-hidden="true">
            M
          </span>
          <div>
            <span className="preview-testimonial__name">María García</span>
            <span className="preview-testimonial__role">CEO, TechCorp</span>
          </div>
        </div>
      </blockquote>
      <blockquote className="preview-testimonial">
        <p className="preview-testimonial__text">
          "La mejor plataforma que hemos usado. Altamente recomendada."
        </p>
        <div className="preview-testimonial__author">
          <span className="preview-testimonial__avatar" aria-hidden="true">
            C
          </span>
          <div>
            <span className="preview-testimonial__name">Carlos Ruiz</span>
            <span className="preview-testimonial__role">CTO, StartUpX</span>
          </div>
        </div>
      </blockquote>
    </div>
  )
}

function PreviewFaq() {
  const [open, setOpen] = useState<number | null>(null)
  const items = [
    {
      q: '¿Cómo funciona la plataforma?',
      a: 'Regístrate gratis y accede a todas las herramientas desde tu panel de control.',
    },
    { q: '¿Hay periodo de prueba?', a: 'Sí, ofrecemos 14 días de prueba gratuita sin compromiso.' },
    {
      q: '¿Puedo cancelar cuando quiera?',
      a: 'Sin problema. Cancela en cualquier momento desde tu cuenta.',
    },
  ]
  return (
    <div className="preview-faq">
      <h3 className="preview-faq__title">Preguntas frecuentes</h3>
      {items.map((item, i) => (
        <div key={i} className="preview-faq__item">
          <button
            className="preview-faq__question"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {item.q}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: open === i ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {open === i && <p className="preview-faq__answer">{item.a}</p>}
        </div>
      ))}
    </div>
  )
}

function PreviewCards() {
  return (
    <div className="preview-cards">
      {[1, 2, 3].map((i) => (
        <article className="preview-card" key={i}>
          <h3 className="preview-card__title">Tarjeta {i}</h3>
          <p className="preview-card__text">Contenido descriptivo de la tarjeta {i}.</p>
        </article>
      ))}
    </div>
  )
}

function PreviewButtons() {
  return (
    <div className="preview-buttons">
      <button className="preview-btn preview-btn--primary">Primario</button>
      <button className="preview-btn preview-btn--secondary">Secundario</button>
    </div>
  )
}

function PreviewForm() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (sent) return
    setSent(true)
    setTimeout(() => setSent(false), 2000)
  }

  return (
    <form className="preview-form" onSubmit={handleSubmit}>
      <label className="preview-form__label" htmlFor="pv-email">
        Correo electrónico
      </label>
      <input
        className="preview-form__input"
        id="pv-email"
        type="email"
        placeholder="correo@ejemplo.com"
      />
      <label className="preview-form__label" htmlFor="pv-name">
        Nombre
      </label>
      <input className="preview-form__input" id="pv-name" type="text" placeholder="Tu nombre" />
      <button
        className={`preview-btn ${sent ? 'preview-btn--sent' : 'preview-btn--primary'}`}
        type="submit"
        disabled={sent}
      >
        {sent ? 'Enviado' : 'Enviar'}
      </button>
    </form>
  )
}

function PreviewFooter() {
  return <footer className="preview-footer">&copy; 2026 NaN Colors Preview.</footer>
}
