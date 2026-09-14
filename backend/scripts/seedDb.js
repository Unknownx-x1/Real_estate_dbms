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

const pool = new Pool({
    connectionString,
    ssl: process.env.DB_SSL === 'true' || (connectionString && connectionString.includes('sslmode=require')) 
        ? { rejectUnauthorized: false } 
        : false
});

async function seedDatabase() {
    const client = await pool.connect();
    try {
        const fullPath = path.resolve(__dirname, '../../db/seed.sql');
        console.log(`[Seed Runner] Reading db/seed.sql...`);
        const sql = fs.readFileSync(fullPath, 'utf8');
        await client.query(sql);
        console.log(`[Seed Runner] ✓ Database re-seeded successfully.`);
    } catch (err) {
        console.error('[Error] Seeding failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seedDatabase();
