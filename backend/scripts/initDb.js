// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/scripts/initDb.js
// Automated Database Initialization & Rebuild Script
// Executes: schema.sql -> constraints.sql -> views.sql -> triggers.sql -> functions.sql -> indexes.sql -> seed.sql
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

async function runSqlFile(client, relativePath) {
    const fullPath = path.resolve(__dirname, '../../', relativePath);
    console.log(`[SQL Runner] Executing ${relativePath}...`);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
    }
    const sql = fs.readFileSync(fullPath, 'utf8');
    await client.query(sql);
    console.log(`[SQL Runner] ✓ Finished ${relativePath}`);
}

async function initDatabase() {
    const client = await pool.connect();
    try {
        console.log('====================================================================');
        console.log('STARTING DATABASE INITIALIZATION (13 RELATIONS, CONSTRAINTS, SEED)');
        console.log(`Target: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
        console.log('====================================================================');

        await runSqlFile(client, 'db/schema.sql');
        await runSqlFile(client, 'db/constraints.sql');
        await runSqlFile(client, 'db/views.sql');
        await runSqlFile(client, 'db/triggers.sql');
        await runSqlFile(client, 'db/functions.sql');
        await runSqlFile(client, 'db/indexes.sql');
        await runSqlFile(client, 'db/seed.sql');

        console.log('====================================================================');
        console.log('✓ ALL 13 RELATIONS, CONSTRAINTS, VIEWS, TRIGGERS & SEED DATA APPLIED');
        console.log('====================================================================');
    } catch (err) {
        console.error('[Error] Database initialization failed:');
        console.error(err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

initDatabase();
