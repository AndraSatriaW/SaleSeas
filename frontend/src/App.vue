<template>
  <div class="app">
    <!-- ============================================================
         HEADER / HERO SECTION
         ============================================================ -->
    <header class="header">
      <div class="container">
        <!-- Navigation -->
        <nav class="nav">
          <div class="nav-brand">
            <span class="nav-logo">⛵</span>
            <span class="nav-name">Sale<span class="nav-name-accent">Seas</span></span>
          </div>
          <div class="nav-tagline">Sail for the best game sales</div>
          <div class="nav-tabs">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'deals' }" 
              @click="switchTab('deals')"
            >
              🌊 Deals
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'wishlist' }" 
              @click="switchTab('wishlist')"
            >
              ★ Wishlist
            </button>
          </div>
        </nav>

        <!-- Hero Content -->
        <div class="hero">
          <h1 class="hero-title">
            Find the <span class="hero-highlight">Best Game Sales</span> Across the Seven Seas
          </h1>
          <p class="hero-subtitle">
            Compare prices from multiple stores. Save your treasure. Start sailing!
          </p>

          <!-- Stats Row —— changes based on active tab -->
          <!-- Deals tab stats -->
          <div class="hero-stats" v-if="activeTab === 'deals' && deals.length > 0">
            <div class="stat">
              <span class="stat-value">{{ deals.length }}+</span>
              <span class="stat-label">Deals Found</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">{{ storeCount }}</span>
              <span class="stat-label">Stores</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">{{ bestDiscount }}%</span>
              <span class="stat-label">Best Discount</span>
            </div>
          </div>

          <!-- Wishlist tab stats -->
          <div class="hero-stats" v-if="activeTab === 'wishlist' && wishlist.length > 0">
            <div class="stat">
              <span class="stat-value">{{ wishlist.length }}</span>
              <span class="stat-label">Wishlisted</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">{{ wishlistBestDiscount }}%</span>
              <span class="stat-label">Best Discount</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Decorative wave divider -->
      <div class="wave-divider">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,40 C150,100 350,0 600,40 C850,80 1050,0 1200,40 L1200,120 L0,120 Z" fill="var(--bg-primary)"></path>
        </svg>
      </div>
    </header>

    <!-- ============================================================
         MAIN CONTENT
         ============================================================ -->
    <main class="main container">
      <!-- DEALS TAB CONTENT -->
      <div v-if="activeTab === 'deals'">
        <!-- Search Bar -->
        <section class="section-search">
          <SearchBar @search="handleSearch" @clear="handleClearSearch" />
        </section>

        <!-- Filter Bar -->
        <section class="section-filter">
          <FilterBar @filter="handleFilter" @reset="handleResetFilters" />
        </section>

        <!-- Active search indicator -->
        <div v-if="activeSearchTitle" class="search-indicator">
          <span>🔍 Showing results for: <strong>"{{ activeSearchTitle }}"</strong></span>
          <button class="search-indicator-clear" @click="handleClearSearch">✕ Clear</button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-section">
          <div class="loading-grid">
            <div v-for="n in 8" :key="n" class="skeleton-card">
              <div class="skeleton skeleton-thumb"></div>
              <div class="skeleton-body">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-price"></div>
                <div class="skeleton skeleton-btn"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">🏴‍☠️</div>
          <h2>Shipwrecked!</h2>
          <p>{{ error }}</p>
          <button class="error-retry-btn" @click="loadDeals">Try Again</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="deals.length === 0" class="empty-state">
          <div class="empty-icon">🏝️</div>
          <h2>No Treasures Found</h2>
          <p>Try adjusting your search or filters to discover more deals.</p>
        </div>

        <!-- Deals Grid -->
        <section v-else class="deals-section">
          <div class="deals-grid">
            <DealCard
              v-for="(deal, index) in deals"
              :key="deal.dealID"
              :deal="deal"
              :storeMap="storeMap"
              :isWishlisted="isWishlisted(deal.gameID)"
              @toggle-wishlist="handleToggleWishlist"
              :style="{ animationDelay: (index % 20) * 50 + 'ms' }"
            />
          </div>

          <!-- Load More Button -->
          <div class="load-more" v-if="!searchMode && deals.length >= 20">
            <button
              id="load-more-btn"
              class="load-more-btn"
              @click="loadMore"
              :disabled="loadingMore"
            >
              {{ loadingMore ? '⏳ Loading...' : '⛵ Load More Deals' }}
            </button>
          </div>
        </section>
      </div>

      <!-- WISHLIST TAB CONTENT -->
      <div v-else-if="activeTab === 'wishlist'">
        <div class="wishlist-header-bar">
          <h2 class="wishlist-title">My Saved Treasures</h2>
          <button 
            class="simulate-btn" 
            :class="{ loading: simulating }"
            :disabled="simulating" 
            @click="simulatePriceDrop"
          >
            <span class="btn-icon">⚡</span>
            {{ simulating ? 'Simulating Drop...' : 'Simulate Price Drop' }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loadingWishlist" class="loading-section">
          <div class="loading-grid">
            <div v-for="n in 4" :key="n" class="skeleton-card">
              <div class="skeleton skeleton-thumb"></div>
              <div class="skeleton-body">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-btn"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="wishlistError" class="error-state">
          <div class="error-icon">🏴‍☠️</div>
          <h2>Shipwrecked!</h2>
          <p>{{ wishlistError }}</p>
          <button class="error-retry-btn" @click="loadWishlist">Try Again</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="wishlist.length === 0" class="empty-state">
          <div class="empty-icon">⭐</div>
          <h2>Your Wishlist is Empty</h2>
          <p>Click the star icon on any deal card to track its prices across different marketplaces!</p>
          <button class="error-retry-btn" @click="switchTab('deals')">Browse Deals</button>
        </div>

        <!-- Wishlist Grid -->
        <section v-else class="wishlist-section">
          <div class="wishlist-grid">
            <WishlistCard
              v-for="game in wishlist"
              :key="game.gameID"
              :game="game"
              :storeMap="storeMap"
              @remove="removeFromWishlistAction"
            />
          </div>
        </section>
      </div>
    </main>

    <!-- ============================================================
         FOOTER
         ============================================================ -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <span class="footer-logo">⛵</span>
            <span>Sale<span class="nav-name-accent">Seas</span></span>
          </div>
          <p class="footer-text">
            Powered by <a href="https://www.cheapshark.com" target="_blank" rel="noopener">CheapShark API</a>.
            Prices are in USD. IDR conversion is approximate.
          </p>
          <p class="footer-copy">© 2026 SaleSeas — UTS Project</p>
        </div>
      </div>
    </footer>

    <!-- ============================================================
         REAL-TIME TOAST NOTIFICATIONS (WebSocket)
         ============================================================ -->
    <div class="toast-container" v-if="notifications.length > 0">
      <div 
        v-for="notification in notifications" 
        :key="notification.id" 
        class="toast-notification"
        :class="{ show: notification.visible }"
      >
        <button class="toast-close" @click="dismissNotification(notification.id)">✕</button>
        
        <div class="toast-header">
          <span class="toast-pulse"></span>
          <span class="toast-title">PRICE DROP ALERT!</span>
        </div>
        
        <div class="toast-body">
          <img :src="notification.thumb" :alt="notification.title" class="toast-thumb" />
          <div class="toast-details">
            <h4 class="toast-game-title">{{ notification.title }}</h4>
            <div class="toast-meta">
              <span class="toast-store">🛍️ {{ notification.storeName }}</span>
            </div>
            <div class="toast-price-row">
              <span class="toast-old-price">${{ notification.oldPrice }}</span>
              <span class="toast-new-price">${{ notification.newPrice }}</span>
              <span class="toast-savings-badge">-{{ notification.savings }}%</span>
            </div>
          </div>
        </div>
        
        <div class="toast-actions">
          <a 
            :href="`https://store.steampowered.com/search/?term=${encodeURIComponent(notification.title)}`" 
            target="_blank" 
            class="toast-btn toast-btn-primary"
          >
            ⚓ Search Deal
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchDeals, fetchStores, searchDeals, fetchWishlist, addToWishlist, removeFromWishlist, triggerMockPriceDrop } from './api.js'
import SearchBar from './components/SearchBar.vue'
import FilterBar from './components/FilterBar.vue'
import DealCard from './components/DealCard.vue'
import WishlistCard from './components/WishlistCard.vue'

