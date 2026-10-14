<div align="center">

# 🔍 NexaFind — AI Product Discovery Platform

### Find your perfect product by simply describing what you need.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle-336791?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

**[Live Demo](https://nexafind.vercel.app)** · **[Report Bug](https://github.com/YOUR_USERNAME/nexafind/issues)** · **[Request Feature](https://github.com/YOUR_USERNAME/nexafind/issues)**

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started (Local)](#-getting-started-local)
- [Database Setup](#-database-setup)
- [Deploy to Vercel](#-deploy-to-vercel)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Ranking Algorithm](#-ranking-algorithm)
- [Database Schema](#-database-schema)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)

---

## 🧠 About the Project

**NexaFind** is a full-stack AI-powered product discovery platform that goes far beyond traditional keyword search. Instead of typing "laptop", you describe your exact needs in plain English — and the platform intelligently extracts your preferences, ranks products that match, and explains *why* each product was recommended.

> **Example:** *"I need a laptop for machine learning under $1500 with at least 16GB RAM and good battery life"*

The system will:
- Detect category → **Laptops**
- Extract budget → **$1500 (hard constraint)**
- Extract preferences → **16GB RAM (high priority), Battery (high priority)**
- Detect use case → **Machine Learning / Programming**
- Rank matching products with a score breakdown
- Flag trade-offs and clarify missing info

---

## ⚙️ How It Works

```
User types a natural language query
           │
           ▼
┌─────────────────────────┐
│   Preference Extractor   │  ← Converts text → structured preferences
│  (preferenceExtractor.ts)│    (budget, category, constraints, weights)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│     Product Retrieval    │  ← Checks PostgreSQL DB first
│    (productService.ts)   │    Falls back to Mock Provider if DB empty
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      Ranking Engine      │  ← Scores each product across 6 factors
│    (rankingEngine.ts)    │    Filters hard constraint violations
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      Search Response     │  ← Returns ranked list with:
│                          │    score, explanation, trade-offs, matches
└─────────────────────────┘
             │
             ▼
    Results displayed on UI
  with score breakdown cards
```

### The 6 Ranking Factors

| Factor | Weight | What it measures |
|--------|--------|-----------------|
| 🎯 Specification Match | 35% | How many of your preferred specs the product has |
| 💰 Price Match | 25% | How well the price fits within your budget |
| 🔍 Semantic Relevance | 15% | How well the product matches your intended use |
| ⭐ Rating | 10% | Star rating adjusted by number of reviews |
| ✅ Availability | 10% | Whether it's in stock and current |
| 🕐 Data Freshness | 5% | How recently the product data was updated |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.9 (strict mode) |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL via Drizzle ORM |
| **Validation** | Zod |
| **Icons** | React Icons |
| **Deployment** | Vercel |
| **DB Hosting** | Neon / Supabase / Railway |

---

## ✨ Features

- 🗣️ **Natural Language Search** — Describe what you need in plain English
- 🧩 **Preference Extraction** — Automatically detects budget, category, specs, and use case
- 📊 **Transparent Scoring** — See exactly why each product was ranked where it is
- ⚡ **Hard Constraint Filtering** — Products over budget or missing required specs are excluded
- 🔁 **Trade-off Analysis** — Know what you gain and lose with each product
- 🆚 **Product Comparison** — Select multiple products to compare side-by-side
- ❓ **Clarification Questions** — AI asks follow-up questions when query is ambiguous
- 🗄️ **Dual Mode** — Works with PostgreSQL (real data) or built-in mock data (no DB needed)
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile
- 🏷️ **Multi-Category** — Laptops, Smartphones, Headphones, Cameras, Appliances

---

## 📁 Project Structure

```
ai-product-discovery-platform/
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── api/                        # Backend API routes
│   │   │   ├── search/
│   │   │   │   └── route.ts            # POST /api/search
│   │   │   ├── compare/
│   │   │   │   └── route.ts            # POST /api/compare
│   │   │   ├── products/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts        # GET /api/products/:id
│   │   │   └── health/
│   │   │       └── route.ts            # GET /api/health
│   │   ├── search/
│   │   │   └── page.tsx                # Search results page
│   │   ├── layout.tsx                  # Root HTML layout + metadata
│   │   ├── page.tsx                    # Home page (search hero)
│   │   └── globals.css                 # Global Tailwind import
│   │
│   ├── components/                     # Reusable React components
│   │   ├── SearchBar.tsx               # Search input + category filter
│   │   ├── ProductCard.tsx             # Product display with score card
│   │   ├── PreferencePanel.tsx         # Sidebar: extracted preferences
│   │   └── ComparisonBar.tsx           # Floating comparison toolbar
│   │
│   ├── db/
│   │   ├── schema.ts                   # Drizzle DB schema (7 tables)
│   │   └── index.ts                    # DB connection (optional/graceful)
│   │
│   ├── lib/
│   │   ├── providers/
│   │   │   └── mockProvider.ts         # 11 sample products (dev/fallback)
│   │   └── services/
│   │       ├── preferenceExtractor.ts  # NLP → structured preferences
│   │       ├── rankingEngine.ts        # Multi-factor scoring & ranking
│   │       └── productService.ts       # Search orchestration layer
│   │
│   └── types/
│       └── index.ts                    # All TypeScript interfaces & types
│
├── .env.example                        # Environment variable template
├── .env.local                          # Your local secrets (git-ignored)
├── .gitignore                          # Files excluded from GitHub
├── vercel.json                         # Vercel deployment config
├── drizzle.config.json                 # Drizzle ORM config
├── next.config.ts                      # Next.js config (image domains etc.)
├── tsconfig.json                       # TypeScript config
├── postcss.config.mjs                  # PostCSS / Tailwind config
└── package.json                        # Scripts & dependencies
```

---

## 🚀 Getting Started (Local)

### Prerequisites

- **Node.js** 18 or higher → [nodejs.org](https://nodejs.org)
- **Git** → [git-scm.com](https://git-scm.com)
- A **PostgreSQL** database (optional — app works with mock data without one)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/nexafind.git
cd nexafind
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the template
cp .env.example .env.local

# Open .env.local and fill in your values
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> ✅ **No database needed to start!** The app uses built-in mock product data by default.

### 5. (Optional) Push DB Schema

If you have a PostgreSQL database connected:

```bash
npm run db:push
```

---

## 🗄️ Database Setup

The app works in **two modes**:

| Mode | When | Data |
|------|------|------|
| **Mock Mode** | No `DATABASE_URL` set | 11 sample products built-in |
| **Database Mode** | `DATABASE_URL` is set | Your real PostgreSQL data |

### Free PostgreSQL Hosting Options

#### Option 1 — Neon (Recommended for Vercel)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the **Connection String** from the dashboard
4. Add it to `.env.local` as `DATABASE_URL`
5. Run `npm run db:push` to create tables

#### Option 2 — Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project → Settings → Database → Connection String (URI)
3. Add to `.env.local` as `DATABASE_URL`
4. Run `npm run db:push`

#### Option 3 — Railway

1. Sign up at [railway.app](https://railway.app)
2. New Project → Provision PostgreSQL → Connect tab → Copy URL
3. Add to `.env.local` as `DATABASE_URL`
4. Run `npm run db:push`

---

## ☁️ Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: NexaFind AI Product Discovery Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nexafind.git
git push -u origin main
```

### Step 2 — Import on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"New Project"** → Import `nexafind`
3. Framework will auto-detect as **Next.js**
4. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon/Supabase/Railway connection string |
| `ENABLE_MOCK_PROVIDER` | `true` |

5. Click **Deploy** 🚀

> **Without a DB?** Just set `ENABLE_MOCK_PROVIDER=true` and deploy — the app works perfectly with mock data.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ❌ Optional | PostgreSQL connection string. App uses mock data if not set. |
| `ENABLE_MOCK_PROVIDER` | ❌ Optional | Set `true` to always include mock data (default: `true`) |
| `ENABLE_REAL_DATA_FALLBACK` | ❌ Optional | Fall back to mock if DB returns no results |
| `NODE_ENV` | Auto | `development` or `production` |
| `CACHE_EXPIRY_HOURS` | ❌ Optional | How long to cache product data (default: 24) |

> ⚠️ **Never commit `.env.local` to GitHub.** It is already listed in `.gitignore`.

---

## 📡 API Reference

### `POST /api/search`

Search for products using a natural language query.

**Request Body:**
```json
{
  "query": "Laptop for programming under $1500 with good battery",
  "category": "laptops",
  "limit": 20,
  "offset": 0,
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "Laptop for programming under $1500...",
    "preference": {
      "category": "laptops",
      "budget": 1500,
      "constraints": [...],
      "preferences": [...],
      "importance": { "price": 0.4, "rating": 0.15 }
    },
    "results": [
      {
        "product": { "name": "MacBook Air M2", "price": 1199, ... },
        "rank": 1,
        "score": 87,
        "scoreBreakdown": { "priceMatch": 0.23, "rating": 0.09, ... },
        "explanation": "Strong match on specification match • 79% of budget",
        "relevanceMatches": ["ram: 8", "storage: 256"],
        "tradeoffs": []
      }
    ],
    "totalCount": 4,
    "clarificationQuestions": ["Do you have a preferred brand?"]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### `POST /api/compare`

Compare two or more products side-by-side.

**Request Body:**
```json
{
  "productIds": ["mock_laptop_001", "mock_laptop_002"],
  "userQuery": "Laptop for programming",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "comparison": {
      "mock_laptop_001": { "name": "Dell XPS 13", "price": 999, "cpu": "i5", "ram": 8 },
      "mock_laptop_002": { "name": "MacBook Air M2", "price": 1199, "cpu": "M2", "ram": 8 }
    },
    "tradeoffAnalysis": "Price range: $999 to $1199 (difference: $200)\nRating range: 4.5 to 4.8 stars"
  }
}
```

---

### `GET /api/products/:id`

Get a single product by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "mock_laptop_001",
    "name": "Dell XPS 13 (9320)",
    "brand": "Dell",
    "price": 999,
    "rating": 4.5,
    "reviewCount": 2847,
    "specifications": { "cpu": "Intel Core i5", "ram": 8, "storage": 512 },
    "inStock": true
  }
}
```

---

### `GET /api/health`

Check service and database status.

**Response:**
```json
{
  "ok": true,
  "database": "connected",
  "mode": "database",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 📊 Ranking Algorithm

Products that violate **hard constraints** (budget, minimum specs) are **excluded** before ranking.

Remaining products are scored on 6 factors:

```
Final Score (0–100) = Σ (factor_score × factor_weight) × 100
```

**Price Match scoring:**
```
price ≤ budget        →  score = 0.5 + (price/budget × 0.5)
price 1.0x–1.2x budget → score = 0.8
price 1.2x–1.5x budget → score = 0.5
price > 1.5x budget   →  score = 0.2
```

**Rating scoring (confidence-adjusted):**
```
normalized = rating / 5
confidence = min(1, reviewCount / 100)
score = normalized × (0.5 + confidence × 0.5)
```

---

## 🗃️ Database Schema

The project uses **7 PostgreSQL tables**:

| Table | Purpose |
|-------|---------|
| `products` | Product catalog with specs, pricing, ratings, and embeddings |
| `user_preferences` | Extracted preferences from natural language queries |
| `constraints` | Individual hard/soft/flexible constraint records |
| `search_history` | User search queries and selected results |
| `recommendations` | Ranked results stored for analytics and feedback |
| `comparisons` | Product comparison matrices and tradeoff analysis |
| `conversations` | Multi-turn conversation history for preference refinement |

---

## 🧩 Troubleshooting

| Problem | Solution |
|---------|---------|
| **No products found** | The mock provider uses keyword matching — try queries like "laptop", "phone", "headphones" |
| **Build fails** | Run `npm run typecheck` to see TypeScript errors |
| **DB connection error** | Check your `DATABASE_URL` format includes `?sslmode=require` |
| **Images not loading** | Images from `via.placeholder.com` are whitelisted in `next.config.ts` |
| **Vercel deploy fails** | Check the Function Logs in Vercel dashboard for the real error |
| **Health check returns DB error** | Verify your `DATABASE_URL` in Vercel environment variables |

---

## 🗺️ Roadmap

- [x] Natural language preference extraction
- [x] Multi-factor ranking engine
- [x] Mock product provider (11 sample products)
- [x] Product comparison UI
- [x] Vercel deployment support
- [x] PostgreSQL + Neon support
- [ ] OpenAI / Claude LLM integration for better NLP
- [ ] Real product APIs (Amazon, eBay, Best Buy)
- [ ] User accounts and saved searches
- [ ] Price alerts and tracking
- [ ] Vector embeddings for semantic search (FAISS)
- [ ] Mobile app (React Native)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ using **Next.js**, **TypeScript**, and **PostgreSQL**

⭐ **Star this repo** if you found it useful!

</div>
