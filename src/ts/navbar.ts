// ============================================================
// navbar.ts — Navbar: scroll effect, mobile menu, active links
// ============================================================
import type { NavState } from './types'

export class Navbar {
  private el: HTMLElement
  private hamburger: HTMLButtonElement
  private navLinks: HTMLElement
  private sections: NodeListOf<HTMLElement>
  private anchors: NodeListOf<HTMLAnchorElement>
  private state: NavState = { isScrolled: false, isMenuOpen: false, activeSection: '' }
  private scrollRAF: number | null = null

  constructor() {
    this.el         = this.getEl<HTMLElement>('#navbar')
    this.hamburger  = this.getEl<HTMLButtonElement>('#hamburger')
    this.navLinks   = this.getEl<HTMLElement>('#navLinks')
    this.sections   = document.querySelectorAll<HTMLElement>('section[id]')
    this.anchors    = document.querySelectorAll<HTMLAnchorElement>('.nav-links a')

    this.bindEvents()
  }

  private getEl<T extends Element>(selector: string): T {
    const el = document.querySelector<T>(selector)
    if (!el) throw new Error(`Navbar: element "${selector}" not found`)
    return el
  }

  private bindEvents(): void {
    // Scroll — throttled via requestAnimationFrame
    window.addEventListener('scroll', () => {
      if (this.scrollRAF !== null) return
      this.scrollRAF = requestAnimationFrame(() => {
        this.onScroll()
        this.updateActiveSection()
        this.scrollRAF = null
      })
    }, { passive: true })

    // Hamburger toggle
    this.hamburger.addEventListener('click', () => this.toggleMenu())

    // Close menu on link click
    this.anchors.forEach(a => a.addEventListener('click', () => this.closeMenu()))

    // Close on outside click
    document.addEventListener('click', (e: MouseEvent) => {
      if (
        this.state.isMenuOpen &&
        !this.navLinks.contains(e.target as Node) &&
        !this.hamburger.contains(e.target as Node)
      ) {
        this.closeMenu()
      }
    })
  }

  private onScroll(): void {
    const scrolled = window.scrollY > 60
    if (scrolled === this.state.isScrolled) return
    this.state.isScrolled = scrolled
    this.el.classList.toggle('scrolled', scrolled)
  }

  private toggleMenu(): void {
    this.state.isMenuOpen ? this.closeMenu() : this.openMenu()
  }

  private openMenu(): void {
    this.state.isMenuOpen = true
    this.hamburger.classList.add('active')
    this.navLinks.classList.add('open')
    document.body.style.overflow = 'hidden'
  }

  private closeMenu(): void {
    this.state.isMenuOpen = false
    this.hamburger.classList.remove('active')
    this.navLinks.classList.remove('open')
    document.body.style.overflow = ''
  }

  private updateActiveSection(): void {
    let current = ''
    this.sections.forEach(section => {
      const top = section.getBoundingClientRect().top
      if (top <= 120) current = section.getAttribute('id') ?? ''
    })

    if (current === this.state.activeSection) return
    this.state.activeSection = current

    this.anchors.forEach(a => {
      const matches = a.getAttribute('href') === `#${current}`
      a.classList.toggle('active', matches)
    })
  }
}
