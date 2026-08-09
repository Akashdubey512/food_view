# 🍔 FoodView

> A full-stack food discovery & ordering platform where restaurants upload short food reels (videos) and customers browse, like, save, and order — all in one seamless mobile-first experience.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary)](https://cloudinary.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)

---

## 🌟 Overview

**FoodView** blends the short-video experience of social media with food ordering. Food partners upload short video reels of their dishes; customers scroll, like, save, and add to cart — and checkout via Razorpay.

---

## ✨ Features

### For Customers
- 🎬 **Food Reels** — Scroll short videos of dishes from nearby restaurants
- ❤️ **Like & Save** — Bookmark favourite dishes for later
- 🛒 **Cart & Checkout** — Add dishes, pay securely with Razorpay
- 📦 **Order History** — Track all past orders
- 🏪 **Partner Storefronts** — Browse all dishes from a specific restaurant

### For Food Partners
- 📊 **Dashboard** — Overview of orders and menu stats
- 🍽️ **Menu Management** — Add, edit, and delete food items with video/image uploads
- 👤 **Profile Management** — Update business details and change password
- 📋 **Order Management** — View and update incoming order status

### Platform
- 🔐 JWT-based authentication with HTTP-only cookies
- 🛡️ Helmet, CORS, rate limiting, HPP, mongo-sanitize security middleware
- 🗜️ Response compression (gzip) + Morgan request logging
- ☁️ Cloudinary media storage with automatic old-asset cleanup
- 🩺 `/health` endpoint for monitoring (200 connected / 503 disconnected)
- 📈 MongoDB indexes for optimised query performance

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router 7, Axios |
| **Backend** | Node.js 22, Express 5 |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT, bcrypt, HTTP-only cookies |
| **Media Storage** | Cloudinary (video + image) |
| **Payments** | Razorpay |
| **Security** | Helmet, express-rate-limit, express-mongo-sanitize, hpp, cors |
| **Performance** | compression, morgan |
| **Dev Tools** | nodemon, dotenv |

---

## 📁 Project Structure

```
food_view/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Route handlers (auth, food, cart, order, payment, health)
│   │   ├── middlewares/       # Auth guard, rate limiter, multer upload
│   │   ├── models/            # Mongoose schemas (User, FoodPartner, Food, Cart, Order, ...)
│   │   ├── routes/            # Express routers
│   │   ├── utils/             # Cloudinary helper, JWT utils, async wrapper
│   │   ├── db/                # MongoDB connection
│   │   └── app.js             # Express app setup (middleware stack)
│   ├── index.js               # Entry point + graceful shutdown
│   ├── .env.example           # Backend env template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/        # Reusable UI (BottomNav, PartnerComponents, ReelCard, ...)
    │   ├── context/           # React context (AuthContext, CartContext)
    │   ├── pages/
    │   │   ├── auth/          # Login & registration pages
    │   │   ├── general/       # Home, Saved, Cart, Orders
    │   │   └── food_partner/  # Partner dashboard, menu, profile, add/edit food
    │   ├── styles/            # CSS files
    │   └── utils/api.js       # Central Axios instance (reads VITE_API_BASE_URL)
    ├── .env.example           # Frontend env template
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Razorpay account

### 1. Clone the repository

```bash
git clone https://github.com/Akashdubey512/food_view.git
cd food_view
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your actual values (see Environment Variables below)
npm install
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your actual values
npm install
npm run dev
```

The frontend dev server starts at `http://localhost:5173` and proxies API calls to the backend at `http://localhost:3000`.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `super-secret-key` |
| `JWT_EXPIRY` | Token lifetime | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `mycloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123xyz` |
| `RAZORPAY_KEY_ID` | Razorpay key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | `secret...` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` \| `production` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay publishable key | `rzp_test_...` |

---

## 📡 API Endpoints

### Auth — Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/user/register` | Register a new user |
| POST | `/api/v1/auth/user/login` | User login |
| POST | `/api/v1/auth/user/logout` | User logout |

### Auth — Food Partners
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/food-partner/register` | Register a partner |
| POST | `/api/v1/auth/food-partner/login` | Partner login |
| POST | `/api/v1/auth/food-partner/logout` | Partner logout |

### Food
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/food` | Get all food items (pagination: `?page=1&limit=10`) |
| POST | `/api/v1/food` | Upload a new food item (partner) |
| PATCH | `/api/v1/food/:id` | Edit food item (partner) |
| DELETE | `/api/v1/food/:id` | Delete food item (partner) |
| POST | `/api/v1/food/like` | Like / unlike a food item |
| POST | `/api/v1/food/save` | Save / unsave a food item |
| GET | `/api/v1/food/:id/like-status` | Get like status for current user |
| GET | `/api/v1/food/:id/save-status` | Get save status for current user |

### Food Partner
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/food-partner/:id` | Get partner profile + food items |
| PATCH | `/api/v1/food-partner/edit-profile` | Update partner profile |
| PATCH | `/api/v1/food-partner/change-password` | Change partner password |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/cart` | Get user's cart |
| POST | `/api/v1/cart/add` | Add item to cart |
| PATCH | `/api/v1/cart/update` | Update item quantity |
| DELETE | `/api/v1/cart/remove/:id` | Remove item from cart |
| DELETE | `/api/v1/cart/clear` | Clear entire cart |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/orders` | Get user's orders |
| POST | `/api/v1/orders` | Place an order |
| GET | `/api/v1/orders/partner` | Get partner's orders |
| PATCH | `/api/v1/orders/:id/status` | Update order status (partner) |

### Saved Items
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/saved` | Get saved food items |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | System health check |

---

## ☁️ Deployment

### Backend on Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node index.js`
6. Add all backend environment variables from the table above in the **Environment** tab
7. Set `NODE_ENV=production` and `CORS_ORIGIN=https://your-frontend.vercel.app`

### Frontend on Vercel

1. Import your repository on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_API_BASE_URL` → your Render backend URL (e.g. `https://foodview-api.onrender.com`)
   - `VITE_RAZORPAY_KEY_ID` → your Razorpay publishable key

### Post-Deployment Checklist

- [ ] MongoDB Atlas: whitelist `0.0.0.0/0` (or Render's IP range)
- [ ] Cloudinary: confirm upload preset and folder (`food_view`)
- [ ] Razorpay: switch to `rzp_live_*` keys in production
- [ ] Verify `/api/v1/health` returns HTTP 200 with `"status": "ok"`
- [ ] Test user registration, login, food upload, cart, and checkout end-to-end

---

## 📄 License

MIT © 2026 FoodView
