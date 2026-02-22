CREATE TABLE polymarket_opportunities (
  id SERIAL PRIMARY KEY,
  market_name TEXT,
  outcome_a TEXT,
  outcome_b TEXT,
  price_a DECIMAL,
  price_b DECIMAL,
  price_sum DECIMAL,
  profit_percent DECIMAL,
  scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE polymarket_scans (
  id SERIAL PRIMARY KEY,
  scanned_at TIMESTAMPTZ,
  markets_scanned INTEGER,
  opportunities_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
