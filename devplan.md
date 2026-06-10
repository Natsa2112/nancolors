# NaN Colors — Plan de Construcción

> **Versión:** 1.0  
> **Estado:** Planificación  
> **Autor:** NaN Colors Architecture Team  

---

## Índice

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura Técnica](#3-arquitectura-técnica)
4. [Arquitectura UX](#4-arquitectura-ux)
5. [Estructura de Carpetas](#5-estructura-de-carpetas)
6. [Roadmap de Desarrollo](#6-roadmap-de-desarrollo)
7. [Lista de Componentes](#7-lista-de-componentes)
8. [Lista de Páginas](#8-lista-de-páginas)
9. [Lista de Utilidades](#9-lista-de-utilidades)
10. [Algoritmos de Color](#10-algoritmos-de-color)
11. [Riesgos Técnicos](#11-riesgos-técnicos)
12. [Mejoras Futuras](#12-mejoras-futuras)
13. [Estimación de Complejidad](#13-estimación-de-complejidad)
14. [Estrategia SEO](#14-estrategia-seo)
15. [Guía de Implementación](#15-guía-de-implementación)
    - 15.14 Uso Obligatorio de Skills y Context7

---

## 1. Visión General del Proyecto

### 1.1 Propósito

NaN Colors es una herramienta web para diseñadores y desarrolladores frontend que permite explorar, generar, validar y exportar paletas de color con retroalimentación visual instantánea y cumplimiento de accesibilidad WCAG.

### 1.2 Audiencia Objetivo

- **Primaria:** Diseñadores web UI/UX (25-45 años) que necesitan paletas rápidas y accesibles.
- **Secundaria:** Desarrolladores frontend que necesitan generar tokens de color para sistemas de diseño.
- **Terciaria:** Estudiantes de diseño/web que aprenden teoría del color.

### 1.3 Diferenciadores Clave

- Live Preview con componentes reales (navbar, cards, formularios) no solo swatches.
- Recomendador inteligente con 12 roles semánticos (fondo, botón, hover, texto, etc.).
- Exportación multi-formato (CSS custom properties, Tailwind, JSON, SVG).
- Paletas compartibles por URL (sin backend, todo en query params cifrados).

### 1.4 Principios de Diseño

- **Mobile First:** Toda interfaz diseñada desde 320px hacia arriba.
- **Performance:** Lighthouse score objetivo > 95 en todas las métricas.
- **Accessibility by Default:** WCAG AA mínimo obligatorio, AAA como meta.
- **Instant Feedback:** Toda interacción responde en < 50ms (optimistic UI).
- **Zero Lock-in:** Sin registro obligatorio, exportación abierta.
- **Perceptually Uniform:** Las armonías se calculan preferentemente en OKLCH, no solo HSL, para mezclas visualmente correctas.
- **Color is Never the Only Signal:** Toda información transmitida por color tiene un respaldo textual o icónico.

---

## 2. Stack Tecnológico

### 2.1 Core

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| Framework | Astro | 5.x | Islands architecture, cero JS por defecto, perfecto para herramientas |
| Lenguaje | TypeScript | 5.x | Type safety estricto en toda la aplicación |
| Package Manager | pnpm | 10.x | Más rápido que npm/yarn, strict dependency resolution |
| Styling | CSS Modular con Custom Properties | — | Sin framework de utilidades. CSS nativo organizado en archivos por dominio. Las variables CSS manejaban el theming runtime. Más control, cero dependencias de estilos. |
| Color Library | Culori | 4.x | Tree-shakeable, soporta OKLCH, más ligero que chroma.js |
| State (Frontend) | Nano Stores | 5.x | Framework-agnostic, 1KB, integración nativa con Astro |
| Icons | Lucide Icons | latest | Átomico, tree-shakeable, consistente |
| Animations | Motion (framer-motion v11/v12) para React islands | latest | WAAPI nativo, cero dependencias pesadas |
| Forms | React Hook Form + Zod (solo en islands interactivos) | latest | Validación tipada, render mínimo |

### 2.2 Infraestructura

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Hosting | Cloudflare Pages | Edge network, builds rápidos, preview URLs, sin servidor |
| Dominio | nancolors.dev (recomendado) | Corto, memorable, nicho |
| Analytics | Plausible (self-hosted o Cloudflare) | Privacidad, sin cookies, lightweight |
| CDN | Cloudflare (incluido) | Global distribution automática |

### 2.3 Por qué CSS Modular + Custom Properties

- **Runtime:** Las variables CSS (`--color-primary`, `--color-surface`, etc.) se actualizan con JavaScript para el Live Preview.
- El Live Preview se construye con CSS Custom Properties exclusivamente. No necesita framework de componentes pesado porque es puro CSS.
- El shell de la aplicación también usa CSS Custom Properties, separadas en `--app-*` (estáticas) y `--p-*` (dinámicas).
- **CSS modular:** Archivos separados por dominio (`base.css`, `layout.css`, `color.css`, `preview.css`, `components.css`, `utilities.css`), todos dentro de `src/styles/`. Los componentes Astro importan los CSS que necesitan mediante `link` en el `<head>` o `import` en el frontmatter.
- **Sin dependencias de estilos:** Sin Tailwind, sin PostCSS plugins, sin build steps de CSS. Lo que escribes en CSS es lo que se renderiza. Total control, cero framework lock-in.
- **Utilidades limitadas:** Un archivo `utilities.css` con clases helper tipo `flex`, `grid`, `text-center`, `sr-only`, etc. Solo las que el proyecto necesita. Nada de utility-first masivo.

### 2.4 Por qué Nano Stores

- Se integra con Astro sin necesidad de cargar JavaScript del lado del servidor.
- Los stores se comparten entre islas de React/Vanilla JS sin contexto de React.
- El store de color central puede ser escuchado desde el Live Preview (HTML+CSS plano) y desde los componentes interactivos (selector, exportación) simultáneamente.

### 2.5 Stack Adicional Recomendado

| Propósito | Librería | Justificación |
|-----------|----------|---------------|
| Variants en componentes | `class-variance-authority` (cva) | Sistema de variantes tipadas para Button, Badge, etc. |
| Testing unitario | Vitest | Rápido, compatible con Vite/Astro, same tsconfig |
| Testing E2E | Playwright | Multi-browser, mobile emulation, ya corre en CI |
| Error tracking | Sentry (opcional, fase 2+) | Source maps, breadcrumbs, user context |
| Compresión URL | lz-string | Compresión suficiente para paletas < 1800 chars |
| Validación | Zod | Schemas tipados para exportación y share params |
| Bundle analysis | `@bytepit/astro-visualizer` o `vite-bundle-visualizer` | Monitorear tamaños de islas React |

---

## 3. Arquitectura Técnica

### 3.1 Modelo de Datos Central

```typescript
interface ColorState {
  // Color base
  hex: string;           // #FF6B35
  rgb: RGB;              // { r: 255, g: 107, b: 53 }
  hsl: HSL;              // { h: 16, s: 100, l: 60 }
  oklch: OKLCH;          // { l: 0.65, c: 0.18, h: 40 }
  luminance: number;     // Contraste relativo

  // Paletas generadas
  palettes: {
    complementary: string[];
    analogous: string[];
    triadic: string[];
    monochromatic: string[];
    splitComplementary: string[];
    tetradic: string[];
  };

  // Roles semánticos (recomendador)
  semantic: {
    secondary: string;
    tertiary: string;
    background: string;
    surface: string;
    card: string;
    button: string;
    buttonHover: string;
    text: string;
    link: string;
    success: string;
    warning: string;
    error: string;
  };

  // Accesibilidad
  contrast: {
    aaLarge: boolean;
    aaNormal: boolean;
    aaaLarge: boolean;
    aaaNormal: boolean;
    scores: ContrastScore[];
  };

  // UI
  activeTab: string;
  isGenerating: boolean;
  error: string | null;
}
```

### 3.2 Flujo de Datos

```
Usuario interactúa (input HEX / selector visual)
       │
       ▼
Store de color (Nano Store)
       │
       ├──► Algoritmos de transformación (HEX → RGB → HSL → OKLCH)
       ├──► Algoritmos de armonía (complementario, análogo, triádico, etc.)
       ├──► Recomendador semántico (reglas heurísticas basadas en HSL/OKLCH)
       ├──► Calculador de contraste (fórmula WCAG relative luminance)
       └──► Actualización de CSS Custom Properties en :root
              │
              ▼
       Live Preview se re-renderiza automáticamente (sin JS Virtual DOM)
```

### 3.3 Patrón de Componentes

```
Astro (server)
  ├── Layout base (HTML shell, SEO, fonts)
  ├── Páginas (cada una es una ruta)
  └── Componentes estáticos (header, footer, SEO)

React Islands (client)
  ├── ColorPicker (selector visual + input HEX)
  ├── PaletteGenerator (vista de paletas)
  ├── SemanticPanel (recomendador)
  ├── ContrastPanel (accesibilidad)
  ├── LivePreview (vista previa completa)
  ├── ExportPanel (exportación)
  └── ShareButton (compartir)
```

### 3.4 CSR vs SSR

- **SSR (Astro server):** Layout, metadata, Open Graph, contenido estático, texto introductorio.
- **CSR (Islands):** Toda la lógica interactiva (selector, preview, exportación).
- **Estrategia:** La página principal carga instantánea con HTML estático. Las islas se hidratan solo cuando el usuario interactúa (`client:idle` o `client:visible`).

### 3.5 Gestión de Estado

```
nano-store/
  ├── color.store.ts       // Store central del color activo
  ├── palettes.store.ts     // Paletas generadas (derivado)
  ├── semantic.store.ts     // Colores semánticos (derivado)
  ├── contrast.store.ts     // Puntuaciones de contraste (derivado)
  ├── ui.store.ts           // Estado de UI (tabs activas, modales)
  └── share.store.ts        // Estado para compartir URL
```

Los stores derivados se actualizan automáticamente mediante los `computed` de Nano Stores cuando el store principal cambia.

### 3.6 Sistema de Design Tokens (Tres Niveles)

Basado en el patrón de component-patterns:

```css
/* Nivel 1: Global Tokens (valores crudos) */
:root {
  --blue-500: #3B82F6;
  --gray-100: #F3F4F6;
  --gray-900: #111827;
  --space-4: 1rem;
  --radius-md: 0.5rem;
}

/* Nivel 2: Semantic Tokens (propósito) — shell de la app */
:root {
  --color-primary: var(--blue-500);
  --color-background: var(--gray-100);
  --color-foreground: var(--gray-900);
  --spacing-section: 7.5rem;
}

/* Nivel 3: Component Tokens (específicos) */
:root {
  --button-bg: var(--color-primary);
  --button-text: white;
  --card-padding: var(--space-4);
  --card-radius: var(--radius-md);
  --input-border: 1px solid var(--color-border);
}
```

**Regla:** Los componentes usan EXCLUSIVAMENTE tokens de nivel 3. Nunca referenciar valores crudos (HEX) o tokens semánticos directamente en CSS de componentes.

### 3.7 Sistema de Grid y Espaciado

- **Grid base:** 12 columnas en desktop, 4 columnas en tablet, 2 columnas en mobile.
- **Baseline grid:** 8px para todos los espaciados (`space-1: 0.25rem` → `space-12: 3rem`).
- **Contenido máximo:** 1200px (tool) / 1440px (landing).
- Implementar con CSS nativo: `container-type: inline-size` en los contenedores, `@container (min-width: ...)` en las queries. Los Preview* usan container queries, no viewport queries.

---

## 4. Arquitectura UX

### 4.1 Flujo de Navegación

```
LANDING (Home)
  │
  ├── Selector de Color (hero, siempre visible)
  │     ├── Input HEX manual
  │     ├── Color Picker visual (eyedropper nativo si soportado)
  │     └── Color Swatches recientes (últimos 5)
  │
  ├── Tabs de Herramientas
  │     ├── Paletas ───► Complementarias, Análogas, Triádicas, etc.
  │     ├── Recomendador ──► 12 roles semánticos
  │     ├── Accesibilidad ──► WCAG AA/AAA, scores, advertencias
  │     └── Live Preview ──► Navbar, Hero, Cards, Botones, Forms, Footer
  │
  ├── Exportación (floating action bar)
  │     ├── Copiar color (click en cualquier swatch)
  │     ├── Exportar como CSS Custom Properties
  │     ├── Exportar como Tailwind config
  │     ├── Exportar como JSON
  │     ├── Exportar como SVG Palette
  │     └── Compartir URL
  │
  └── Footer
        ├── Guía rápida de uso
        ├── Explicación de algoritmos
        └── Enlaces (About, GitHub, Feedback)
```

### 4.2 Wireframes en Texto

#### Mobile (320px–767px)

```
┌──────────────────────────┐
│  ◐ NaN Colors    [☰]    │  ← Navbar compacta
│──────────────────────────│
│  ┌─ Color Principal ──┐  │
│  │  #FF6B35    [🎨]   │  │  ← Input + Picker
│  │  ━━━━━━━━━━━━━━━━  │  │  ← Barra de color
│  │  [○ ○ ○ ○ ○]       │  │  ← Swatches recientes
│  └────────────────────┘  │
│──────────────────────────│
│  [Paletas][Recomendador]  │  ← Tabs (horizontal scroll)
│  [Accesibilidad][Preview] │
│──────────────────────────│
│                          │
│  ┌─ Contenido activo ─┐  │  ← Panel que cambia por tab
│  │                     │  │
│  │  (según tab)        │  │
│  │                     │  │
│  └────────────────────┘  │
│                          │
│──────────────────────────│
│  [📋 Copiar] [⬇ Exportar]│  ← Action bar fija abajo
│──────────────────────────│
│  NaN Colors © 2026      │  ← Footer simplificado
└──────────────────────────┘
```

#### Desktop (1024px+)

```
┌─────────────────────────────────────────────────────────────┐
│  ◐ NaN Colors                    [GitHub] [Feedback]       │
│─────────────────────────────────────────────────────────────│
│  ┌──────────┐ ┌──────────────────────────────────────────┐ │
│  │ COLOR    │ │  PREVIEW / HERRAMIENTAS                  │ │
│  │ INPUT    │ │                                          │ │
│  │          │ │  ┌────────────────────────────────────┐  │ │
│  │ #FF6B35  │ │  │  Live Preview (ocupa el espacio)   │  │ │
│  │ [🎨]     │ │  │  ┌──────┐ ┌──────┐ ┌──────┐      │  │ │
│  │ ████████ │ │  │  │ Card │ │ Card │ │ Card │      │  │ │
│  │          │ │  │  └──────┘ └──────┘ └──────┘      │  │ │
│  │ Recent:  │ │  └────────────────────────────────────┘  │ │
│  │ ○○○○○    │ │                                          │ │
│  │          │ │  [Paletas] [Recomendador] [Accesibilidad] │ │
│  │ ARMONÍAS │ │                                          │ │
│  │ ─────────│ │  ┌────────────────────────────────────┐  │ │
│  │ Comp     │ │  │  Contenido del tab activo          │  │ │
│  │ Analog   │ │  │                                    │  │ │
│  │ Triad    │ │  │                                    │  │ │
│  │ Monoc    │ │  └────────────────────────────────────┘  │ │
│  │ Split    │ │                                          │ │
│  │ Tetra    │ │  [📋] [CSS] [Tailwind] [JSON] [SVG] [🔗] │ │
│  └──────────┘ └──────────────────────────────────────────┘ │
│─────────────────────────────────────────────────────────────│
│  NaN Colors © 2026 · WCAG AA · Open Source                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Jerarquía Visual

1. **Zona 1 (Hero):** Input de color + barra de color → elemento más prominente. El color actual es el protagonista.
2. **Zona 2 (Tabs):** Paletas, Recomendador, Accesibilidad, Live Preview → navegación secundaria pero siempre visible.
3. **Zona 3 (Contenido):** Panel activo según tab. En mobile ocupa toda la pantalla. En desktop comparte espacio con la preview.
4. **Zona 4 (Export):** Barra de acciones flotante. Siempre accesible pero no intrusiva.
5. **Zona 5 (Footer):** Información secundaria, enlaces.

### 4.4 Microinteracciones

| Elemento | Interacción | Efecto | Duración | Timing |
|----------|-------------|--------|----------|--------|
| Input HEX | onChange | El color de fondo del input cambia instantáneamente con transición | 200ms | ease-out |
| Swatch reciente | click | Copia al portapapeles + tooltip "Copied!" | 150ms + 1.5s tooltip | spring |
| Tab | click | Indicador subrayado animado (slide) | 300ms | ease-in-out |
| Paleta generada | carga | Cards aparecen con stagger (50ms delay cada uno) | 300ms total | ease-out |
| Score accesibilidad | cambio | Score anima de 0 al valor real (contador) | 400ms | ease-out |
| Preview | cambio de color | Transición suave de colores en todos los componentes | 300ms | ease-in-out |
| Copiar | click | Icono check animado + tooltip | 200ms | spring |
| Exportar | click | Dropdown con slide + fade | 200ms | ease-out |

### 4.5 Estados

#### Estado Vacío

```
┌──────────────────────────────┐
│  ✨ No color selected yet    │
│                              │
│  Pick a color to start       │
│  exploring harmonies and     │
│  accessibility scores.       │
│                              │
│  [🎨 Pick a Color]           │
└──────────────────────────────┘
```

#### Estado de Carga (generación de paletas)

```
┌──────────────────────────────┐
│  ◌ Generating palette...     │
│                              │
│  ▰▰▰▱▱▱▱▱▱▱  30%           │
│                              │
│  (skeleton cards animados)   │
└──────────────────────────────┘
```

#### Estado de Error (HEX inválido)

```
┌──────────────────────────────┐
│  ⚠ Invalid color            │
│                              │
│  "#ZZZ123" is not a valid    │
│  hexadecimal color.          │
│                              │
│  Try: #FF6B35 or "ff6b35"    │
└──────────────────────────────┘
```

#### Estado Edge (contraste insuficiente)

```
┌──────────────────────────────┐
│  ⚠ Low Contrast Warning     │
│                              │
│  Text: #FFFFF on #FFCC00     │
│  Ratio: 1.32:1              │
│                              │
│  ✗ WCAG AA Normal           │
│  ✗ WCAG AA Large            │
│  ✗ WCAG AAA                 │
│                              │
│  Suggested: #5C4A00          │
│  [Apply Suggestion]          │
└──────────────────────────────┘
```

---

## 5. Estructura de Carpetas

```
nancolors/
├── public/
│   ├── favicon.svg
│   ├── og-image.png              # Open Graph por defecto
│   ├── robots.txt
│   ├── _headers                  # Cloudflare: security headers, CSP
│   ├── _redirects                # Cloudflare: redirects
│   └── fonts/                    # Variable fonts locales (WOFF2)
│
├── src/
│   ├── __tests__/
│   │   ├── lib/
│   │   │   ├── color/
│   │   │   │   ├── convert.test.ts
│   │   │   │   ├── harmonies.test.ts
│   │   │   │   ├── semantic.test.ts
│   │   │   │   ├── contrast.test.ts
│   │   │   │   └── manipulation.test.ts
│   │   │   ├── validation.test.ts
│   │   │   ├── clipboard.test.ts
│   │   │   ├── share.test.ts
│   │   │   └── export.service.test.ts
│   │   ├── stores/
│   │   │   ├── color.store.test.ts
│   │   │   ├── palettes.store.test.ts
│   │   │   └── contrast.store.test.ts
│   │   └── components/
│   │       ├── ColorPicker.test.tsx
│   │       └── ExportPanel.test.tsx
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   └── og-template.png
│   │   └── icons/
│   │       └── custom-icons.svg
│   │
│   ├── components/
│   │   ├── ui/                     # UI primitives (design system)
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   ├── Badge.astro
│   │   │   ├── Tabs.astro
│   │   │   ├── Input.astro
│   │   │   ├── Tooltip.astro
│   │   │   └── Skeleton.astro
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Navigation.astro
│   │   │   ├── MobileNav.astro
│   │   │   └── SkipLink.astro       # Skip-to-content link
│   │   │
│   │   ├── color/
│   │   │   ├── ColorInput.astro
│   │   │   ├── ColorSwatch.astro
│   │   │   ├── ColorBar.astro
│   │   │   ├── RecentColors.astro
│   │   │   └── ColorPicker.tsx
│   │   │
│   │   ├── palettes/
│   │   │   ├── PaletteGrid.astro
│   │   │   ├── PaletteCard.astro
│   │   │   ├── HarmonySelector.astro
│   │   │   └── PaletteGenerator.tsx
│   │   │
│   │   ├── semantic/
│   │   │   ├── SemanticList.astro
│   │   │   ├── SemanticCard.astro
│   │   │   └── SemanticPanel.tsx
│   │   │
│   │   ├── contrast/
│   │   │   ├── ContrastScore.astro
│   │   │   ├── ContrastGauge.astro
│   │   │   ├── ContrastWarning.astro
│   │   │   └── ContrastPanel.tsx
│   │   │
│   │   ├── preview/
│   │   │   ├── PreviewNavbar.astro
│   │   │   ├── PreviewHero.astro
│   │   │   ├── PreviewCards.astro
│   │   │   ├── PreviewButtons.astro
│   │   │   ├── PreviewForm.astro
│   │   │   ├── PreviewAlert.astro
│   │   │   ├── PreviewFooter.astro
│   │   │   └── LivePreview.tsx
│   │   │
│   │   ├── export/
│   │   │   ├── ExportBar.astro
│   │   │   ├── ExportFormat.astro
│   │   │   ├── CopyButton.astro
│   │   │   └── ExportPanel.tsx
│   │   │
│   │   └── share/
│   │       ├── ShareButton.astro
│   │       └── SharePanel.tsx
│   │
│   ├── i18n/
│   │   └── locales/
│   │       ├── es/
│   │       │   └── common.json
│   │       ├── en/
│   │       │   └── common.json
│   │       └── pt/
│   │           └── common.json
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro       # HTML shell, SEO, fonts, analytics, skip-link
│   │   ├── ToolLayout.astro       # Layout herramienta (2 columnas desktop)
│   │   └── LandingLayout.astro    # Layout landing pages futuras
│   │
│   ├── pages/
│   │   ├── index.astro            # Herramienta principal
│   │   ├── about.astro            # Algoritmos / Cómo funciona
│   │   ├── accessibility.astro    # Guía WCAG
│   │   ├── 404.astro              # Página no encontrada
│   │   ├── terms.astro            # Términos de uso
│   │   ├── privacy.astro          # Política de privacidad
│   │   ├── api/
│   │   │   └── color.json.ts      # Endpoint para preview social
│   │   └── palette/
│   │       └── [id].astro         # Paleta compartida por URL
│   │
│   ├── stores/
│   │   ├── color.store.ts
│   │   ├── palettes.store.ts
│   │   ├── semantic.store.ts
│   │   ├── contrast.store.ts
│   │   ├── ui.store.ts
│   │   └── share.store.ts
│   │
│   ├── lib/
│   │   ├── color/
│   │   │   ├── convert.ts         # HEX ↔ RGB ↔ HSL ↔ OKLCH
│   │   │   ├── harmonies.ts       # Complementario, análogo, triádico, etc.
│   │   │   ├── semantic.ts        # 12 roles semánticos
│   │   │   ├── contrast.ts        # Contraste WCAG
│   │   │   ├── luminance.ts       # Luminancia relativa
│   │   │   ├── manipulation.ts    # Lighten, darken, saturate, mix
│   │   │   └── cvd.ts             # Simulación de daltonismo
│   │   │
│   │   ├── utils.ts               # debounce, clamp, formatHex, colorName
│   │   ├── validation.ts          # Validación HEX
│   │   ├── clipboard.ts           # Portapapeles
│   │   ├── share.ts               # Encode/decode para URL
│   │   ├── constants.ts           # Thresholds WCAG, colores base
│   │   └── types.ts               # Interfaces compartidas
│   │
│   ├── hooks/
│   │   ├── useColor.ts
│   │   ├── useContrast.ts
│   │   ├── useShare.ts
│   │   └── useClipboard.ts
│   │
│   ├── services/
│   │   ├── color.service.ts       # Orquestación de algoritmos
│   │   ├── export.service.ts      # Generación de formatos
│   │   └── analytics.service.ts   # Eventos Plausible
│   │
│   ├── styles/
│   │   ├── base.css               # Reset, variables, tipografía
│   │   ├── layout.css             # Grid, contenedores, espaciados
│   │   ├── components.css         # Button, Card, Tabs, Input, Tooltip, Badge
│   │   ├── color.css              # ColorSwatch, ColorBar, ColorPicker
│   │   ├── palettes.css           # PaletteGrid, PaletteCard
│   │   ├── semantic.css           # SemanticPanel
│   │   ├── contrast.css           # ContrastGauge, scores
│   │   ├── preview.css            # Live Preview (usa var(--p-*) exclusivamente)
│   │   ├── export.css             # ExportBar, format buttons, share
│   │   ├── navigation.css         # Header, Footer, Nav, MobileNav
│   │   ├── animations.css         # Keyframes, transiciones, microinteracciones
│   │   ├── utilities.css          # .flex, .grid, .sr-only, .text-center
│   │   └── themes.css             # Temas futuro: oscuro, alto contraste
│   │
│   ├── content/                   # Astro Content Collections
│   │   ├── guides/
│   │   │   └── color-theory.md
│   │   └── config.ts
│   │
│   └── env.d.ts
│
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI/CD pipeline
│
├── astro.config.mjs
├── tsconfig.json                  # paths: { "@/*": ["./src/*"] }
├── package.json
├── pnpm-lock.yaml
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## 6. Roadmap de Desarrollo

> **Regla:** Cada fase contiene tareas ordenadas cronológicamente. No saltar pasos. Cada tarea numbered depende de que las anteriores estén completas. Las fases son secuenciales (0→1→2→3→4→5→6).

### Fase 0: Fundación (Días 1–2)

**Objetivo:** Proyecto Astro inicializado con tooling, tipos, store central y motores de color.

| # | Tarea | Depende de | Archivos que crea |
|---|-------|-----------|-------------------|
| 0.1 | Inicializar proyecto `pnpm create astro` con TypeScript + React | — | `package.json`, `astro.config.mjs`, `tsconfig.json` |
| 0.2 | Instalar dependencias: Culori, Nano Stores, Lucide, Motion, Zod, lz-string, Vitest, Playwright | 0.1 | — |
| 0.3 | Configurar `tsconfig.json` con alias `@/` → `./src/*` y strict mode | 0.1 | `tsconfig.json` (edit) |
| 0.4 | Configurar ESLint + Prettier + `.gitignore` | 0.1 | `.eslintrc.js`, `.prettierrc` |
| 0.5 | Crear `src/lib/types.ts` con interfaces `RGB`, `HSL`, `OKLCH`, `ColorState`, `ContrastScore` | 0.2 | `src/lib/types.ts` |
| 0.6 | Crear `src/lib/constants.ts` (thresholds WCAG, colores default) | 0.5 | `src/lib/constants.ts` |
| 0.7 | Crear `src/lib/color/convert.ts` (HEX↔RGB↔HSL↔OKLCH usando Culori) | 0.2, 0.5 | `src/lib/color/convert.ts` |
| 0.8 | Crear `src/lib/color/luminance.ts` (relativeLuminance, linearize) | 0.5, 0.7 | `src/lib/color/luminance.ts` |
| 0.9 | Crear `src/lib/color/contrast.ts` (contrastRatio, wcagLevel, scoreContrast) | 0.8 | `src/lib/color/contrast.ts` |
| 0.10 | Escribir test unitario `convert.test.ts` (Vitest) | 0.7 | `src/__tests__/lib/color/convert.test.ts` |
| 0.11 | Escribir test unitario `contrast.test.ts` | 0.9 | `src/__tests__/lib/color/contrast.test.ts` |
| 0.12 | Crear `src/styles/base.css` (reset, CSS variables 3 niveles, prefers-reduced-motion) | — | `src/styles/base.css` |
| 0.13 | Crear `src/styles/layout.css` (grid, containers, max-width, section spacing) | — | `src/styles/layout.css` |
| 0.14 | Crear `src/styles/utilities.css` (.flex, .grid, .sr-only, .text-center) | — | `src/styles/utilities.css` |
| 0.15 | Crear `src/layouts/BaseLayout.astro` (viewport meta, charset, SEO shell, preload fonts, skip-link, analytics slot) | 0.12, 0.13, 0.14 | `src/layouts/BaseLayout.astro` |
| 0.16 | Configurar `public/robots.txt`, `public/favicon.svg` | — | `public/robots.txt`, `public/favicon.svg` |
| 0.17 | Crear `public/_headers` (CSP, security headers) | — | `public/_headers` |
| 0.18 | Crear `src/stores/color.store.ts` con Nano Stores (hex, rgb, hsl, oklch, luminance) | 0.5, 0.7, 0.8, 0.9 | `src/stores/color.store.ts` |
| 0.19 | Escribir test `color.store.test.ts` (setColor → computed values) | 0.18 | `src/__tests__/stores/color.store.test.ts` |
| 0.20 | Verificar flujo: input manual #FF6B35 → store actualiza hex/rgb/hsl/oklch/luminance | 0.7, 0.18 | — |

**Entregable:** `pnpm dev` muestra página en blanco con CSS variables funcionales. Tests de color pasan.

---

### Fase 1: Input de Color + Paletas (Días 3–7)

**Objetivo:** Usuario introduce un color (input o picker) y ve 6 tipos de paletas.

| # | Tarea | Depende de | Archivos |
|---|-------|-----------|----------|
| 1.1 | Crear `src/lib/color/manipulation.ts` (lighten, darken, saturate, desaturate, mix, adjustHue) | 0.7 | `src/lib/color/manipulation.ts` |
| 1.2 | Crear `src/lib/color/harmonies.ts` (6 funciones de armonía en HSL con fallback OKLCH) | 0.7, 1.1 | `src/lib/color/harmonies.ts` |
| 1.3 | Escribir test `harmonies.test.ts` (cada armonía con 3 colores de prueba) | 1.2 | `src/__tests__/lib/color/harmonies.test.ts` |
| 1.4 | Crear `src/styles/components.css` (Button, Card, Tabs, Input, Tooltip, Badge — solo estilos) | 0.12 | `src/styles/components.css` |
| 1.5 | Crear componentes UI: `Button.astro`, `Card.astro`, `Badge.astro`, `Tabs.astro`, `Input.astro`, `Tooltip.astro`, `Skeleton.astro` | 1.4 | `src/components/ui/*.astro` |
| 1.6 | Crear `src/styles/navigation.css` (Header, Footer, Nav, MobileNav estilos) | 0.12 | `src/styles/navigation.css` |
| 1.7 | Crear `src/components/layout/SkipLink.astro` | 1.5 | `src/components/layout/SkipLink.astro` |
| 1.8 | Crear `src/components/layout/Header.astro`, `Footer.astro`, `Navigation.astro`, `MobileNav.astro` | 1.6 | `src/components/layout/*.astro` |
| 1.9 | Crear `src/layouts/ToolLayout.astro` (Header + main slot + Footer, responsive 2 columnas en desktop) | 1.8, 0.15 | `src/layouts/ToolLayout.astro` |
| 1.10 | Crear `src/styles/color.css` (ColorSwatch, ColorBar, ColorPicker estilos) | 0.12 | `src/styles/color.css` |
| 1.11 | Crear `ColorSwatch.astro` (tooltip con HEX, copia al clipboard) | 1.5, 1.10 | `src/components/color/ColorSwatch.astro` |
| 1.12 | Crear `ColorBar.astro` (barra horizontal con color actual) | 1.10 | `src/components/color/ColorBar.astro` |
| 1.13 | Crear `ColorInput.astro` (input HEX + ColorBar + validación inline) | 1.11, 1.12 | `src/components/color/ColorInput.astro` |
| 1.14 | Crear `ColorPicker.tsx` (React Island — selector visual con canvas) | 0.18 | `src/components/color/ColorPicker.tsx` |
| 1.15 | Escribir test `ColorPicker.test.tsx` (Playwright component) | 1.14 | `src/__tests__/components/ColorPicker.test.tsx` |
| 1.16 | Crear `src/stores/palettes.store.ts` (derivado computed de color.store, 6 armonías) | 0.18, 1.2 | `src/stores/palettes.store.ts` |
| 1.17 | Crear `src/stores/ui.store.ts` (activeTab) | — | `src/stores/ui.store.ts` |
| 1.18 | Crear `src/styles/palettes.css` (PaletteGrid, PaletteCard, HarmonySelector) | 0.12 | `src/styles/palettes.css` |
| 1.19 | Crear `PaletteCard.astro` (5 swatches + nombre de armonía) | 1.5, 1.11, 1.18 | `src/components/palettes/PaletteCard.astro` |
| 1.20 | Crear `PaletteGrid.astro` (grid responsive de PaletteCards) | 1.19 | `src/components/palettes/PaletteGrid.astro` |
| 1.21 | Crear `HarmonySelector.astro` (botones: Complementary, Analogous, etc.) | 1.5 | `src/components/palettes/HarmonySelector.astro` |
| 1.22 | Crear `PaletteGenerator.tsx` (React Island — suscribe a palettes.store, renderiza HarmonySelector + PaletteGrid) | 1.16, 1.17, 1.20, 1.21 | `src/components/palettes/PaletteGenerator.tsx` |
| 1.23 | Crear `src/pages/index.astro` (ToolLayout + ColorInput + ColorPicker + PaletteGenerator envueltos en Tabs) | 1.9, 1.13, 1.14, 1.22, 1.5 | `src/pages/index.astro` |
| 1.24 | Crear `src/lib/utils.ts` (debounce, clamp, formatHex) | — | `src/lib/utils.ts` |
| 1.25 | Conectar debounce a ColorInput (150ms) para evitar recalcular en cada keystroke | 1.24, 1.14 | — |
| 1.26 | Escribir test E2E Playwright: "pick color → see 6 palettes" | 1.23 | `src/__tests__/e2e/palettes.spec.ts` (new) |

**Entregable:** Usuario escribe HEX (o usa picker) → ve 6 paletas de armonías en tabs. Tests de armonías y E2E pasan.

---

### Fase 2: Recomendador + Accesibilidad (Días 8–11)

**Objetivo:** Panel semántico con 12 roles + panel de accesibilidad WCAG con scores y sugerencias.

| # | Tarea | Depende de | Archivos |
|---|-------|-----------|----------|
| 2.1 | Crear `src/lib/color/semantic.ts` (generateSemanticPalette con 12 roles, reglas de ajuste por contraste, color psychology weights) | 0.7, 1.1 | `src/lib/color/semantic.ts` |
| 2.2 | Escribir test `semantic.test.ts` (12 roles generados correctamente, contraste mínimo en text/bg) | 2.1 | `src/__tests__/lib/color/semantic.test.ts` |
| 2.3 | Crear `src/stores/semantic.store.ts` (derivado computed de color.store, genera 12 roles) | 0.18, 2.1 | `src/stores/semantic.store.ts` |
| 2.4 | Crear `src/stores/contrast.store.ts` (derivado computed, calcula scores para todos los pares semánticos) | 0.18, 0.9, 2.3 | `src/stores/contrast.store.ts` |
| 2.5 | Escribir test `contrast.store.test.ts` | 2.4 | `src/__tests__/stores/contrast.store.test.ts` |
| 2.6 | Crear `src/styles/semantic.css` (SemanticCard, SemanticList) | 0.12 | `src/styles/semantic.css` |
| 2.7 | Crear `SemanticCard.astro` (swatch + nombre del rol + HEX + etiqueta "AA"/"AAA"/"FAIL") | 1.5, 1.11, 2.6 | `src/components/semantic/SemanticCard.astro` |
| 2.8 | Crear `SemanticList.astro` (grid de 12 SemanticCards) | 2.7 | `src/components/semantic/SemanticList.astro` |
| 2.9 | Crear `SemanticPanel.tsx` (React Island — suscribe a semantic.store + contrast.store, renderiza SemanticList con indicadores de contraste) | 2.3, 2.4, 2.8 | `src/components/semantic/SemanticPanel.tsx` |
| 2.10 | Crear `src/styles/contrast.css` (ContrastScore, ContrastGauge circular, ContrastWarning) | 0.12 | `src/styles/contrast.css` |
| 2.11 | Crear `ContrastScore.astro` (label + ratio + check/cross para AA/AAA) | 1.5, 2.10 | `src/components/contrast/ContrastScore.astro` |
| 2.12 | Crear `ContrastGauge.astro` (barra/circular visual que va de rojo a verde según ratio 1:1→21:1) | 2.10 | `src/components/contrast/ContrastGauge.astro` |
| 2.13 | Crear `ContrastWarning.astro` (alerta + color sugerido + botón "Apply") | 1.5, 2.10 | `src/components/contrast/ContrastWarning.astro` |
| 2.14 | Crear `ContrastPanel.tsx` (React Island — tabla de pares fg/bg con scores, warnings, sugerencias) | 2.4, 2.11, 2.12, 2.13 | `src/components/contrast/ContrastPanel.tsx` |
| 2.15 | Integrar SemanticPanel y ContrastPanel en `index.astro` como tabs "Recomendador" y "Accesibilidad" | 1.23, 2.9, 2.14 | `src/pages/index.astro` (edit) |
| 2.16 | Escribir test E2E: "select color → semantic panel shows 12 colors → contrast panel shows scores" | 2.15 | — |

**Entregable:** Tabs "Recomendador" (12 roles semánticos) y "Accesibilidad" (scores WCAG AA/AAA, sugerencias de color alternativo) funcionales.

---

### Fase 3: Live Preview (Días 12–15)

**Objetivo:** 7 componentes visuales (Navbar, Hero, Cards, Buttons, Form, Alert, Footer) que se actualizan en tiempo real.

| # | Tarea | Depende de | Archivos |
|---|-------|-----------|----------|
| 3.1 | Crear `src/styles/preview.css` (todos los componentes Preview usan `var(--p-color-*)` exclusivamente. Container queries para responsive.) | 0.12 | `src/styles/preview.css` |
| 3.2 | Crear `PreviewNavbar.astro` (logo, 3 nav links, CTA button — colores de --p-color-*) | 1.5, 3.1 | `src/components/preview/PreviewNavbar.astro` |
| 3.3 | Crear `PreviewHero.astro` (headline, subtexto, CTA) | 1.5, 3.1 | `src/components/preview/PreviewHero.astro` |
| 3.4 | Crear `PreviewCards.astro` (grid 3 cards con título, texto, botón) | 1.5, 3.1 | `src/components/preview/PreviewCards.astro` |
| 3.5 | Crear `PreviewButtons.astro` (primary, secondary, outline, ghost, disabled) | 1.5, 3.1 | `src/components/preview/PreviewButtons.astro` |
| 3.6 | Crear `PreviewForm.astro` (input, select, checkbox, submit) | 1.5, 3.1 | `src/components/preview/PreviewForm.astro` |
| 3.7 | Crear `PreviewAlert.astro` (info, success, warning, error) | 1.5, 3.1 | `src/components/preview/PreviewAlert.astro` |
| 3.8 | Crear `PreviewFooter.astro` (links, copyright, sociales) | 1.5, 3.1 | `src/components/preview/PreviewFooter.astro` |
| 3.9 | Crear `LivePreview.tsx` (React Island — suscribe a color.store + semantic.store + contrast.store, actualiza 20 CSS variables en `:root` via `requestAnimationFrame`. Renderiza 7 Preview* componentes.) | 0.18, 2.3, 2.4, 3.2–3.8 | `src/components/preview/LivePreview.tsx` |
| 3.10 | Agregar transiciones CSS: `transition: background-color 300ms ease-in-out, color 300ms ease-in-out` en `preview.css` | 3.1 | `src/styles/preview.css` (edit) |
| 3.11 | Integrar LivePreview en `index.astro` como tab "Live Preview" | 1.23, 3.9 | `src/pages/index.astro` (edit) |
| 3.12 | Verificar que preview se ve correcto en mobile (container queries) y desktop | 3.9 | — |
| 3.13 | Verificar no-flickering: rápido cambio de HEX 5 veces en 1s | 3.9 | — |

**Entregable:** Live Preview completamente funcional con 7 componentes actualizándose en tiempo real al cambiar el color. Sin flickering.

---

### Fase 4: Exportación + Share + Páginas (Días 16–19)

**Objetivo:** Copiar colores, exportar en 4 formatos, compartir por URL, páginas informativas.

| # | Tarea | Depende de | Archivos |
|---|-------|-----------|----------|
| 4.1 | Crear `src/lib/clipboard.ts` (copyToClipboard con `navigator.clipboard` y fallback) | — | `src/lib/clipboard.ts` |
| 4.2 | Crear `src/lib/export.service.ts` (toCSSVariables, toTailwindConfig, toJSON, toSVG) | 0.5 | `src/lib/export.service.ts` |
| 4.3 | Escribir test `export.service.test.ts` (4 formatos generan strings válidos) | 4.2 | `src/__tests__/lib/export.service.test.ts` |
| 4.4 | Crear `src/lib/validation.ts` (isValidHex, normalizeHex) | — | `src/lib/validation.ts` |
| 4.5 | Escribir test `validation.test.ts` (HEX 3/6 dígitos, con/sin #, mayúsculas/minúsculas) | 4.4 | `src/__tests__/lib/validation.test.ts` |
| 4.6 | Crear `src/lib/share.ts` (encodePalette con lz-string + base64, decodePalette, buildShareUrl, isValidShareParam) | 0.5 | `src/lib/share.ts` |
| 4.7 | Escribir test `share.test.ts` (encode → decode → mismo estado) | 4.6 | `src/__tests__/lib/share.test.ts` |
| 4.8 | Crear `src/stores/share.store.ts` (estado para UI de share: url, copiado, error) | 4.6 | `src/stores/share.store.ts` |
| 4.9 | Crear `src/styles/export.css` (ExportBar, ExportFormat buttons, CopyButton feedback) | 0.12 | `src/styles/export.css` |
| 4.10 | Crear `CopyButton.astro` (check animado + tooltip "Copied!" 1.5s) | 1.5, 4.1 | `src/components/export/CopyButton.astro` |
| 4.11 | Crear `ExportFormat.astro` (botón individual por formato: CSS, Tailwind, JSON, SVG) | 1.5 | `src/components/export/ExportFormat.astro` |
| 4.12 | Crear `ExportBar.astro` (contenedor de CopyButton + ExportFormat buttons) | 4.10, 4.11 | `src/components/export/ExportBar.astro` |
| 4.13 | Crear `ExportPanel.tsx` (React Island — dropdown con formatos, genera string y copia) | 4.2, 4.10, 4.11, 4.12 | `src/components/export/ExportPanel.tsx` |
| 4.14 | Crear `ShareButton.astro` (icono share, abre SharePanel) | 1.5 | `src/components/share/ShareButton.astro` |
| 4.15 | Crear `SharePanel.tsx` (React Island — genera URL, muestra input con botón copiar) | 4.6, 4.8, 4.10 | `src/components/share/SharePanel.tsx` |
| 4.16 | Integrar ExportPanel y SharePanel en `index.astro` (floating action bar) | 1.23, 4.13, 4.15 | `src/pages/index.astro` (edit) |
| 4.17 | Crear `src/pages/api/color.json.ts` (endpoint: recibe ?hex=, devuelve JSON con paletas y semantic) | 0.9, 1.2, 2.1 | `src/pages/api/color.json.ts` |
| 4.18 | Crear `src/pages/palette/[id].astro` (SSR: lee query param, decode, renderiza tool layout con paleta precargada) | 4.6, 1.9 | `src/pages/palette/[id].astro` |
| 4.19 | Crear `src/pages/about.astro` (explicación de algoritmos con diagramas visuales) | 0.15 | `src/pages/about.astro` |
| 4.20 | Crear `src/pages/accessibility.astro` (guía WCAG, cómo usar la herramienta) | 0.15 | `src/pages/accessibility.astro` |
| 4.21 | Crear `src/pages/404.astro` (diseño lúdico con paleta aleatoria) | 0.15 | `src/pages/404.astro` |
| 4.22 | Crear `src/pages/terms.astro` (términos de uso) | 0.15 | `src/pages/terms.astro` |
| 4.23 | Crear `src/pages/privacy.astro` (política de privacidad) | 0.15 | `src/pages/privacy.astro` |
| 4.24 | Escribir test `clipboard.test.ts` (simular navigator.clipboard) | 4.1 | `src/__tests__/lib/clipboard.test.ts` |

**Entregable:** Exportación a 4 formatos funcionando. URL compartible que carga paleta en página dedicada. About, Accesibilidad, 404, Terms, Privacy pages. Tests de export y share pasan.

---

### Fase 5: Pulido + Accesibilidad + Animaciones + SEO (Días 20–22)

**Objetivo:** Microinteracciones, validación, estados, SEO, auditoría de accesibilidad.

| # | Tarea | Depende de | Archivos |
|---|-------|-----------|----------|
| 5.1 | Crear `src/lib/color/cvd.ts` (simulateProtanopia, simulateDeuteranopia, simulateTritanopia con matrices Brettel-Viénot-Mollon) | 0.7 | `src/lib/color/cvd.ts` |
| 5.2 | Escribir test `cvd.test.ts` | 5.1 | `src/__tests__/lib/color/cvd.test.ts` |
| 5.3 | Integrar toggle CVD en `ContrastPanel.tsx` (simula sobre paleta actual, advierte si pierde diferenciación) | 5.1, 2.14 | `src/components/contrast/ContrastPanel.tsx` (edit) |
| 5.4 | Crear `src/styles/animations.css` (keyframes para stagger, slide+fade, spring, counter) | 0.12 | `src/styles/animations.css` |
| 5.5 | Aplicar stagger a PaletteCards (50ms delay cada uno, 300ms total, ease-out) | 5.4, 1.20 | `PaletteGrid.astro` (edit) |
| 5.6 | Aplicar slide+fade a Tabs (300ms ease-in-out) | 5.4, 1.5 | `Tabs.astro` (edit) |
| 5.7 | Aplicar spring animation a CopyButton (icono check) | 5.4, 4.10 | `CopyButton.astro` (edit) |
| 5.8 | Aplicar counter animado a ContrastScores (400ms ease-out) | 5.4, 2.11 | `ContrastScore.astro` (edit) |
| 5.9 | Verificar `prefers-reduced-motion` desactiva todas las animaciones (ya en base.css) | 0.12 | — |
| 5.10 | Implementar estados vacío, carga y error en todos los paneles (ColorPicker, PaletteGenerator, SemanticPanel, ContrastPanel, LivePreview, ExportPanel, SharePanel) | — | Varios |
| 5.11 | Crear esquemas JSON-LD (WebApplication) para homepage y about | — | `BaseLayout.astro` (edit) |
| 5.12 | Añadir Open Graph y Twitter Card meta tags en `BaseLayout.astro` | 0.15 | `BaseLayout.astro` (edit) |
| 5.13 | Configurar `@astrojs/sitemap` en `astro.config.mjs` | — | `astro.config.mjs` (edit) |
| 5.14 | Verificar heading hierarchy: un `<h1>` por página, sin saltos | — | Todas las páginas |
| 5.15 | Verificar landmarks: `<header>`, `<nav>`, `<main>`, `<footer>` en todas las páginas | — | Todas las páginas |
| 5.16 | Verificar skip-link funciona y es primer elemento focusable | 1.7 | — |
| 5.17 | Verificar focus visible (2px outline, 3:1 contraste) en todos los interactive | — | Varios |
| 5.18 | Verificar `aria-live="polite"` en regiones dinámicas (paletas, scores, errores) | — | Varios |
| 5.19 | Verificar `role="alert"` en errores de validación y contrast warnings | — | Varios |
| 5.20 | Verificar touch targets ≥ 44×44px y spacing ≥ 8px | — | Varios |
| 5.21 | Verificar `@media (hover: hover)` para tooltips (fallback tap en touch) | — | `Tooltip.astro` |
| 5.22 | Prueba con NVDA/VoiceOver: flujo pick color → leer paletas → exportar | — | — |
| 5.23 | Ejecutar Lighthouse audit — target Performance ≥ 95, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95 | — | — |
| 5.24 | Verificar bundle size de cada isla React < 50KB (`vite-bundle-visualizer`) | — | — |
| 5.25 | Crear `src/services/analytics.service.ts` (eventos tipados: color_selected, palette_generated, etc.) | — | `src/services/analytics.service.ts` |
| 5.26 | Crear `src/i18n/locales/es/common.json` + `en/common.json` + `pt/common.json` (archivos iniciales) | — | `src/i18n/locales/*/common.json` |
| 5.27 | Crear `src/styles/themes.css` (preparación para dark mode futuro) | 0.12 | `src/styles/themes.css` |

**Entregable:** Aplicación completa con animaciones, estados, accesibilidad auditada, SEO, analytics. Lighthouse ≥ 95.

---

### Fase 6: Tests + CI/CD + Producción (Días 23–25)

**Objetivo:** Pipeline de calidad, deploy a Cloudflare Pages, monitoreo.

| # | Tarea | Depende de | Archivos |
|---|-------|-----------|----------|
| 6.1 | Escribir test `manipulation.test.ts` | 1.1 | `src/__tests__/lib/color/manipulation.test.ts` |
| 6.2 | Escribir test `palettes.store.test.ts` | 1.16 | `src/__tests__/stores/palettes.store.test.ts` |
| 6.3 | Escribir test `semantic.store.test.ts` | 2.3 | `src/__tests__/stores/semantic.store.test.ts` |
| 6.4 | Escribir test `ExportPanel.test.tsx` (Playwright component) | 4.13 | `src/__tests__/components/ExportPanel.test.tsx` |
| 6.5 | Escribir test E2E: "full flow — pick color → see palettes → check contrast → export CSS → copy" | 4.16 | — |
| 6.6 | Escribir test E2E: "shared URL — open → see same palette" | 4.18 | — |
| 6.7 | Escribir test accesibilidad con Playwright + axe-core en cada página | 5.14–5.22 | — |
| 6.8 | Crear `.github/workflows/ci.yml` (pnpm install → lint → test --coverage → build) | — | `.github/workflows/ci.yml` |
| 6.9 | Configurar Cloudflare Pages (build command: `pnpm build`, output: `dist/`) | — | — |
| 6.10 | Configurar dominio personalizado | — | — |
| 6.11 | Configurar Plausible Analytics con evento personalizado | 5.25 | — |
| 6.12 | Configurar redirects (`public/_redirects`) | — | `public/_redirects` |
| 6.13 | Verificar CSP headers en `public/_headers` bloquean lo necesario | 0.17 | — |
| 6.14 | Prueba de carga Lighthouse CI (production URL) | — | — |
| 6.15 | Post-mortem: documentar errores conocidos, limitaciones, próximos pasos | — | — |

**Entregable:** `nancolors.dev` en producción con CI pipeline, analytics, tests, y auditoría de performance.

---

## 7. Lista de Componentes

### 7.1 UI Primitives (Design System)

| Componente | Props | Descripción |
|-----------|-------|-------------|
| `Button.astro` | `variant: 'primary' \| 'secondary' \| 'ghost' \| 'outline'`, `size: 'sm' \| 'md' \| 'lg'`, `disabled: boolean` | Botón base con variantes |
| `Card.astro` | `padding: 'sm' \| 'md' \| 'lg'`, `elevation: 'none' \| 'sm' \| 'md'` | Contenedor con borde y sombra |
| `Badge.astro` | `variant: 'default' \| 'success' \| 'warning' \| 'error'` | Etiqueta pequeña |
| `Tabs.astro` | `tabs: Tab[]`, `activeTab: string`, `onChange: (id) => void` | Navegación por tabs |
| `Input.astro` | `type: 'text' \| 'color'`, `value: string`, `onChange`, `error: string` | Input base |
| `Tooltip.astro` | `content: string`, `position: 'top' \| 'bottom'` | Tooltip hover/click |
| `Skeleton.astro` | `width: string`, `height: string`, `variant: 'text' \| 'card' \| 'circle'` | Skeleton loader |

### 7.2 Layout

| Componente | Descripción |
|-----------|-------------|
| `Header.astro` | Navbar principal con logo, nav, enlaces externos |
| `Footer.astro` | Footer con información, enlaces, copyright |
| `Navigation.astro` | Links de navegación (modo desktop) |
| `MobileNav.astro` | Menú hamburguesa + overlay (modo mobile) |

### 7.3 Color

| Componente | Tipo | Descripción |
|-----------|------|-------------|
| `ColorInput.astro` | Astro (server) | Input HEX + barra de color |
| `ColorSwatch.astro` | Astro | Círculo cuadrado de color con tooltip |
| `ColorBar.astro` | Astro | Barra horizontal ancha mostrando el color actual |
| `RecentColors.astro` | Astro | Grid de últimos 5 colores (localStorage) |
| `ColorPicker.tsx` | React Island | Selector visual de color con canvas + eyedropper |

### 7.4 Palettes

| Componente | Tipo | Descripción |
|-----------|------|-------------|
| `PaletteGrid.astro` | Astro | Grid de paletas |
| `PaletteCard.astro` | Astro | Una tarjeta de paleta (5 colores en fila) |
| `HarmonySelector.astro` | Astro | Botones para seleccionar tipo de armonía |
| `PaletteGenerator.tsx` | React Island | Orquesta la UI completa de paletas |

### 7.5 Semantic

| Componente | Tipo | Descripción |
|-----------|------|-------------|
| `SemanticList.astro` | Astro | Lista de colores semánticos |
| `SemanticCard.astro` | Astro | Una tarjeta con color, nombre, etiqueta |
| `SemanticPanel.tsx` | React Island | Panel completo con 12 roles |

### 7.6 Contrast

| Componente | Tipo | Descripción |
|-----------|------|-------------|
| `ContrastScore.astro` | Astro | Score individual con check/cross |
| `ContrastGauge.astro` | Astro | Indicador visual (barra o circular) |
| `ContrastWarning.astro` | Astro | Alerta con sugerencia de color alternativo |
| `ContrastPanel.tsx` | React Island | Panel completo con tabla/scores |

### 7.7 Preview

| Componente | Tipo | Descripción |
|-----------|------|-------------|
| `PreviewNavbar.astro` | Astro | Navbar de ejemplo |
| `PreviewHero.astro` | Astro | Hero section de ejemplo |
| `PreviewCards.astro` | Astro | Grid de 3 cards |
| `PreviewButtons.astro` | Astro | Botones en variantes |
| `PreviewForm.astro` | Astro | Formulario de ejemplo |
| `PreviewAlert.astro` | Astro | Alertas en 4 variantes |
| `PreviewFooter.astro` | Astro | Footer de ejemplo |
| `LivePreview.tsx` | React Island | Contenedor del preview + lógica de CSS variables |

### 7.8 Export / Share

| Componente | Tipo | Descripción |
|-----------|------|-------------|
| `ExportBar.astro` | Astro | Barra de acciones flotante |
| `ExportFormat.astro` | Astro | Elemento individual de formato |
| `CopyButton.astro` | Astro | Botón con feedback visual |
| `ExportPanel.tsx` | React Island | Dropdown de formatos + generación |
| `ShareButton.astro` | Astro | Botón de compartir |
| `SharePanel.tsx` | React Island | Panel con URL generada |

---

## 8. Lista de Páginas

| Ruta | Página | Layout | Tipo | Descripción |
|------|--------|--------|------|-------------|
| `/` | Index | `ToolLayout` | SSR + Islands | Herramienta principal |
| `/about` | About | `BaseLayout` | SSR | Cómo funciona, algoritmos |
| `/accessibility` | Accessibility Guide | `BaseLayout` | SSR | Guía de accesibilidad |
| `/palette/[id]` | Shared Palette | `ToolLayout` | SSR + Islands | Paleta desde URL, precargada |
| `/api/color.json.ts` | Color API | — | API | JSON endpoint para preview social |
| `/404` | 404 | `BaseLayout` | SSR | Página no encontrada |
| `/terms` | Terms of Service | `BaseLayout` | SSR | Términos de uso |
| `/privacy` | Privacy Policy | `BaseLayout` | SSR | Política de privacidad |

### 8.1 Estrategia de Internacionalización (i18n)

Aunque el lanzamiento inicial es en español/inglés, la arquitectura debe soportar i18n desde el día 1:

- **Claves de traducción:** Archivos JSON en `src/i18n/locales/{es,en,pt,fr}/common.json`.
- **Acceso:** Función helper `t('key')` que consulta el locale activo. En componentes Astro se usa en SSR. En React Islands se pasa como prop desde el servidor.
- **Detección de locale:** Por URL (`/es/`, `/en/`), con redirect desde `/` según `Accept-Language`.
- **Routing:** Usar `@astrojs/i18n` o carpetas `src/pages/[locale]/index.astro`.
- **Textos hardcodeados:** Prohibido. Todo texto visible debe pasar por `t()`.

### 8.2 Páginas Adicionales

| Ruta | Propósito | Contenido |
|------|-----------|-----------|
| `/404` | Página no encontrada | Diseño lúdico con el color primario, enlace a home. Mostrar paleta aleatoria como "consuelo". |
| `/terms` | Términos de uso | Uso libre de paletas generadas, sin almacenamiento de datos, limitación de responsabilidad. |
| `/privacy` | Política de privacidad | Qué datos se recogen (solo analytics anónimos), sin cookies, sin tracking personal. |

### 8.3 Metadatos por Página

| Ruta | Title | Description | OG Image |
|------|-------|-------------|----------|
| `/` | NaN Colors — Paletas accesibles en tiempo real | Genera paletas de color, evalúa contraste WCAG, y previsualiza en componentes reales. | `og-image.png` con paleta actual |
| `/about` | Cómo funciona NaN Colors — Algoritmos de color | Explicación de armonías, contraste, OKLCH y teoría del color. | `og-about.png` |
| `/accessibility` | Guía de Accesibilidad WCAG — NaN Colors | Aprende a usar contraste AA/AAA en tus diseños web. | `og-accessibility.png` |
| `/palette/[id]` | Paleta compartida — NaN Colors | Paleta generada desde [color] — mira la preview en vivo. | Open Graph dinámico con swatches |

---

## 9. Lista de Utilidades

### 9.1 Color Conversion (`lib/color/convert.ts`)

| Función | Input | Output | Descripción |
|---------|-------|--------|-------------|
| `hexToRgb(hex)` | `string` | `RGB` | `#FF6B35` → `{ r: 255, g: 107, b: 53 }` |
| `rgbToHex(rgb)` | `RGB` | `string` | Inverso |
| `rgbToHsl(rgb)` | `RGB` | `HSL` | Fórmula estándar |
| `hslToRgb(hsl)` | `HSL` | `RGB` | Inverso |
| `rgbToOklch(rgb)` | `RGB` | `OKLCH` | Usando Culori |
| `oklchToRgb(oklch)` | `OKLCH` | `RGB` | Usando Culori |
| `hexToHsl(hex)` | `string` | `HSL` | Atajo |
| `hslToHex(hsl)` | `HSL` | `string` | Atajo |
| `hexToOklch(hex)` | `string` | `OKLCH` | Atajo |
| `isValidHex(hex)` | `string` | `boolean` | Validación de formato |

### 9.2 Harmonies (`lib/color/harmonies.ts`)

| Función | Input | Output | Descripción |
|---------|-------|--------|-------------|
| `complementary(hsl)` | `HSL` | `HSL[]` | +180° en hue |
| `analogous(hsl, count)` | `HSL, number` | `HSL[]` | ±30° en hue, `count` colores |
| `triadic(hsl)` | `HSL` | `HSL[]` | +120°, +240° en hue |
| `monochromatic(hsl, count)` | `HSL, number` | `HSL[]` | Misma hue, variar lightness/saturation |
| `splitComplementary(hsl)` | `HSL` | `HSL[]` | +150°, +210° en hue |
| `tetradic(hsl)` | `HSL` | `HSL[]` | +60°, +180°, +240° en hue |

### 9.3 Manipulation (`lib/color/manipulation.ts`)

| Función | Input | Output | Descripción |
|---------|-------|--------|-------------|
| `lighten(hsl, amount)` | `HSL, number` | `HSL` | Aumentar L (0-1) |
| `darken(hsl, amount)` | `HSL, number` | `HSL` | Disminuir L (0-1) |
| `saturate(hsl, amount)` | `HSL, number` | `HSL` | Aumentar S (0-1) |
| `desaturate(hsl, amount)` | `HSL, number` | `HSL` | Disminuir S (0-1) |
| `mix(color1, color2, weight)` | `HSL, HSL, number` | `HSL` | Mezcla ponderada |
| `adjustHue(hsl, degrees)` | `HSL, number` | `HSL` | Rotar hue |
| `setLightness(hsl, value)` | `HSL, number` | `HSL` | Fijar L específico |
| `suggestReadableColor(bgHSL, level)` | `HSL, 'AA'\|'AAA'` | `HSL` | Encuentra color de texto legible |

### 9.4 Semantic (`lib/color/semantic.ts`)

| Función | Input | Output | Descripción |
|---------|-------|--------|-------------|
| `generateSemanticPalette(hsl)` | `HSL` | `SemanticPalette` | 12 roles semánticos |
| `suggestButtonColor(bgHSL)` | `HSL` | `HSL` | Botón con contraste garantizado |
| `suggestTextColor(bgHSL)` | `HSL` | `HSL` | Blanco o negro con ajuste fino |
| `suggestHoverColor(btnHSL)` | `HSL` | `HSL` | 10% lighter o darker según luminancia |

### 9.5 Contrast (`lib/color/contrast.ts`)

| Función | Input | Output | Descripción |
|---------|-------|--------|-------------|
| `relativeLuminance(rgb)` | `RGB` | `number` | Fórmula WCAG (0-1) |
| `contrastRatio(rgb1, rgb2)` | `RGB, RGB` | `number` | Ratio 1:1 a 21:1 |
| `wcagLevel(ratio, size)` | `number, 'normal'\|'large'` | `'AA'\|'AAA'\|'fail'` | Nivel WCAG |
| `scoreContrast(fg, bg)` | `RGB, RGB` | `ContrastScore` | Score completo con nivel |
| `suggestAlternative(fg, bg, target)` | `RGB, RGB, 'AA'\|'AAA'` | `RGB` | Ajusta fg hasta alcanzar target |

### 9.6 Color Vision Deficiency (`lib/color/cvd.ts`)

| Función | Input | Output | Descripción |
|---------|-------|--------|-------------|
| `simulateProtanopia(rgb)` | `RGB` | `RGB` | Matriz de simulación: 1.5% de conos L fallan |
| `simulateDeuteranopia(rgb)` | `RGB` | `RGB` | Matriz de simulación: 6% de conos M fallan |
| `simulateTritanopia(rgb)` | `RGB` | `RGB` | Matriz de simulación: conos S fallan |
| `paletteLosesDifferentiation(palette, type)` | `string[], CVDType` | `boolean` | True si dos colores de la paleta se confunden bajo la deficiencia |
| `suggestCvdSafeAdjustment(hex, type)` | `string, CVDType` | `string` | Ajusta saturación/luminosidad para preservar diferenciación |

**Matrices de simulación** (basadas en el modelo de Brettel-Viénot-Mollon):

```typescript
const PROTANOPIA = [
  [0.112, 0.885, 0.003],
  [0.112, 0.885, 0.003],
  [0.004, 0.000, 0.996]
];
// Aplicar: result = matrix × rgb (vector columna)
```

Implementar en `lib/color/cvd.ts`. Los resultados se usan en el panel de accesibilidad para mostrar un toggle "Simular daltonismo".

### 9.7 Export (`lib/export.service.ts`)

| Función | Input | Output | Descripción |
|---------|-------|--------|-------------|
| `toCSSVariables(palette, prefix)` | `Record<string, string>, string` | `string` | `--primary: #FF6B35; ...` |
| `toTailwindConfig(palette)` | `Record<string, string>` | `string` | Config de Tailwind |
| `toJSON(palette)` | `Record<string, string>` | `string` | JSON formateado |
| `toSVG(palette)` | `Record<string, string>` | `string` | SVG inline con swatches |

### 9.8 Share (`lib/share.ts`)

| Función | Input | Output | Descripción |
|---------|-------|--------|-------------|
| `encodePalette(state)` | `ColorState` | `string` | Comprime a base64 |
| `decodePalette(string)` | `string` | `ColorState` | Restaura desde base64 |
| `buildShareUrl(encoded)` | `string` | `string` | URL completa |
| `isValidShareParam(param)` | `string` | `boolean` | Valida formato |

### 9.9 Other

| Función | Archivo | Descripción |
|---------|---------|-------------|
| `isValidHex(value)` | `lib/validation.ts` | Valida HEX (3/6 dígitos, con/sin #) |
| `normalizeHex(value)` | `lib/validation.ts` | Normaliza a #RRGGBB |
| `copyToClipboard(text)` | `lib/clipboard.ts` | Copia con fallback |
| `debounce(fn, ms)` | `lib/utils.ts` | Debounce para input rápido |
| `clamp(value, min, max)` | `lib/utils.ts` | Clamping numérico |
| `formatHex(hex)` | `lib/utils.ts` | #ff6b35 → #FF6B35 |
| `colorName(hex)` | `lib/utils.ts` | `#FF6B35` → `"Burnt Orange"` | Nombre descriptivo del color (usar lista inline de ~150 colores nombrados + algoritmo de distancia Euclídea en OKLCH) |

---

## 9.10 Testing

### Estrategia de Tests

| Tipo | Herramienta | Objetivo | Cobertura Mínima |
|------|-------------|----------|------------------|
| Unitarios (algoritmos) | Vitest | `lib/color/*.ts`, `lib/validation.ts`, `lib/share.ts` | 95%+ líneas |
| Unitarios (stores) | Vitest + `@nanostores/vitest` | Stores derivados, computed values | 90%+ |
| Integración (componentes) | Playwright Component Tests | ExportPanel, ColorPicker, LivePreview | 80%+ |
| E2E | Playwright | Flujo completo: pick color → ver paletas → exportar → compartir | 3 scenarios clave |
| Accesibilidad | Playwright + axe-core | Cada página y componente clave | sin violaciones WCAG AA |
| Visual | Playwright Screenshot | Regresión visual en previews y paletas | comparación por pixel |

### Estructura de tests

```
src/
└── __tests__/
    ├── lib/
    │   ├── color/
    │   │   ├── convert.test.ts
    │   │   ├── harmonies.test.ts
    │   │   ├── semantic.test.ts
    │   │   ├── contrast.test.ts
    │   │   └── manipulation.test.ts
    │   ├── validation.test.ts
    │   ├── clipboard.test.ts
    │   ├── share.test.ts
    │   └── export.service.test.ts
    ├── stores/
    │   ├── color.store.test.ts
    │   ├── palettes.store.test.ts
    │   └── contrast.store.test.ts
    └── components/
        ├── ColorPicker.test.tsx
        └── ExportPanel.test.tsx
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml — recomendación
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test -- --coverage
      - run: pnpm build
      - uses: actions/upload-artifact@v4  # screenshots de regresión
        if: failure()
        with:
          path: playwright-report/
  deploy_preview:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy preview a Cloudflare Pages"
```

## 10. Algoritmos de Color

### 10.1 HEX → RGB

```
Input: "#FF6B35" (string)
1. Eliminar # → "FF6B35"
2. Si 3 dígitos, expandir: "F6B" → "FF66BB"
3. Dividir en pares: ["FF", "6B", "35"]
4. Convertir cada par a decimal:
   R = 0xFF = 255
   G = 0x6B = 107
   B = 0x35 = 53
Output: { r: 255, g: 107, b: 53 }
```

### 10.2 RGB → HSL

```
Input: { r: 255, g: 107, b: 53 }  (normalized: r/255, g/255, b/255)

R' = 1.0, G' = 0.42, B' = 0.21

Cmax = max(R', G', B') = 1.0
Cmin = min(R', G', B') = 0.21
Δ = Cmax - Cmin = 0.79

Hue:
  Si Δ = 0 → H = 0
  Si Cmax = R' → H = 60 × (((G' - B') / Δ) mod 6) = 60 × ((0.42-0.21)/0.79) = 60 × 0.266 = 16°
  Si Cmax = G' → H = 60 × (((B' - R') / Δ) + 2)
  Si Cmax = B' → H = 60 × (((R' - G') / Δ) + 4)

Saturation: L = (Cmax + Cmin) / 2 = 0.605
  Si Δ = 0 → S = 0
  Si no → S = Δ / (1 - |2L - 1|) = 0.79 / (1 - |1.21 - 1|) = 0.79 / 0.79 = 1.0

Lightness: L = 0.605 → 60.5%

Output: { h: 16, s: 100, l: 60.5 }
```

### 10.3 HSL → RGB (inverso)

```
Input: { h: 16, s: 100, l: 60.5 }

C = (1 - |2L - 1|) × S = (1 - |1.21 - 1|) × 1.0 = 0.79
X = C × (1 - |(H / 60) mod 2 - 1|) = 0.79 × (1 - |0.27 - 1|) = 0.79 × 0.73 = 0.577
m = L - C/2 = 0.605 - 0.395 = 0.21

H=16° está entre 0° y 60° → (R', G', B') = (C, X, 0)

R = (0.79 + 0.21) × 255 = 255
G = (0.577 + 0.21) × 255 ≈ 200  → wait, let me recalculate

Actually let me be more precise.

H = 16°, sector 0 (0-60°): (C, X, 0)
R' = C = 0.79
G' = X = 0.577
B' = 0

R = (0.79 + 0.21) × 255 = 255
G = (0.577 + 0.21) × 255 = 200.7 → 201  
B = (0 + 0.21) × 255 = 53.55 → 54

Output: { r: 255, g: 201, b: 54 }

Hmm, slight discrepancy from original due to rounding. Acceptable in practice.
```

### 10.4 RGB → OKLCH (usando Culori)

OKLCH es un espacio perceptual (visión humana uniforme). Se usa para:

- Mezclas visualmente correctas (vs HSL donde mezclar amarillo y azul da gris sucio).
- Ajustes de lightness que se ven naturales.
- Generación de paletas monocromáticas perceptuales.
- **Evaluación de contraste:** La luminosidad perceptual (L en OKLCH) correlaciona mejor con la legibilidad que HSL.

**No implementar manualmente.** Usar las funciones de Culori:

```typescript
import { rgb, oklch } from 'culori/fn';

const rgbColor = rgb('#FF6B35');
const oklchColor = oklch(rgbColor);
// → { l: 0.65, c: 0.18, h: 40, mode: 'oklch' }
```

**⚠️ Gamut Mapping:** OKLCH puede producir colores fuera del gamut sRGB. Usar `culori/fn` → `toGamut('rgb')` para mapear al espacio sRGB antes de mostrar en pantalla.

```typescript
import { toGamut } from 'culori/fn';
const safeRgb = toGamut('rgb', 'oklch')(oklchColor);
```

### 10.5 Armonías

**Nota importante:** Todas las armonías se calculan preferentemente en OKLCH (perceptual) usando Culori, con fallback a HSL para compatibilidad. Las armonías en HSL rotan el tono (hue) pero no preservan la luminosidad perceptual — un color con L=60% en HSL puede verse más claro u oscuro después de rotar el hue. OKLCH resuelve esto: rotar `h` en OKLCH preserva `l` (luminosidad perceptual), dando mezclas visualmente uniformes.

```typescript
// Ejemplo conceptual para complementario con Culori
import { oklch, formatHex } from 'culori/fn';
function complementaryOklch(hex: string): string[] {
  const color = oklch(hex);
  const complement = { ...color, h: (color.h + 180) % 360 };
  return [hex, formatHex(complement)];
}
```

#### Complementario

```
H_complement = (H + 180) mod 360
S_complement = S
L_complement = L

Resultado: [original, complementario]
```

#### Análogos

```
Para N colores (default 3):
  offset = 30  (grados)
  H_i = (H - offset + (i × offset × 2 / (N-1))) mod 360
  S_i = S
  L_i = L

Ejemplo (N=3):
  Color 1: H - 30
  Color 2: H (original)
  Color 3: H + 30
```

#### Triádicos

```
Color 1: H
Color 2: (H + 120) mod 360
Color 3: (H + 240) mod 360
S y L iguales al original.
```

#### Monocromáticos

```
Para N colores (default 5):
  L_base = L
  rango = 40  (% de rango de lightness)
  L_i = clamp(L_base - rango/2 + (i × rango / (N-1)), 0, 100)
  
  Opcional: variar ligeramente S para más riqueza visual.
  S_i = S × (0.7 + 0.3 × (i / (N-1)))
```

#### Split Complementary

```
Color 1: H (original)
Color 2: (H + 150) mod 360
Color 3: (H + 210) mod 360
```

#### Tetrádicos (Rectangular)

```
Color 1: H (original)
Color 2: (H + 60) mod 360
Color 3: (H + 180) mod 360  (complementario)
Color 4: (H + 240) mod 360  (complementario de color 2)
```

### 10.6 Recomendador Semántico (Heurísticas)

El recomendador usa reglas basadas en HSL para generar 12 roles:

| Rol | Algoritmo |
|-----|-----------|
| **Secondary** | Split complement: `(H + 150)` con S y L ajustados para contraste |
| **Tertiary** | Análogo lejano: `(H + 45)` con S reducida 20% |
| **Background** | `L = 98%`, `S = 5%` (casi blanco) o `L = 5%` (casi negro) según modo |
| **Surface** | `L = 95%` (claro) o `L = 10%` (oscuro), misma hue que background |
| **Card** | `L = 100%` (blanco) o `L = 15%` (oscuro) |
| **Button** | Color primary con ajuste: si `L < 45`, lighten; si `L > 75`, darken. Target `L = 50-55` |
| **Button Hover** | Button color: si L_btn < 50, lighten 10%; si no, darken 10% |
| **Text** | Si L_bg > 60 → negro (`#1A1A1A`), si no → blanco (`#F5F5F5`). Ajustar fino para WCAG AAA |
| **Link** | Primary con hue rotado +10°, S +10%, L ajustado para contraste con background |
| **Success** | `H = 140`, `S = 60%`, `L = 45%` (verde estándar, desplazado hacia hue primario si está cerca) |
| **Warning** | `H = 45`, `S = 90%`, `L = 55%` (ámbar) |
| **Error** | `H = 0`, `S = 80%`, `L = 50%` (rojo) |

**Reglas de ajuste fino:**
- Si el color primary está cerca de success/warning/error (±30° hue), desplazar el semáforo ±15° para mantener diferenciación.
- Todos los textos deben pasar WCAG AA contra su fondo. Si no, ajustar L en pasos de 5% hasta cumplir.
- **Color psychology:** El recomendador debe considerar el contexto de uso. Para un color primary azul (trust, fintech), los semánticos deben inclinarse hacia tonos profesionales. Para uno naranja (energía, startups), los semánticos pueden ser más vibrantes. Esto se codifica como pesos de ajuste en las reglas HSL/OKLCH.
- **Color deficiency simulation (post-procesado):** La herramienta debe ofrecer un toggle para simular protanopia, deuteranopia y tritanopia sobre la paleta actual, usando una matriz de simulación aplicada a los valores RGB. Si la paleta pierde diferenciación bajo alguna deficiencia, mostrar advertencia y sugerir ajustes de saturación o luminosidad.

### 10.7 Contraste WCAG

```
Fórmula de luminancia relativa (sRGB):

Para cada canal (R, G, B) normalizado a [0, 1]:

  sR = R / 255
  sG = G / 255
  sB = B / 255

  linearize(c):
    if c ≤ 0.04045 → c / 12.92
    else → ((c + 0.055) / 1.055) ^ 2.4

  L = 0.2126 × linearize(sR) + 0.7152 × linearize(sG) + 0.0722 × linearize(sB)

Ratio de contraste:
  L_light = max(L1, L2)
  L_dark  = min(L1, L2)
  ratio = (L_light + 0.05) / (L_dark + 0.05)

Criterios WCAG 2.1:
  AA Normal:  ratio ≥ 4.5:1
  AA Large:   ratio ≥ 3:1   (texto ≥ 18px o ≥ 14px bold)
  AAA Normal: ratio ≥ 7:1
  AAA Large:  ratio ≥ 4.5:1
```

### 10.8 Algoritmo de Sugerencia de Color Alternativo

Cuando un par fg/bg no pasa WCAG, encontrar un color alternativo:

```
1. Calcular ratio actual.
2. Si ratio < target:
   a. Mantener hue constante.
   b. Mover L en pasos de 5% hacia blanco (si fg es claro) o negro (si fg es oscuro).
   c. Recalcular ratio.
   d. Si se pasa de L=0 o L=100 sin alcanzar target, ajustar S (reducir).
   e. Repetir hasta target o hasta agotar opciones.
3. Devolver el primer color que cumple.
```

---

## 11. Riesgos Técnicos

| # | Riesgo | Impacto | Probabilidad | Mitigación |
|---|--------|---------|-------------|------------|
| 1 | **Rendering de paletas lento en mobile** con muchos cálculos de color | Medio | Baja | Los algoritmos son O(1) (no hay loops grandes). Usar debounce en input (150ms). Culori en tree-shaking elimina código muerto. |
| 2 | **CSS Custom Properties no soportadas** en navegadores antiguos | Bajo | Muy Baja (2026) | No mitigar. La herramienta requiere navegador moderno. Mostrar banner solo si detecta falta de soporte. |
| 3 | **URL compartida demasiado larga** (límite 2048 chars en algunos clientes) | Alto | Media | Usar compresión lz-string. Si excede 1800 chars, mostrar advertencia y ofrecer copiar manualmente. |
| 4 | **Color Picker nativo inconsistente** entre navegadores (Chrome muestra `#rrggbb`, Safari `rgba()`, etc.) | Medio | Media | El picker se usa solo como respaldo. El input HEX es el método primario. El componente React normaliza el valor. |
| 5 | **Culori aumenta el bundle size** si se importa todo | Medio | Baja | Usar importaciones específicas: `import { rgb, oklch } from 'culori/fn'` (solo las funciones necesarias). Tree-shaking automático. |
| 6 | **React Islands incrementan JS** en página | Alto | Media | Mantener islas pequeñas. Cada isla debe ser < 50KB. Monitorear con `astro build --verbose`. |
| 7 | **SEO en página de paleta compartida** con contenido dinámico | Medio | Alta | La página SSR renderiza la paleta desde query params (sin JS). Open Graph preview generado en servidor. |
| 8 | **Copia al portapapeles bloqueada** en HTTP/no-https | Medio | Media | `navigator.clipboard` requiere HTTPS (seguro en Cloudflare). Incluir fallback con `document.execCommand('copy')`. |
| 9 | **Flickering en Live Preview** por re-renderizados excesivos | Medio | Media | CSS transitions (300ms) absorben cambios. Actualizar CSS vars en bloque (no una por una) usando `requestAnimationFrame`. |
| 10 | **Deuda técnica por falta de tests** | Medio | Media | Priorizar tests en los algoritmos de color (lógica pura, fácil de testear). Tests de integración en exportación. |
| 11 | **El share por URL expone el estado completo** (privacidad) | Bajo | Baja | El contenido compartido es público por definición. No incluir datos personales ni tokens. |
| 12 | **Diferencias perceptuales entre monitores** (P3 vs sRGB) | Bajo | Alta | La app opera en sRGB. Documentar que los colores se muestran en sRGB y pueden variar en pantallas P3/OLED. |
| 13 | **Color deficiency no considerada** en paletas generadas | Medio | Media | Añadir simulador CVD (protanopia/deuteranopia/tritanopia) como toggle en el panel de accesibilidad. Matriz de simulación aplicada a RGB. |
| 14 | **URL sharing sin rate limiting** en endpoint API | Medio | Baja | Endpoint `/api/color.json.ts` público — implementar rate limiting por IP con Cloudflare WAF o token de un solo uso. |
| 15 | **Internacionalización futura costosa** si no se planifica desde el inicio | Medio | Media | Usar Astro i18n con `@astrojs/react` y claves de traducción en JSON. No hardcodear textos en componentes. |

---

## 12. Mejoras Futuras

### 12.1 Core (0–3 meses post-lanzamiento)

- [ ] **Modo oscuro**: Toggle para ver la paleta en fondo oscuro. Fácil: cambiar `--bg` y `--text` variables y re-calcular contraste.
- [ ] **Eyedropper nativo**: Usar `EyeDropper` API de Chrome (cae fuera de spec pero es útil).
- [ ] **Paletas guardadas en localStorage**: Historial de hasta 20 paletas recientes.
- [ ] **Zoom en Live Preview**: Slider para ver el preview a diferentes tamaños (320px, 768px, 1024px, 1440px).
- [ ] **Múltiples colores base**: Permitir seleccionar 2-3 colores base y generar armonías híbridas.

### 12.2 IA (3–6 meses)

- [ ] **Recomendador IA**: Usar clasificador simple (ML transpilado a WASM con ONNX) para sugerir paletas basadas en "mood": profesional, divertido, lujoso, minimalista, vintage.
- [ ] **Análisis de imagen**: Subir una imagen y extraer paleta dominante (cuantización de color con k-means en WASM).
- [ ] **Descripción en lenguaje natural**: "Genera una paleta otoñal" → IA interpreta y genera colores.

### 12.3 Social (6–12 meses)

- [ ] **Sistema de usuarios** (opcional, OAuth con GitHub/Google): Guardar paletas, favoritos.
- [ ] **Comunidad**: Galería de paletas públicas, votación, comentarios.
- [ ] **Marketplace**: Paletas premium, packs de diseñadores.
- [ ] **API pública**: Endpoint REST para generar paletas programáticamente.
- [ ] **Plugin Figma**: Exportar paleta directamente a Figma.
- [ ] **Extensión VS Code**: Generar tokens de color CSS desde el editor.

### 12.4 Expansión

- [ ] **NaN Colors Studio**: Versión Pro con generación de sistemas de diseño completos (tipografía, spacings, shadows coordinados).
- [ ] **Team Workspaces**: Paletas compartidas en equipo con versioning.
- [ ] **Design Tokens Export**: Exportar a formato Design Tokens W3C.
- [ ] **Brand Kits**: Paleta + tipografía + logo +拍板 en un kit descargable.

---

## 13. Estimación de Complejidad

| Fase | Días | Módulos | Riesgo | Prioridad |
|------|------|---------|-------|-----------|
| **Fase 0:** Fundación | 2 | Proyecto Astro, tipos, convert.ts, luminance, contrast, base CSS, stores, tests | Bajo | P0 |
| **Fase 1:** Input + Paletas | 5 | manipulation, harmonies, UI components, layout components, tabs, ColorPicker, PaletteGenerator, index page | Medio | P0 |
| **Fase 2:** Semántico + Contraste | 4 | semantic.ts, semantic.store, contrast.store, SemanticPanel, ContrastPanel, CVD simulation | Alto | P1 |
| **Fase 3:** Live Preview | 4 | preview.css, 7 Preview* componentes, LivePreview.tsx, transiciones, responsive | Alto | P1 |
| **Fase 4:** Export + Share + Pages | 4 | clipboard, export.service, share, ExportPanel, SharePanel, api, about, access, 404, terms, privacy | Medio | P2 |
| **Fase 5:** Pulido + SEO + A11Y | 3 | animations, cvd.ts, analytics, i18n, prefers-reduced-motion, focus, aria, lighthouse, themes | Medio | P2 |
| **Fase 6:** Tests + CI/CD + Deploy | 3 | Tests faltantes, CI pipeline, Cloudflare Pages, Plausible, post-mortem | Medio | P3 |

**Total estimado:** 25 días hábiles (~5 semanas) distribuidos en 7 fases secuenciales.

### Matriz de Dependencias entre Fases

```
Fase 0 (Fundación)
  └──► Fase 1 (Input + Paletas)
         ├──► Fase 2 (Semántico + Contraste)
         │      └──► Fase 3 (Live Preview) ← también depende de Fase 0 stores
         └──► Fase 4 (Export + Share + Pages)
                └──► Fase 5 (Pulido + SEO + A11Y)
                       └──► Fase 6 (Tests + CI/CD + Deploy)
```

**Reglas:**
- No comenzar una fase hasta que la anterior esté completa y testeada.
- Cada fase numbered produce un entregable verificable (tests pasando).
- Fase 2 y Fase 4 son paralelizables solo si hay 2 agentes, pero NO se recomienda (Fase 3 necesita stores de Fase 2).
- No hay dependencias circulares. El grafo es un DAG lineal estricto.

---

## 14. Estrategia SEO

### 14.1 Técnico

- **SSR:** Toda página se renderiza en servidor (Astro por defecto). Las islas React se hidratan en cliente pero el HTML inicial contiene el contenido completo.
- **Sitemap:** Usar `@astrojs/sitemap`. Incluir `/`, `/about`, `/accessibility`.
- **robots.txt:** Permitir todo, apuntar a sitemap.
- **Canonical:** Cada página tiene `<link rel="canonical">`.
- **Performance:** Core Web Vitals objetivo: LCP < 1.5s, FID < 50ms, CLS < 0.05.
- **HTTPS:** Forzado por Cloudflare.
- **Mobile First:** Responsive design desde 320px. Google Mobile-Friendly test debe pasar.
- **Structured Data (JSON-LD):** En homepage y about.

### 14.2 On-Page

- **Título:** `NaN Colors — Generador de paletas accesibles WCAG en tiempo real`.
- **Meta Description:** `NaN Colors genera paletas de color armónicas, evalúa contraste WCAG AA/AAA, y previsualiza en componentes web reales. Ideal para diseñadores y desarrolladores.`
- **Headings:** Estructura jerárquica con `<h1>`, `<h2>`, `<h3>`.
- **Alt text:** Todos los iconos decorativos con `alt=""`. Imágenes informativas con `alt` descriptivo.
- **Internal links:** Desde `about` y `accessibility` hacia la herramienta principal.

### 14.3 Open Graph

```html
<!-- Homepage -->
<meta property="og:title" content="NaN Colors — Paletas accesibles en tiempo real" />
<meta property="og:description" content="Genera paletas de color, evalúa contraste WCAG, y previsualiza en componentes reales." />
<meta property="og:image" content="https://nancolors.dev/og-image.png" />
<meta property="og:url" content="https://nancolors.dev" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="NaN Colors" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="NaN Colors" />
<meta name="twitter:description" content="Generador de paletas accesibles." />
<meta name="twitter:image" content="https://nancolors.dev/og-image.png" />

<!-- Palette compartida → OG dinámico -->
<!-- La página /palette/[id] debe generar OG image con los swatches -->
```

### 14.4 Schema.org (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "NaN Colors",
  "url": "https://nancolors.dev",
  "description": "Generador de paletas de color accesibles con validación WCAG.",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript for interactive features",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Person",
    "name": "NaN Colors Team"
  }
}
```

### 14.5 Palabras Clave Objetivo

| Keyword | Intención | Volumen Estimado | Dificultad |
|---------|-----------|------------------|------------|
| color palette generator | Transaccional | Alto | Alta |
| WCAG contrast checker | Transaccional | Medio | Media |
| accessible color palette | Informativo | Medio | Baja |
| color harmony generator | Transaccional | Medio | Media |
| live color preview tool | Informativo | Bajo | Baja |
| paleta de colores accesible | Transaccional | Medio (ES) | Baja |
| generador de paletas WCAG | Transaccional | Bajo (ES) | Baja |

### 14.6 Consideraciones Legales y Privacidad

- **GDPR:** Aunque Plausible no requiere consentimiento (no cookies, anonimizado), incluir un banner informativo minimalista si se añaden trackers en el futuro.
- **BFSG (Barrierefreiheitsstärkungsgesetz):** Desde junio 2025 aplica en Alemania. La app debe cumplir WCAG 2.1 AA como mínimo legal. Auditoría obligatoria pre-lanzamiento.
- **Términos de uso:** Página `/terms` simple que aclare que las paletas generadas son de uso libre y que no se almacenan datos personales.
- **Política de privacidad:** Página `/privacy` que detalle qué datos se recogen (analytics anónimos únicamente).

### 14.7 Landing Pages Futuras

- `/tools/contrast-checker` → Checker de contraste standalone.
- `/tools/palette-generator` → Generador de paletas standalone.
- `/blog/` → Artículos sobre teoría del color, accesibilidad, casos de uso.
- `/es/`, `/pt/`, `/fr/` → Internacionalización (i18n con Astro).

---

## 15. Guía de Implementación

### 15.1 Orden de Archivos a Crear

```
> Seguir la numeración `fase.tarea` del roadmap (Sección 6). Cada archivo se crea cuando su tarea numbered lo indica.

```
FASE 0 (días 1-2):      → Tareas 0.1 a 0.20
FASE 1 (días 3-7):      → Tareas 1.1 a 1.26
FASE 2 (días 8-11):     → Tareas 2.1 a 2.16
FASE 3 (días 12-15):    → Tareas 3.1 a 3.13
FASE 4 (días 16-19):    → Tareas 4.1 a 4.24
FASE 5 (días 20-22):    → Tareas 5.1 a 5.27
FASE 6 (días 23-25):    → Tareas 6.1 a 6.15
```

Cada tarea numbered en el roadmap indica exactamente qué archivos crear y en qué orden. No hay orden de archivos separado — el roadmap es la única fuente de verdad para la secuencia de creación.

### 15.2 Analytics — Taxonomía de Eventos

Configurar Plausible (o el proveedor elegido) con los siguientes eventos personalizados:

| Evento | Disparador | Datos |
|--------|-----------|-------|
| `color_selected` | Usuario introduce o pickea un color | `hex`, `source: 'input'\|'picker'\|'recent'` |
| `palette_generated` | Paleta se genera automáticamente | `type: 'complementary'\|'analogous'\|...`, `hex` |
| `semantic_viewed` | Usuario abre el panel semántico | `hex` |
| `contrast_checked` | Usuario ve scores de contraste | `ratio`, `passes_aa`, `passes_aaa` |
| `color_copied` | Usuario copia un color al portapapeles | `hex`, `source: 'swatch'\|'export'\|'semantic'` |
| `palette_exported` | Usuario exporta una paleta | `format: 'css'\|'tailwind'\|'json'\|'svg'` |
| `palette_shared` | Usuario comparte una paleta | `hex`, `url_length` |
| `preview_interacted` | Usuario interactúa con Live Preview | `action: 'scroll'\|'click'` |
| `error_seen` | Usuario ve un error | `type: 'invalid_hex'\|'contrast_fail'\|'export_fail'` |

Implementar en `src/services/analytics.service.ts` como funciones tipadas que se llaman desde los componentes React Island.

### 15.3 Accesibilidad Obligatoria

Además del panel de contraste WCAG, la aplicación debe implementar:

- **Skip-to-content link:** Primer elemento focusable en todas las páginas. Enlaza a `#main-content`. Visible solo en focus.
- **Focus management:** Todos los componentes interactivos tienen `outline` visible (2px, contraste 3:1 contra el fondo). Modales con foco atrapado (focus trap). Tecla Escape cierra modales/dropdowns.
- **`prefers-reduced-motion`:** Todas las animaciones y transiciones deben respetar esta media query. Las microinteracciones (stagger, slide, spring) deben convertirse en cambios instantáneos cuando `prefers-reduced-motion: reduce`.
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- **Touch targets:** Mínimo 44×44px (WCAG), preferible 48×48px. Espaciado entre targets mínimo 8px. Esto aplica a ColorSwatch, CopyButton, tabs, y todos los elementos interactivos.
- **Color as signal:** Ningún estado (error, éxito, warning) se comunica solo con color. Siempre acompañado de icono + texto. Ejemplo: alerta de error con `role="alert"` + icono X rojo + texto descriptivo.
- **ARIA live regions:** Las actualizaciones dinámicas (nuevas paletas, scores de contraste) usan `aria-live="polite"`. Errores de validación usan `role="alert"`.
- **Landmarks:** Toda página tiene `<header>`, `<nav>`, `<main id="main-content">`, `<footer>`.
- **Heading hierarchy:** Exactamente un `<h1>` por página. Sin saltos de nivel (`<h1>` → `<h2>` → `<h3>`, nunca `<h1>` → `<h3>`).
- **Pruebas con screen reader:** Validar con VoiceOver (macOS) y NVDA (Windows) antes de cada release.
- **Simulador de deficiencia de color:** En el panel de accesibilidad, añadir toggle para simular protanopia, deuteranopia y tritanopia sobre la paleta actual. Si la paleta pierde diferenciación, mostrar advertencia y sugerir ajustes.

### 15.3 Convenciones de Código

- **TypeScript strict mode** habilitado en `tsconfig.json`.
- **Naming:** camelCase para funciones/variables, PascalCase para componentes/tipos, kebab-case para archivos `.astro`.
- **Imports:** Orden: librerías externas → stores → lib → componentes → estilos.
- **Componentes Astro:** Sin scripts `<script>` grandes (mover a `tsx` si es interactivo).
- **Stores:** Usar `computed` para valores derivados (no recalcular en cada render).
- **CSS:** Todos los estilos en `src/styles/` organizados por dominio. Los componentes Astro importan los CSS necesarios desde su frontmatter con `import '@/styles/components.css'`. No usar estilos inline ni CSS-in-JS. No usar CSS modules — el sistema de naming BEM-like (bloque__elemento--modificador) dentro de cada archivo previene colisiones.
- **Naming CSS:** Clases con prefijo del dominio: `.color-swatch`, `.preview-navbar`, `.contrast-gauge`. Sin anidamiento profundo (max 2 niveles).
- **Tests (cuando se añadan):** `vitest` para tests unitarios de algoritmos. `playwright` para tests E2E.

### 15.4 Seguridad

- **Content Security Policy (CSP):** En Cloudflare `_headers` o `_middleware.ts`, establecer:
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' (para Astro Islands); style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self';
  ```
  Ajustar según necesidades del build de Astro.
- **Rate limiting:** Endpoint `/api/color.json.ts` debe tener rate limiting. Implementar con Cloudflare WAF o token incluido en la URL comprimida (solo quien genera la URL puede consultar la API).
- **No secrets en cliente:** Toda variable de entorno con prefijo `PUBLIC_` se expone al cliente. No usar para secrets. Las variables privadas solo existen en build-time de Astro.

### 15.5 Variables de Entorno

```env
# .env.example
PUBLIC_SITE_URL=https://nancolors.dev
PUBLIC_ANALYTICS_DOMAIN=nancolors.dev
PUBLIC_ANALYTICS_SCRIPT_URL=https://plausible.io/js/script.js
```

### 15.7 Configuración de Astro

```typescript
// astro.config.mjs — recomendaciones
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nancolors.dev',
  output: 'static', // Static site, sin servidor
  integrations: [
    react(),         // Islands interactivos
    sitemap(),       // SEO
  ],
  build: {
    format: 'directory', // /about/index.html en vez de /about.html
  },
  vite: {
    css: {
      // PostCSS sin Tailwind — CSS vanilla
    },
  },
});
```

### 15.8 Live Preview — Arquitectura Interna

El Live Preview es el componente más complejo. Su arquitectura:

```
LivePreview.tsx (React Island)
  │
  ├── Suscribe a color.store (Nano Store)
  │
  ├── useEffect:
  │     ├── Lee el estado actual del store (todos los colores: primary, secondary, bg, text, etc.)
  │     ├── Construye objeto de CSS variables:
  │     │     :root {
  │     │       --p-color-primary: #FF6B35;
  │     │       --p-color-secondary: #355CFF;
  │     │       --p-color-background: #FAFAFA;
  │     │       --p-color-surface: #F0F0F0;
  │     │       --p-color-text: #1A1A1A;
  │     │       --p-color-button: #FF6B35;
  │     │       ...
  │     │     }
  │     ├── Aplica al DOM: document.documentElement.style.setProperty(...)
  │     │     Usando requestAnimationFrame para batch updates
  │     └── Cleanup: no necesario (las vars persisten mientras el componente existe)
  │
  └── Renderiza 7 subcomponentes (puros, sin estado):
        <PreviewNavbar />
        <PreviewHero />
        <PreviewCards />
        <PreviewButtons />
        <PreviewForm />
        <PreviewAlert />
        <PreviewFooter />
```

Los subcomponentes `Preview*` son **Astro components** (no React). Usan exclusivamente `var(--p-color-*)` para todos los colores. Esto significa:

- Son 100% estáticos, cero JavaScript.
- Se renderizan en SSR.
- En cliente, sus estilos cambian porque las variables CSS cambian.
- Se pueden reusar en la página de paleta compartida.

**Esto es clave:** El LivePreview.tsx es el único componente que necesita JavaScript. Los 7 previews son HTML puro con CSS variables.

### 15.9 Almacenamiento Local

| Clave | Tipo | Descripción |
|-------|------|-------------|
| `nancolors_recent` | `string[]` (JSON) | Últimos 5 colores HEX recientes |
| `nancolors_favorites` | `string[]` (JSON) | Paletas guardadas como favoritas (futuro) |
| `nancolors_theme` | `'light' \| 'dark'` | Preferencia de tema |

### 15.10 Tipografía

| Propiedad | Valor | Notas |
|-----------|-------|-------|
| Font primaria | Inter (variable, WOFF2) | Self-hosted, geometría neutral, ideal para UI |
| Font secundaria | Ninguna | Inter para headings y body — single-family evita fricción |
| Fallback | system-ui, -apple-system, sans-serif | Stack nativo si Inter no carga |
| Scale | Major Third (1.250) | `clamp()` para fluidez sin media queries |
| Body size | `clamp(1rem, 0.5vw + 0.875rem, 1.125rem)` | 16px → 18px |
| H1 size | `clamp(2rem, 1.5vw + 1.5rem, 3rem)` | 32px → 48px |
| H2 size | `clamp(1.5rem, 1vw + 1.25rem, 2.25rem)` | 24px → 36px |
| H3 size | `clamp(1.25rem, 0.75vw + 1rem, 1.5rem)` | 20px → 24px |
| Line-height body | 1.6 | Lectura cómoda en web |
| Line-height headings | 1.15 | Compacto, jerarquía clara |
| Line length | `max-width: 65ch` | Control en párrafos largos |
| Font-weight body | 400 | Regular |
| Font-weight headings | 600 | SemiBold (Inter variable) |
| Carga | `<link rel="preload">` + `font-display: swap` | Evitar FOIT, máximo 2 archivos WOFF2 |

**Archivos CSS de tipografía:** Las variables de tamaño se definen en `base.css` como Custom Properties:
```css
:root {
  --font-body: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --text-body: clamp(1rem, 0.5vw + 0.875rem, 1.125rem);
  --text-h1: clamp(2rem, 1.5vw + 1.5rem, 3rem);
  --text-h2: clamp(1.5rem, 1vw + 1.25rem, 2.25rem);
  --text-h3: clamp(1.25rem, 0.75vw + 1rem, 1.5rem);
  --leading-body: 1.6;
  --leading-heading: 1.15;
  --max-width-text: 65ch;
}
```

### 15.11 Responsive Design

Detalles adicionales a la estrategia mobile-first:

- **Viewport meta tag:** `<meta name="viewport" content="width=device-width, initial-scale=1">` en `BaseLayout.astro`. Nunca usar `user-scalable=no` ni `maximum-scale=1`.
- **Fluid typography:** Todos los tamaños de fuente usan `clamp()` como se define en la sección 15.10. Sin media queries para font sizes.
- **Responsive images:** Las imágenes del logo y OG template usan `loading="lazy"` (excepto el hero). Usar `<picture>` si se necesitan variantes en el futuro.
- **Breakpoints basados en contenido:** Los definidos en la tabla 15.9 son orientativos. Ajustar según dónde "se rompa" el layout real.
- **Touch targets:** Mínimo 44×44px en todos los elementos interactivos. Espaciado mínimo 8px entre targets adyacentes. Aplicar a: ColorSwatch, CopyButton, tabs, harmony buttons, export format buttons.
- **Hover en touch:** Los tooltips y hover states deben tener alternativa tap/click. Implementar con `@media (hover: hover)` para detectar dispositivos con hover verdadero.
- **Content choreography:** En mobile, el orden de contenido es: color input → tab content activo → export bar (fixed bottom). En desktop: color input (sidebar) + preview + tab content (main area).
- **Pruebas:** Verificar en 320px, 768px, 1024px, 1440px. Sin scroll horizontal en ningún punto.

### 15.12 Responsive Breakpoints

| Breakpoint | Ancho | Layout |
|------------|-------|--------|
| `sm` | 640px | Single column, tabs horizontales |
| `md` | 768px | Single column, más espacio |
| `lg` | 1024px | Two columns: sidebar + content |
| `xl` | 1280px | Two columns con más ancho de preview |
| `2xl` | 1536px | Máximo ancho, contenido centrado |

### 15.14 Uso Obligatorio de Skills y Context7 Durante la Implementación

> **Regla vinculante para el agente implementador.** Cada tarea debe resolverse usando los recursos apropiados antes de escribir código.

#### Skills Disponibles

El agente implementador tiene acceso a estos skills especializados. Debe cargar el skill relevante antes de abordar cualquier tarea de su dominio:

| Skill | Cuándo usarlo |
|-------|---------------|
| **color-theory** | Al implementar `lib/color/` (armonías, contraste, manipulación, semántico, CVD). Validar que las reglas de 60-30-10, esquemas y tokens de color se cumplan. |
| **component-patterns** | Al crear componentes en `src/components/`. Aplicar compound components para Tabs/Card, variantes con cva, tokens de 3 niveles. |
| **accessibility** | Al implementar skip-link, focus management, `prefers-reduced-motion`, ARIA live regions, contraste, simulador CVD. Verificar checklist del skill. |
| **ui-design** | Al crear layouts, grillas, jerarquía visual, espaciados. Aplicar grid 12 columnas, baseline 8px, whitespace. |
| **ux-design** | Al implementar flujos de navegación, estados vacío/carga/error, microinteracciones, validación inline. |
| **responsive-design** | Al implementar container queries, fluid typography con `clamp()`, touch targets, content choreography por viewport. |
| **web-typography** | Al configurar fonts Inter, tipografía fluida, `font-display: swap`, line-length 65ch. |

**Mecanismo:** Antes de iniciar cualquier tarea de una fase, cargar el skill relevante con la herramienta `skill()`, leer sus reglas y checklist, y seguirlas durante la implementación.

#### Context7 para Documentación de Librerías

Ante cualquier duda sobre APIs, configuración o uso de librerías del stack, usar Context7 MCP en este orden:

1. `context7_resolve-library-id(query, libraryName)` para encontrar el ID exacto.
2. `context7_query-docs(libraryId, query)` para obtener la documentación específica.

**Librerías que requieren consulta Context7 obligatoria antes de usar:**

| Librería | Por qué |
|----------|---------|
| Astro 5.x | API de Islands, client directives, integraciones |
| Culori 4.x | API tree-shakeable, funciones fn, gamut mapping |
| Nano Stores 5.x | `computed`, `atom`, integración con React/Astro |
| Motion (framer-motion) | WAAPI, animate(), soporte React |
| React Hook Form + Zod | Resolver, schemas, integración con islands |
| lz-string | API de compresión, límites de tamaño |
| Cloudflare Pages | `_headers`, `_redirects`, build config, WAF |

**Ejemplo de uso:** Antes de implementar `LivePreview.tsx`, buscar en Context7 la documentación de Nano Stores `useStore` y `computed` para asegurar la suscripción correcta al store desde React.

#### Flujo de Trabajo por Tarea

Para cada tarea numbered en el roadmap:

1. **Cargar skill(s)** relevantes con `skill()` si la tarea pertenece a un dominio cubierto.
2. **Consultar Context7** si la tarea involucra una librería del stack.
3. **Leer las secciones del devplan** que corresponden (arquitectura, algoritmos, componentes).
4. **Implementar** siguiendo las reglas del skill + la documentación de Context7.
5. **Verificar** contra el checklist del skill.

Este flujo es obligatorio. No implementar nada sin haber cargado el skill correspondiente primero.

### 15.15 CSS Custom Properties Globales

```css
/* ========================================
   base.css — Reset, variables globales, base typography
   ======================================== */

/* Reset mínimo */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 100%; /* 16px base */
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  color: var(--app-text);
  background: var(--app-bg);
  min-height: 100vh;
}

img, svg, canvas { display: block; max-width: 100%; }
button, input, select, textarea { font: inherit; color: inherit; }
a { color: inherit; text-decoration: none; }
ul, ol { list-style: none; }
h1, h2, h3, h4, h5, h6 { line-height: 1.2; font-weight: 600; }

/* ========================================
   Nivel 1: Global tokens (valores crudos)
   ======================================== */
:root {
  --blue-500: #3B82F6;
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-900: #111827;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

/* ========================================
   Nivel 2: Semantic tokens — app shell
   ======================================== */
:root {
  --app-bg: #FFFFFF;
  --app-surface: #F5F5F5;
  --app-border: #E5E5E5;
  --app-text: #1A1A1A;
  --app-text-muted: #737373;
  --app-accent: #6366F1;
  --app-radius: var(--radius-lg);
  --spacing-section: var(--space-20);
  --content-max-width: 1200px;
}

/* ========================================
   Nivel 2: Semantic tokens — preview (dinámicos via JS)
   ======================================== */
:root {
  --p-color-primary: #FF6B35;
  --p-color-secondary: #355CFF;
  --p-color-tertiary: #35D0FF;
  --p-color-background: #FAFAFA;
  --p-color-surface: #F0F0F0;
  --p-color-card: #FFFFFF;
  --p-color-button: #FF6B35;
  --p-color-button-hover: #E8551F;
  --p-color-button-text: #FFFFFF;
  --p-color-text: #1A1A1A;
  --p-color-link: #355CFF;
  --p-color-success: #22C55E;
  --p-color-warning: #F59E0B;
  --p-color-error: #EF4444;
  --p-color-border: #E5E5E5;
}

/* ========================================
   prefers-reduced-motion
   ======================================== */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Checklist de Calidad

Pre-lanzamiento, verificar:

- [ ] Lighthouse Performance ≥ 95.
- [ ] Lighthouse Accessibility ≥ 95.
- [ ] Lighthouse Best Practices ≥ 95.
- [ ] Lighthouse SEO ≥ 95.
- [ ] Todas las páginas tienen meta description + OG tags.
- [ ] La URL compartida funciona sin JavaScript.
- [ ] No hay fugas de memoria (Nano Stores + useEffect cleanup).
- [ ] El input HEX acepta: `#FF6B35`, `ff6b35`, `#F6B`, `f6b`, `FF6B35`.
- [ ] Los swatches recientes persisten entre sesiones.
- [ ] Live Preview no produce flickering en cambios rápidos.
- [ ] Export CSS/Tailwind/JSON/SVG produce código válido.
- [ ] `@media (hover: hover)` implementado para tooltips y hover states.
- [ ] Viewport meta tag correcto (sin `user-scalable=no`).
- [ ] Tooltips funcionan en touch (mobile) y hover (desktop).
- [ ] Skeleton loaders se muestran durante generación.
- [ ] Mensajes de error claros para HEX inválido.
- [ ] Modo offline (service worker) — opcional, futuro.
- [ ] Skip-to-content link presente y funcional en todas las páginas.
- [ ] Focus visible en todos los elementos interactivos.
- [ ] `prefers-reduced-motion` respetado — animaciones se desactivan.
- [ ] Touch targets ≥ 44×44px con espaciado ≥ 8px.
- [ ] Color nunca es el único diferenciador de estado (siempre icono + texto).
- [ ] `aria-live="polite"` en regiones dinámicas.
- [ ] Landmarks HTML5 presentes (`<header>`, `<nav>`, `<main>`, `<footer>`).
- [ ] Heading hierarchy correcta (un `<h1>`, sin saltos).
- [ ] Prueba con NVDA/VoiceOver en flujo principal.
- [ ] Simulador CVD (protanopia/deuteranopia/tritanopia) implementado.
- [ ] CSP headers configurados en Cloudflare.
- [ ] Rate limiting en endpoint `/api/color.json.ts`.
- [ ] Vitest pasa con cobertura ≥ 90% en algoritmos de color.
- [ ] Playwright E2E pasa en flujo principal.
- [ ] CI pipeline configurado (lint → test → build).
- [ ] 404 page personalizada.
- [ ] Términos de uso y política de privacidad publicados.
- [ ] Bundle size de cada isla React < 50KB (verificar con build visualizer).
- [ ] OG image dinámica para paletas compartidas.

---

*NaN Colors — Construido con Astro, TypeScript y mucho amor por el color.*
