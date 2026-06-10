import { atom } from 'nanostores'

export interface Toast {
  message: string
  id: number
}

export const $toasts = atom<Toast[]>([])

let nextId = 0

export function showToast(message: string): void {
  const id = nextId++
  $toasts.set([...$toasts.get(), { message, id }])
  setTimeout(() => {
    $toasts.set($toasts.get().filter((t) => t.id !== id))
  }, 2000)
}
