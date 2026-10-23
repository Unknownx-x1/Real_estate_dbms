// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/server.js
// Server Entrypoint
// ============================================================================

const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connectivity
        const res = await db.query('SELECT NOW() AS current_time;');
        console.log(`[Database] PostgreSQL connection established successfully at ${res.rows[0].current_time}`);

        // Check if database tables exist; if uninitialized or AUTO_INIT is true, auto-init and pre-seed
        const tableCheck = await db.query("SELECT to_regclass('public.person') AS table_exists;");
        if (!tableCheck.rows[0].table_exists || process.env.AUTO_INIT === 'true') {
            console.log('[Database] Uninitialized database detected. Automatically building schema and pre-seeding demo data...');
            const { initDatabase } = require('../scripts/initDb');
            try {
                await initDatabase();
                console.log('[Database] ✓ Automatic schema initialization and pre-seeding completed.');
            } catch (initErr) {
                console.error('[Database] Automatic init notice:', initErr.message);
            }
        }

        app.listen(PORT, () => {
            console.log(`[Server] Real Estate Backend running on http://localhost:${PORT}`);
            console.log(`[Server] Health Check available at http://localhost:${PORT}/api/health`);
        });
    } catch (err) {
        console.error('[Fatal] Unable to connect to PostgreSQL database:', err.message);
        console.error('[Notice] Please verify DATABASE_URL in your .env file or run PostgreSQL.');
        
        // Still launch the HTTP server so health check / docs / mock flows can respond
        app.listen(PORT, () => {
            console.log(`[Server] Server started on http://localhost:${PORT} (PostgreSQL disconnected)`);
        });
    }
};

startServer();
