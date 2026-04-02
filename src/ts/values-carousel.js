// ============================================================
// values-carousel.ts
// Controla navegação do carrossel dos 7 Pilares
// ============================================================
export class ValuesCarousel {
    constructor() {
        Object.defineProperty(this, "grid", {
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
        this.grid = document.querySelector('.values-grid');
        this.prevBtn = document.querySelector('.values-nav--prev');
        this.nextBtn = document.querySelector('.values-nav--next');
        if (this.grid && this.prevBtn && this.nextBtn) {
            this.init();
        }
    }
    init() {
        this.prevBtn.addEventListener('click', () => this.scroll('prev'));
        this.nextBtn.addEventListener('click', () => this.scroll('next'));
    }
    scroll(direction) {
        const card = this.grid.querySelector('.value-card');
        if (!card)
            return;
        const scrollAmount = card.offsetWidth + 32; // width + gap
        const currentScroll = this.grid.scrollLeft;
        if (direction === 'prev') {
            this.grid.scrollTo({
                left: currentScroll - scrollAmount,
                behavior: 'smooth'
            });
        }
        else {
            this.grid.scrollTo({
                left: currentScroll + scrollAmount,
                behavior: 'smooth'
            });
        }
    }
}
