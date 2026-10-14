# API Documentation

Complete API reference for the Intelligent Product Discovery platform.

## Base URL

```
Development:  http://localhost:3000
Production:   https://your-domain.com
```

## Response Format

All API responses follow this format:

```json
{
  "success": true/false,
  "data": {},
  "error": "Error message (if success=false)",
  "errors": {"field": "error message"},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

## Authentication

Currently, the API is open. To add authentication:

1. Add user context extraction
2. Validate bearer tokens
3. Associate search results with user IDs

## Endpoints

### 1. Search Products

**Endpoint:** `POST /api/search`

Search for products based on natural language query with AI preference modeling.

**Request:**

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Laptop for programming with good battery",
    "category": "laptops",
    "limit": 20,
    "offset": 0,
    "userId": "user123"
  }'
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| query | string | Yes | Natural language search query |
| category | string | No | Product category (laptops, smartphones, headphones, appliances, cameras) |
| limit | number | No | Results per page (default: 20, max: 100) |
| offset | number | No | Pagination offset (default: 0) |
| userId | string | No | User identifier for tracking (default: "anonymous") |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "query": "Laptop for programming with good battery",
    "preference": {
      "userId": "user123",
      "rawQuery": "Laptop for programming with good battery",
      "category": "laptops",
      "intendedUse": "Programming",
      "budget": null,
      "budgetCurrency": "USD",
      "constraints": [
        {
          "type": "hard",
          "attribute": "category",
          "operator": "===",
          "value": "laptops"
        }
      ],
      "preferences": [
        {
          "attribute": "batteryLife",
          "desiredValue": "12h+",
          "priority": "high",
          "flexibility": 0.4
        }
      ],
      "importance": {
        "price": 0.4,
        "batteryLife": 0.6
      },
      "tradeoffs": [],
      "clarificationQuestions": [
        "What's your budget range?",
        "Do you have a preferred OS?"
      ],
      "extractedAt": "2024-01-15T10:30:00Z"
    },
    "results": [
      {
        "product": {
          "id": "mock_laptop_002",
          "productId": "macbook_air_m2",
          "name": "MacBook Air M2",
          "brand": "Apple",
          "category": "laptops",
          "description": "Lightweight laptop with Apple M2 chip...",
          "price": 1199,
          "currency": "USD",
          "imageUrl": "https://...",
          "productUrl": "https://example.com/products/...",
          "specifications": {
            "cpu": "Apple M2",
            "ram": 8,
            "storage": 256,
            "batteryLife": "15h"
          },
          "source": "mock",
          "availability": "in_stock",
          "inStock": true,
          "rating": 4.8,
          "reviewCount": 5234,
          "status": "current",
          "dataFreshness": "fresh",
          "lastUpdated": "2024-01-15T10:00:00Z"
        },
        "rank": 1,
        "score": 87,
        "scoreBreakdown": {
          "priceMatch": 0.75,
          "specificationMatch": 0.90,
          "semanticRelevance": 0.85,
          "availability": 1.0,
          "rating": 0.96,
          "dataFreshness": 1.0
        },
        "explanation": "Strong match on specification match • 80% of budget • 4.8/5 rating (5234 reviews)",
        "relevanceMatches": [
          "cpu: Apple M2",
          "ram: 8",
          "storage: 256",
          "batteryLife: 15h"
        ],
        "tradeoffs": [
          "Higher price at the cost of premium build quality"
        ]
      }
    ],
    "totalCount": 12,
    "clarificationQuestions": [
      "What's your budget range?",
      "Do you have a preferred OS?"
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Invalid request parameters",
  "errors": {
    "query": "Search query is required"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 2. Get Product Details

**Endpoint:** `GET /api/products/{id}`

Get detailed information about a specific product.

**Request:**

```bash
curl http://localhost:3000/api/products/mock_laptop_001
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | Product ID from search results |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "mock_laptop_001",
    "productId": "dell_xps_13_9320",
    "name": "Dell XPS 13 (9320)",
    "brand": "Dell",
    "category": "laptops",
    "description": "Ultra-thin laptop with FHD display, Intel Core i5, 8GB RAM, 512GB SSD",
    "price": 999,
    "currency": "USD",
    "imageUrl": "https://...",
    "productUrl": "https://example.com/laptops/dell-xps-13",
    "specifications": {
      "cpu": "Intel Core i5-1240P",
      "ram": 8,
      "storage": 512,
      "storageType": "SSD",
      "display": "13.3 FHD (1920x1200)",
      "batteryLife": "12h",
      "weight": "2.8 lbs",
      "os": "Windows 11"
    },
    "source": "mock",
    "sourceId": "dell_xps_13_9320",
    "seller": null,
    "availability": "in_stock",
    "inStock": true,
    "rating": 4.5,
    "reviewCount": 2847,
    "status": "current",
    "dataFreshness": "fresh",
    "lastUpdated": "2024-01-15T10:00:00Z",
    "metadata": {}
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Product not found",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 3. Compare Products