// ============================================================
// Reactive State
// ============================================================

const deals = ref([])           // Array of deal objects
const storeMap = ref({})        // Map of storeID -> storeName
const loading = ref(true)       // Initial loading state
const loadingMore = ref(false)  // Loading more deals
const error = ref(null)         // Error message
const currentPage = ref(0)      // Current page for pagination
const searchMode = ref(false)   // Whether we're in search/filter mode
const activeSearchTitle = ref('') // Currently active search term
const currentFilters = ref({})  // Currently active filters

const activeTab = ref('deals')   // 'deals' or 'wishlist'
const wishlist = ref([])         // Array of wishlisted games with live pricing
const wishlistedGameIds = ref(new Set()) // Set of gameIDs in wishlist
const loadingWishlist = ref(false)
const wishlistError = ref(null)

const notifications = ref([])    // Price drop alerts
const wsConnected = ref(false)   // WebSocket status
const simulating = ref(false)    // Simulation status

// ============================================================
// Computed
// ============================================================

// Count unique stores in current deals
const storeCount = computed(() => {
  const storeIds = new Set(deals.value.map(d => d.storeID))
  return storeIds.size
})

// Find the best (highest) discount in current deals
const bestDiscount = computed(() => {
  if (deals.value.length === 0) return 0
  const max = Math.max(...deals.value.map(d => parseFloat(d.savings) || 0))
  return Math.round(max)
})

