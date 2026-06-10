import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('NaN Colors')
  })

  test('has skip link', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.locator('.skip-link')
    await expect(skipLink).toBeVisible()
  })

  test('color picker renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#hex-input')).toBeVisible()
    await expect(page.locator('#hex-input')).toHaveValue('#ff6b35')
  })

  test('changes color on hex input', async ({ page }) => {
    await page.goto('/')
    const input = page.locator('#hex-input')
    await input.fill('#000000')
    await expect(input).toHaveValue('#000000')
  })
})

test.describe('Static pages', () => {
  const pages = [
    { path: '/about', title: 'Acerca' },
    { path: '/accessibility', title: 'Accesibilidad' },
    { path: '/terms', title: 'Términos' },
    { path: '/privacy', title: 'Privacidad' },
  ]

  for (const { path, title } of pages) {
    test(`loads ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('h1')).toContainText(title)
    })
  }
})

test.describe('API', () => {
  test('color.json endpoint loads', async ({ page }) => {
    const response = await page.goto('/api/color.json')
    expect(response).not.toBeNull()
    const data = await response!.json()
    expect(data).toHaveProperty('error')
  })
})

test.describe('404', () => {
  test('shows 404 page', async ({ page }) => {
    const response = await page.goto('/nonexistent')
    expect(response?.status()).toBe(404)
    await expect(page.locator('h1')).toContainText('404')
  })
})
