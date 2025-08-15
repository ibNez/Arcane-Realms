-- Initialize game database schema and seed data

CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed an initial player for testing
INSERT INTO players (name) VALUES ('Test Player')
ON CONFLICT (name) DO NOTHING;