// Best discount across wishlisted games
const wishlistBestDiscount = computed(() => {
  if (wishlist.value.length === 0) return 0
  const max = Math.max(...wishlist.value.map(g => g.bestDiscount || 0))
  return Math.round(max)
})

// ============================================================
// Methods
// ============================================================

/**
 * Check if a game is wishlisted
 */
function isWishlisted(gameID) {
  return wishlistedGameIds.value.has(gameID.toString())
}

/**
 * Fetch and sync wishlist item IDs on load
 */
async function syncWishlistIds() {
  try {
    const response = await fetchWishlist()
    if (response.success && response.data) {
      const ids = response.data.map(item => item.gameID.toString())
      wishlistedGameIds.value = new Set(ids)
    }
  } catch (err) {
    console.error('Failed to sync wishlist IDs:', err)
  }
}

/**
 * Fetch full wishlist details with live pricing
 */
async function loadWishlist() {
  loadingWishlist.value = true
  wishlistError.value = null
  try {
    const response = await fetchWishlist()
    if (response.success && response.data) {
      wishlist.value = response.data
      // Keep IDs in sync
      const ids = response.data.map(item => item.gameID.toString())
      wishlistedGameIds.value = new Set(ids)
    } else {
      wishlistError.value = response.message || 'Failed to fetch wishlist'
    }
  } catch (err) {
    console.error('Failed to load wishlist details:', err)
    wishlistError.value = 'Could not load wishlist. Make sure the database and wishlist-service are running.'
  } finally {
    loadingWishlist.value = false
  }
}

/**
 * Switch between Deals and Wishlist tabs
 */
function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'wishlist') {
    loadWishlist()
  } else {
    // Sync wishlist IDs so main deal cards show accurate star states
    syncWishlistIds()
  }
}

/**
 * Toggle wishlist status for a game from a deal card
 */
async function handleToggleWishlist(deal) {
  const gameIDStr = deal.gameID.toString()
  try {
    if (wishlistedGameIds.value.has(gameIDStr)) {
      // Remove
      const response = await removeFromWishlist(gameIDStr)
      if (response.success) {
        wishlistedGameIds.value.delete(gameIDStr)
      }
    } else {
      // Add
      const response = await addToWishlist(gameIDStr, deal.title, deal.thumb)
      if (response.success) {
        wishlistedGameIds.value.add(gameIDStr)
      }
    }
  } catch (err) {
    console.error('Failed to toggle wishlist:', err)
  }
}

/**
 * Remove a game from within the Wishlist tab
 */
async function removeFromWishlistAction(gameID) {
  try {
    const response = await removeFromWishlist(gameID)
    if (response.success) {
      wishlist.value = wishlist.value.filter(item => item.gameID !== gameID)
      wishlistedGameIds.value.delete(gameID.toString())
    }
  } catch (err) {
    console.error('Failed to remove from wishlist:', err)
  }
}

/**
 * Load the initial set of deals and store list
 */
