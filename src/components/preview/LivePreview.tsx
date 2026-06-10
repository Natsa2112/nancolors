import { useEffect, useRef } from 'react'
import { useStore } from '@nanostores/react'
import { $hex } from '../../stores/color.store'
import { $semantic } from '../../stores/semantic.store'
import { $contrast } from '../../stores/contrast.store'
import type { SemanticRoles, ContrastInfo } from '../../lib/types'

const CSS_VARS: Record<string, (hex: string, s: SemanticRoles, c: ContrastInfo) => string> = {
  '--p-color-bg': (_, s) => s.background,
  '--p-color-text': (_, s) => s.text,
  '--p-color-navbar-bg': (_, s) => s.surface,
  '--p-color-navbar-text': (_, s) => s.text,
  '--p-color-hero-bg': (hex, _) => hex,
  '--p-color-hero-text': (_, s) => s.text,
  '--p-color-card-bg': (_, s) => s.card,
  '--p-color-card-text': (_, s) => s.text,
  '--p-color-card-border': (_, s) => s.surface,
  '--p-color-btn-bg': (_, s) => s.button,
  '--p-color-btn-text': (_, s) => s.button === s.text ? s.card : s.text,
}

export default function LivePreview() {
  const hex = useStore($hex)
  const semantic = useStore($semantic)
  const contrast = useStore($contrast)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const valuesRef = useRef({ hex, semantic, contrast })

  valuesRef.current = { hex, semantic, contrast }

  useEffect(() => {
    if (rafRef.current !== null) return
    const el = containerRef.current
    if (!el) return

    function update() {
      if (!el) return
      const { hex: h, semantic: s, contrast: c } = valuesRef.current
      for (const [name, fn] of Object.entries(CSS_VARS)) {
        el.style.setProperty(name, fn(h, s, c))
      }
      rafRef.current = requestAnimationFrame(update)
    }

    rafRef.current = requestAnimationFrame(update)
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  return (
    <div className="preview" ref={containerRef}>
      <div className="preview__toolbar">
        <span className="preview__dot" />
        <span className="preview__dot" />
        <span className="preview__dot" />
      </div>
      <div className="preview__body">
        <PreviewNavbar />
        <PreviewHero />
        <PreviewCards />
        <PreviewButtons />
        <PreviewForm />
        <PreviewFooter />
      </div>
    </div>
  )
}

function PreviewNavbar() {
  return (
    <nav className="preview-navbar" aria-label="Previsualización de navegación">
      <span className="preview-navbar__logo">Logo</span>
      <div className="preview-navbar__links">
        <a className="preview-navbar__link" href="#">Inicio</a>
        <a className="preview-navbar__link" href="#">Productos</a>
        <a className="preview-navbar__link" href="#">Contacto</a>
      </div>
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
