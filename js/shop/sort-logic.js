/**
 * Sort Manager
 * Handles sorting logic for the Shop page
 */
export class SortManager {
  constructor(shop) {
    this.shop = shop;
    this.select = document.getElementById('sort-select');
  }

  init() {
    if (!this.select) return;
    
    this.select.addEventListener('change', () => {
      this.apply();
    });
  }

  apply() {
    const sortBy = this.select.value;
    let sorted = [...this.shop.filteredProducts];

    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        // Featured uses initial mock order
        sorted.sort((a, b) => a.id - b.id);
        break;
    }

    this.shop.updateFilters(sorted);
  }
}
