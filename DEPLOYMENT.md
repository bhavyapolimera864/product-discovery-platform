# Deployment Guide

This document describes how to deploy the Intelligent Product Discovery platform to various environments.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+ database
- Environment with Node.js runtime support
- Git for version control

## Local Development

### Quick Start

```bash
# 1. Clone and install
git clone <repository>
cd intelligent-product-discovery
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Initialize database
npx drizzle-kit push

# 4. Start development server
npm run dev

# 5. Open browser
# Visit http://localhost:3000
```

### Database Setup

```bash
# Create database
createdb app_db

# Create user (if needed)
createuser postgres

# Initialize schema
npx drizzle-kit push
```

## Production Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Verify build succeeded
ls .next/

# Start production server
npm start
```

### Environment Variables (Production)

Create `.env` file with production credentials:

```env
# Database - Use production PostgreSQL instance
DATABASE_URL=postgresql://user:password@prod-db.example.com:5432/app_db

# Security - Use strong secrets
NODE_ENV=production

# Product APIs - Configure real providers
AMAZON_API_KEY=your_production_key
EBAY_API_KEY=your_production_key

# Logging
LOG_LEVEL=info

# Performance
CACHE_EXPIRY_HOURS=24
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=60000
```

### Security Checklist

- [ ] All secrets in environment variables (never in code)
- [ ] `.env` file not committed to git
- [ ] Database password uses strong credentials
- [ ] API keys rotated regularly
- [ ] CORS configured for production origins
- [ ] HTTPS enabled on all endpoints
- [ ] Database connection uses SSL
- [ ] Rate limiting enabled
- [ ] Timeouts configured for external APIs
- [ ] Error logging doesn't expose sensitive data

## Cloud Deployments

### Vercel (Next.js Optimized)

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
# Visit https://vercel.com/new
# Select GitHub repository
# Configure environment variables in Vercel dashboard

# 3. Database Setup
# Option A: Use Vercel Postgres
# Option B: Use external PostgreSQL provider

# 4. Deploy
# Vercel auto-deploys on push to main branch
```

**Environment Setup in Vercel:**
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.example`
3. Mark database credentials as "Sensitive"
4. Deploy will use these variables automatically

### AWS Elastic Beanstalk

```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize EB project
eb init -p "Node.js 18" intelligent-product-discovery

# 3. Create environment
eb create production-env

# 4. Set environment variables
eb setenv DATABASE_URL=postgresql://...
eb setenv NODE_ENV=production

# 5. Deploy
eb deploy
```

**RDS Setup for Database:**
1. Create RDS PostgreSQL instance
2. Set security group to allow Beanstalk access
3. Note connection string
4. Use in DATABASE_URL environment variable

### Heroku

```bash
# 1. Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
heroku create intelligent-product-discovery

# 4. Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# 5. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set AMAZON_API_KEY=your_key

# 6. Deploy
git push heroku main

# 7. View logs
heroku logs --tail
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build Next.js app
COPY . .
RUN npm run build

# Start production server
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
# Build image
docker build -t intelligent-discovery:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NODE_ENV="production" \
  intelligent-discovery:latest

# Push to registry (ECR, Docker Hub, etc.)
docker tag intelligent-discovery:latest your-registry/intelligent-discovery:latest
docker push your-registry/intelligent-discovery:latest
```

### Docker Compose (Development)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/app_db
      NODE_ENV: development
    depends_on:
      - postgres
    command: npm run dev

volumes:
  postgres_data:
```

Start:

```bash
docker-compose up -d
```

## Database Migrations

### Adding a New Table

1. Edit `src/db/schema.ts` to add new table definition
2. Run schema push to apply changes:

```bash
npx drizzle-kit push
```

3. No migration files needed - Drizzle handles this automatically

### Viewing Schema Changes

```bash
# Generate migration files (for version control)
npx drizzle-kit generate

# Review migrations in drizzle/ directory
cat drizzle/0001_*.sql
```

## Monitoring and Maintenance

### Health Checks

