/**
 * Stacked Cards Animation Manager
 * Handles the persistent stacking and reveal effect on scroll
 */
export class StackedCardsManager {
  constructor() {
    this.container = document.querySelector('.stacked-cards-container');
    this.cards = document.querySelectorAll('.stacked-card');
    this.isSupported = CSS.supports('animation-timeline', 'scroll()');
  }

  /**
   * Initialize the stacked cards effect
   */
  async init() {
    if (!this.container || this.cards.length === 0) return;

    // If native scroll animations are supported, we let CSS handle it
    if (this.isSupported) {
      console.log('StackedCards: Using native CSS scroll timelines');
      return;
    }

    // Fallback for browsers without animation-timeline support
    this.setupFallbackReveal();
    console.log('StackedCards: Initialized with JS fallback');
  }

  /**
   * Set up IntersectionObserver and Scroll listeners for browsers without native support
   */
  setupFallbackReveal() {
    const observerOptions = {
      threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.updateCardState(entry.target, entry.intersectionRatio);
        }
      });
    }, observerOptions);

    this.cards.forEach(card => observer.observe(card));

    // Also use scroll listener for finer control if needed
    window.addEventListener('scroll', () => {
      this.handleScroll();
    }, { passive: true });
  }

  /**
   * Update card visuals based on scroll progress
   */
  handleScroll() {
    const viewportHeight = window.innerHeight;
    
    this.cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      // Calculate dynamic sticky point based on child index to match CSS
      const stickyPoint = viewportHeight * (0.10 + (index * 0.05)); 
      
      // If card is sticky (reached its specific top), start scaling it down for the next card
      if (rect.top <= stickyPoint + 5) {
        // How far past the sticky point has the card's bottom scrolled?
        const scrollDistance = stickyPoint - rect.top;
        const progress = Math.min(scrollDistance / 500, 1); // Scale over 500px scroll
        
        const scale = 1 - (progress * 0.1); // Scale down to 0.9
        const opacity = 1 - (progress * 0.2);
        const blur = progress * 4;
        
        card.style.transform = `${this.getBaseRotation(index)} scale(${scale}) translateY(${-progress * 20}px)`;
        card.style.opacity = opacity;
        card.style.filter = `blur(${blur}px)`;
      } else {
        // Reset to initial state
        card.style.transform = this.getBaseRotation(index);
        card.style.opacity = '1';
        card.style.filter = 'none';
      }
    });
  }

  /**
   * Helper to get initial rotation based on card index (matching CSS)
   */
  getBaseRotation(index) {
    const rotations = ['rotate(-1.5deg)', 'rotate(1deg)', 'rotate(-0.5deg)', 'rotate(1.5deg)'];
    return rotations[index % rotations.length];
  }

  /**
   * Update card state for simpler reveal
   */
  updateCardState(card, ratio) {
    if (ratio > 0.1) {
      card.classList.add('is-revealed');
    }
  }
}
