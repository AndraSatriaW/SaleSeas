<template>
  <!-- Deal Card Component - Displays a single game deal -->
  <div class="deal-card" :class="{ 'high-discount': savingsPercent >= 75 }">
    <!-- Discount Badge -->
    <div class="discount-badge" :class="discountBadgeClass">
      -{{ savingsPercent }}%
    </div>

    <!-- Wishlist Star Button -->
    <button 
      @click.prevent="emit('toggle-wishlist', deal)" 
      class="wishlist-star-btn" 
      :class="{ 'is-wishlisted': isWishlisted }"
      :title="isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
    >
      ★
    </button>

    <!-- Game Thumbnail -->
    <div class="card-thumb">
      <img
        :src="deal.thumb"
        :alt="deal.title"
        loading="lazy"
        @error="onImageError"
      />
    </div>

    <!-- Card Content -->
    <div class="card-body">
      <!-- Game Title -->
      <h3 class="card-title" :title="deal.title">{{ deal.title }}</h3>

      <!-- Store Name -->
      <p class="card-store">
        🏪 {{ storeName }}
      </p>

      <!-- Price Section -->
      <div class="card-prices">
        <div class="price-row">
          <span class="price-original">${{ deal.normalPrice }}</span>
          <span class="price-sale">${{ deal.salePrice }}</span>
        </div>
        <!-- IDR Conversion -->
        <p class="price-idr">≈ {{ idrPrice }}</p>
      </div>

      <!-- Savings Bar (visual indicator) -->
      <div class="savings-bar-wrapper">
        <div class="savings-bar">
          <div class="savings-bar-fill" :style="{ width: savingsPercent + '%' }"></div>
        </div>
        <span class="savings-text">{{ savingsPercent }}% saved</span>
      </div>

      <!-- CTA Buttons -->
      <div class="card-actions">
        <!-- Direct link to the actual store marketplace -->
        <div class="card-cta-wrapper">
          <a
            :href="storeSearchInfo.url"
            target="_blank"
            rel="noopener"
            class="card-cta-link"
            :title="'View this game on ' + storeSearchInfo.storeName"
          >
            Go to {{ storeSearchInfo.storeName }}
          </a>
          <button @click.prevent="copyLink(storeSearchInfo.url)" class="copy-btn" title="Copy link to clipboard">
            <span v-if="copied">✅</span>
            <span v-else>📋</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, ref, defineEmits } from 'vue'
import { convertToIDR, getStoreSearchUrl } from '../api.js'

const emit = defineEmits(['toggle-wishlist'])

const copied = ref(false)
function copyLink(url) {
  navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const props = defineProps({
  /** The deal object from CheapShark API */
  deal: {
    type: Object,
    required: true,
  },
  /** Map of store IDs to store names */
  storeMap: {
    type: Object,
    default: () => ({}),
  },
  /** Whether this game is wishlisted */
  isWishlisted: {
    type: Boolean,
    default: false,
  },
})

// Calculate the savings percentage (rounded)
const savingsPercent = computed(() => {
  return Math.round(parseFloat(props.deal.savings) || 0)
})

// Get the store name from the store map
const storeName = computed(() => {
  return props.storeMap[props.deal.storeID] || `Store #${props.deal.storeID}`
})

// Convert sale price to IDR
const idrPrice = computed(() => {
  return convertToIDR(props.deal.salePrice)
})

// Direct store search URL (fallback if CheapShark redirect is blocked)
// Dynamically resolves to the correct store (Steam, Epic, GOG, etc.)
const storeSearchInfo = computed(() => {
  return getStoreSearchUrl(props.deal.storeID, props.deal.title)
})

// Dynamic badge color based on discount level
const discountBadgeClass = computed(() => {
  if (savingsPercent.value >= 90) return 'badge-legendary'
  if (savingsPercent.value >= 75) return 'badge-epic'
  if (savingsPercent.value >= 50) return 'badge-great'
  return 'badge-normal'
})

// Fallback for broken images
function onImageError(e) {
  e.target.src = 'https://placehold.co/300x140/1a2332/64748b?text=No+Image'
}
</script>

<style scoped>
.deal-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
  animation: fadeInUp 0.5s ease backwards;
}

.deal-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-glow);
  box-shadow: var(--shadow-glow), var(--shadow-lg);
}

.deal-card.high-discount {
  border-color: rgba(240, 180, 41, 0.2);
}

.deal-card.high-discount:hover {
  border-color: rgba(240, 180, 41, 0.4);
  box-shadow: 0 0 20px rgba(240, 180, 41, 0.1), var(--shadow-lg);
}

/* Discount Badge */
.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.85rem;
  border-radius: var(--radius-sm);
  z-index: 2;
  letter-spacing: -0.5px;
}

.badge-normal {
  background: var(--color-green-dark);
  color: white;
}

.badge-great {
  background: var(--color-green);
  color: white;
}

.badge-epic {
  background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold));
  color: #1a1a1a;
}

.badge-legendary {
  background: linear-gradient(135deg, #ff6b35, #ffd700);
  color: #1a1a1a;
  animation: pulse 2s ease infinite;
}

/* Thumbnail */
.card-thumb {
  width: 100%;
  height: 140px;
  overflow: hidden;
  background: var(--bg-surface);
  position: relative;
}

.card-thumb::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, var(--bg-card));
  pointer-events: none;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.deal-card:hover .card-thumb img {
  transform: scale(1.05);
}

/* Card Body */
.card-body {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-store {
  font-size: 0.78rem;
  color: var(--text-muted);
}

/* Prices */
.card-prices {
  margin-top: auto;
}

.price-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.price-original {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-decoration: line-through;
}

.price-sale {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-green-light);
}

.price-idr {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Savings Bar */
.savings-bar-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
}

.savings-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.savings-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-green-dark), var(--color-green), var(--color-gold));
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.savings-text {
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
}

/* CTA Buttons */
.card-actions {
  display: flex;
  margin-top: var(--space-sm);
  width: 100%;
}

.card-cta-wrapper {
  display: flex;
  width: 100%;
  transition: all var(--transition-normal);
  border-radius: var(--radius-md);
}

.card-cta-wrapper:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 92, 0.3);
}

.card-cta-link {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(16, 185, 92, 0.12), rgba(16, 185, 92, 0.06));
  border: 1px solid rgba(16, 185, 92, 0.2);
  border-right: none;
  border-top-left-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-md);
  color: var(--color-green-light);
  font-weight: 600;
  font-size: 0.85rem;
  transition: all var(--transition-normal);
  text-decoration: none;
}

.card-cta-link:hover {
  background: linear-gradient(135deg, var(--color-green-dark), var(--color-green));
  color: white;
  border-color: transparent;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 92, 0.10);
  border: 1px solid rgba(16, 185, 92, 0.2);
  border-left: none; 
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
  padding: 0 12px;
  color: var(--color-green-light);
  transition: all var(--transition-fast);
  font-size: 0.9rem;
  cursor: pointer;
}

.copy-btn:hover {
  background: linear-gradient(135deg, var(--color-green-dark), var(--color-green));
  color: white;
  border-color: transparent;
}

/* Wishlist Star Button */
.wishlist-star-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: rgba(10, 22, 40, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all var(--transition-fast);
}

.wishlist-star-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: #ffd700;
  color: #ffd700;
  transform: scale(1.1);
}

.wishlist-star-btn.is-wishlisted {
  color: #ffd700;
  border-color: #ffd700;
  background: rgba(10, 22, 40, 0.8);
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}
</style>
