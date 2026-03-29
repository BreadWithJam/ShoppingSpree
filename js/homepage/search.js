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
    this.debounceDelay = 300;
    this.minQueryLength = 2;
    this.maxSuggestions = 8;
    this.apiEndpoint = '/api/search';
    this.suggestionsEndpoint = '/api/suggestions';
    this.searchHistory = this.loadSearchHistory();
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
   * Handle search input changes with enhanced debouncing
   */
  async handleSearchInput(event) {
    const query = event.target.value.trim();
    this.searchQuery = query;

    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (query.length === 0) {
      this.hideSuggestions();
      return;
    }

    if (query.length < this.minQueryLength) {
      this.hideSuggestions();
      return;
    }

    // Debounced API call
    this.searchTimeout = setTimeout(async () => {
      await this.fetchSuggestions(query);
    }, this.debounceDelay);
  }

  /**
   * Handle search input keydown with enhanced navigation
   */
  handleSearchKeydown(event) {
    const suggestionsElement = this.getElement('searchSuggestions');
    
    if (!suggestionsElement || suggestionsElement.hidden) {
      // Handle shortcuts even when suggestions are hidden
      if (event.key === 'Enter') {
        event.preventDefault();
        const searchInput = this.getElement('searchInput');
        if (searchInput && searchInput.value.trim()) {
          this.performSearch(searchInput.value.trim());
        }
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateSuggestions(1);
        this.announceSelectedSuggestion();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateSuggestions(-1);
        this.announceSelectedSuggestion();
        break;
      case 'Enter':
        event.preventDefault();
        this.selectCurrentSuggestion();
        break;
      case 'Escape':
        event.preventDefault();
        this.hideSuggestions();
        event.target.blur();
        break;
      case 'Tab':
        // Allow tab to close suggestions and move focus
        this.hideSuggestions();
        break;
      case 'Home':
        event.preventDefault();
        this.selectedSuggestionIndex = -1;
        this.updateSuggestionSelection();
        this.announceSelectedSuggestion();
        break;
      case 'End':
        event.preventDefault();
        this.selectedSuggestionIndex = this.suggestions.length - 1;
        this.updateSuggestionSelection();
        this.announceSelectedSuggestion();
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
   * Perform search with API integration and result highlighting
   */
  async performSearch(query) {
    if (this.isSearching) return;

    try {
      this.isSearching = true;
      this.showSearchLoading();
      this.hideSuggestions();

      // Add to search history
      this.addToSearchHistory(query);

      // Make API call with error handling and retry logic
      const results = await this.searchProductsAPI(query);
      
      this.hideSearchLoading();
      this.handleSearchResults(results, query);
      
      // Emit search performed event
      this.emitSearchEvent('searchPerformed', { query, results });
      
    } catch (error) {
      this.hideSearchLoading();
      this.handleError(error, 'search');
      this.showSearchError('Search failed. Please try again.');
      
      // Emit search error event
      this.emitSearchEvent('searchError', { query, error: error.message });
    } finally {
      this.isSearching = false;
    }
  }

  /**
   * Fetch search suggestions with enhanced API integration
   */
  async fetchSuggestions(query) {
    try {
      // Cancel previous request if still pending
      if (this.suggestionsAbortController) {
        this.suggestionsAbortController.abort();
      }
      
      this.suggestionsAbortController = new AbortController();
      
      // Get suggestions from API with filtering and highlighting
      const suggestions = await this.getSuggestionsAPI(query, {
        signal: this.suggestionsAbortController.signal
      });
      
      // Filter and limit suggestions
      const filteredSuggestions = this.filterSuggestions(suggestions, query);
      const limitedSuggestions = filteredSuggestions.slice(0, this.maxSuggestions);
      
      this.suggestions = limitedSuggestions;
      this.selectedSuggestionIndex = -1;
      
      if (limitedSuggestions.length > 0) {
        this.renderSuggestions(limitedSuggestions, query);
        this.showSuggestions();
      } else {
        this.hideSuggestions();
      }
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.handleError(error, 'suggestions');
        this.hideSuggestions();
      }
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
   * Render suggestions with highlighting
   */
  renderSuggestions(suggestions, query = '') {
    const suggestionsElement = this.getElement('searchSuggestions');
    if (!suggestionsElement) return;

    const suggestionHTML = suggestions.map((suggestion, index) => {
      const text = suggestion.text || suggestion;
      const category = suggestion.category || '';
      const highlightedText = this.highlightSearchTerm(text, query);
      
      return `
        <div class="search-suggestion" 
             role="option" 
             aria-selected="false"
             data-index="${index}"
             tabindex="-1">
          <span class="search-suggestion__text">${highlightedText}</span>
          ${category ? `<span class="search-suggestion__category">${this.escapeHtml(category)}</span>` : ''}
          ${suggestion.type ? `<span class="search-suggestion__type">${this.escapeHtml(suggestion.type)}</span>` : ''}
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
      
      // Add mouse enter for keyboard/mouse interaction consistency
      this.addEventListener(item, 'mouseenter', () => {
        this.selectedSuggestionIndex = index;
        this.updateSuggestionSelection();
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
   * API call for product search with retry logic
   */
  async searchProductsAPI(query, options = {}) {
    const { retries = 2, timeout = 5000 } = options;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(`${this.apiEndpoint}?q=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Search API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.results || data;
        
      } catch (error) {
        if (attempt === retries || error.name === 'AbortError') {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * API call for search suggestions
   */
  async getSuggestionsAPI(query, options = {}) {
    const { signal, timeout = 3000 } = options;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Use provided signal or create new one
      const requestSignal = signal || controller.signal;
      
      const response = await fetch(`${this.suggestionsEndpoint}?q=${encodeURIComponent(query)}&limit=${this.maxSuggestions}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: requestSignal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Suggestions API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.suggestions || data;
      
    } catch (error) {
      // Fallback to mock suggestions if API fails
      if (error.name !== 'AbortError') {
        console.warn('Suggestions API failed, using fallback:', error.message);
        return this.getFallbackSuggestions(query);
      }
      throw error;
    }
  }

  /**
   * Filter suggestions based on relevance and query
   */
  filterSuggestions(suggestions, query) {
    if (!suggestions || !Array.isArray(suggestions)) {
      return [];
    }
    
    const queryLower = query.toLowerCase();
    
    return suggestions
      .filter(suggestion => {
        const text = (suggestion.text || suggestion).toLowerCase();
        return text.includes(queryLower);
      })
      .sort((a, b) => {
        const aText = (a.text || a).toLowerCase();
        const bText = (b.text || b).toLowerCase();
        
        // Prioritize exact matches
        const aExact = aText === queryLower;
        const bExact = bText === queryLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Prioritize starts with
        const aStarts = aText.startsWith(queryLower);
        const bStarts = bText.startsWith(queryLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // Sort by length (shorter first)
        return aText.length - bText.length;
      });
  }

  /**
   * Highlight search term in suggestion text
   */
  highlightSearchTerm(text, query) {
    if (!query || !text) {
      return this.escapeHtml(text);
    }
    
    const escapedText = this.escapeHtml(text);
    const escapedQuery = this.escapeHtml(query);
    
    // Case-insensitive highlighting
    const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  /**
   * Announce selected suggestion for screen readers
   */
  announceSelectedSuggestion() {
    const searchInput = this.getElement('searchInput');
    if (!searchInput) return;
    
    let announcement = '';
    
    if (this.selectedSuggestionIndex >= 0 && this.selectedSuggestionIndex < this.suggestions.length) {
      const suggestion = this.suggestions[this.selectedSuggestionIndex];
      const text = suggestion.text || suggestion;
      const category = suggestion.category ? ` in ${suggestion.category}` : '';
      announcement = `${text}${category}, ${this.selectedSuggestionIndex + 1} of ${this.suggestions.length}`;
    } else {
      announcement = `${this.searchQuery}, type to search`;
    }
    
    // Update aria-live region
    searchInput.setAttribute('aria-describedby', 'search-status');
    
    let statusElement = document.getElementById('search-status');
    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.id = 'search-status';
      statusElement.className = 'visually-hidden';
      statusElement.setAttribute('aria-live', 'polite');
      statusElement.setAttribute('aria-atomic', 'true');
      document.body.appendChild(statusElement);
    }
    
    statusElement.textContent = announcement;
  }

  /**
   * Add query to search history
   */
  addToSearchHistory(query) {
    if (!query || query.length < 2) return;
    
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(item => item !== query);
    
    // Add to beginning
    this.searchHistory.unshift(query);
    
    // Limit history size
    this.searchHistory = this.searchHistory.slice(0, 10);
    
    // Save to localStorage
    this.saveSearchHistory();
  }

  /**
   * Load search history from localStorage
   */
  loadSearchHistory() {
    try {
      const history = localStorage.getItem('search_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.warn('Failed to load search history:', error);
      return [];
    }
  }

  /**
   * Save search history to localStorage
   */
  saveSearchHistory() {
    try {
      localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  /**
   * Get fallback suggestions when API fails
   */
  getFallbackSuggestions(query) {
    const fallbackSuggestions = [
      ...this.searchHistory.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      ).map(item => ({ text: item, type: 'history' })),
      { text: `${query} shoes`, category: 'Fashion' },
      { text: `${query} electronics`, category: 'Electronics' },
      { text: `${query} books`, category: 'Books' },
      { text: `${query} home`, category: 'Home & Living' }
    ];
    
    return fallbackSuggestions.slice(0, this.maxSuggestions);
  }

  /**
   * Emit search events
   */
  emitSearchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
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