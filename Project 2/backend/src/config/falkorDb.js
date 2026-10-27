// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/config/falkorDb.js
// FalkorDB (GraphBLAS Graph Engine) Connection Manager
// ============================================================================

const { FalkorDB } = require('falkordb');
require('dotenv').config();

const FALKORDB_URL = process.env.FALKORDB_URL || 'redis://localhost:6379';
const GRAPH_NAME = process.env.FALKORDB_GRAPH_NAME || 'real_estate_graph';

let client = null;
let graph = null;
let isConnected = false;
let lastError = null;

/**
 * Initializes and connects to FalkorDB instance.
 */
async function connectFalkor() {
    if (client && isConnected && graph) {
        return { client, graph };
    }

    try {
        console.log(`[FalkorDB] Connecting to ${FALKORDB_URL}...`);
        client = await FalkorDB.connect({ url: FALKORDB_URL });
        graph = client.selectGraph(GRAPH_NAME);
        isConnected = true;
        lastError = null;
        console.log(`[FalkorDB] ✓ Connected successfully to graph '${GRAPH_NAME}'`);
        return { client, graph };
    } catch (err) {
        isConnected = false;
        lastError = err.message;
        console.warn(`[FalkorDB Warning] Could not connect to FalkorDB (${FALKORDB_URL}): ${err.message}`);
        console.warn(`[FalkorDB Warning] Ensure FalkorDB container is running: 'docker compose up -d' or 'docker run -p 6379:6379 falkordb/falkordb'`);
        return { client: null, graph: null, error: err };
    }
}

/**
 * Get active Graph instance.
 */
async function getGraph() {
    if (!graph || !isConnected) {
        await connectFalkor();
    }
    return graph;
}

/**
 * Execute a Cypher query with timing and structured output.
 * @param {string} cypher - OpenCypher query string
 * @param {Object} [params] - Query parameters
 */
async function queryGraph(cypher, params = {}) {
    const activeGraph = await getGraph();
    if (!activeGraph) {
        throw new Error(`FalkorDB is unavailable. Please ensure FalkorDB is running at ${FALKORDB_URL}. Details: ${lastError || 'Disconnected'}`);
    }

    const start = performance.now();
    const result = await activeGraph.query(cypher, { params });
    const elapsedMs = Number((performance.now() - start).toFixed(2));

    let headers = Array.isArray(result.headers) && result.headers.length > 0 ? [...result.headers] : [];
    let rows = [];

    if (Array.isArray(result.data) && result.data.length > 0) {
        const first = result.data[0];
        if (Array.isArray(first)) {
            if (headers.length === 0) {
                headers = first.map((_, idx) => `Col ${idx + 1}`);
            }
            rows = result.data;
        } else if (typeof first === 'object' && first !== null) {
            if (headers.length === 0) {
                headers = Object.keys(first);
            }
            rows = result.data.map(obj => headers.map(h => {
                const val = obj[h];
                if (val && typeof val === 'object' && val.properties) {
                    return val.properties.name || val.properties.description || val.properties.id || JSON.stringify(val.properties);
                }
                return val;
            }));
        } else {
            headers = ['Result'];
            rows = result.data.map(val => [val]);
        }
    }

    return {
        data: result.data || [],
        rows,
        headers,
        metadata: result.metadata || [],
        executionTimeMs: elapsedMs,
    };
}

/**
 * Health check reporting node/edge statistics and engine status.
 */
async function checkHealth() {
    try {
        const activeGraph = await getGraph();
        if (!activeGraph) {
            return {
                status: 'DOWN',
                engine: 'FalkorDB (GraphBLAS)',
                url: FALKORDB_URL,
                graphName: GRAPH_NAME,
                error: lastError || 'Connection not established'
            };
        }

        // Count nodes and edges
        const countRes = await activeGraph.query(`
            MATCH (n)
            OPTIONAL MATCH (n)-[r]->()
            RETURN count(DISTINCT n) AS nodeCount, count(r) AS edgeCount
        `);

        let nodeCount = 0;
        let edgeCount = 0;
        if (countRes.data && countRes.data.length > 0) {
            const first = countRes.data[0];
            nodeCount = Number(first.nodeCount ?? first[0] ?? 0);
            edgeCount = Number(first.edgeCount ?? first[1] ?? 0);
        }

        return {
            status: 'UP',
            engine: 'FalkorDB (GraphBLAS)',
            url: FALKORDB_URL,
            graphName: GRAPH_NAME,
            stats: {
                nodes: nodeCount,
                relationships: edgeCount
            }
        };
    } catch (err) {
        return {
            status: 'DOWN',
            engine: 'FalkorDB (GraphBLAS)',
            url: FALKORDB_URL,
            graphName: GRAPH_NAME,
            error: err.message
        };
    }
}

/**
 * Close connection
 */
async function close() {
    if (client) {
        await client.close();
        isConnected = false;
        client = null;
        graph = null;
    }
}

module.exports = {
    connectFalkor,
    getGraph,
    queryGraph,
    checkHealth,
    close,
    GRAPH_NAME
};
