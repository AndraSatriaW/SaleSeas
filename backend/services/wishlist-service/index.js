/**
 * Wishlist Service - Microservice for managing game wishlists using MySQL
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;
const CHEAPSHARK_API = process.env.CHEAPSHARK_API_URL || 'https://www.cheapshark.com/api/1.0';
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';

app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'saleseas_user',
  password: process.env.DB_PASSWORD || 'saleseas_password',
  database: process.env.DB_NAME || 'saleseas_db',
};

let dbConnection = null;

/**
 * Establish database connection with retry logic
 */
async function connectDatabase() {
  const maxRetries = 15;
  const retryInterval = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Connecting to database ${dbConfig.database} on ${dbConfig.host} (Attempt ${attempt}/${maxRetries})...`);
      dbConnection = await mysql.createConnection(dbConfig);
      console.log('Database connected successfully.');
      
      // Create table if not exists
      await initializeDatabase();
      return;
    } catch (error) {
      console.error(`Database connection failed: ${error.message}`);
      if (attempt === maxRetries) {
        console.error('Max retries reached. Exiting service.');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
}

/**
 * Initialize database schema
 */
async function initializeDatabase() {
  const query = `
    CREATE TABLE IF NOT EXISTS wishlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id VARCHAR(50) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      thumb TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await dbConnection.query(query);
  console.log('Database schema verified/created.');
}

/**
 * GET /wishlist
 * Retrieve all wishlisted items, and fetch active store prices from CheapShark API in real-time.
 */
app.get('/wishlist', async (req, res) => {
  try {
    // 1. Fetch wishlist from database
    const [rows] = await dbConnection.query('SELECT game_id, title, thumb FROM wishlist ORDER BY created_at DESC');
    
    if (rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 2. Extract game IDs to query CheapShark API
    const gameIds = rows.map(row => row.game_id);
    
    // CheapShark allows batch lookup with /games?ids=id1,id2,id3
    const idsString = gameIds.join(',');
    
    let cheapSharkData = {};
    try {
      const response = await axios.get(`${CHEAPSHARK_API}/games`, {
        params: { ids: idsString },
        headers: { 'User-Agent': 'SaleSeas/1.0 (contact@saleseas.com)' }
      });
      cheapSharkData = response.data || {};
    } catch (apiError) {
      console.error('CheapShark API batch lookup failed, using local database cache:', apiError.message);
      // Fallback: if CheapShark fails, return database items with empty deals
      const fallbackData = rows.map(row => ({
        gameID: row.game_id,
        title: row.title,
        thumb: row.thumb,
        bestDiscount: 0,
        deals: [],
      }));
      return res.json({ success: true, data: fallbackData });
    }

    // 3. Merge database list with live prices and deals
    const mergedList = rows.map(row => {
      const gameID = row.game_id;
      const apiItem = cheapSharkData[gameID];

      if (!apiItem) {
        // If no data returned from CheapShark, fall back to DB values
        return {
          gameID,
          title: row.title,
          thumb: row.thumb,
          bestDiscount: 0,
          deals: [],
        };
      }

      // Map deals and compute discounts.
      // If deal.savings is 0 (or less), or discount is gone, we display it as 0%.
      const deals = (apiItem.deals || []).map(deal => {
        const rawSavings = parseFloat(deal.savings) || 0;
        const savingsPercent = rawSavings > 0 ? Math.round(rawSavings) : 0;
        
        return {
          storeID: deal.storeID,
          dealID: deal.dealID,
          price: deal.price,
          retailPrice: deal.retailPrice,
          savings: savingsPercent.toString(), // Keep as string or number for standard structure
        };
      });

      // Find the best discount percentage across all stores
      const bestDiscount = deals.reduce((max, deal) => {
        const disc = parseInt(deal.savings) || 0;
        return disc > max ? disc : max;
      }, 0);

      return {
        gameID,
        title: apiItem.info?.title || row.title,
        thumb: apiItem.info?.thumb || row.thumb,
        bestDiscount,
        deals,
      };
    });

    res.json({
      success: true,
      data: mergedList,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist',
      error: error.message,
    });
  }
});

/**
 * POST /wishlist
 * Add a game to the wishlist database
 */
app.post('/wishlist', async (req, res) => {
  try {
    const { gameID, title, thumb } = req.body;

    if (!gameID || !title) {
      return res.status(400).json({
        success: false,
        message: 'gameID and title are required fields',
      });
    }

    const query = `
      INSERT INTO wishlist (game_id, title, thumb) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE title = VALUES(title), thumb = VALUES(thumb)
    `;
    await dbConnection.query(query, [gameID.toString(), title, thumb || '']);

    res.json({
      success: true,
      message: 'Game successfully added to wishlist',
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add game to wishlist',
      error: error.message,
    });
  }
});

/**
 * DELETE /wishlist/:gameID
 * Remove a game from the wishlist database
 */
app.delete('/wishlist/:gameID', async (req, res) => {
  try {
    const { gameID } = req.params;

    if (!gameID) {
      return res.status(400).json({
        success: false,
        message: 'gameID is required',
      });
    }

    const query = 'DELETE FROM wishlist WHERE game_id = ?';
    const [result] = await dbConnection.query(query, [gameID]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Game not found in wishlist',
      });
    }

    res.json({
      success: true,
      message: 'Game successfully removed from wishlist',
    });
  } catch (error) {
    console.error('Error deleting from wishlist:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to remove game from wishlist',
      error: error.message,
    });
  }
});

