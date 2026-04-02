// ── Fade-up on scroll ─────────────────────────────
export class ScrollAnimator {
    constructor(options = {}) {
        Object.defineProperty(this, "observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "SELECTORS", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
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
        });
        this.observer = new IntersectionObserver(this.onIntersect.bind(this), {
            threshold: options.threshold ?? 0.12,
            rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
        });
        this.init();
    }
    init() {
        this.SELECTORS.forEach(selector => {
            document.querySelectorAll(selector).forEach((el, i) => {
                el.classList.add('fade-up');
                // Stagger delay for sibling items (max 4 steps)
                const delayIndex = i % 4;
                if (delayIndex > 0)
                    el.classList.add(`fade-up-delay-${delayIndex}`);
                this.observer.observe(el);
            });
        });
    }
    onIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                this.observer.unobserve(entry.target);
            }
        });
    }
}
// ── Animated number counters ──────────────────────
export class CounterAnimator {
    constructor() {
        Object.defineProperty(this, "observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.observer = new IntersectionObserver(this.onIntersect.bind(this), { threshold: 0.5 });
        this.init();
    }
    init() {
        document.querySelectorAll('[data-counter]').forEach(el => {
            this.observer.observe(el);
        });
    }
    onIntersect(entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting)
                return;
            const el = entry.target;
            const config = this.parseConfig(el);
            this.animateCount(el, config);
            this.observer.unobserve(el);
        });
    }
    parseConfig(el) {
        return {
            target: parseFloat(el.dataset['counter'] ?? '0'),
            suffix: el.dataset['suffix'] ?? '',
            duration: parseInt(el.dataset['duration'] ?? '1800', 10),
        };
    }
    animateCount(el, config) {
        const { target, suffix, duration } = config;
        const start = performance.now();
        const isDecimal = !Number.isInteger(target);
        const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;
            el.textContent = `${isDecimal ? value.toFixed(1) : Math.floor(value)}${suffix}`;
            if (progress < 1)
                requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }
}