async function loadDeals() {
  loading.value = true
  error.value = null
  searchMode.value = false
  activeSearchTitle.value = ''

  try {
    // Fetch deals and stores in parallel
    const [dealsResponse, storesResponse] = await Promise.all([
      fetchDeals({ pageSize: 20, pageNumber: 0 }),
      fetchStores(),
    ])

    deals.value = dealsResponse.data || []
    currentPage.value = 0

    // Build store map: { storeID: storeName }
    if (storesResponse.data) {
      const map = {}
      storesResponse.data.forEach(store => {
        map[store.storeID] = store.storeName
      })
      storeMap.value = map
    }
  } catch (err) {
    console.error('Failed to load deals:', err)
    error.value = 'Could not connect to the server. Make sure all backend services are running.'
  } finally {
    loading.value = false
  }
}

/**
 * Load more deals (pagination)
 */
async function loadMore() {
  loadingMore.value = true
  try {
    currentPage.value += 1
    const response = await fetchDeals({
      pageSize: 20,
      pageNumber: currentPage.value,
      ...currentFilters.value,
    })
    if (response.data && response.data.length > 0) {
      deals.value = [...deals.value, ...response.data]
    }
  } catch (err) {
    console.error('Failed to load more deals:', err)
  } finally {
    loadingMore.value = false
  }
}

/**
 * Handle search by title
 * Uses the Search Service via api gateway
 */
async function handleSearch(title) {
  if (!title) return

  loading.value = true
  error.value = null
  searchMode.value = true
  activeSearchTitle.value = title

  try {
    const response = await searchDeals({
      title,
      pageSize: 40,
      ...currentFilters.value,
    })
    deals.value = response.data || []
  } catch (err) {
    console.error('Search failed:', err)
    error.value = 'Search failed. Please try again.'
  } finally {
    loading.value = false
  }
}

/**
 * Clear search and reload default deals
 */
function handleClearSearch() {
  activeSearchTitle.value = ''
  searchMode.value = false
  currentFilters.value = {}
  loadDeals()
}

/**
 * Handle filter changes
 */
async function handleFilter(filters) {
  loading.value = true
  error.value = null
  currentFilters.value = filters

  try {
    const params = {
      pageSize: 40,
      ...filters,
    }

    // If there's an active search title, include it
    if (activeSearchTitle.value) {
      params.title = activeSearchTitle.value
      searchMode.value = true
    }

    const response = await searchDeals(params)
    deals.value = response.data || []
  } catch (err) {
    console.error('Filter failed:', err)
    error.value = 'Failed to apply filters. Please try again.'
  } finally {
    loading.value = false
  }
}

/**
 * Reset all filters
 */
function handleResetFilters() {
  currentFilters.value = {}
  if (activeSearchTitle.value) {
    handleSearch(activeSearchTitle.value)
  } else {
    loadDeals()
  }
}

// ============================================================
// WebSockets & Simulation Methods
// ============================================================

/**
 * Initialize WebSocket connection to the API Gateway
 */
function initWebSocket() {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // Use current hostname, but default port 3000 for the gateway
  const wsUrl = `${wsProtocol}//${window.location.hostname}:3000`;

  console.log(`Connecting to WebSocket server: ${wsUrl}`);
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connected successfully to API Gateway.');
    wsConnected.value = true;
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('WebSocket message received:', message);
      if (message.type === 'PRICE_DROP') {
        showPriceDropNotification(message.data);
      }
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed. Reconnecting in 5 seconds...');
    wsConnected.value = false;
    setTimeout(initWebSocket, 5000);
  };

  socket.onerror = (err) => {
    console.error('WebSocket error:', err);
  };
}

/**
 * Show toast notification for a price drop
 */
function showPriceDropNotification(data) {
  const id = Date.now();
  const newNotification = {
    id,
    ...data,
    visible: true
  };
  notifications.value.push(newNotification);

  // Auto-remove notification after 8 seconds
  setTimeout(() => {
    dismissNotification(id);
  }, 8000);
}

/**
 * Dismiss a notification manually
 */
function dismissNotification(id) {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index !== -1) {
    // Fade out first
    notifications.value[index].visible = false;
    // Remove from array after animation completes
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id);
    }, 400);
  }
}

