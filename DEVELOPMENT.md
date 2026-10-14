# Development Guide

Complete guide for developing, testing, and extending the Intelligent Product Discovery platform.

## Setting Up Development Environment

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- PostgreSQL 13+ ([download](https://www.postgresql.org/download))
- Git
- VS Code or IDE of choice

### Quick Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd intelligent-product-discovery

# 2. Install dependencies
npm install

# 3. Start PostgreSQL
# macOS with Homebrew
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows (using SQL Server Management Studio or pgAdmin)

# 4. Create database
createdb app_db

# 5. Create .env file
cp .env.example .env

# 6. Apply schema
npx drizzle-kit push

# 7. Start development server
npm run dev

# 8. Open browser
# http://localhost:3000
```

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── search/route.ts       # Search endpoint
│   │   ├── compare/route.ts      # Comparison endpoint
│   │   ├── products/[id]/route.ts
│   │   └── health/route.ts       # Health check
│   ├── search/                   # Search results page
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── SearchBar.tsx            # Search input
│   ├── ProductCard.tsx          # Product display
│   ├── PreferencePanel.tsx      # Preference editor
│   └── ComparisonBar.tsx        # Comparison UI
├── db/                           # Database layer
│   ├── schema.ts                # Table definitions
│   └── index.ts                 # Connection and client
├── lib/                          # Business logic
│   ├── providers/               # Product providers
│   │   └── mockProvider.ts      # Mock data for dev
│   └── services/                # Core services
│       ├── preferenceExtractor.ts   # NLP extraction
│       ├── rankingEngine.ts         # Ranking logic
│       └── productService.ts        # Orchestration
└── types/                        # TypeScript definitions
    └── index.ts                 # Core types

.env                             # Environment variables
.env.example                     # Example .env
drizzle.config.json             # Drizzle ORM config
package.json                    # Dependencies
tsconfig.json                   # TypeScript config
README.md                       # Project overview
API.md                         # API documentation
ARCHITECTURE.md                # System design
DEPLOYMENT.md                  # Deployment guide
```

## Development Workflow

### 1. Running the Development Server

```bash
npm run dev
```

Features:
- Hot module replacement (HMR)
- Fast refresh for components
- Auto-reload on file changes
- Source maps for debugging
- TypeScript checking

### 2. Type Checking

```bash
# Full TypeScript check (what CI/CD runs)
npx tsc --noEmit

# Quick check during development
npm run typecheck
```

### 3. Linting

```bash
# Check code quality
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### 4. Building for Production

```bash
# Full production build
npm run build

# Start production server
npm start
```

## Making Changes

### Adding a New API Route

1. Create new route file:

```typescript
// src/app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  query: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Implement endpoint logic
    const result = await processRequest(validation.data);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

2. Test with curl or Postman
3. Update `API.md` with endpoint documentation

### Adding a New Database Table

1. Edit `src/db/schema.ts`:

```typescript
export const myTable = pgTable("my_table", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});
```

2. Apply schema:

```bash
npx drizzle-kit push
```

3. Use in services:

```typescript
import { db } from "@/db";
import { myTable } from "@/db/schema";

const results = await db.select().from(myTable);
```

### Adding a New Component

1. Create component file:

```typescript
// src/components/NewComponent.tsx
"use client"; // Add if using hooks/interactivity

interface NewComponentProps {
  title: string;
  onAction?: () => void;
}

export default function NewComponent({ title, onAction }: NewComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200">
      <h2 className="text-lg font-bold">{title}</h2>
      {onAction && (
        <button onClick={onAction} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Action
        </button>
      )}
    </div>
  );
}
```

2. Use in pages:

```typescript
import NewComponent from "@/components/NewComponent";

export default function Page() {
  return <NewComponent title="My Component" />;
}
```

### Adding a New Service

1. Create service file:

```typescript
// src/lib/services/myService.ts
export class MyService {
  async doSomething(input: string): Promise<string> {
    // Implementation
    return result;
  }
}

export const myService = new MyService();
```

2. Use in API routes or other services:

```typescript
import { myService } from "@/lib/services/myService";

const result = await myService.doSomething("input");
```

## Testing

### Manual Testing

```bash
# Test home page
curl http://localhost:3000/

# Test search API
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "laptop"}'

# Test product endpoint
curl http://localhost:3000/api/products/mock_laptop_001

# Test comparison
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["mock_laptop_001", "mock_laptop_002"]}'

# Test health check
curl http://localhost:3000/api/health
```

### Using Postman

1. Create new request
2. Set method to POST
3. Enter URL: `http://localhost:3000/api/search`
4. Headers → Add `Content-Type: application/json`
5. Body → Raw JSON:

```json
{
  "query": "Laptop for programming",
  "limit": 10
}
```

6. Send and review response

### Browser DevTools

```javascript
// Test API in browser console
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'laptop' })
});
const data = await response.json();
console.log(data);
```

## Database Management

### Viewing Database

```bash
# Connect to database
psql app_db

# List tables
\dt

# Describe table
\d products

# Run query
SELECT * FROM products LIMIT 5;

# Exit
\q
```

### Common Database Tasks

```bash
# Backup database
pg_dump app_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql app_db < backup_20240115_101530.sql

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM products WHERE category = 'laptops';

# Vacuum and optimize
VACUUM ANALYZE;

# Drop and recreate database (dev only!)
dropdb app_db
createdb app_db
npx drizzle-kit push
```

## Debugging

### Chrome DevTools

1. Visit `chrome://inspect`
2. Click "Inspect" on your application
3. Debug frontend code, network, storage

### VS Code Debugger

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

Run with:

```bash
node --inspect-brk ./node_modules/next/dist/bin/next dev
```

### Console Logging

```typescript
// Frontend
console.log('Message', data);
console.error('Error:', error);

// Backend (shown in terminal)
console.log('[API]', message);
console.error('[ERROR]', error);
```

### Environment Variables in Development

```bash
# Add to .env
DEBUG=app:*

# Access in code
if (process.env.DEBUG) {
  console.log('Debug info');
}
```

## Common Issues and Solutions

### Issue: Database Connection Failed

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
```bash
# 1. Check PostgreSQL is running
ps aux | grep postgres

# 2. Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux

# 3. Verify .env has correct DATABASE_URL
cat .env | grep DATABASE_URL

# 4. Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: Port 3000 Already in Use

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
```bash
# 1. Kill process on port 3000
kill $(lsof -t -i:3000)  # macOS/Linux

# 2. Use different port
PORT=3001 npm run dev

# 3. Find and kill process
netstat -tulpn | grep 3000  # Linux
lsof -i :3000  # macOS
```

### Issue: TypeScript Errors

**Symptom:**
```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**Solutions:**
```bash
# 1. Regenerate types
npx next typegen

# 2. Check TypeScript
npx tsc --noEmit

# 3. Restart IDE to clear cache

# 4. Clear build cache
rm -rf .next
```

### Issue: Module Not Found

**Symptom:**
```
Module not found: Can't resolve '@/lib/service'
```

**Solutions:**
```bash
# 1. Verify file exists
ls src/lib/service.ts

# 2. Check path aliases in tsconfig.json
# Should have: "@/*": "./src/*"

# 3. Restart dev server
npm run dev

# 4. Check for typos in import path
```

### Issue: Search Returns No Results

**Symptom:**
```
Results: []
totalCount: 0
```

**Solutions:**
```bash
# 1. Verify mock data is loaded
curl http://localhost:3000/api/products/mock_laptop_001

# 2. Check database has products
psql app_db -c "SELECT COUNT(*) FROM products;"

# 3. Test preference extraction
const pref = await preferenceExtractor.extract("laptop");
console.log(pref);

# 4. Test ranking with mock data
const products = [mockLaptop1, mockLaptop2];
const results = await rankingEngine.rank(products, pref);
```

## Performance Optimization

### Database Query Optimization

```typescript
// Bad: Full table scan
const products = await db.select().from(productsTable);

// Good: Filtered and indexed
const products = await db
  .select()
  .from(productsTable)
  .where(eq(productsTable.category, 'laptops'))
  .orderBy(desc(productsTable.rating))
  .limit(20);
```

### Frontend Performance

```typescript
// Bad: Render all products immediately
return products.map(p => <ProductCard key={p.id} product={p} />);

// Good: Lazy load/paginate
return (
  <>
    {products.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
    {/* Pagination component */}
  </>
);
```

### API Performance

```typescript
// Bad: Multiple sequential database queries
for (const id of productIds) {
  const product = await getProductById(id);
}

// Good: Batch query
const products = await db.select().from(productsTable)
  .where(inArray(productsTable.id, productIds));
```

## Extending the System

### Add New Product Category

1. Update schema enum:

```typescript
// src/db/schema.ts
export const categoryEnum = pgEnum("category", [
  "laptops",
  "smartphones",
  "headphones",
  "appliances",
  "cameras",
  "drones", // New!
  "other",
]);
```

2. Update types:

```typescript
// src/types/index.ts
export type ProductCategory = 
  | "laptops"
  | "smartphones"
  | "headphones"
  | "appliances"
  | "cameras"
  | "drones" // New!
  | "other";
```

3. Add mock data:

```typescript
// src/lib/providers/mockProvider.ts
const MOCK_DRONES: Product[] = [
  {
    id: "mock_drone_001",
    name: "DJI Mavic 3",
    category: "drones",
    // ...
  }
];
```

### Add New Ranking Factor

```typescript
// src/lib/services/rankingEngine.ts

// 1. Add to weights interface
export interface RankingWeights {
  // ... existing factors
  brandReputation: number;  // New!
}

// 2. Add scoring method
private scoreBrandReputation(product: Product): number {
  const brandScores: Record<string, number> = {
    'apple': 0.95,
    'dell': 0.85,
    // ...
  };
  return brandScores[product.brand?.toLowerCase()] ?? 0.5;
}

// 3. Include in scoring
const scoreBreakdown = {
  // ... existing scores
  brandReputation: this.scoreBrandReputation(product) * weights.brandReputation,
};

// 4. Normalize final calculation
const totalScore = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0) * 100;
```

### Integrate LLM for Better Preferences

```typescript
// src/lib/services/preferenceExtractor.ts
import OpenAI from 'openai';

async extractWithLLM(query: string): Promise<UserPreference> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const message = await client.messages.create({
    model: 'gpt-4',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Extract structured preferences from: "${query}"`
    }]
  });

  const extractedText = message.content[0].type === 'text' 
    ? message.content[0].text 
    : '';

  // Parse LLM response into UserPreference
  return this.parsePreferences(extractedText);
}
```

## Code Quality

### ESLint and Prettier

```bash
# Check code style
npm run lint

# Format code automatically
npx prettier --write .

# Check TypeScript
npm run typecheck
```

### Before Committing

```bash
# 1. Run type check
npx tsc --noEmit

# 2. Run linter
npm run lint

# 3. Build
npm run build

# 4. Run tests (if available)
npm test

# 5. Commit changes
git add .
git commit -m "Description of changes"
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm start                # Start prod server
npm run lint             # Check code quality
npm run typecheck        # TypeScript check

# Database
npx drizzle-kit push     # Apply schema
npx drizzle-kit studio   # Open Drizzle Studio GUI

# Type Generation
npx next typegen         # Generate route types

# Utilities
node -e "console.log()"  # Quick JavaScript execution
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "Add feature: description"

# Keep updated with main
git fetch origin
git rebase origin/main

# Push to remote
git push origin feature/my-feature

# Create Pull Request on GitHub

# After review and merge
git checkout main
git pull origin main
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev)

---

**Last Updated**: January 2024
**Status**: Active Development
