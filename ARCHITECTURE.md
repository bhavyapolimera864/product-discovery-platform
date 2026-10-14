# System Architecture

This document describes the architectural design of the Intelligent Product Discovery platform.

## Overview

The system is built as a full-stack Next.js application that understands natural language product search queries, models user preferences and constraints, retrieves semantically relevant products, and ranks them transparently with explainable scoring.

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│  (React Components - Search, Results, Comparison, Details)      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App Router                           │
│  ├─ Pages: /, /search                                          │
│  └─ API Routes: /api/search, /api/compare, /api/products       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
        ┌─────────┴──────────────────────┐
        │                                │
        ▼                                ▼
┌───────────────────────────┐   ┌──────────────────────────┐
│   Service Layer           │   │   Data Access Layer      │
│                           │   │                          │
│ ├─ ProductService         │   │ ├─ Drizzle ORM          │
│ ├─ PreferenceExtractor    │   │ ├─ PostgreSQL Driver    │
│ ├─ RankingEngine          │   │ └─ Connection Pool      │
│ └─ ExplanationGenerator   │   │                          │
└───────────────────────────┘   └──────────────────────────┘
        │                                │
        └────────────┬────────────────────┘
                     │
        ┌────────────┴────────────────────┐
        │                                 │
        ▼                                 ▼
┌─────────────────────────────────┐ ┌───────────────────┐
│   Product Data Layer            │ │  PostgreSQL       │
│                                 │ │  Database         │
│ ├─ MockProvider                 │ │                   │
│ ├─ Provider Interface           │ │ Tables:           │
│ └─ [Future: Real APIs]          │ │ ├─ products       │
│   - Amazon API                  │ │ ├─ preferences    │
│   - eBay API                    │ │ ├─ constraints    │
│   - Best Buy API                │ │ ├─ search_history │
│   - Google Shopping             │ │ ├─ recommendations│
│   - Custom CSV/JSON             │ │ └─ conversations  │
└─────────────────────────────────┘ └───────────────────┘
```

## Core Components

### 1. Frontend Layer (React Components)

**Home Page (`/`)**
- Hero section with value proposition
- Natural language search bar with category filters
- Example queries for quick exploration
- System status indicator

**Search Results Page (`/search`)**
- Preference panel showing extracted constraints
- Product results grid with ranking
- Score breakdowns for transparency
- Product selection for comparison
- Clarification questions if needed

**Components**
- `SearchBar.tsx` - Search input with category filter
- `ProductCard.tsx` - Individual product display with ranking
- `PreferencePanel.tsx` - Shows extracted user preferences
- `ComparisonBar.tsx` - Bottom sticky bar for comparison

**State Management**
- React hooks (useState, useEffect)
- URL query parameters for deep linking
- Server components where possible for performance

### 2. API Routes

**POST `/api/search`**
- Entry point for all product searches
- Request validation with Zod
- Coordinates orchestration flow
- Returns SearchResponse with preference model

**GET `/api/products/[id]`**
- Fetches detailed product information
- Handles dynamic ID routing
- Returns complete Product object

**POST `/api/compare`**
- Compares 2+ products side-by-side
- Generates comparison matrix
- Provides tradeoff analysis
- Uses user preferences for context

**GET `/api/health`**
- System health check
- Database connectivity validation
- Used for monitoring and deployment verification

### 3. Service Layer

**ProductService** (`src/lib/services/productService.ts`)
- Orchestrates the entire search flow:
  1. Extract preferences from query
  2. Validate extracted preferences
  3. Retrieve products (from DB or provider)
  4. Rank products
  5. Return comprehensive results
- Handles database operations
- Manages provider integration
- Implements caching strategy

**PreferenceExtractor** (`src/lib/services/preferenceExtractor.ts`)
- Converts natural language → structured preferences
- Pattern matching for budget, specs, use cases
- Identifies hard constraints vs soft preferences
- Calculates importance weights
- Generates clarification questions
- Schema validation with Zod

**RankingEngine** (`src/lib/services/rankingEngine.ts`)
- Multi-factor scoring algorithm
- Enforces hard constraint filtering
- Configurable ranking weights
- Score breakdowns for transparency
- Generates natural language explanations
- Identifies trade-offs

**Key Algorithms:**

```
RANKING ALGORITHM:

