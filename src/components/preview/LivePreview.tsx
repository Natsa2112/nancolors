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

function getPaletteColors(
  palettes: Palettes,
  active: HarmonyType | null
): string[] {
  if (!active) return []
  return palettes[active] ?? []
}

const CSS_VARS: Record<string, (hex: string, s: SemanticRoles, c: ContrastInfo, palette: string[]) => string> = {
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
  '--p-color-btn-text': (_, s, __, p) => s.text,
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
  const valuesRef = useRef({ hex, semantic, contrast, palette: getPaletteColors(palettes, activePalette), dark: false })
  const [previewDark, setPreviewDark] = useState(false)

  valuesRef.current = { hex, semantic, contrast, palette: getPaletteColors(palettes, activePalette), dark: previewDark }

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
    <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} style={{ display: activeTab !== tab ? 'none' : undefined }}>
      <div className="preview" ref={containerRef}>
        <div className="preview__toolbar">
          <span className="preview__dot" aria-hidden="true" />
          <span className="preview__dot" aria-hidden="true" />
          <span className="preview__dot" aria-hidden="true" />
        </div>
        <div className="preview__body">
          <PreviewNavbar previewDark={previewDark} onToggle={() => setPreviewDark(!previewDark)} />
          <PreviewHero />
          <PreviewCards />
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
        <a className="preview-navbar__link" href="#">Inicio</a>
        <a className="preview-navbar__link" href="#">Productos</a>
        <a className="preview-navbar__link" href="#">Contacto</a>
      </div>
      <button
        className={`preview-navbar__theme-btn ${previewDark ? 'preview-navbar__theme-btn--dark' : ''}`}
        onClick={onToggle}
        aria-pressed={previewDark}
        aria-label={previewDark ? 'Modo claro' : 'Modo oscuro'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  return (
    <form className="preview-form" onSubmit={(e) => e.preventDefault()}>
      <label className="preview-form__label" htmlFor="pv-email">Correo electrónico</label>
      <input className="preview-form__input" id="pv-email" type="email" placeholder="correo@ejemplo.com" />
      <label className="preview-form__label" htmlFor="pv-name">Nombre</label>
      <input className="preview-form__input" id="pv-name" type="text" placeholder="Tu nombre" />
      <button className="preview-btn preview-btn--primary" type="submit">Enviar</button>
    </form>
  )
}

function PreviewFooter() {
  return (
    <footer className="preview-footer">
      &copy; 2026 NaN Colors Preview.
    </footer>
  )
}
