<template>
  <!-- Wishlist Card — Landscape Layout -->
  <div class="wishlist-card" :class="{ 'high-discount': game.bestDiscount >= 75 }">

    <!-- Left: Thumbnail + Badges -->
    <div class="card-left">
      <!-- Game Thumbnail -->
      <div class="card-thumb">
        <img
          :src="game.thumb"
          :alt="game.title"
          loading="lazy"
          @error="onImageError"
        />
        <!-- Overlay gradient -->
        <div class="thumb-overlay"></div>
      </div>

      <!-- Best Discount Badge (over thumbnail) -->
      <div class="discount-badge" :class="discountBadgeClass">
        <span v-if="game.bestDiscount > 0">-{{ game.bestDiscount }}%</span>
        <span v-else>0%</span>
      </div>

      <!-- Star remove button -->
      <button
        @click.prevent="$emit('remove', game.gameID)"
        class="wishlist-star-btn"
        title="Remove from wishlist"
      >
        ★
      </button>
    </div>

    <!-- Right: Content -->
    <div class="card-body">
      <!-- Game Title -->
      <h3 class="card-title" :title="game.title">{{ game.title }}</h3>

      <div class="deals-divider"></div>

      <!-- Marketplace Deals List -->
      <div class="deals-list">
        <h4 class="deals-list-title">Marketplace Deals</h4>

        <div v-if="game.deals && game.deals.length > 0" class="deals-container">
          <div
            v-for="deal in sortedDeals"
            :key="deal.storeID"
            class="deal-row"
            :class="{ 'deal-row-discount': parseFloat(deal.savings) > 0 }"
          >
            <!-- Store name -->
            <div class="deal-store">
              <span class="store-icon">🏪</span>
              <span class="store-name">{{ storeMap[deal.storeID] || 'Store #' + deal.storeID }}</span>
            </div>

            <!-- Prices -->
            <div class="deal-prices">
              <span v-if="parseFloat(deal.savings) > 0" class="price-original">${{ deal.retailPrice }}</span>
              <span class="price-sale">${{ deal.price }}</span>
              <span class="price-idr">≈ {{ formatToIDR(deal.price) }}</span>
            </div>

            <!-- Discount % badge -->
            <div class="deal-discount" :class="getSavingsClass(deal.savings)">
              {{ parseFloat(deal.savings) > 0 ? '-' + Math.round(parseFloat(deal.savings)) + '%' : '0%' }}
            </div>

            <!-- Direct link to marketplace (NOT CheapShark redirect) -->
            <a
              :href="getStoreUrl(deal.storeID)"
              target="_blank"
              rel="noopener"
              class="deal-link"
              :title="'Go to ' + (storeMap[deal.storeID] || 'Store')"
            >
              ⛵
            </a>
          </div>
        </div>

        <div v-else class="no-deals-info">
          No current deals available for this game.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { convertToIDR, getStoreSearchUrl } from '../api.js'

const props = defineProps({
  /** Wishlist item containing game details and deals */
  game: {
    type: Object,
    required: true,
  },
  /** Map of store IDs to store names */
  storeMap: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['remove'])

// Sort deals: active discounts first, then by price
const sortedDeals = computed(() => {
  if (!props.game.deals) return []
  return [...props.game.deals].sort((a, b) => {
    const sa = parseFloat(a.savings) || 0
    const sb = parseFloat(b.savings) || 0
    if (sb !== sa) return sb - sa          // highest discount first
    return parseFloat(a.price) - parseFloat(b.price)  // then cheapest first
  })
})

// Dynamic badge class based on best discount
const discountBadgeClass = computed(() => {
  const savings = props.game.bestDiscount || 0
  if (savings >= 90) return 'badge-legendary'
  if (savings >= 75) return 'badge-epic'
  if (savings >= 50) return 'badge-great'
  if (savings > 0)   return 'badge-normal'
  return 'badge-none'
})

function getSavingsClass(savings) {
  const s = parseFloat(savings) || 0
  if (s >= 75) return 'savings-epic'
  if (s >= 50) return 'savings-great'
  if (s > 0)   return 'savings-normal'
  return 'savings-none'
}

function formatToIDR(price) {
  return convertToIDR(price)
}

/**
 * Return a direct marketplace URL (not CheapShark redirect).
 * Uses the same getStoreSearchUrl helper used on the Deals page.
 */
function getStoreUrl(storeID) {
  return getStoreSearchUrl(storeID, props.game.title).url
}

// Fallback for broken thumbnails
function onImageError(e) {
  e.target.src = 'https://placehold.co/180x120/1a2332/64748b?text=No+Image'
}
</script>

<style scoped>
/* ============================================================
   LANDSCAPE CARD LAYOUT
   ============================================================ */
.wishlist-card {
  display: flex;
  flex-direction: row;          /* ← horizontal (landscape) */
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
  animation: fadeInUp 0.5s ease backwards;
  min-height: 140px;
}

.wishlist-card:hover {
  transform: translateY(-3px);
  border-color: var(--border-glow);
  box-shadow: var(--shadow-glow), var(--shadow-lg);
}

.wishlist-card.high-discount {
  border-color: rgba(240, 180, 41, 0.25);
}

.wishlist-card.high-discount:hover {
  border-color: rgba(240, 180, 41, 0.5);
  box-shadow: 0 0 20px rgba(240, 180, 41, 0.12), var(--shadow-lg);
}

/* ============================================================
   LEFT PANEL — Thumbnail
   ============================================================ */
.card-left {
  position: relative;
  flex-shrink: 0;
  width: 220px;
}

.card-thumb {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg-surface);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;   /* full image, no crop — same style as main page */
  transition: transform var(--transition-slow);
  background: var(--bg-surface);
}

