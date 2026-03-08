// ============================================================
// animations.ts — Intersection Observer for scroll animations
//                 + animated number counters
// ============================================================
import type { AnimationObserverOptions, CounterConfig } from './types'

// ── Fade-up on scroll ─────────────────────────────
export class ScrollAnimator {
  private observer: IntersectionObserver

  private readonly SELECTORS = [
    '.proof-item',
    '.result-card',
    '.service-card',
    '.step',
    '.team-card',
    '.plan-card',
    '.faq-item',
    '.section-title',
    '.results-testimonial',
    '.pain-col',
  ]

  constructor(options: AnimationObserverOptions = {}) {
    this.observer = new IntersectionObserver(
      this.onIntersect.bind(this),
      {
        threshold:  options.threshold  ?? 0.12,
        rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
      }
    )
    this.init()
  }

  private init(): void {
    this.SELECTORS.forEach(selector => {
      document.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
        el.classList.add('fade-up')
        // Stagger delay for sibling items (max 4 steps)
        const delayIndex = i % 4
        if (delayIndex > 0) el.classList.add(`fade-up-delay-${delayIndex}`)
        this.observer.observe(el)
      })
    })
  }

  private onIntersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        this.observer.unobserve(entry.target)
      }
    })
  }
}

// ── Animated number counters ──────────────────────
export class CounterAnimator {
  private observer: IntersectionObserver

  constructor() {
    this.observer = new IntersectionObserver(
      this.onIntersect.bind(this),
      { threshold: 0.5 }
    )
    this.init()
  }

  private init(): void {
    document.querySelectorAll<HTMLElement>('[data-counter]').forEach(el => {
      this.observer.observe(el)
    })
  }

  private onIntersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const el = entry.target as HTMLElement
      const config = this.parseConfig(el)
      this.animateCount(el, config)
      this.observer.unobserve(el)
    })
  }

  private parseConfig(el: HTMLElement): CounterConfig {
    return {
      target:   parseFloat(el.dataset['counter'] ?? '0'),
      suffix:   el.dataset['suffix'] ?? '',
      duration: parseInt(el.dataset['duration'] ?? '1800', 10),
    }
  }

  private animateCount(el: HTMLElement, config: CounterConfig): void {
    const { target, suffix, duration } = config
    const start = performance.now()
    const isDecimal = !Number.isInteger(target)

    const step = (now: number) => {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const value  = target * eased

      el.textContent = `${isDecimal ? value.toFixed(1) : Math.floor(value)}${suffix}`

      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }
}
