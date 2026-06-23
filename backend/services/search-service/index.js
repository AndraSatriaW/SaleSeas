/**
 * Search Service - Microservice for searching games
 * 
 * This service handles game search queries using the CheapShark API.
 * It provides search by title and filtering capabilities.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const CHEAPSHARK_API = process.env.CHEAPSHARK_API_URL || 'https://www.cheapshark.com/api/1.0';

// Enable CORS
app.use(cors());
app.use(express.json());

/**
 * GET /search
 * Search for games by title using CheapShark API
 * 
 * Query Parameters:
 *   - title (required): Game title to search for
 *   - limit: Maximum number of results (default 10, max 60)
 *   - exact: Whether to match exact title (0 or 1)
 */
app.get('/search', async (req, res) => {
  try {
    const { title, limit, exact } = req.query;

    // Validate that title is provided
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search title is required. Use ?title=game_name',
      });
    }

    const params = {
      title: title.trim(),
      limit: limit || 20,
      exact: exact || 0,
    };

    const response = await axios.get(`${CHEAPSHARK_API}/games`, { params });

    res.json({
      success: true,
      data: response.data,
      query: title.trim(),
    });
  } catch (error) {
    console.error('Error searching games:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search games',
      error: error.message,
    });
  }
});


app.get('/search/deals', async (req, res) => {
  try {
    const params = {
      title: req.query.title || undefined,
      upperPrice: req.query.upperPrice || undefined,
      lowerPrice: req.query.lowerPrice || undefined,
      sortBy: req.query.sortBy || 'Deal Rating',
      pageSize: req.query.pageSize || 20,
      onSale: 1,
    };

    // Remove undefined params
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) delete params[key];
    });

    let results = [];
    const response = await axios.get(`${CHEAPSHARK_API}/deals`, { params });
    results = response.data;

    // Apply minimum savings filter (CheapShark API doesn't have this param natively)
    const minSavings = parseFloat(req.query.minSavings);
    if (!isNaN(minSavings) && minSavings > 0) {
      results = results.filter(deal => parseFloat(deal.savings) >= minSavings);
    }

    res.json({
      success: true,
      data: results,
      filters: {
        title: req.query.title || null,
        upperPrice: req.query.upperPrice || null,
        lowerPrice: req.query.lowerPrice || null,
        minSavings: req.query.minSavings || null,
      },
    });
  } catch (error) {
    console.error('Error searching deals:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search deals',
      error: error.message,
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'search-service' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Search Service running on port ${PORT}`);
});
