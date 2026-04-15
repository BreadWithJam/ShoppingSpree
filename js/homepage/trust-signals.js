/**
 * Trust Signals Module
 * Handles trust signal interactions, review displays, and social proof functionality
 */

import { BaseModule } from './base-module.js';

class TrustSignals extends BaseModule {
  constructor() {
    super('TrustSignals');
    
    this.selectors = {
      trustSignalsSection: '.trust-signals',
      reviewsSection: '.customer-reviews',
      socialProofSection: '.social-proof',
      reviewCards: '.review-card',
      testimonialCards: '.testimonial-card',
      socialLinks: '.social-link',
      reviewsCta: '.reviews-cta a',
      policyCards: '.policy-card',
      securityBadges: '.security-badge'
    };
    
    this.state = {
      reviewsLoaded: false,
      testimonialsVisible: false,
      socialProofTracked: false
    };
    
    this.observer = null;
  }

  hasTrustSignalSections() {
    return Boolean(
      document.querySelector(this.selectors.trustSignalsSection) ||
      document.querySelector(this.selectors.reviewsSection) ||
      document.querySelector(this.selectors.socialProofSection)
    );
  }

  async init() {
    if (!this.hasTrustSignalSections()) {
      console.info('TrustSignals module skipped – no sections present.');
      return;
    }

    await super.init();
    this.setupIntersectionObserver();
    this.enhanceAccessibility();
    this.trackTrustSignalViews();
  }

  async findElements() {
    this.setElement('trustSignalsSection', document.querySelector(this.selectors.trustSignalsSection));
    this.setElement('reviewsSection', document.querySelector(this.selectors.reviewsSection));
    this.setElement('socialProofSection', document.querySelector(this.selectors.socialProofSection));
    this.setElement('reviewsCta', document.querySelector(this.selectors.reviewsCta));
    this.setElement('socialLinks', document.querySelectorAll(this.selectors.socialLinks));
    this.setElement('policyCards', document.querySelectorAll(this.selectors.policyCards));
    this.setElement('securityBadges', document.querySelectorAll(this.selectors.securityBadges));
  }

