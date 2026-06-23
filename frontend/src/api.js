/**
 * API Service - Centralized API communication layer
 * 
 * All API calls go through the API Gateway (port 3000).
 * The gateway then routes to the appropriate microservice.
 */

import axios from 'axios';

// Base URL for the API Gateway
const API_BASE = 'http://localhost:3000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10 second timeout
});

/**
 * Fetch game deals with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.pageNumber - Page number (starts at 0)
 * @param {number} params.pageSize - Results per page
 * @param {string} params.sortBy - Sort method
 * @param {number} params.storeID - Filter by store
 * @param {number} params.upperPrice - Max price
 * @param {number} params.lowerPrice - Min price
 * @returns {Promise} API response with deals data
 */
export async function fetchDeals(params = {}) {
  const response = await api.get('/deals', { params });
  return response.data;
}

/**
 * Fetch list of available game stores
 * @returns {Promise} API response with stores data
 */
export async function fetchStores() {
  const response = await api.get('/stores');
  return response.data;
}

/**
 * Search games by title
 * @param {string} title - Game title to search for
 * @param {number} limit - Max results (default 20)
 * @returns {Promise} API response with search results
 */
export async function searchGames(title, limit = 20) {
  const response = await api.get('/search', {
    params: { title, limit },
  });
  return response.data;
}

/**
 * Search deals with filters (uses Search Service)
 * @param {Object} filters - Filter parameters
 * @param {string} filters.title - Game title
 * @param {number} filters.upperPrice - Max price
 * @param {number} filters.lowerPrice - Min price
 * @param {number} filters.minSavings - Minimum discount %
 * @param {string} filters.sortBy - Sort method
 * @returns {Promise} API response with filtered deals
 */
export async function searchDeals(filters = {}) {
  const response = await api.get('/search/deals', { params: filters });
  return response.data;
}

/**
 * Check health of all services
 * @returns {Promise} Health status of all services
 */
export async function checkHealth() {
  const response = await api.get('/health');
  return response.data;
}

/**
 * Fetch all wishlisted items with live price information
 * @returns {Promise} API response with wishlist items
 */
export async function fetchWishlist() {
  const response = await api.get('/wishlist');
  return response.data;
}

/**
 * Add a game to the wishlist
 * @param {string|number} gameID - CheapShark game ID
 * @param {string} title - Title of the game
 * @param {string} thumb - Thumbnail URL
 * @returns {Promise} API response
 */
export async function addToWishlist(gameID, title, thumb) {
  const response = await api.post('/wishlist', { gameID, title, thumb });
  return response.data;
}

/**
 * Remove a game from the wishlist
 * @param {string|number} gameID - CheapShark game ID
 * @returns {Promise} API response
 */
export async function removeFromWishlist(gameID) {
  const response = await api.delete(`/wishlist/${gameID}`);
  return response.data;
}

/**
 * Trigger a simulated price drop on the backend
 * @returns {Promise} API response
 */
export async function triggerMockPriceDrop() {
  const response = await api.post('/wishlist/mock-price-drop');
  return response.data;
}

/**
 * Generate the CheapShark redirect URL for a deal
 * Per CheapShark user agreement, we must use their redirect links
 * @param {string} dealID - The deal ID from CheapShark
 * @returns {string} Redirect URL
 */
export function getDealRedirectUrl(dealID) {
  return `https://www.cheapshark.com/redirect?dealID=${dealID}`;
}

// USD to IDR conversion rate (approximate)
const USD_TO_IDR_RATE = 15850;

/**
 * Convert USD price to IDR
 * @param {number|string} usdPrice - Price in USD
 * @returns {string} Formatted price in IDR
 */
export function convertToIDR(usdPrice) {
  const price = parseFloat(usdPrice);
  if (isNaN(price)) return 'Rp 0';
  const idr = Math.round(price * USD_TO_IDR_RATE);
  return `Rp ${idr.toLocaleString('id-ID')}`;
}

/**
 * Store search URL mapping
 * Maps CheapShark storeID to the store's search page URL template.
 * Use {title} as placeholder for the encoded game title.
 */
const STORE_SEARCH_URLS = {
  '1':  { name: 'Steam',              url: 'https://store.steampowered.com/search/?term={title}' },
  '2':  { name: 'GamersGate',         url: 'https://www.gamersgate.com/games/?query={title}' },
  '3':  { name: 'GreenManGaming',     url: 'https://www.greenmangaming.com/search/{title}' },
  '7':  { name: 'GOG',                url: 'https://www.gog.com/games?query={title}' },
  '8':  { name: 'Origin',             url: 'https://www.ea.com/games/library?search={title}' },
  '11': { name: 'Humble Store',       url: 'https://www.humblebundle.com/store/search?search={title}' },
  '13': { name: 'Ubisoft Store',      url: 'https://store.ubisoft.com/search?q={title}' },
  '15': { name: 'Fanatical',          url: 'https://www.fanatical.com/en/search?search={title}' },
  '21': { name: 'WinGameStore',       url: 'https://www.wingamestore.com/search/?SearchWord={title}' },
  '23': { name: 'GameBillet',         url: 'https://www.gamebillet.com/AllProducts?term={title}' },
  '24': { name: 'Voidu',              url: 'https://www.voidu.com/en/search/{title}' },
  '25': { name: 'Epic Games Store',   url: 'https://store.epicgames.com/browse?q={title}' },
  '27': { name: 'Gamesplanet',        url: 'https://www.gamesplanet.com/search?query={title}' },
  '28': { name: 'Gamesload',          url: 'https://www.gamesload.com/search?q={title}' },
  '29': { name: '2Game',              url: 'https://2game.com/search?q={title}' },
  '30': { name: 'IndieGala',          url: 'https://www.indiegala.com/search?q={title}' },
  '31': { name: 'Blizzard Shop',      url: 'https://shop.battle.net/' },
  '33': { name: 'DLGamer',            url: 'https://www.dlgamer.com/us/search?keywords={title}' },
  '34': { name: 'Noctre',             url: 'https://www.noctre.com/search?q={title}' },
  '35': { name: 'DreamGame',          url: 'https://www.dreamgame.com/search?q={title}' },
};

/**
 * Get the direct store search URL for a game
 * @param {string} storeID - The CheapShark store ID
 * @param {string} gameTitle - The game title to search for
 * @returns {{ url: string, storeName: string }} Store search URL and name
 */
export function getStoreSearchUrl(storeID, gameTitle) {
  const encodedTitle = encodeURIComponent(gameTitle);
  const store = STORE_SEARCH_URLS[storeID];

  if (store) {
    return {
      url: store.url.replace('{title}', encodedTitle),
      storeName: store.name,
    };
  }

  // Fallback: search the game title on Google with the store
  return {
    url: `https://www.google.com/search?q=${encodedTitle}+game+deal`,
    storeName: 'Store',
  };
}

export default api;
