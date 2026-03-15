/**
 * Search Manager Module
 * Handles product search functionality, autocomplete, and search interactions
 */

import { BaseModule } from './base-module.js';

export class SearchManager extends BaseModule {
  constructor() {
    super('SearchManager');
    this.searchQuery = '';
    this.suggestions = [];
    this.selectedSuggestionIndex = -1;
    this.searchTimeout = null;
    this.isSearching = false;
  }

  /**
   * Find search elements
   */
  async findElements() {
    this.setElement('searchForm', this.findElement('.search-form'));
    this.setElement('searchInput', this.findElement('.search-input'));
    this.setElement('searchButton', this.findElement('.search-button'));
    this.setElement('searchSuggestions', this.findElement('.search-suggestions'));
  }

  /**
   * Bind search events
   */
  bindEvents() {
    const searchForm = this.getElement('searchForm');
    const searchInput = this.getElement('searchInput');
    const searchButton = this.getElement('searchButton');

    if (searchForm) {
      this.addEventListener(searchForm, 'submit', this.handleSearchSubmit);
    }

    if (searchInput) {
      this.addEventListener(searchInput, 'input', this.debounce(this.handleSearchInput, 300));
      this.addEventListener(searchInput, 'keydown', this.handleSearchKeydown);
      this.addEventListener(searchInput, 'focus', this.handleSearchFocus);
      this.addEventListener(searchInput, 'blur', this.handleSearchBlur);
    }

    if (searchButton) {
      this.addEventListener(searchButton, 'click', this.handleSearchButtonClick);
    }

    // Close suggestions on outside click
    this.addEventListener(document, 'click', this.handleOutsideClick);
  }

