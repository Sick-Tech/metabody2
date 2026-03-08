// ============================================================
// faq.ts — FAQ accordion with accessible aria attributes
// ============================================================

export class FAQ {
  private items: NodeListOf<HTMLElement>

  constructor() {
    this.items = document.querySelectorAll<HTMLElement>('.faq-item')
    this.init()
  }

  private init(): void {
    this.items.forEach(item => {
      const btn    = item.querySelector<HTMLButtonElement>('.faq-question')
      const answer = item.querySelector<HTMLElement>('.faq-answer')
      if (!btn || !answer) return

      btn.addEventListener('click', () => this.toggle(btn, answer))
    })
  }

  private toggle(btn: HTMLButtonElement, answer: HTMLElement): void {
    const isOpen = btn.getAttribute('aria-expanded') === 'true'

    // Close all others
    this.items.forEach(other => {
      const otherBtn    = other.querySelector<HTMLButtonElement>('.faq-question')
      const otherAnswer = other.querySelector<HTMLElement>('.faq-answer')
      if (!otherBtn || !otherAnswer) return
      otherBtn.setAttribute('aria-expanded', 'false')
      otherAnswer.classList.remove('open')
    })

    // Toggle current
    btn.setAttribute('aria-expanded', String(!isOpen))
    answer.classList.toggle('open', !isOpen)
  }
}