**Endpoint:** `POST /api/compare`

Compare multiple products side by side.

**Request:**

```bash
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{
    "productIds": ["mock_laptop_001", "mock_laptop_002"],
    "userQuery": "Laptop for programming",
    "userId": "user123"
  }'
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| productIds | string[] | Yes | Array of product IDs (minimum 2) |
| userQuery | string | No | Original search query for context |
| userId | string | No | User identifier |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "mock_laptop_001",
        "name": "Dell XPS 13 (9320)",
        "brand": "Dell",
        "price": 999,
        "specifications": {...}
      },
      {
        "id": "mock_laptop_002",
        "name": "MacBook Air M2",
        "brand": "Apple",
        "price": 1199,
        "specifications": {...}
      }
    ],
    "comparison": {
      "mock_laptop_001": {
        "name": "Dell XPS 13 (9320)",
        "brand": "Dell",
        "price": 999,
        "currency": "USD",
        "rating": 4.5,
        "reviewCount": 2847,
        "availability": "in_stock",
        "inStock": true,
        "cpu": "Intel Core i5-1240P",
        "ram": 8,
        "storage": 512,
        "storageType": "SSD",
        "display": "13.3 FHD (1920x1200)",
        "batteryLife": "12h",
        "weight": "2.8 lbs",
        "os": "Windows 11"
      },
      "mock_laptop_002": {
        "name": "MacBook Air M2",
        "brand": "Apple",
        "price": 1199,
        "currency": "USD",
        "rating": 4.8,
        "reviewCount": 5234,
        "availability": "in_stock",
        "inStock": true,
        "cpu": "Apple M2",
        "ram": 8,
        "storage": 256,
        "storageType": "SSD",
        "display": "13.6 Liquid Retina",
        "batteryLife": "15h",
        "weight": "2.7 lbs",
        "os": "macOS"
      }
    },
    "tradeoffAnalysis": "Price range: $999 to $1199 (difference: $200)\nRating range: 4.5 to 4.8 stars\n2/2 products currently in stock"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Invalid request parameters",
  "errors": {
    "productIds": "At least 2 products required to compare"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 4. Health Check

**Endpoint:** `GET /api/health`

Check if the API is running and database is connected.

**Request:**

```bash
curl http://localhost:3000/api/health
```

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Data Types

### Product Object

```typescript
{
  id: string;                           // Unique product ID
  productId: string;                    // External product ID
  name: string;                         // Product name
  brand?: string;                       // Brand name
  category: "laptops" | "smartphones" | "headphones" | "appliances" | "cameras" | "other";
  description?: string;                 // Product description
  price?: number;                       // Price amount
  currency: string;                     // ISO 4217 code (USD, INR, etc.)
  imageUrl?: string;                    // Product image URL
  productUrl?: string;                  // Link to product on seller
  specifications?: Record<string, any>; // Category-specific specs
  source: string;                       // Data provider name
  sourceId?: string;                    // ID from provider
  seller?: string;                      // Seller/brand
  availability: string;                 // in_stock, preorder, unavailable
  inStock: boolean;                     // Availability flag
  rating?: number;                      // Rating 0-5
  reviewCount?: number;                 // Number of reviews
  status: "current" | "stale" | "unavailable" | "error";
  dataFreshness: "fresh" | "stale" | "unavailable";
  lastUpdated: Date;                    // Last update timestamp
  metadata?: Record<string, any>;       // Additional data
}
```

### UserPreference Object

```typescript
{
  userId: string;
  rawQuery: string;
  category?: ProductCategory;
  intendedUse?: string;
  budget?: number;
  budgetCurrency?: string;
  constraints: Constraint[];
  preferences: PreferenceItem[];
  importance: Record<string, number>;
  tradeoffs: Tradeoff[];
  clarificationQuestions?: string[];
  validationErrors?: string[];
  extractedAt?: Date;
}
```

### Constraint Object

```typescript
{
  type: "hard" | "soft" | "flexible";
  attribute: string;
  operator?: "===" | ">=" | "<=" | ">" | "<" | "in" | "contains";
  value: any;
  importance?: number;        // 0-1 weight
  reason?: string;            // Explanation
}
```

### Recommendation Object

```typescript
{
  product: Product;
  rank: number;
  score: number;              // 0-100
  scoreBreakdown: {
    priceMatch: number;
    specificationMatch: number;
    semanticRelevance: number;
    availability: number;
    rating: number;
    dataFreshness: number;
  };
  explanation: string;        // Natural language explanation
  constraintViolations?: string[];
  relevanceMatches?: string[];
  tradeoffs?: string[];
}
```

---

## Rate Limiting

```
Rate Limit: 100 requests per 60 seconds per IP
```

Headers returned:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1705314600
```

