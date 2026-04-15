/**
 * Filter Manager
 * Handles filtering logic for the Shop page
 */
export class FilterManager {
  constructor(shop) {
    this.shop = shop;
    this.activeCategory = 'all';
    this.activePriceRange = null;
    this.activeRatingThreshold = null;
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Category filters
    const categoryButtons = document.querySelectorAll('[data-filter]');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        categoryButtons.forEach(b => b.classList.remove('is-active'));
        e.target.classList.add('is-active');
        this.activeCategory = e.target.getAttribute('data-filter');
        this.apply();
      });
    });

    // Price filters
    const priceButtons = document.querySelectorAll('[data-price]');
    priceButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const isActive = e.target.classList.contains('is-active');
        document.querySelectorAll('[data-price]').forEach(b => b.classList.remove('is-active'));
        
        if (isActive) {
          this.activePriceRange = null;
        } else {
          e.target.classList.add('is-active');
          this.activePriceRange = e.target.getAttribute('data-price');
        }
        this.apply();
      });
    });

    // Rating filters
    const ratingButtons = document.querySelectorAll('[data-rating]');
    ratingButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const isActive = e.target.classList.contains('is-active');
        document.querySelectorAll('[data-rating]').forEach(b => b.classList.remove('is-active'));
        
        if (isActive) {
          this.activeRatingThreshold = null;
        } else {
          e.target.classList.add('is-active');
          this.activeRatingThreshold = parseFloat(e.target.getAttribute('data-rating'));
        }
        this.apply();
      });
    });
  }

  apply() {
    let results = [...this.shop.products];

    // Filter by Category
    if (this.activeCategory !== 'all') {
      results = results.filter(p => p.category === this.activeCategory);
    }

    // Filter by Price
    if (this.activePriceRange) {
      const [min, max] = this.activePriceRange.split('-').map(v => v === '+' ? Infinity : parseFloat(v));
      results = results.filter(p => {
        if (max === undefined) return p.price >= min;
        return p.price >= min && p.price <= max;
      });
    }

    // Filter by Rating
    if (this.activeRatingThreshold) {
      results = results.filter(p => p.rating >= this.activeRatingThreshold);
    }

    this.shop.updateFilters(results);
  }
}
