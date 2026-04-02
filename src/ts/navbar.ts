// ============================================================
// navbar.ts — Navbar: scroll effect, mobile menu, active links
// ============================================================
import type { NavState } from './types'

export class Navbar {
  private el: HTMLElement
  private hamburger: HTMLButtonElement
  private navLinks: HTMLElement
  private overlay: HTMLElement | null
  private sections: NodeListOf<HTMLElement>
  private anchors: NodeListOf<HTMLAnchorElement>
  private state: NavState = { isScrolled: false, isMenuOpen: false, activeSection: '' }
  private scrollRAF: number | null = null
  private intersectionObserver: IntersectionObserver | null = null

  constructor() {
    this.el         = this.getEl<HTMLElement>('#navbar')
    this.hamburger  = this.getEl<HTMLButtonElement>('#hamburger')
    this.navLinks   = this.getEl<HTMLElement>('#navLinks')
    this.overlay    = document.querySelector<HTMLElement>('#navOverlay')
    this.sections   = document.querySelectorAll<HTMLElement>('section[id]')
    this.anchors    = document.querySelectorAll<HTMLAnchorElement>('.nav-links a')

    this.bindEvents()
    this.initIntersectionObserver()
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

    // Close on overlay click
    this.overlay?.addEventListener('click', () => this.closeMenu())
  }

  private initIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-60px 0px -66% 0px',
      threshold: 0
    }

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = (entry.target as HTMLElement).getAttribute('id')
          this.setActiveSection(sectionId)
        }
      })
    }, options)

    this.sections.forEach(section => {
      this.intersectionObserver?.observe(section)
    })
  }

  private setActiveSection(sectionId: string | null): void {
    if (!sectionId || sectionId === this.state.activeSection) return
    
    this.state.activeSection = sectionId

    this.anchors.forEach(a => {
      const matches = a.getAttribute('href') === `#${sectionId}`
      a.classList.toggle('active', matches)
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
    this.overlay?.classList.add('open')
    document.body.style.overflow = 'hidden'
  }

  private closeMenu(): void {
    this.state.isMenuOpen = false
    this.hamburger.classList.remove('active')
    this.navLinks.classList.remove('open')
    this.overlay?.classList.remove('open')
    document.body.style.overflow = ''
  }
}