---

## Examples

### Example 1: Full Search Flow

```bash
# 1. Search for laptops
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Laptop for machine learning under $1500 with 16GB RAM",
    "category": "laptops"
  }' | jq '.data.results[0]'

# 2. View top result details
curl http://localhost:3000/api/products/mock_laptop_002 | jq '.data'

# 3. Compare top 2 results
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{
    "productIds": ["mock_laptop_001", "mock_laptop_002"],
    "userQuery": "Laptop for machine learning"
  }' | jq '.data.tradeoffAnalysis'
```

### Example 2: Category Filtering

```bash
# Search only for headphones
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Wireless headphones with noise cancellation",
    "category": "headphones"
  }'
```

### Example 3: Pagination

```bash
# First page (default)
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "laptop",
    "limit": 10,
    "offset": 0
  }'

# Second page
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "laptop",
    "limit": 10,
    "offset": 10
  }'
```

---

## Integration Guide

### JavaScript/TypeScript

```typescript
import { SearchRequest, SearchResponse } from './types';

async function searchProducts(query: string): Promise<SearchResponse> {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      limit: 20,
    }),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  const { data } = await response.json();
  return data;
}

// Usage
const results = await searchProducts('Laptop for programming');
console.log(`Found ${results.results.length} products`);
results.results.forEach((rec) => {
  console.log(`${rec.rank}. ${rec.product.name} - Score: ${rec.score}/100`);
});
```

### Python

```python
import requests
import json

def search_products(query: str) -> dict:
    """Search for products via API"""
    response = requests.post(
        'http://localhost:3000/api/search',
        headers={'Content-Type': 'application/json'},
        json={'query': query, 'limit': 20}
    )
    response.raise_for_status()
    return response.json()['data']

# Usage
results = search_products('Laptop for machine learning')
for rec in results['results']:
    print(f"{rec['rank']}. {rec['product']['name']}")
    print(f"   Score: {rec['score']}/100")
    print(f"   Price: ${rec['product']['price']}")
```

### cURL

```bash
# Basic search
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Laptop"}'

# Pretty print JSON output
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Laptop"}' | jq '.'

# Save results to file
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Laptop"}' > results.json
```

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Product search endpoint
- Comparison endpoint
- Product details endpoint
- Mock data provider

### Future (v1.1.0)
- Authentication and user accounts
- Search history endpoint
- Saved preferences endpoint
- Price alerts
- User ratings and reviews

---

**Last Updated**: January 2024
**API Version**: 1.0.0
**Status**: Production Ready
