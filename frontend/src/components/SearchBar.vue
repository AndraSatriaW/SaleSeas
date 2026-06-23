<template>
  <!-- Search Bar Component -->
  <div class="search-bar">
    <div class="search-input-wrapper">
      <!-- Search Icon -->
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.3-4.3"></path>
      </svg>

      <input
        id="search-input"
        type="text"
        v-model="searchQuery"
        @input="onInput"
        @keyup.enter="onSearch"
        placeholder="Search for game deals..."
        class="search-input"
        autocomplete="off"
      />

      <!-- Clear button -->
      <button
        v-if="searchQuery"
        class="clear-btn"
        @click="clearSearch"
        title="Clear search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
    </div>

    <button id="search-button" class="search-btn" @click="onSearch">
      ⛵ Search
    </button>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

// Emit events to parent component
const emit = defineEmits(['search', 'clear'])

const searchQuery = ref('')

// Triggered when user clicks search or presses Enter
function onSearch() {
  emit('search', searchQuery.value.trim())
}

// Triggered on every keystroke (for live search if needed)
function onInput() {
  // If input is cleared completely, reset to show all deals
  if (searchQuery.value.trim() === '') {
    emit('clear')
  }
}

// Clear the search input and reset results
function clearSearch() {
  searchQuery.value = ''
  emit('clear')
}
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: var(--space-md);
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  pointer-events: none;
  transition: color var(--transition-fast);
}

.search-input-wrapper:focus-within .search-icon {
  color: var(--color-green);
}

.search-input {
  width: 100%;
  padding: 14px 44px 14px 48px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all var(--transition-normal);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--color-green);
  box-shadow: 0 0 0 3px var(--color-green-glow), var(--shadow-md);
  background: var(--bg-surface);
}

.clear-btn {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.search-btn {
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--color-green-dark), var(--color-green));
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: var(--radius-lg);
  white-space: nowrap;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 8px rgba(16, 185, 92, 0.3);
}

.search-btn:hover {
  background: linear-gradient(135deg, var(--color-green), var(--color-green-light));
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(16, 185, 92, 0.4);
}

.search-btn:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .search-bar {
    flex-direction: column;
  }

  .search-btn {
    width: 100%;
  }
}
</style>