  /**
   * Handle search form submission
   */
  async handleSearchSubmit(event) {
    event.preventDefault();
    
    const searchInput = this.getElement('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.trim();
    
    if (query.length === 0) {
      this.showSearchError('Please enter a search term');
      return;
    }

    await this.performSearch(query);
  }

  /**
   * Handle search input changes
   */
  async handleSearchInput(event) {
    const query = event.target.value.trim();
    this.searchQuery = query;

    if (query.length === 0) {
      this.hideSuggestions();
      return;
    }

    if (query.length < 2) {
      return; // Wait for at least 2 characters
    }

    await this.fetchSuggestions(query);
  }

  /**
   * Handle search input keydown
   */
  handleSearchKeydown(event) {
    const suggestionsElement = this.getElement('searchSuggestions');
    
    if (!suggestionsElement || suggestionsElement.hidden) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateSuggestions(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateSuggestions(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.selectCurrentSuggestion();
        break;
      case 'Escape':
        event.preventDefault();
        this.hideSuggestions();
        break;
    }
  }

  /**
   * Handle search input focus
   */
  handleSearchFocus(event) {
    const query = event.target.value.trim();
    
    if (query.length >= 2 && this.suggestions.length > 0) {
      this.showSuggestions();
    }
  }

  /**
   * Handle search input blur
   */
  handleSearchBlur() {
    // Delay hiding suggestions to allow for suggestion clicks
    setTimeout(() => {
      this.hideSuggestions();
    }, 150);
  }

  /**
   * Handle search button click
   */
  handleSearchButtonClick(event) {
    event.preventDefault();
    
    const searchForm = this.getElement('searchForm');
    if (searchForm) {
      searchForm.dispatchEvent(new Event('submit'));
    }
  }

  /**
   * Handle outside clicks to close suggestions
   */
  handleOutsideClick(event) {
    const searchForm = this.getElement('searchForm');
    const suggestionsElement = this.getElement('searchSuggestions');
    
    if (searchForm && !searchForm.contains(event.target) && 
        suggestionsElement && !suggestionsElement.contains(event.target)) {
      this.hideSuggestions();
    }
  }

  /**
   * Perform search
   */
  async performSearch(query) {
    if (this.isSearching) return;

    try {
      this.isSearching = true;
      this.showSearchLoading();

      // Simulate API call - replace with actual search endpoint
      const results = await this.searchProducts(query);
      
      this.hideSearchLoading();
      this.handleSearchResults(results, query);
      
    } catch (error) {
      this.hideSearchLoading();
      this.handleError(error, 'search');
      this.showSearchError('Search failed. Please try again.');
    } finally {
      this.isSearching = false;
    }
  }

  /**
   * Fetch search suggestions
   */
  async fetchSuggestions(query) {
    try {
      // Simulate API call - replace with actual suggestions endpoint
      const suggestions = await this.getSuggestions(query);
      
      this.suggestions = suggestions;
      this.selectedSuggestionIndex = -1;
      
      if (suggestions.length > 0) {
        this.renderSuggestions(suggestions);
        this.showSuggestions();
      } else {
        this.hideSuggestions();
      }
      
    } catch (error) {
      this.handleError(error, 'suggestions');
      this.hideSuggestions();
    }
  }

  /**
   * Navigate through suggestions with keyboard
   */
  navigateSuggestions(direction) {
    const maxIndex = this.suggestions.length - 1;
    
    this.selectedSuggestionIndex += direction;
    
    if (this.selectedSuggestionIndex < -1) {
      this.selectedSuggestionIndex = maxIndex;
    } else if (this.selectedSuggestionIndex > maxIndex) {
      this.selectedSuggestionIndex = -1;
    }
    
    this.updateSuggestionSelection();
  }

  /**
   * Select current suggestion
   */
  selectCurrentSuggestion() {
    if (this.selectedSuggestionIndex >= 0 && this.selectedSuggestionIndex < this.suggestions.length) {
      const suggestion = this.suggestions[this.selectedSuggestionIndex];
      this.applySuggestion(suggestion);
    } else {
      // No suggestion selected, perform search with current input
      const searchInput = this.getElement('searchInput');
      if (searchInput) {
        this.performSearch(searchInput.value.trim());
      }
    }
  }

  /**
   * Apply selected suggestion
   */
  applySuggestion(suggestion) {
    const searchInput = this.getElement('searchInput');
    
    if (searchInput) {
      searchInput.value = suggestion.text || suggestion;
      this.hideSuggestions();
      this.performSearch(suggestion.text || suggestion);
    }
  }

  /**
   * Update suggestion selection visual state
   */
  updateSuggestionSelection() {
    const suggestionsElement = this.getElement('searchSuggestions');
    if (!suggestionsElement) return;

    const suggestionItems = suggestionsElement.querySelectorAll('.search-suggestion');
    
    suggestionItems.forEach((item, index) => {
      if (index === this.selectedSuggestionIndex) {
        item.classList.add('search-suggestion--selected');
        item.setAttribute('aria-selected', 'true');
      } else {
        item.classList.remove('search-suggestion--selected');
        item.setAttribute('aria-selected', 'false');
      }
    });

    // Update input value with selected suggestion
    const searchInput = this.getElement('searchInput');
    if (searchInput) {
      if (this.selectedSuggestionIndex >= 0) {
        const suggestion = this.suggestions[this.selectedSuggestionIndex];
        searchInput.value = suggestion.text || suggestion;
      } else {
        searchInput.value = this.searchQuery;
      }
    }
  }

  /**
   * Render suggestions
   */
  renderSuggestions(suggestions) {
    const suggestionsElement = this.getElement('searchSuggestions');
    if (!suggestionsElement) return;

    const suggestionHTML = suggestions.map((suggestion, index) => {
      const text = suggestion.text || suggestion;
      const category = suggestion.category || '';
      
      return `
        <div class="search-suggestion" 
             role="option" 
             aria-selected="false"
             data-index="${index}">
          <span class="search-suggestion__text">${this.escapeHtml(text)}</span>
          ${category ? `<span class="search-suggestion__category">${this.escapeHtml(category)}</span>` : ''}
        </div>
      `;
    }).join('');

    suggestionsElement.innerHTML = suggestionHTML;

    // Add click listeners to suggestions
    const suggestionItems = suggestionsElement.querySelectorAll('.search-suggestion');
    suggestionItems.forEach((item, index) => {
      this.addEventListener(item, 'click', () => {
        this.applySuggestion(suggestions[index]);
      });
    });
  }

  /**
   * Show suggestions
   */
  showSuggestions() {
    const suggestionsElement = this.getElement('searchSuggestions');
    if (suggestionsElement) {
      suggestionsElement.hidden = false;
      suggestionsElement.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Hide suggestions
   */
  hideSuggestions() {
    const suggestionsElement = this.getElement('searchSuggestions');
    if (suggestionsElement) {
      suggestionsElement.hidden = true;
      suggestionsElement.setAttribute('aria-expanded', 'false');
    }
    
    this.selectedSuggestionIndex = -1;
  }

  /**
   * Show search loading state
   */
  showSearchLoading() {
    const searchButton = this.getElement('searchButton');
    if (searchButton) {
      searchButton.disabled = true;
      searchButton.innerHTML = `
        <svg class="search-loading" width="20" height="20" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
          <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none">
            <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 12 12;360 12 12"/>
          </path>
        </svg>
      `;
    }
  }

  /**
   * Hide search loading state
   */
  hideSearchLoading() {
    const searchButton = this.getElement('searchButton');
    if (searchButton) {
      searchButton.disabled = false;
      searchButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      `;
    }
  }

  /**
   * Show search error
   */
  showSearchError(message) {
    // Create or update error message
    console.error('Search error:', message);
    
    // You could show a toast notification or inline error here
    // For now, just log the error
  }

  /**
   * Handle search results
   */
  handleSearchResults(results, query) {
    console.log(`Search results for "${query}":`, results);
    
    // Emit search results event for other modules to handle
    const searchEvent = new CustomEvent('searchResults', {
      detail: { query, results }
    });
    
    document.dispatchEvent(searchEvent);
  }

  /**
   * Mock search API call
   */
  async searchProducts(query) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock search results
    return [
      { id: 1, name: `${query} Product 1`, price: 29.99 },
      { id: 2, name: `${query} Product 2`, price: 39.99 },
      { id: 3, name: `${query} Product 3`, price: 49.99 }
    ];
  }

  /**
   * Mock suggestions API call
   */
  async getSuggestions(query) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock suggestions
    const mockSuggestions = [
      { text: `${query} shoes`, category: 'Fashion' },
      { text: `${query} electronics`, category: 'Electronics' },
      { text: `${query} books`, category: 'Books' },
      { text: `${query} home`, category: 'Home & Living' }
    ];
    
    return mockSuggestions.slice(0, 5); // Return max 5 suggestions
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clear search
   */
  clearSearch() {
    const searchInput = this.getElement('searchInput');
    if (searchInput) {
      searchInput.value = '';
      this.searchQuery = '';
      this.hideSuggestions();
    }
  }

  /**
   * Get current search query
   */
  get currentQuery() {
    return this.searchQuery;
  }
}