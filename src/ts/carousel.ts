// ============================================================
// carousel.ts — Results Carousel Controller
// Gerencia navegação do carrossel de resultados com setas
// ============================================================

export class ResultsCarousel {
  private track: HTMLElement | null
  private prevBtn: HTMLElement | null
  private nextBtn: HTMLElement | null
  private cards: HTMLElement[] = []
  private currentIndex: number = 0
  private itemsPerView: number = 4
  private cardWidth: number = 0

  constructor() {
    this.track = document.getElementById('resultsCarouselTrack')
    this.prevBtn = document.getElementById('resultsCarouselPrev')
    this.nextBtn = document.getElementById('resultsCarouselNext')

    if (!this.track || !this.prevBtn || !this.nextBtn) return

    this.init()
  }

  private init(): void {
    this.collectCards()
    this.updateItemsPerView()
    this.setupEventListeners()
    this.updateCarousel()
    window.addEventListener('resize', () => this.handleResize())
  }

  private collectCards(): void {
    const cards = this.track?.querySelectorAll('.result-photo-card') as NodeListOf<HTMLElement>
    this.cards = Array.from(cards)
  }

  private updateItemsPerView(): void {
    const width = window.innerWidth
    
    if (width < 768) {
      this.itemsPerView = 1
    } else if (width < 1024) {
      this.itemsPerView = 2
    } else {
      this.itemsPerView = 4
    }

    // Limitar índice atual se necessário
    const maxIndex = Math.max(0, this.cards.length - this.itemsPerView)
    if (this.currentIndex > maxIndex) {
      this.currentIndex = maxIndex
    }
  }

  private calculateCardWidth(): number {
    if (this.cards.length === 0) return 0
    const firstCard = this.cards[0]
    return firstCard.offsetWidth
  }

  private setupEventListeners(): void {
    this.prevBtn?.addEventListener('click', () => this.prev())
    this.nextBtn?.addEventListener('click', () => this.next())
  }

  private prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--
      this.updateCarousel()
    }
  }

  private next(): void {
    const maxIndex = Math.max(0, this.cards.length - this.itemsPerView)
    if (this.currentIndex < maxIndex) {
      this.currentIndex++
      this.updateCarousel()
    }
  }

  private updateCarousel(): void {
    if (!this.track) return

    this.cardWidth = this.calculateCardWidth()
    const gap = 16 // 1rem = 16px
    const offset = -(this.currentIndex * (this.cardWidth + gap))

    this.track.style.transform = `translateX(${offset}px)`
    this.track.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'

    this.updateButtonStates()
  }

  private updateButtonStates(): void {
    const maxIndex = Math.max(0, this.cards.length - this.itemsPerView)
    
    if (this.prevBtn) {
      const prevButton = this.prevBtn as HTMLButtonElement
      prevButton.disabled = this.currentIndex === 0
      this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.4' : '1'
    }

    if (this.nextBtn) {
      const nextButton = this.nextBtn as HTMLButtonElement
      nextButton.disabled = this.currentIndex >= maxIndex
      this.nextBtn.style.opacity = this.currentIndex >= maxIndex ? '0.4' : '1'
    }
  }

  private handleResize(): void {
    const newItemsPerView = this.getItemsPerView()
    
    if (newItemsPerView !== this.itemsPerView) {
      this.updateItemsPerView()
      this.currentIndex = 0
      this.updateCarousel()
    } else {
      // Apenas recalcular a posição se o número de cards por view não mudou
      this.updateCarousel()
    }
  }

  private getItemsPerView(): number {
    const width = window.innerWidth
    
    if (width < 768) return 1
    if (width < 1024) return 2
    return 4
  }
}
