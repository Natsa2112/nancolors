import { test, expect } from '@playwright/test'

// lz-string compressed IDs for known hex values
const VALID_ID = 'GbBsCMGYFYg' // ff6b35
const VALID_HEX = 'ff6b35'

test.describe('Share palette flow via homepage', () => {
  test('loads palette from encoded share URL', async ({ page }) => {
    await page.goto(`/?c=${VALID_ID}`)
    await expect(page.locator('#hex-input')).toHaveValue(VALID_HEX)
  })

  test('loads homepage with no encoding issues', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('NaN Colors')
    await expect(page.locator('#hex-input')).toHaveValue('ff6b35')
  })

  test('share URL sets correct color in picker', async ({ page }) => {
    await page.goto(`/?c=${VALID_ID}`)
    const input = page.locator('#hex-input')
    await expect(input).toHaveValue(VALID_HEX)
    // Verify tabs are still functional
    await page.getByRole('tab', { name: 'Paletas' }).click()
    await expect(page.getByRole('tab', { name: 'Paletas' })).toHaveAttribute('aria-selected', 'true')
  })

  test('invalid share param shows default color', async ({ page }) => {
    await page.goto('/?c=invalid-xyz')
    // Should not crash, just show default color
    await expect(page.locator('#hex-input')).toBeVisible()
  })
})

test.describe('Full color flow', () => {
  test('color picker updates all panels', async ({ page }) => {
    await page.goto('/')

    // Change color
    const input = page.locator('#hex-input')
    await input.fill('00ff00')
    await expect(input).toHaveValue('00ff00')

    // Click palettes tab
    await page.getByRole('tab', { name: 'Paletas' }).click()
    await expect(page.getByRole('tab', { name: 'Paletas' })).toHaveAttribute('aria-selected', 'true')
  })

  test('tabs navigation works', async ({ page }) => {
    await page.goto('/')

    // Navigate through all tabs
    const tabNames = ['Paletas', 'Semántico', 'Contraste', 'Preview', 'Exportar']
    for (const name of tabNames) {
      await page.getByRole('tab', { name }).click()
      await expect(page.getByRole('tab', { name })).toHaveAttribute('aria-selected', 'true')
    }
  })

  test('export panel shows code output', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Exportar' }).click()
    await expect(page.locator('.export-panel__code')).toBeVisible()
    await expect(page.locator('.export-panel__code')).toContainText('--color-base')
  })

  test('export format switching works', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Exportar' }).click()

    // Default is CSS
    await expect(page.locator('.export-panel__code')).toContainText(':root')

    // Switch to JSON
    await page.getByRole('radio', { name: 'JSON' }).click()
    await expect(page.locator('.export-panel__code')).toContainText('"base"')

    // Switch to Tailwind
    await page.getByRole('radio', { name: 'Tailwind' }).click()
    await expect(page.locator('.export-panel__code')).toContainText('theme')

    // Switch to SVG
    await page.getByRole('radio', { name: 'SVG' }).click()
    await expect(page.locator('.export-panel__code')).toContainText('<svg')
  })
})

test.describe('Dark mode', () => {
  test('theme toggle changes theme', async ({ page }) => {
    await page.goto('/')

    // Initial state: light (default)
    const html = page.locator('html')

    // Click toggle
    await page.locator('#theme-toggle').click()
    await expect(html).toHaveAttribute('data-theme', 'dark')

    // Toggle back
    await page.locator('#theme-toggle').click()
    await expect(html).toHaveAttribute('data-theme', 'light')
  })

  test('theme persists after reload', async ({ page }) => {
    await page.goto('/')
    await page.locator('#theme-toggle').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // Reload page
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })
})

test.describe('Color API', () => {
  test('returns valid color data for valid hex', async ({ page }) => {
    const response = await page.goto('/api/color.json?hex=ff6b35')
    expect(response?.status()).toBe(200)
    const data = await response!.json()
    expect(data).toHaveProperty('hex', '#ff6b35')
    expect(data).toHaveProperty('rgb')
    expect(data).toHaveProperty('hsl')
    expect(data).toHaveProperty('oklch')
  })

  test('returns 400 for invalid hex', async ({ page }) => {
    const response = await page.goto('/api/color.json?hex=xyz')
    expect(response?.status()).toBe(400)
    const data = await response!.json()
    expect(data).toHaveProperty('error')
  })
})

test.describe('Accessibility', () => {
  test('skip link is focusable', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.locator('.skip-link')
    await skipLink.focus()
    await expect(skipLink).toBeFocused()
  })

  test('tabs have proper ARIA attributes', async ({ page }) => {
    await page.goto('/')
    const tablist = page.getByRole('tablist')
    await expect(tablist).toBeVisible()

    const tabs = page.getByRole('tab')
    const count = await tabs.count()
    expect(count).toBe(5)

    // First tab should be selected by default
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
  })

  test('color input has label', async ({ page }) => {
    await page.goto('/')
    const input = page.locator('#hex-input')
    await expect(input).toBeVisible()
    // Input should have accessible name via label or aria-label
    const label = page.locator('label[for="hex-input"]')
    await expect(label).toHaveCount(1)
  })
})
