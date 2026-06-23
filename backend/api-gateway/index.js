/**
 * API Gateway - Central entry point for Sale Seas backend
 * 
 * This gateway routes requests from the frontend to the appropriate
 * microservice (Deals Service or Search Service).
 * The frontend only communicates with this gateway.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const WebSocket = require('ws');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
let wss = null;

// Microservice URLs from environment variables
const DEALS_SERVICE = process.env.DEALS_SERVICE_URL || 'http://localhost:3001';
const SEARCH_SERVICE = process.env.SEARCH_SERVICE_URL || 'http://localhost:3002';
const WISHLIST_SERVICE = process.env.WISHLIST_SERVICE_URL || 'http://localhost:3003';

// Enable CORS so the Vue.js frontend can communicate with the gateway
app.use(cors());
app.use(express.json());

// ============================================================
// DEALS ROUTES - Proxied to Deals Service (port 3001)
// ============================================================

/**
 * GET /api/deals
 * Proxy to Deals Service to fetch game deals
 */
app.get('/api/deals', async (req, res) => {
  try {
    // Forward query params to the deals service
    const response = await axios.get(`${DEALS_SERVICE}/deals`, {
      params: req.query,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Gateway error (deals):', error.message);
    res.status(502).json({
      success: false,
      message: 'Deals service is unavailable',
      error: error.message,
    });
  }
});

/**
 * GET /api/stores
 * Proxy to Deals Service to fetch store list
 */
app.get('/api/stores', async (req, res) => {
  try {
    const response = await axios.get(`${DEALS_SERVICE}/stores`);
    res.json(response.data);
  } catch (error) {
    console.error('Gateway error (stores):', error.message);
    res.status(502).json({
      success: false,
      message: 'Deals service is unavailable',
      error: error.message,
    });
  }
});

// ============================================================
// SEARCH ROUTES - Proxied to Search Service (port 3002)
// ============================================================

/**
 * GET /api/search
 * Proxy to Search Service to search games by title
 */
app.get('/api/search', async (req, res) => {
  try {
    const response = await axios.get(`${SEARCH_SERVICE}/search`, {
      params: req.query,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Gateway error (search):', error.message);
    res.status(502).json({
      success: false,
      message: 'Search service is unavailable',
      error: error.message,
    });
  }
});

/**
 * GET /api/search/deals
 * Proxy to Search Service to search deals with filters
 */
app.get('/api/search/deals', async (req, res) => {
  try {
    const response = await axios.get(`${SEARCH_SERVICE}/search/deals`, {
      params: req.query,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Gateway error (search deals):', error.message);
    res.status(502).json({
      success: false,
      message: 'Search service is unavailable',
      error: error.message,
    });
  }
});

// ============================================================
// WISHLIST ROUTES - Proxied to Wishlist Service (port 3003)
// ============================================================

/**
 * GET /api/wishlist
 * Proxy to Wishlist Service to fetch wishlist items with live price data
 */
app.get('/api/wishlist', async (req, res) => {
  try {
    const response = await axios.get(`${WISHLIST_SERVICE}/wishlist`);
    res.json(response.data);
  } catch (error) {
    console.error('Gateway error (fetch wishlist):', error.message);
    res.status(502).json({
      success: false,
      message: 'Wishlist service is unavailable',
      error: error.message,
    });
  }
});

/**
 * POST /api/wishlist
 * Proxy to Wishlist Service to add a game to wishlist
 */
app.post('/api/wishlist', async (req, res) => {
  try {
    const response = await axios.post(`${WISHLIST_SERVICE}/wishlist`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Gateway error (add wishlist):', error.message);
    res.status(502).json({
      success: false,
      message: 'Wishlist service is unavailable',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/wishlist/:gameID
 * Proxy to Wishlist Service to remove a game from wishlist
 */
app.delete('/api/wishlist/:gameID', async (req, res) => {
  try {
    const response = await axios.delete(`${WISHLIST_SERVICE}/wishlist/${req.params.gameID}`);
    res.json(response.data);
  } catch (error) {
    console.error('Gateway error (delete wishlist):', error.message);
    res.status(502).json({
      success: false,
      message: 'Wishlist service is unavailable',
      error: error.message,
    });
  }
});

/**
 * GET /api/wishlist/check/:gameID
 * Proxy to Wishlist Service to check if a game is wishlisted
 */
app.get('/api/wishlist/check/:gameID', async (req, res) => {
  try {
    const response = await axios.get(`${WISHLIST_SERVICE}/wishlist/check/${req.params.gameID}`);
    res.json(response.data);
  } catch (error) {
    console.error('Gateway error (check wishlist):', error.message);
    res.status(502).json({
      success: false,
      message: 'Wishlist service is unavailable',
      error: error.message,
    });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * GET /api/health
 * Check the health of all services
 */
app.get('/api/health', async (req, res) => {
  const health = {
    gateway: 'ok',
    deals: 'unknown',
    search: 'unknown',
    wishlist: 'unknown',
  };

  try {
    await axios.get(`${DEALS_SERVICE}/health`, { timeout: 3000 });
    health.deals = 'ok';
  } catch {
    health.deals = 'down';
  }

  try {
    await axios.get(`${SEARCH_SERVICE}/health`, { timeout: 3000 });
    health.search = 'ok';
  } catch {
    health.search = 'down';
  }

  try {
    await axios.get(`${WISHLIST_SERVICE}/health`, { timeout: 3000 });
    health.wishlist = 'ok';
  } catch {
    health.wishlist = 'down';
  }

  res.json(health);
});

// ============================================================
// SIMULATION & INTERNAL NOTIFICATIONS (WebSocket)
// ============================================================

/**
 * POST /api/wishlist/mock-price-drop
 * Proxy route to Wishlist Service to trigger mock price drop
 */
app.post('/api/wishlist/mock-price-drop', async (req, res) => {
  try {
    const response = await axios.post(`${WISHLIST_SERVICE}/wishlist/mock-price-drop`);
    res.json(response.data);
  } catch (error) {
    console.error('Gateway error (mock price drop):', error.message);
    res.status(502).json({
      success: false,
      message: 'Wishlist service is unavailable',
      error: error.message,
    });
  }
});

/**
 * POST /api/internal/notify-price-drop
 * Endpoint for backend microservices to send notifications to connect WS clients
 */
app.post('/api/internal/notify-price-drop', (req, res) => {
  const notification = req.body;
  if (!notification || !notification.gameID) {
    return res.status(400).json({ success: false, message: 'Invalid notification payload' });
  }

  // Broadcast to all connected clients
  let clientCount = 0;
  if (wss) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'PRICE_DROP',
          data: notification
        }));
        clientCount++;
      }
    });
  }

  console.log(`Broadcasted price drop alert for "${notification.title}" to ${clientCount} client(s).`);
  res.json({ success: true, broadcastedTo: clientCount });
});

// Start the gateway
const server = app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Deals Service:  ${DEALS_SERVICE}`);
  console.log(`Search Service: ${SEARCH_SERVICE}`);
  console.log(`Wishlist Service: ${WISHLIST_SERVICE}`);
});

// Initialize WebSocket server
wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected to API Gateway.');

  ws.on('close', () => {
    console.log('WebSocket client disconnected.');
  });
});
