export class Navbar {
    constructor() {
        Object.defineProperty(this, "el", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hamburger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "navLinks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "overlay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sections", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "anchors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { isScrolled: false, isMenuOpen: false, activeSection: '' }
        });
        Object.defineProperty(this, "scrollRAF", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "intersectionObserver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.el = this.getEl('#navbar');
        this.hamburger = this.getEl('#hamburger');
        this.navLinks = this.getEl('#navLinks');
        this.overlay = document.querySelector('#navOverlay');
        this.sections = document.querySelectorAll('section[id]');
        this.anchors = document.querySelectorAll('.nav-links a');
        this.bindEvents();
        this.initIntersectionObserver();
    }
    getEl(selector) {
        const el = document.querySelector(selector);
        if (!el)
            throw new Error(`Navbar: element "${selector}" not found`);
        return el;
    }
    bindEvents() {
        // Scroll — throttled via requestAnimationFrame
        window.addEventListener('scroll', () => {
            if (this.scrollRAF !== null)
                return;
            this.scrollRAF = requestAnimationFrame(() => {
                this.onScroll();
                this.scrollRAF = null;
            });
        }, { passive: true });
        // Hamburger toggle
        this.hamburger.addEventListener('click', () => this.toggleMenu());
        // Close menu on link click
        this.anchors.forEach(a => a.addEventListener('click', () => this.closeMenu()));
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.state.isMenuOpen &&
                !this.navLinks.contains(e.target) &&
                !this.hamburger.contains(e.target)) {
                this.closeMenu();
            }
        });
        // Close on overlay click
        this.overlay?.addEventListener('click', () => this.closeMenu());
    }
    initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-60px 0px -66% 0px',
            threshold: 0
        };
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');
                    this.setActiveSection(sectionId);
                }
            });
        }, options);
        this.sections.forEach(section => {
            this.intersectionObserver?.observe(section);
        });
    }
    setActiveSection(sectionId) {
        if (!sectionId || sectionId === this.state.activeSection)
            return;
        this.state.activeSection = sectionId;
        this.anchors.forEach(a => {
            const matches = a.getAttribute('href') === `#${sectionId}`;
            a.classList.toggle('active', matches);
        });
    }
    onScroll() {
        const scrolled = window.scrollY > 60;
        if (scrolled === this.state.isScrolled)
            return;
        this.state.isScrolled = scrolled;
        this.el.classList.toggle('scrolled', scrolled);
    }
    toggleMenu() {
        this.state.isMenuOpen ? this.closeMenu() : this.openMenu();
    }
    openMenu() {
        this.state.isMenuOpen = true;
        this.hamburger.classList.add('active');
        this.navLinks.classList.add('open');
        this.overlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    closeMenu() {
        this.state.isMenuOpen = false;
        this.hamburger.classList.remove('active');
        this.navLinks.classList.remove('open');
        this.overlay?.classList.remove('open');
        document.body.style.overflow = '';
    }
}