/**
 * Trigger mock price drop event on the backend
 */
async function simulatePriceDrop() {
  simulating.value = true;
  try {
    const res = await triggerMockPriceDrop();
    console.log('Simulated price drop response:', res);
  } catch (err) {
    console.error('Failed to simulate price drop:', err);
  } finally {
    simulating.value = false;
  }
}

// ============================================================
// Lifecycle
// ============================================================

onMounted(() => {
  loadDeals()
  syncWishlistIds()
  initWebSocket()
})
</script>

<style scoped>
/* ============================================================
   HEADER
   ============================================================ */
.header {
  position: relative;
  background: linear-gradient(135deg, #061a0e 0%, #0a1628 40%, #0d1f12 100%);
  padding-bottom: 40px;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: 
    radial-gradient(circle at 30% 20%, rgba(16, 185, 92, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 70% 60%, rgba(240, 180, 41, 0.06) 0%, transparent 40%);
  animation: float 8s ease-in-out infinite;
  pointer-events: none;
}

/* Navigation */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) 0;
  position: relative;
}

.nav-tabs {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.tab-btn {
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(16, 185, 92, 0.15), rgba(240, 180, 41, 0.15));
  border-color: var(--color-green-light);
  color: var(--color-green-light);
  box-shadow: 0 0 12px rgba(16, 185, 92, 0.2);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.nav-logo {
  font-size: 1.8rem;
  animation: wave 3s ease-in-out infinite;
}

.nav-name {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.nav-name-accent {
  color: var(--color-green);
}

.nav-tagline {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

/* Hero */
.hero {
  text-align: center;
  padding: var(--space-2xl) 0 var(--space-xl);
  position: relative;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 900;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: var(--space-md);
  letter-spacing: -1px;
}

.hero-highlight {
  background: linear-gradient(135deg, var(--color-green-light), var(--color-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 500px;
  margin: 0 auto var(--space-xl);
}

/* Stats */
.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xl);
  animation: fadeInUp 0.6s ease 0.3s backwards;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-green-light);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: var(--border-color);
}

/* Wave Divider */
.wave-divider {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  line-height: 0;
}

.wave-divider svg {
  width: 100%;
  height: 50px;
}

/* ============================================================
   MAIN CONTENT
   ============================================================ */
.main {
  padding-top: var(--space-xl);
  padding-bottom: var(--space-3xl);
  min-height: 60vh;
}

.section-search {
  margin-bottom: var(--space-lg);
}

.section-filter {
  margin-bottom: var(--space-xl);
}

/* Search Indicator */
.search-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-lg);
  background: rgba(16, 185, 92, 0.08);
  border: 1px solid rgba(16, 185, 92, 0.15);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.search-indicator strong {
  color: var(--color-green-light);
}

.search-indicator-clear {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.8rem;
  transition: all var(--transition-fast);
}

.search-indicator-clear:hover {
  border-color: #ef4444;
  color: #ef4444;
}

/* ============================================================
   DEALS GRID
   ============================================================ */
.deals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
}

/* ============================================================
   WISHLIST GRID — single column landscape cards
   ============================================================ */
.wishlist-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  max-width: 900px;
  margin: 0 auto;
}

/* ============================================================
   LOADING SKELETON
   ============================================================ */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.skeleton-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.skeleton-thumb {
  width: 100%;
  height: 140px;
  border-radius: 0;
}

.skeleton-body {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.skeleton-title {
  height: 20px;
  width: 80%;
}

.skeleton-text {
  height: 14px;
  width: 50%;
}

.skeleton-price {
  height: 28px;
  width: 40%;
  margin-top: var(--space-sm);
}

.skeleton-btn {
  height: 40px;
  width: 100%;
  margin-top: var(--space-sm);
}

/* ============================================================
   ERROR & EMPTY STATES
   ============================================================ */
.error-state,
.empty-state {
  text-align: center;
  padding: var(--space-3xl) var(--space-lg);
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-md);
}

.error-state h2,
.empty-state h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.error-state p,
.empty-state p {
  color: var(--text-secondary);
  max-width: 400px;
  margin: 0 auto;
}

.error-retry-btn {
  margin-top: var(--space-lg);
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--color-green-dark), var(--color-green));
  color: white;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.error-retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(16, 185, 92, 0.4);
}