  bindEvents() {
    // Handle review CTA clicks
    const reviewsCta = this.getElement('reviewsCta');
    if (reviewsCta) {
      this.addEventListener(reviewsCta, 'click', this.handleReviewsCtaClick);
    }

    // Handle social link clicks
    const socialLinks = this.getElement('socialLinks');
    socialLinks?.forEach(link => {
      this.addEventListener(link, 'click', this.handleSocialLinkClick);
    });

    // Handle policy card interactions
    const policyCards = this.getElement('policyCards');
    policyCards?.forEach(card => {
      this.addEventListener(card, 'mouseenter', this.handlePolicyCardHover);
      this.addEventListener(card, 'focus', this.handlePolicyCardFocus);
    });

    // Handle security badge interactions
    const securityBadges = this.getElement('securityBadges');
    securityBadges?.forEach(badge => {
      this.addEventListener(badge, 'click', this.handleSecurityBadgeClick);
    });
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleSectionVisible(entry.target);
        }
      });
    }, observerOptions);

    // Observe trust signal sections
    const sections = [
      this.getElement('trustSignalsSection'),
      this.getElement('reviewsSection'),
      this.getElement('socialProofSection')
    ].filter(Boolean);

    sections.forEach(section => {
      this.observer.observe(section);
    });
  }

  handleSectionVisible(section) {
    const sectionClass = section.className.split(' ')[0];
    
    switch (sectionClass) {
      case 'trust-signals':
        this.animatePolicyCards();
        break;
      case 'customer-reviews':
        this.loadReviews();
        break;
      case 'social-proof':
        this.animateTestimonials();
        this.trackSocialProof();
        break;
    }
  }

  animatePolicyCards() {
    const policyCards = this.getElement('policyCards');
    
    policyCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      }, index * 100);
    });
  }

  loadReviews() {
    if (this.state.reviewsLoaded) return;
    
    this.state.reviewsLoaded = true;
    
    // Simulate loading additional reviews
    const reviewCards = document.querySelectorAll(this.selectors.reviewCards);
    
    reviewCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        });
      }, index * 150);
    });

    // Track reviews section view
    this.trackEvent('trust_signals', 'reviews_viewed', {
      section: 'customer_reviews',
      review_count: reviewCards.length
    });
  }

  animateTestimonials() {
    if (this.state.testimonialsVisible) return;
    
    this.state.testimonialsVisible = true;
    
    const testimonialCards = document.querySelectorAll(this.selectors.testimonialCards);
    
    testimonialCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(-30px)';
        card.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateX(0)';
        });
      }, index * 200);
    });
  }

  trackSocialProof() {
    if (this.state.socialProofTracked) return;
    
    this.state.socialProofTracked = true;
    
    this.trackEvent('trust_signals', 'social_proof_viewed', {
      section: 'social_proof',
      testimonial_count: document.querySelectorAll(this.selectors.testimonialCards).length
    });
  }

  handleReviewsCtaClick(event) {
    event.preventDefault();
    
    this.trackEvent('trust_signals', 'reviews_cta_clicked', {
      target_url: event.target.href
    });
    
    // Show loading state
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;
    
    // Simulate navigation delay
    setTimeout(() => {
      window.location.href = button.href;
    }, 300);
  }

  handleSocialLinkClick(event) {
    const link = event.currentTarget;
    const platform = link.querySelector('.social-link__text')?.textContent || 'unknown';
    
    this.trackEvent('trust_signals', 'social_link_clicked', {
      platform: platform.toLowerCase(),
      target_url: link.href
    });
    
    // Add visual feedback
    link.style.transform = 'scale(0.95)';
    setTimeout(() => {
      link.style.transform = 'scale(1)';
    }, 150);
  }

  handlePolicyCardHover(event) {
    const card = event.currentTarget;
    const title = card.querySelector('.policy-card__title')?.textContent || 'unknown';
    
    this.trackEvent('trust_signals', 'policy_card_hovered', {
      policy_type: title.toLowerCase().replace(/\s+/g, '_')
    });
  }

  handlePolicyCardFocus(event) {
    const card = event.currentTarget;
    const title = card.querySelector('.policy-card__title')?.textContent || 'unknown';
    
    this.trackEvent('trust_signals', 'policy_card_focused', {
      policy_type: title.toLowerCase().replace(/\s+/g, '_'),
      interaction_method: 'keyboard'
    });
  }

  handleSecurityBadgeClick(event) {
    event.preventDefault();
    
    const badge = event.currentTarget;
    const badgeText = badge.querySelector('.security-badge__text')?.textContent || 'unknown';
    
    this.trackEvent('trust_signals', 'security_badge_clicked', {
      badge_type: badgeText.toLowerCase().replace(/\s+/g, '_')
    });
    
    // Show security information modal (placeholder)
    this.showSecurityInfo(badgeText);
  }

  showSecurityInfo(badgeType) {
    // Create a simple modal for security information
    const modal = document.createElement('div');
    modal.className = 'security-info-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'security-modal-title');
    modal.setAttribute('aria-modal', 'true');
    
    const securityInfo = this.getSecurityInfo(badgeType);
    
    modal.innerHTML = `
      <div class="security-info-modal__backdrop" aria-hidden="true"></div>
      <div class="security-info-modal__content">
        <header class="security-info-modal__header">
          <h3 id="security-modal-title" class="security-info-modal__title">${securityInfo.title}</h3>
          <button class="security-info-modal__close" aria-label="Close security information">×</button>
        </header>
        <div class="security-info-modal__body">
          <p>${securityInfo.description}</p>
          <ul class="security-info-modal__features">
            ${securityInfo.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus management
    const closeButton = modal.querySelector('.security-info-modal__close');
    closeButton.focus();
    
    // Event listeners
    closeButton.addEventListener('click', () => this.closeSecurityModal(modal));
    modal.querySelector('.security-info-modal__backdrop').addEventListener('click', () => this.closeSecurityModal(modal));
    
    // Keyboard handling
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeSecurityModal(modal);
      }
    });
    
    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('security-info-modal--visible');
    });
  }

  closeSecurityModal(modal) {
    modal.classList.remove('security-info-modal--visible');
    
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
  }

  getSecurityInfo(badgeType) {
    const securityData = {
      'SSL Secured': {
        title: 'SSL Security Certificate',
        description: 'Your connection to our website is encrypted and secure.',
        features: [
          '256-bit SSL encryption',
          'Verified by trusted certificate authority',
          'All data transmitted securely',
          'Regular security audits performed'
        ]
      },
      'Money Back Guarantee': {
        title: '30-Day Money Back Guarantee',
        description: 'Shop with confidence knowing you can return any item within 30 days.',
        features: [
          'Full refund within 30 days',
          'No questions asked policy',
          'Free return shipping',
          'Quick processing time'
        ]
      },
      '50,000+ Happy Customers': {
        title: 'Trusted by Thousands',
        description: 'Join over 50,000 satisfied customers who trust us for their shopping needs.',
        features: [
          '4.8/5 average customer rating',
          '98% customer satisfaction rate',
          'Over 2,800 verified reviews',
          'Established since 2020'
        ]
      }
    };
    
    return securityData[badgeType] || {
      title: 'Security Information',
      description: 'We take your security and satisfaction seriously.',
      features: ['Secure shopping experience', 'Customer satisfaction guaranteed']
    };
  }

  enhanceAccessibility() {
    // Add ARIA labels for better screen reader support
    const reviewCards = document.querySelectorAll(this.selectors.reviewCards);
    reviewCards.forEach((card, index) => {
      card.setAttribute('aria-label', `Customer review ${index + 1}`);
    });
    
    const testimonialCards = document.querySelectorAll(this.selectors.testimonialCards);
    testimonialCards.forEach((card, index) => {
      card.setAttribute('aria-label', `Customer testimonial ${index + 1}`);
    });
    
    // Enhance keyboard navigation for policy cards
    const policyCards = document.querySelectorAll(this.selectors.policyCards);
    policyCards.forEach(card => {
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }
    });
  }

  trackTrustSignalViews() {
    // Track initial page load with trust signals
    const section = this.getElement('trustSignalsSection');
    const reviews = this.getElement('reviewsSection');
    const socialProof = this.getElement('socialProofSection');

    if (!section && !reviews && !socialProof) {
      return;
    }

    // Track trust signal views
    this.trackEvent('trust_signals', 'page_loaded', {
      trust_signals_present: Boolean(section),
      policy_count: document.querySelectorAll(this.selectors.policyCards).length,
      review_count: document.querySelectorAll(this.selectors.reviewCards).length,
      testimonial_count: document.querySelectorAll(this.selectors.testimonialCards).length
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    super.destroy();
  }
}

export { TrustSignals };