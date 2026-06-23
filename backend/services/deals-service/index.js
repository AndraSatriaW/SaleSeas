/**
 * Deals Service - Microservice for fetching game deals
 * 
 * This service communicates with the CheapShark API to retrieve
 * current game deals and store information.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CHEAPSHARK_API = process.env.CHEAPSHARK_API_URL || 'https://www.cheapshark.com/api/1.0';

// Enable CORS so the API Gateway can communicate with this service
app.use(cors());
app.use(express.json());

/**
 * GET /deals
 * Fetch game deals from CheapShark API
 * 
 * Query Parameters (all optional, forwarded to CheapShark):
 *   - storeID: Filter by store (e.g., 1 = Steam)
 *   - upperPrice: Maximum sale price
 *   - lowerPrice: Minimum sale price
 *   - pageNumber: Page number for pagination (starts at 0)
 *   - pageSize: Number of deals per page (default 20, max 60)
 *   - sortBy: Sort method (Deal Rating, Title, Savings, Price, etc.)
 *   - onSale: Filter only items on sale (1 = yes)
 */
app.get('/deals', async (req, res) => {
  try {
    // Forward all query parameters to CheapShark API
    const params = {
      storeID: req.query.storeID || undefined,
      upperPrice: req.query.upperPrice || undefined,
      lowerPrice: req.query.lowerPrice || undefined,
      pageNumber: req.query.pageNumber || 0,
      pageSize: req.query.pageSize || 20,
      sortBy: req.query.sortBy || 'Deal Rating',
      onSale: req.query.onSale || 1,
    };

    // Remove undefined params so they aren't sent as "undefined" string
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) delete params[key];
    });

    const response = await axios.get(`${CHEAPSHARK_API}/deals`, { params });

    res.json({
      success: true,
      data: response.data,
      totalPages: response.headers['x-total-page-count'] || null,
    });
  } catch (error) {
    console.error('Error fetching deals:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deals from CheapShark API',
      error: error.message,
    });
  }
});

/**
 * GET /stores
 * Fetch list of available stores from CheapShark API
 * Used to display store names alongside deals
 */
app.get('/stores', async (req, res) => {
  try {
    const response = await axios.get(`${CHEAPSHARK_API}/stores`);

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Error fetching stores:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores',
      error: error.message,
    });
  }
});

/**
 * GET /health
 * Health check endpoint to verify the service is running
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'deals-service' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Deals Service running on port ${PORT}`);
});
