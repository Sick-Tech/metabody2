// ============================================================
// values-carousel.ts
// Controla navegação do carrossel dos 7 Pilares
// ============================================================

export class ValuesCarousel {
  private grid: HTMLElement | null
  private prevBtn: HTMLButtonElement | null
  private nextBtn: HTMLButtonElement | null

  constructor() {
    this.grid = document.querySelector('.values-grid')
    this.prevBtn = document.querySelector('.values-nav--prev')
    this.nextBtn = document.querySelector('.values-nav--next')

    if (this.grid && this.prevBtn && this.nextBtn) {
      this.init()
    }
  }

  private init(): void {
    this.prevBtn!.addEventListener('click', () => this.scroll('prev'))
    this.nextBtn!.addEventListener('click', () => this.scroll('next'))
  }

  private scroll(direction: 'prev' | 'next'): void {
    const card = this.grid!.querySelector('.value-card') as HTMLElement
    if (!card) return

    const scrollAmount = card.offsetWidth + 32 // width + gap
    const currentScroll = this.grid!.scrollLeft

    if (direction === 'prev') {
      this.grid!.scrollTo({
        left: currentScroll - scrollAmount,
        behavior: 'smooth'
      })
    } else {
      this.grid!.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      })
    }
  }
}