.wishlist-card:hover .card-thumb img {
  transform: scale(1.04);
}

/* Right-edge fade so content blends seamlessly */
.thumb-overlay {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 100%;
  background: linear-gradient(to right, transparent, var(--bg-card));
  pointer-events: none;
}

/* ============================================================
   Discount Badge (top-right of thumbnail)
   ============================================================ */
.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 8px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.8rem;
  border-radius: var(--radius-sm);
  z-index: 2;
  letter-spacing: -0.5px;
}

.badge-none     { background: rgba(255,255,255,0.12); color: var(--text-muted); }
.badge-normal   { background: var(--color-green-dark); color: white; }
.badge-great    { background: var(--color-green); color: white; }
.badge-epic     { background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: #1a1a1a; }
.badge-legendary{
  background: linear-gradient(135deg, #ff6b35, #ffd700);
  color: #1a1a1a;
  animation: pulse 2s ease infinite;
}

/* ============================================================
   Star Remove Button (top-left of thumbnail)
   ============================================================ */
.wishlist-star-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-full);
  background: rgba(10, 22, 40, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.5);
  color: #ffd700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all var(--transition-fast);
}

.wishlist-star-btn:hover {
  background: #ffd700;
  color: #1a1a1a;
  transform: scale(1.12);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

/* ============================================================
   RIGHT PANEL — Content
   ============================================================ */
.card-body {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;   /* prevent overflow */
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.deals-divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,0.08), transparent);
  margin: 2px 0;
}

/* ============================================================
   Deals List
   ============================================================ */
.deals-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.deals-list-title {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.deals-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  max-height: 200px;
  padding-right: 4px;
}

/* Custom Scrollbar */
.deals-container::-webkit-scrollbar       { width: 3px; }
.deals-container::-webkit-scrollbar-track { background: transparent; }
.deals-container::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: var(--radius-full);
}
.deals-container::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* ============================================================
   Deal Row
   ============================================================ */
.deal-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  transition: all var(--transition-fast);
}

.deal-row:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.08);
}

.deal-row-discount {
  border-left: 2px solid var(--color-green);
}

/* Store column — grows to fill space */
.deal-store {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.store-icon { font-size: 0.85rem; flex-shrink: 0; }

.store-name {
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Price column — fixed-width, right-aligned */
.deal-prices {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  min-width: 70px;
}

.price-original {
  font-size: 0.68rem;
  color: var(--text-muted);
  text-decoration: line-through;
  line-height: 1;
}

.price-sale {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.2;
}

.price-idr {
  font-size: 0.62rem;
  color: var(--text-muted);
  line-height: 1;
}

/* Discount badge — fixed width */
.deal-discount {
  flex-shrink: 0;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.75rem;
  min-width: 42px;
  text-align: center;
}

.savings-none   { background: rgba(255,255,255,0.06); color: var(--text-muted); }
.savings-normal { background: rgba(16,185,92,0.12);   color: var(--color-green-light); }
.savings-great  { background: var(--color-green);      color: white; }
.savings-epic   { background: var(--color-gold);       color: #1a1a1a; }

/* CTA link — store icon button */
.deal-link {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(16,185,92,0.1);
  border: 1px solid rgba(16,185,92,0.2);
  border-radius: 6px;
  color: var(--color-green-light);
  text-decoration: none;
  font-size: 0.8rem;
  transition: all var(--transition-fast);
}

.deal-link:hover {
  background: var(--color-green);
  border-color: transparent;
  color: white;
  transform: scale(1.08);
}

/* No-deals fallback */
.no-deals-info {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
  padding: var(--space-sm) 0;
}

/* ============================================================
   RESPONSIVE — stack vertically on small screens
   ============================================================ */
@media (max-width: 480px) {
  .wishlist-card {
    flex-direction: column;
  }
  .card-left {
    width: 100%;
    height: 130px;
  }
  .thumb-overlay {
    width: 100%;
    height: 40px;
    top: auto;
    bottom: 0;
    background: linear-gradient(to bottom, transparent, var(--bg-card));
  }
}
</style>