/**
 * GET /wishlist/check/:gameID
 * Check if a game is wishlisted
 */
app.get('/wishlist/check/:gameID', async (req, res) => {
  try {
    const { gameID } = req.params;

    if (!gameID) {
      return res.status(400).json({
        success: false,
        message: 'gameID is required',
      });
    }

    const query = 'SELECT COUNT(*) AS count FROM wishlist WHERE game_id = ?';
    const [rows] = await dbConnection.query(query, [gameID]);
    const isWishlisted = rows[0].count > 0;

    res.json({
      success: true,
      isWishlisted,
    });
  } catch (error) {
    console.error('Error checking wishlist status:', error.message);
    res.status(500).json({
      success: false,
      isWishlisted: false,
      error: error.message,
    });
  }
});

/**
 * POST /wishlist/mock-price-drop
 * Simulate a price drop for a game in the wishlist (or use a fallback popular game if empty).
 * Send the notification payload to the API Gateway.
 */
app.post('/wishlist/mock-price-drop', async (req, res) => {
  try {
    let game = null;

    // 1. Fetch a random game from the database
    const [rows] = await dbConnection.query('SELECT game_id, title, thumb FROM wishlist ORDER BY RAND() LIMIT 1');
    
    if (rows.length > 0) {
      game = {
        gameID: rows[0].game_id,
        title: rows[0].title,
        thumb: rows[0].thumb
      };
    } else {
      // Fallback: Mock a popular game if wishlist is empty
      game = {
        gameID: '144062', // Cyberpunk 2077 gameID on CheapShark
        title: 'Cyberpunk 2077',
        thumb: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_sm_120.jpg'
      };
    }

    // 2. Generate random mock prices showing a drop
    // E.g., original price between $39.99 and $69.99
    const originalPriceNum = parseFloat((Math.random() * 30 + 39.99).toFixed(2));
    // New price is discounted by 40% to 85%
    const savingsPercent = Math.floor(Math.random() * 45) + 40; // 40 to 85%
    const newPriceNum = parseFloat((originalPriceNum * (1 - savingsPercent / 100)).toFixed(2));

    const notificationPayload = {
      gameID: game.gameID,
      title: game.title,
      thumb: game.thumb,
      oldPrice: originalPriceNum.toFixed(2),
      newPrice: newPriceNum.toFixed(2),
      savings: savingsPercent.toString(),
      storeName: ['Steam', 'Epic Games Store', 'GOG', 'Humble Store'][Math.floor(Math.random() * 4)]
    };

    // 3. Notify the API Gateway
    try {
      console.log(`Sending price drop notification for "${notificationPayload.title}" to API Gateway: ${API_GATEWAY_URL}`);
      await axios.post(`${API_GATEWAY_URL}/api/internal/notify-price-drop`, notificationPayload, {
        timeout: 3000
      });
    } catch (notifyError) {
      console.error('Failed to send notification to API Gateway:', notifyError.message);
      // We will still return success for mock trigger, but note the error
      return res.json({
        success: true,
        message: 'Mock price drop triggered, but gateway notification failed',
        data: notificationPayload,
        gatewayError: notifyError.message
      });
    }

    res.json({
      success: true,
      message: 'Mock price drop triggered and broadcasted successfully',
      data: notificationPayload
    });
  } catch (error) {
    console.error('Error in mock-price-drop endpoint:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger mock price drop',
      error: error.message
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  try {
    // Check if database is still accessible
    await dbConnection.query('SELECT 1');
    res.json({ status: 'ok', service: 'wishlist-service', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', service: 'wishlist-service', database: 'disconnected', error: err.message });
  }
});

// Start initialization and server
app.listen(PORT, async () => {
  console.log(`Wishlist Service running on port ${PORT}`);
  await connectDatabase();
});
