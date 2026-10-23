// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/scripts/seedDb.js
// Database Seed-Only Runner
// ============================================================================

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/real_estate_db';
const isRemoteDb = connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');

function getPool() {
    return new Pool({
        connectionString,
        ssl: process.env.DB_SSL === 'true' || (connectionString && connectionString.includes('sslmode=require')) || isRemoteDb
            ? { rejectUnauthorized: false } 
            : false
    });
}

async function seedDatabase() {
    const pool = getPool();
    const client = await pool.connect();
    try {
        const fullPath = path.resolve(__dirname, '../../db/seed.sql');
        console.log(`[Seed Runner] Reading db/seed.sql...`);
        const sql = fs.readFileSync(fullPath, 'utf8');
        await client.query(sql);
        console.log(`[Seed Runner] ✓ Database re-seeded successfully.`);
        return { success: true, message: 'Database re-seeded successfully with demo records across 13 relations' };
    } catch (err) {
        console.error('[Error] Seeding failed:', err.message);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

module.exports = { seedDatabase };

if (require.main === module) {
    seedDatabase().catch(() => process.exit(1));
}
