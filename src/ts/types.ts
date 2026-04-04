// ============================================================
// types.ts — Shared TypeScript interfaces & types
// ============================================================

export interface NavState {
  isScrolled: boolean
  isMenuOpen: boolean
  activeSection: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface CounterConfig {
  target: number
  suffix: string
  duration: number
}

export interface AnimationObserverOptions {
  threshold?: number
  rootMargin?: string
}

// ── Live Sessions (Ao Vivo) ──
export * from './types/live'