/* ============================================================
   LOAD MORE
   ============================================================ */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-2xl);
}

.load-more-btn {
  padding: 14px 36px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}

.load-more-btn:hover:not(:disabled) {
  border-color: var(--color-green);
  color: var(--color-green);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ============================================================
   FOOTER
   ============================================================ */
.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: var(--space-2xl) 0;
}

.footer-content {
  text-align: center;
}

.footer-brand {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: var(--space-md);
}

.footer-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: var(--space-sm);
}

.footer-text a {
  color: var(--color-green);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.footer-text a:hover {
  color: var(--color-green-light);
}

.footer-copy {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 768px) {
  .hero-title {
    font-size: 1.6rem;
  }

  .hero-stats {
    gap: var(--space-md);
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .nav-tagline {
    display: none;
  }

  .deals-grid,
  .loading-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-md);
  }

  .search-indicator {
    flex-direction: column;
    gap: var(--space-sm);
  }
}

@media (max-width: 480px) {
  .deals-grid,
  .loading-grid {
    grid-template-columns: 1fr;
  }
}

/* ============================================================
   WISHLIST HEADER & SIMULATION BUTTON
   ============================================================ */
.wishlist-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
  padding: var(--space-md) var(--space-lg);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
}

.wishlist-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
}

.simulate-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(240, 180, 41, 0.1), rgba(16, 185, 92, 0.1));
  border: 1px solid var(--color-gold-dark);
  border-radius: var(--radius-md);
  color: var(--color-gold-light);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 0 10px rgba(240, 180, 41, 0.05);
}

.simulate-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(240, 180, 41, 0.25), rgba(16, 185, 92, 0.25));
  border-color: var(--color-gold);
  color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(240, 180, 41, 0.15);
}

.simulate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.simulate-btn .btn-icon {
  animation: pulse 1.5s infinite;
}

/* ============================================================
   TOAST NOTIFICATION (WebSocket)
   ============================================================ */
.toast-container {
  position: fixed;
  bottom: var(--space-xl);
  right: var(--space-xl);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  max-width: 380px;
  width: calc(100vw - 2 * var(--space-xl));
  pointer-events: none;
}

.toast-notification {
  pointer-events: auto;
  position: relative;
  padding: var(--space-md);
  background: rgba(26, 35, 50, 0.9);
  border: 1px solid var(--color-green-dark);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(16px) saturate(180%);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  transform: translateY(30px) scale(0.9);
  opacity: 0;
  transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.toast-notification.show {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.toast-notification::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--color-green-light), var(--color-green-dark));
}

.toast-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  color: var(--text-muted);
  font-size: 1rem;
  padding: 4px;
  cursor: pointer;
  transition: color var(--transition-fast);
  line-height: 1;
}

.toast-close:hover {
  color: #ef4444;
}

.toast-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 4px;
}

.toast-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-green-light);
  box-shadow: 0 0 0 0 rgba(52, 210, 120, 0.7);
  animation: pulse-glow 1.5s infinite;
}

@keyframes pulse-glow {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(52, 210, 120, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(52, 210, 120, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(52, 210, 120, 0);
  }
}

.toast-title {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: var(--color-green-light);
}

.toast-body {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.toast-thumb {
  width: 90px;
  height: 52px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.toast-details {
  flex-grow: 1;
  min-width: 0;
}

.toast-game-title {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.toast-meta {
  margin-bottom: 4px;
}

.toast-store {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.toast-price-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.toast-old-price {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-decoration: line-through;
}

.toast-new-price {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-green-light);
}

.toast-savings-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #061a0e;
  background: var(--color-green-light);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}

.toast-actions {
  display: flex;
  margin-top: 4px;
}

.toast-btn {
  width: 100%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toast-btn-primary {
  background: linear-gradient(135deg, var(--color-green-dark) 0%, #086130 100%);
  border: 1px solid var(--color-green);
  color: var(--text-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toast-btn-primary:hover {
  background: linear-gradient(135deg, var(--color-green) 0%, var(--color-green-dark) 100%);
  box-shadow: var(--shadow-glow);
}

@media (max-width: 480px) {
  .toast-container {
    bottom: var(--space-md);
    right: var(--space-md);
    left: var(--space-md);
    width: auto;
    max-width: none;
  }
}
</style>
