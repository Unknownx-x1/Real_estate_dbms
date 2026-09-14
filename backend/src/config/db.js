// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/config/db.js
// Raw PostgreSQL Connection Pool using node-postgres (pg)
// ============================================================================

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/real_estate_db';

const poolConfig = {
    connectionString,
    max: 20, // maximum connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
};

// Enable SSL if explicitly configured or if connecting to cloud provider
if (process.env.DB_SSL === 'true' || (connectionString && connectionString.includes('sslmode=require'))) {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
});

module.exports = {
    pool,
    /**
     * Execute a single parameterized SQL query.
     * @param {string} text - SQL statement with placeholders ($1, $2, ...)
     * @param {Array} params - Array of parameter values
     */
    query: (text, params) => pool.query(text, params),

    /**
     * Acquire a dedicated client from the pool for multi-statement transactions.
     * Must call client.release() when finished.
     */
    getClient: () => pool.connect(),
};
