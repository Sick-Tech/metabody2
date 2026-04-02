// ============================================================
// faq.ts — FAQ accordion with accessible aria attributes
// ============================================================
export class FAQ {
    constructor() {
        Object.defineProperty(this, "items", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.items = document.querySelectorAll('.faq-item');
        this.init();
    }
    init() {
        this.items.forEach(item => {
            const btn = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if (!btn || !answer)
                return;
            btn.addEventListener('click', () => this.toggle(btn, answer));
        });
    }
    toggle(btn, answer) {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        // Close all others
        this.items.forEach(other => {
            const otherBtn = other.querySelector('.faq-question');
            const otherAnswer = other.querySelector('.faq-answer');
            if (!otherBtn || !otherAnswer)
                return;
            otherBtn.setAttribute('aria-expanded', 'false');
            otherAnswer.classList.remove('open');
        });
        // Toggle current
        btn.setAttribute('aria-expanded', String(!isOpen));
        answer.classList.toggle('open', !isOpen);
    }
}