1. CONSTRAINT FILTERING
   - Identify hard constraints from preferences
   - Filter products that violate hard constraints
   - Products that fail filtering are excluded

2. SCORING (for eligible products)
   
   Price Match = {
     if price ≤ budget: 0.5 + (price/budget) * 0.5
     else if price < 1.2 * budget: 0.8
     else if price < 1.5 * budget: 0.5
     else: 0.2
   }
   
   Spec Match = (matched_attributes / total_preferred) + bonus
   
   Semantic Relevance = category_match_score
   
   Availability = {
     in_stock: 1.0
     preorder: 0.6
     unknown: 0.5
     unavailable: 0.2
   }
   
   Rating = (rating/5) * confidence_factor
   
   Data Freshness = {
     current: 1.0
     stale: 0.6
     unavailable: 0.2
     error: 0.1
   }

3. WEIGHTED SCORING
   score = Σ(factor_score × factor_weight)
   
   Default weights:
   - Price Match: 25%
   - Spec Match: 35%
   - Semantic: 15%
   - Availability: 10%
   - Rating: 10%
   - Freshness: 5%

4. RANKING
   Sort by score (descending)
   Assign rank 1, 2, 3, ...

5. EXPLANATION GENERATION
   For each product, generate:
   - Why this match (strongest factor)
   - Price fit analysis
   - Constraint violations (if any)
   - Trade-offs identified
```

### 4. Data Access Layer (Drizzle ORM)

**Database Schema**

```sql
-- Products Catalog
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  productId VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  brand VARCHAR(255),
  category category_enum NOT NULL,
  price NUMERIC(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  specifications JSONB,
  rating NUMERIC(3,2),
  reviewCount INTEGER,
  availability VARCHAR(50),
  inStock BOOLEAN DEFAULT true,
  status status_enum,
  dataFreshness VARCHAR(50),
  lastUpdated TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  embedding JSONB
);
CREATE INDEX ON products(category);
CREATE INDEX ON products(brand);
CREATE INDEX ON products(status);

-- User Preferences (extracted from queries)
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  rawQuery TEXT NOT NULL,
  category category_enum,
  budget NUMERIC(12,2),
  constraints JSONB,
  preferences JSONB,
  importance JSONB,
  tradeoffs JSONB,
  clarificationQuestions JSONB,
  extractedAt TIMESTAMP
);
CREATE INDEX ON user_preferences(userId);
CREATE INDEX ON user_preferences(category);

-- Search History
CREATE TABLE search_history (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  resultsCount INTEGER,
  topProductId INTEGER REFERENCES products(id),
  feedbackRating INTEGER,
  createdAt TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON search_history(userId);

-- Recommendations (for audit trail)
CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  preferenceId INTEGER REFERENCES user_preferences(id),
  productId INTEGER NOT NULL REFERENCES products(id),
  rank INTEGER,
  score NUMERIC(5,4),
  scoreBreakdown JSONB,
  explanation TEXT
);
CREATE INDEX ON recommendations(userId);
CREATE INDEX ON recommendations(preferenceId);

-- Conversations (for multi-turn refinement)
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  messages JSONB,
  preferenceId INTEGER REFERENCES user_preferences(id),
  createdAt TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON conversations(userId);
```

**ORM Usage Pattern**

```typescript
// Querying
const products = await db
  .select()
  .from(productsTable)
  .where(eq(productsTable.category, 'laptops'))
  .orderBy(desc(productsTable.rating))
  .limit(20);

// Inserting
await db.insert(productsTable).values({
  productId: 'product123',
  name: 'Product Name',
  category: 'laptops',
  // ...
});

// Updating
await db
  .update(productsTable)
  .set({ lastUpdated: new Date() })
  .where(eq(productsTable.id, productId));
