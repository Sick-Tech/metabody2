// ============================================================
// main.ts — Application entry point
// Bootstraps all modules in the correct order
// ============================================================
import '../styles/main.scss'

import { Navbar }          from './navbar'
import { FAQ }             from './faq'
import { ScrollAnimator, CounterAnimator } from './animations'
import { ResultsCarousel } from './carousel'
import { TeamModal }       from './team'
import { ValuesCarousel }  from './values-carousel'
import { Live }            from './live'

function bootstrap(): void {
  new Navbar()
  new FAQ()
  new ScrollAnimator()
  new CounterAnimator()
  new ResultsCarousel()
  new TeamModal()
  new ValuesCarousel()
  new Live() // Initialize Live Sessions feature
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap)
} else {
  bootstrap()
}
