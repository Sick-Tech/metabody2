// ============================================================
// carousel.ts — Results Carousel Controller
// Gerencia navegação do carrossel de resultados com setas
// ============================================================
export class ResultsCarousel {
    constructor() {
        Object.defineProperty(this, "track", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "prevBtn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nextBtn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cards", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "currentIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "itemsPerView", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 4
        });
        Object.defineProperty(this, "cardWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.track = document.getElementById('resultsCarouselTrack');
        this.prevBtn = document.getElementById('resultsCarouselPrev');
        this.nextBtn = document.getElementById('resultsCarouselNext');
        if (!this.track || !this.prevBtn || !this.nextBtn)
            return;
        this.init();
    }
    init() {
        this.collectCards();
        this.updateItemsPerView();
        this.setupEventListeners();
        this.updateCarousel();
        window.addEventListener('resize', () => this.handleResize());
    }
    collectCards() {
        const cards = this.track?.querySelectorAll('.result-photo-card');
        this.cards = Array.from(cards);
    }
    updateItemsPerView() {
        const width = window.innerWidth;
        if (width < 768) {
            this.itemsPerView = 1;
        }
        else if (width < 1024) {
            this.itemsPerView = 2;
        }
        else {
            this.itemsPerView = 4;
        }
        // Limitar índice atual se necessário
        const maxIndex = Math.max(0, this.cards.length - this.itemsPerView);
        if (this.currentIndex > maxIndex) {
            this.currentIndex = maxIndex;
        }
    }
    calculateCardWidth() {
        if (this.cards.length === 0)
            return 0;
        const firstCard = this.cards[0];
        return firstCard.offsetWidth;
    }
    setupEventListeners() {
        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());
    }
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel();
        }
    }
    next() {
        const maxIndex = Math.max(0, this.cards.length - this.itemsPerView);
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.updateCarousel();
        }
    }
    updateCarousel() {
        if (!this.track)
            return;
        this.cardWidth = this.calculateCardWidth();
        const gap = 16; // 1rem = 16px
        const offset = -(this.currentIndex * (this.cardWidth + gap));
        this.track.style.transform = `translateX(${offset}px)`;
        this.track.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
        this.updateButtonStates();
    }
    updateButtonStates() {
        const maxIndex = Math.max(0, this.cards.length - this.itemsPerView);
        if (this.prevBtn) {
            const prevButton = this.prevBtn;
            prevButton.disabled = this.currentIndex === 0;
            this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.4' : '1';
        }
        if (this.nextBtn) {
            const nextButton = this.nextBtn;
            nextButton.disabled = this.currentIndex >= maxIndex;
            this.nextBtn.style.opacity = this.currentIndex >= maxIndex ? '0.4' : '1';
        }
    }
    handleResize() {
        const newItemsPerView = this.getItemsPerView();
        if (newItemsPerView !== this.itemsPerView) {
            this.updateItemsPerView();
            this.currentIndex = 0;
            this.updateCarousel();
        }
        else {
            // Apenas recalcular a posição se o número de cards por view não mudou
            this.updateCarousel();
        }
    }
    getItemsPerView() {
        const width = window.innerWidth;
        if (width < 768)
            return 1;
        if (width < 1024)
            return 2;
        return 4;
    }
}