```bash
# Test health endpoint
curl https://your-deployment.com/api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Database Backups

```bash
# PostgreSQL backup
pg_dump app_db > backup_$(date +%Y%m%d).sql

# Restore from backup
psql app_db < backup_20240115.sql

# Or use managed backups:
# - AWS RDS Automated Backups
# - Heroku Postgres Backups
# - Google Cloud SQL Backups
```

### Log Monitoring

```bash
# Local development
npm run dev
# Logs print to console

# Production with Vercel
# View in Vercel dashboard → Logs

# Production with Heroku
heroku logs --tail

# Production with AWS Beanstalk
eb logs
```

## Performance Optimization

### Database Optimization

```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes
ORDER BY idx_blks_hit DESC;

-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM products WHERE category = 'laptops';

-- Vacuum and analyze tables
VACUUM ANALYZE;
```

### Caching Strategy

```env
# Cache product results for 24 hours
CACHE_EXPIRY_HOURS=24

# Enable Redis caching (if available)
REDIS_URL=redis://cache:6379
```

### CDN Setup

```javascript
// Serve static assets from CDN
// next.config.ts
export default {
  images: {
    domains: ['cdn.example.com'],
  },
};
```

## Scaling

### Horizontal Scaling

- Stateless Next.js servers can be scaled horizontally
- Use load balancer (ALB, CloudFlare, nginx)
- Session/preference data stored in PostgreSQL
- Cache layer (Redis) for search results

### Database Scaling

```sql
-- Add read replica
-- In AWS RDS: Create read replica from main instance

-- Connection pooling
-- Use PgBouncer or managed connection pooling service
```

### Sample Architecture

```
                    ┌─────────────┐
                    │   Users     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Load Balancer│
                    │(ALB/CloudFlare)
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
   │ Next.js 1 │      │ Next.js 2 │      │ Next.js 3 │
   │Instance   │      │Instance   │      │Instance   │
   └────┬─────┘      └────┬─────┘      └────┬─────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Connection  │
                    │ Pool/Cache  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
   │  Primary │      │  Read     │      │  Read    │
   │PostgreSQL│      │ Replica 1 │      │ Replica 2│
   └──────────┘      └───────────┘      └──────────┘
```

## Rollback Procedures

### Rollback on Deployment Error

```bash
# Vercel
vercel rollback

# Heroku
heroku releases:rollback

# AWS EB
eb setenv DEPLOYMENT=previous_version
eb deploy
```

### Database Rollback

```bash
# Restore from backup
psql app_db < backup_20240115.sql

# Or revert schema changes
git checkout HEAD~1 -- src/db/schema.ts
npx drizzle-kit push
```

## Troubleshooting

### Build Failures

```bash
# Clear build cache
rm -rf .next
npm run build

# Verify dependencies
npm ci

# Check TypeScript
npx tsc --noEmit
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check credentials
echo $DATABASE_URL

# Verify schema
psql $DATABASE_URL -c "\dt"
```

### Memory/Performance Issues

```bash
# Check Node memory usage
npm run build -- --debug

# Monitor production
node --inspect=0.0.0.0:9229 .next/standalone/server.js

# Use Chrome DevTools
# Visit chrome://inspect
```

## Cost Estimation

### Monthly Costs (Rough Estimates)

| Component | Service | Cost |
|-----------|---------|------|
| Compute | Vercel Hobby | Free-$25 |
| Database | Vercel Postgres | $15-100 |
| Storage | Vercel Blob | $0.50/GB |
| Analytics | Vercel Analytics | $9-15 |
| **Total** | | **$24-140/mo** |

### Cost Optimization

- Use managed services (Vercel, Heroku) for simple setups
- Self-host on EC2/DigitalOcean for more control
- Use database read replicas only when needed
- Archive old search history to reduce storage
- Cache aggressively to reduce API calls

## Support and Troubleshooting

See [README.md](./README.md) for general troubleshooting.

For deployment-specific issues:
1. Check environment variables are correctly set
2. Verify database connectivity
3. Review application logs
4. Check resource limits (memory, CPU)
5. Ensure all dependencies are installed

---

**Last Updated**: January 2024
