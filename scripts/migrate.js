const { Pool } = require('pg');
const fs = require('fs');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  for (const line of content.split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      dbUrl = line.substring('DATABASE_URL='.length).trim();
      break;
    }
  }
}

if (!dbUrl) {
  console.error('No DATABASE_URL found!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

const ddl = `
DO $$ BEGIN
    CREATE TYPE category AS ENUM ('laptops', 'smartphones', 'headphones', 'appliances', 'cameras', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status AS ENUM ('current', 'stale', 'unavailable', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE constraint_type AS ENUM ('hard', 'soft', 'flexible');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(500) NOT NULL,
    brand VARCHAR(255),
    category category NOT NULL,
    description TEXT,
    price DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    image_url VARCHAR(500),
    product_url VARCHAR(500),
    specifications JSON,
    source VARCHAR(100),
    source_id VARCHAR(255),
    seller VARCHAR(255),
    availability VARCHAR(50) DEFAULT 'unknown',
    in_stock BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    status status DEFAULT 'current',
    data_freshness VARCHAR(50) DEFAULT 'fresh',
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSON,
    embedding JSON
);

CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_brand_idx ON products(brand);
CREATE INDEX IF NOT EXISTS products_source_idx ON products(source);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    raw_query TEXT NOT NULL,
    category category,
    intended_use TEXT,
    budget DECIMAL(12, 2),
    budget_currency VARCHAR(3) DEFAULT 'USD',
    constraints JSON,
    preferences JSON,
    importance JSON,
    tradeoffs JSON,
    clarification_questions JSON,
    validation_errors JSON,
    extracted_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS user_preferences_category_idx ON user_preferences(category);

CREATE TABLE IF NOT EXISTS constraints (
    id SERIAL PRIMARY KEY,
    preference_id INTEGER NOT NULL,
    type constraint_type NOT NULL,
    attribute VARCHAR(100) NOT NULL,
    operator VARCHAR(20),
    value VARCHAR(255),
    importance DECIMAL(3, 2) DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS constraints_preference_id_idx ON constraints(preference_id);
CREATE INDEX IF NOT EXISTS constraints_type_idx ON constraints(type);

CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    category category,
    results_count INTEGER,
    top_product_id INTEGER,
    interaction_time INTEGER,
    feedback_rating INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS search_history_user_id_idx ON search_history(user_id);
CREATE INDEX IF NOT EXISTS search_history_category_idx ON search_history(category);

CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    preference_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    rank INTEGER,
    score DECIMAL(5, 4),
    score_breakdown JSON,
    explanation TEXT,
    constraint_violations JSON,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS recommendations_user_id_idx ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS recommendations_preference_id_idx ON recommendations(preference_id);
CREATE INDEX IF NOT EXISTS recommendations_product_id_idx ON recommendations(product_id);

CREATE TABLE IF NOT EXISTS comparisons (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    product_ids JSON,
    comparison JSON,
    explanations JSON,
    tradeoff_analysis TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comparisons_user_id_idx ON comparisons(user_id);

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    messages JSON,
    preference_id INTEGER,
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations(user_id);
CREATE INDEX IF NOT EXISTS conversations_preference_id_idx ON conversations(preference_id);
`;

async function run() {
  try {
    console.log('Applying database schema to Neon PostgreSQL...');
    await pool.query(ddl);
    console.log('✅ Schema migration succeeded!');

    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Created tables in database:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
