/**
 * Shop Page Manager
 * Handles product rendering, state management, and orchestration of shop features.
 */
import { FilterManager } from './filter-logic.js';
import { SortManager } from './sort-logic.js';

export class ShopManager {
  constructor() {
    this.container = document.getElementById('product-grid');
    this.countElement = document.getElementById('current-count');
    this.paginationContainer = document.getElementById('pagination');
    this.products = [];
    this.filteredProducts = [];
    this.itemsPerPage = 6;
    this.currentPage = 1;
    
    this.filterManager = new FilterManager(this);
    this.sortManager = new SortManager(this);
  }

  /**
   * Initialize the Shop page logic
   */
  async init() {
    if (!this.container) return;
    
    // Simulate API fetch delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    this.products = this.generateMockProducts();
    this.filteredProducts = [...this.products];
    
    this.filterManager.init();
    this.sortManager.init();
    
    this.render();
    console.log('ShopManager initialized');
  }

  /**
   * Render products based on current filtered/sorted state and pagination
   */
  render() {
    this.container.innerHTML = '';
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const productsToRender = this.filteredProducts.slice(start, end);
    
    if (productsToRender.length === 0) {
      this.container.innerHTML = '<li class="no-products">No products found matching your criteria.</li>';
      this.countElement.textContent = '0';
      this.paginationContainer.innerHTML = '';
      return;
    }
    
    productsToRender.forEach(product => {
      const card = this.createProductCard(product);
      this.container.appendChild(card);
    });
    
    this.countElement.textContent = this.filteredProducts.length.toString();
    this.renderPagination();
  }

  /**
   * Create a product card element (reusing BEM classes from homepage)
   */
  createProductCard(product) {
    const li = document.createElement('li');
    li.innerHTML = `
      <article class="product-card" style="opacity: 0; transform: translateY(20px); transition: all 0.4s ease-out">
        <div class="product-card__image-container">
          <img class="product-card__image" src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.discount ? `<div class="product-card__badge">-${product.discount}%</div>` : ''}
        </div>
        <div class="product-card__content">
          <h3 class="product-card__title">${product.name}</h3>
          <div class="product-card__rating">
            <div class="product-card__stars">
              ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
            </div>
            <span class="product-card__rating-text">(${product.reviews})</span>
          </div>
          <div class="product-card__pricing">
            <span class="product-card__price">$${product.price.toFixed(2)}</span>
            ${product.originalPrice ? `<span class="product-card__original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
          </div>
          <button class="product-card__action button button--primary">Add to Cart</button>
        </div>
      </article>
    `;
    
    // Animate in
    setTimeout(() => {
      const article = li.querySelector('article');
      article.style.opacity = '1';
      article.style.transform = 'translateY(0)';
    }, 50);
    
    return li;
  }

  /**
   * Render pagination controls
   */
  renderPagination() {
    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    this.paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `pagination__button ${i === this.currentPage ? 'is-active' : ''}`;
      btn.textContent = i;
      btn.addEventListener('click', () => {
        this.currentPage = i;
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      this.paginationContainer.appendChild(btn);
    }
  }

  /**
   * Hook for FilterManager to update products
   */
  updateFilters(filtered) {
    this.filteredProducts = filtered;
    this.currentPage = 1;
    this.render();
  }

  /**
   * Mock data generation
   */
  generateMockProducts() {
    return [
      { id: 1, name: 'Precision Pro Camera', category: 'electronics', price: 899.99, rating: 4.8, reviews: 156, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80', originalPrice: 1099.99, discount: 18 },
      { id: 2, name: 'Vantage Sneakers', category: 'fashion', price: 85.00, rating: 4.5, reviews: 342, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Smart Home Hub', category: 'electronics', price: 129.99, rating: 4.2, reviews: 89, image: 'https://images.unsplash.com/photo-1558002038-1037906d9927?auto=format&fit=crop&w=400&q=80', originalPrice: 159.99, discount: 19 },
      { id: 4, name: 'Velvet Soft Cushion', category: 'home', price: 24.99, rating: 4.7, reviews: 213, image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Pro Yoga Mat', category: 'sports', price: 45.00, rating: 4.9, reviews: 567, image: 'https://images.unsplash.com/photo-1592432676556-269275ad6fab?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'Minimalist Wall Clock', category: 'home', price: 39.00, rating: 4.4, reviews: 128, image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=400&q=80' },
      { id: 7, name: 'Ultra-thin Laptop', category: 'electronics', price: 1299.00, rating: 4.6, reviews: 45, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80' },
      { id: 8, name: 'Designer Sunglasses', category: 'fashion', price: 150.00, rating: 4.3, reviews: 67, image: 'https://images.unsplash.com/photo-1511499767390-a73953f46ca2?auto=format&fit=crop&w=400&q=80' },
      { id: 9, name: 'Titanium Water Bottle', category: 'sports', price: 55.00, rating: 4.8, reviews: 892, image: 'https://images.unsplash.com/photo-1602143307185-84e05b38ed84?auto=format&fit=crop&w=400&q=80' },
      { id: 10, name: 'Ceramic Coffee Set', category: 'home', price: 65.00, rating: 4.5, reviews: 143, image: 'https://images.unsplash.com/photo-1544787210-2213d84ad9a0?auto=format&fit=crop&w=400&q=80' },
      { id: 11, name: 'Noise-cancelling Pods', category: 'electronics', price: 199.99, rating: 4.7, reviews: 231, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80' },
      { id: 12, name: 'Leather Weekend Bag', category: 'fashion', price: 220.00, rating: 4.1, reviews: 54, image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=400&q=80' }
    ];
  }
}