```

### 5. Product Provider System

**Provider Interface**

```typescript
interface ProductProvider {
  name: string;
  category: ProductCategory;
  search(query: string, limit?: number): Promise<Product[]>;
  getProduct(productId: string): Promise<Product | null>;
  getCategories(): Promise<ProductCategory[]>;
}
```

**Mock Provider** (Development)
- Built-in test data for all categories
- No API credentials needed
- Realistic product specifications
- Used by default

**Provider Architecture (Future)**

```
ProductService
    ├─ MockProvider (default, development)
    ├─ AmazonProvider (when API key configured)
    ├─ EbayProvider (when API key configured)
    ├─ BestBuyProvider (when API key configured)
    └─ GoogleShoppingProvider (when API key configured)
```

Adding a new provider:
1. Implement `ProductProvider` interface
2. Normalize API response to `Product` schema
3. Handle pagination, errors, rate limits
4. Register in product service
5. Configure API credentials in `.env`

### 6. Type System

**Core Types** (`src/types/index.ts`)

```typescript
Product              // Normalized product data
UserPreference       // Extracted constraints/preferences
Constraint          // Individual constraint
PreferenceItem      // Individual preference
Recommendation      // Ranked product with explanation
SearchRequest       // API request schema
SearchResponse      // API response schema
```

**Benefits:**
- Type safety across entire codebase
- Self-documenting data structures
- IDE autocomplete and refactoring
- Validation with Zod at API boundaries

## Data Flow

### Search Request Flow

```
1. User Input (Frontend)
   └─> "Laptop for programming under $1500 with good battery"

2. API Request
   └─> POST /api/search { query, category, limit }

3. Preference Extraction
   └─> Extract: category, budget, constraints, preferences, importance

4. Preference Validation
   └─> Validate constraints and preferences
   └─> Generate clarification questions if needed

5. Product Retrieval
   ├─> Check database for recent results
   ├─> OR fetch from product provider
   └─> Cache in database

6. Product Ranking
   ├─> Filter by hard constraints
   ├─> Score by multiple factors
   ├─> Sort by final score
   └─> Generate explanations

7. Response Construction
   └─> Compile results with preference model and explanations

8. API Response (Frontend)
   └─> { preference, results, clarificationQuestions, errors }

9. Display Results (Frontend)
   └─> Show ranked products with scores and explanations
   └─> Display preference summary
   └─> Offer clarification options
```

### Comparison Flow

```
1. User Selects Products
   └─> Checkbox in ProductCard component

2. Compare Button Click
   └─> POST /api/compare { productIds, userQuery }

3. Product Retrieval
   └─> Fetch full details for each product from database

4. Comparison Matrix
   └─> Extract all attributes from all products
   └─> Build attribute comparison table

5. Tradeoff Analysis
   └─> Compare prices
   └─> Compare ratings
   └─> Analyze stock status
   └─> Generate natural language analysis

6. Response
   └─> { products, comparison matrix, tradeoff analysis }

7. Display
   └─> Show side-by-side comparison
   └─> Highlight key differences
```

## Performance Considerations

### Database Optimization

- **Indexing**: category, brand, status, source for fast filtering
- **Query Patterns**: Pre-filtered by status='current' and sorted by rating
- **Connection Pooling**: Node-postgres with reuse
- **Prepared Statements**: Drizzle ORM parameterized queries prevent SQL injection

### Caching Strategy

```javascript
// Level 1: API Response Caching
// Cache search results for 24 hours by query hash
const cacheKey = `search_${hash(query)}`;

// Level 2: Database Connection Pooling
// Pool connections across requests

// Level 3: Product Data Caching (Future)
// Sync products from APIs on a schedule
// Mark stale data appropriately

// Level 4: Frontend Caching
// Browser cache for static assets
// Service Workers for offline support (future)
```

### Scaling Strategy

```
Current (Single Instance)
├─ Next.js server
├─ PostgreSQL single instance
└─ Mock data provider

Horizontal Scaling (Multiple Instances)
├─ Load balancer (ALB/CloudFlare)
├─ Multiple Next.js instances (stateless)
├─ Shared PostgreSQL (connection pooling)
├─ Shared cache (Redis)
└─ Product API integrations

