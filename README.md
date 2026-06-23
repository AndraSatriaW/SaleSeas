# SaleSeas 🌊🎮

SaleSeas is a web application for discovering and tracking game deals. It allows users to browse the latest discounts across multiple game stores, search for specific titles, and manage a personal wishlist with real-time price drop notifications.

---

## Features

- **Browse Deals** – Browse current game deals across multiple online stores
- **Search** – Search for games by title with filter support
- **Wishlist** – Save games to a personal wishlist stored in a database
- **Price Drop Alerts** – Receive real-time notifications via WebSocket when a wishlisted game's price drops

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue.js, Vite |
| API Gateway | Node.js, Express, WebSocket |
| Deals Service | Node.js, Express |
| Search Service | Node.js, Express |
| Wishlist Service | Node.js, Express, MySQL2 |
| Database | MariaDB |
| DB Admin | phpMyAdmin |
| Containerization | Docker, Docker Compose |

---

## Architecture

SaleSeas uses a **microservices architecture**. The Vue.js frontend only communicates with the **API Gateway**, which proxies requests to the appropriate backend service.

```
Frontend (Vue.js)
      │
      ▼
API Gateway (:3000)
  ├── Deals Service (:3001)   → fetches game deals from CheapShark API
  ├── Search Service (:3002)  → searches games by title
  └── Wishlist Service (:3003) → manages wishlist via MariaDB
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed

### Run with Docker

```bash
docker compose up --build
```

This will start all services:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3000 |
| phpMyAdmin | http://localhost:8080 |

---

## Environment Variables

The Wishlist Service requires these environment variables (set in `docker-compose.yml` or a local `.env`):

```env
PORT=3003
DB_HOST=db
DB_USER=saleseas_user
DB_PASSWORD=saleseas_password
DB_NAME=saleseas_db
CHEAPSHARK_API_URL=https://www.cheapshark.com/api/1.0
API_GATEWAY_URL=http://api-gateway:3000
```
