<template>
  <!-- Filter Bar Component -->
  <div class="filter-bar">
    <div class="filter-bar-inner">
      <!-- Price Range Filter -->
      <div class="filter-group">
        <label class="filter-label">💰 Price Range (USD)</label>
        <div class="filter-row">
          <input
            id="filter-min-price"
            type="number"
            v-model.number="filters.lowerPrice"
            placeholder="Min"
            min="0"
            class="filter-input"
          />
          <span class="filter-separator">—</span>
          <input
            id="filter-max-price"
            type="number"
            v-model.number="filters.upperPrice"
            placeholder="Max"
            min="0"
            class="filter-input"
          />
        </div>
      </div>

      <!-- Minimum Discount Filter -->
      <div class="filter-group">
        <label class="filter-label">🏷️ Min Discount</label>
        <select id="filter-discount" v-model.number="filters.minSavings" class="filter-select">
          <option :value="0">Any discount</option>
          <option :value="25">25%+ off</option>
          <option :value="50">50%+ off</option>
          <option :value="75">75%+ off</option>
          <option :value="90">90%+ off</option>
          <option :value="100">100% off (Free!)</option>
        </select>
      </div>

      <!-- Sort By Filter -->
      <div class="filter-group">
        <label class="filter-label">📊 Sort By</label>
        <select id="filter-sort" v-model="filters.sortBy" class="filter-select">
          <option value="Deal Rating">Best Deal</option>
          <option value="Savings">Highest Discount</option>
          <option value="Price">Lowest Price</option>
          <option value="Title">Title A-Z</option>
          <option value="recent">Most Recent</option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="filter-actions">
        <button id="apply-filters-btn" class="filter-apply-btn" @click="applyFilters">
          Apply Filters
        </button>
        <button id="reset-filters-btn" class="filter-reset-btn" @click="resetFilters">
          Reset
        </button>
      </div>
    </div>

    <!-- Toggle filter visibility on mobile -->
    <button class="filter-toggle" @click="showFilters = !showFilters">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
      </svg>
      {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, defineEmits } from 'vue'

const emit = defineEmits(['filter', 'reset'])

const showFilters = ref(true)

// Reactive filter state
const filters = reactive({
  lowerPrice: null,
  upperPrice: null,
  minSavings: 0,
  sortBy: 'Deal Rating',
})

// Send current filters to parent
function applyFilters() {
  // Build clean filter object (remove null/empty values)
  const cleanFilters = {}
  if (filters.lowerPrice !== null && filters.lowerPrice !== '') {
    cleanFilters.lowerPrice = filters.lowerPrice
  }
  if (filters.upperPrice !== null && filters.upperPrice !== '') {
    cleanFilters.upperPrice = filters.upperPrice
  }
  if (filters.minSavings > 0) {
    cleanFilters.minSavings = filters.minSavings
  }
  if (filters.sortBy) {
    cleanFilters.sortBy = filters.sortBy
  }

  emit('filter', cleanFilters)
}

// Reset all filters to defaults
function resetFilters() {
  filters.lowerPrice = null
  filters.upperPrice = null
  filters.minSavings = 0
  filters.sortBy = 'Deal Rating'
  emit('reset')
}
</script>

<style scoped>
.filter-bar {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.filter-bar-inner {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
  align-items: flex-end;
  padding: var(--space-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
  min-width: 160px;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.filter-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all var(--transition-fast);
}

.filter-input:focus {
  border-color: var(--color-green);
  box-shadow: 0 0 0 3px var(--color-green-glow);
}

.filter-input::placeholder {
  color: var(--text-muted);
}

.filter-separator {
  color: var(--text-muted);
  font-weight: 300;
}

.filter-select {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all var(--transition-fast);
  cursor: pointer;
  appearance: auto;
}

.filter-select:focus {
  border-color: var(--color-green);
  box-shadow: 0 0 0 3px var(--color-green-glow);
}

.filter-actions {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-end;
}

.filter-apply-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-green-dark), var(--color-green));
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.filter-apply-btn:hover {
  background: linear-gradient(135deg, var(--color-green), var(--color-green-light));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 92, 0.3);
}

.filter-reset-btn {
  padding: 10px 16px;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.85rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-reset-btn:hover {
  border-color: var(--text-muted);
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

.filter-toggle {
  display: none;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: 10px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  width: 100%;
  justify-content: center;
  transition: all var(--transition-fast);
}

.filter-toggle:hover {
  border-color: var(--color-green);
  color: var(--color-green);
}

@media (max-width: 768px) {
  .filter-toggle {
    display: flex;
  }

  .filter-bar-inner {
    display: v-bind("showFilters ? 'flex' : 'none'");
    flex-direction: column;
  }

  .filter-group {
    min-width: 100%;
  }

  .filter-actions {
    width: 100%;
  }

  .filter-apply-btn,
  .filter-reset-btn {
    flex: 1;
  }
}
</style>
