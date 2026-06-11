export const prerender = false

import type { APIRoute } from 'astro'
import { hexToRgb, hexToHsl, hexToOklch, isValidHex } from '../../lib/color/convert'
import { relativeLuminance } from '../../lib/color/luminance'

export const GET: APIRoute = ({ url }) => {
  const hexParam = url.searchParams.get('hex')

  if (!hexParam || !isValidHex(`#${hexParam.replace(/^#/, '')}`)) {
    return new Response(
      JSON.stringify({ error: 'Parámetro "hex" inválido. Usa formato HEX (ej: ?hex=ff6b35)' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const hex = `#${hexParam.replace(/^#/, '').toLowerCase()}`
  const rgb = hexToRgb(hex)
  const hsl = hexToHsl(hex)
  const oklch = hexToOklch(hex)
  const luminance = relativeLuminance(hex)

  if (!rgb || !hsl || !oklch || luminance === null) {
    return new Response(JSON.stringify({ error: 'No se pudo procesar el color' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      hex,
      rgb,
      hsl,
      oklch,
      luminance: Math.round(luminance * 10000) / 10000,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}