Vertical Scaling (More Resources)
├─ Larger database instance
├─ More compute for API processing
├─ Faster SSD storage
└─ More memory for caching
```

## Security Architecture

### Input Validation
- **Zod Schemas**: All API inputs validated against schema
- **Type Safety**: TypeScript prevents type mismatches
- **Sanitization**: No direct SQL queries (Drizzle ORM prevents SQL injection)

### Data Protection
- **Environment Variables**: API keys never in code
- **Secrets Management**: `.env` in `.gitignore`
- **Connection Encryption**: PostgreSQL SSL support
- **Request Timeouts**: Prevent hanging requests

### API Security
```typescript
// Rate limiting middleware (future)
app.use(rateLimit({
  windowMs: 60000,
  max: 100
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',')
}));

// Helmet headers (future)
app.use(helmet());
```

## Testing Strategy

### Unit Tests
- Preference extraction with various inputs
- Ranking algorithm correctness
- Score calculation accuracy

### Integration Tests
- API endpoints with mock data
- Database operations with real schema
- Search flow end-to-end

### Manual Testing
- UI interaction flows
- Search with different categories
- Product comparison
- Edge cases (empty results, errors)

### Performance Testing
- Benchmark search query processing
- Database query performance
- API response times
- Memory usage

## Monitoring & Observability

### Health Checks
```bash
# Application health
GET /api/health
└─> { status: 'ok', timestamp }

# Database connectivity
Check: Database query execution time
```

### Logging Strategy
```typescript
// Log levels
'debug'   - Detailed development info
'info'    - General application flow
'warn'    - Warning conditions
'error'   - Error conditions

// Never log: passwords, API keys, personal data
```

### Metrics (Future)
- Search query count
- Average response time
- Products ranked per search
- User feedback/ratings
- Product provider hit rates

## Deployment Architecture

### Development
```
Local Machine
├─ Node.js 18+
├─ PostgreSQL (localhost:5432)
├─ npm run dev (hot reload)
└─ http://localhost:3000
```

### Staging
```
Vercel/AWS
├─ Next.js Deployment
├─ PostgreSQL Instance
├─ Environment variables
└─ Full testing before prod
```

### Production
```
Vercel/AWS
├─ CDN for static assets
├─ Multi-region database (future)
├─ Load balancing
├─ Auto-scaling
├─ Monitoring & alerting
└─ Backup & recovery
```

## Future Architecture Enhancements

### Phase 2: Vector Search
```
Current:           Future:
Keyword search  → Semantic search
Heuristic       → Learning-to-rank
ranking           with feedback
```

Requires:
- Sentence Transformers for embeddings
- FAISS for similarity search
- Vector storage in PostgreSQL (pgvector)
- Embedding pipeline

### Phase 3: LLM Integration
```
Current:           Future:
Rule-based       → GPT-4/Claude NLU
preference        Natural language
extraction        explanations
                  Context-aware
                  clarification
```

Requires:
- OpenAI/Cohere API integration
- Prompt engineering
- Cost monitoring and limits
- Context window management

### Phase 4: Personalization
```
Current:           Future:
Single search    → User accounts
session            Search history
                   Saved preferences
                   Personalized rankings
                   Recommendation engine
```

Requires:
- User authentication
- Preference history storage
- Collaborative filtering
- Behavioral analytics

### Phase 5: Multi-turn Conversation
```
Current:           Future:
Single query     → Multi-turn chat
                   Context retention
                   Preference refinement
                   Follow-up questions
```

Requires:
- Conversation history storage
- LLM conversation management
- Context summarization
- Session management

## Architecture Principles

1. **Separation of Concerns**
   - Frontend (UI) separate from backend (API)
   - Services encapsulate business logic
   - Database abstraction through ORM

2. **Type Safety**
   - Full TypeScript coverage
   - Zod validation at boundaries
   - Compile-time type checking

3. **Extensibility**
   - Provider interface for product sources
   - Pluggable ranking weights
   - Configurable preferences

4. **Performance**
   - Database indexing
   - Lazy loading
   - Pagination
   - Caching strategy

5. **Maintainability**
   - Clear naming conventions
   - Documented APIs
   - Modular components
   - Test coverage

6. **Security**
   - Environment variables for secrets
   - SQL injection prevention (ORM)
   - Input validation (Zod)
   - Error handling without exposing details

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Status**: Production Ready
