// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/controllers/graphController.js
// FalkorDB Controller (GraphBLAS Graph Operations, Recommendations & Benchmarks)
// ============================================================================

const { queryGraph, checkHealth, getGraph } = require('../config/falkorDb');
const pgDb = require('../config/db');

/**
 * Health check & Graph statistics
 */
async function getGraphHealth(req, res, next) {
    try {
        const health = await checkHealth();
        return res.status(200).json({
            success: true,
            data: health
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Returns full graph network formatted for visual canvas (Nodes and Edges)
 */
async function getGraphNetwork(req, res, next) {
    try {
        const limit = Number(req.query.limit) || 100;
        
        // Fetch nodes and relationships
        const cypher = `
            MATCH (n)
            OPTIONAL MATCH (n)-[r]->(m)
            RETURN n, r, m
            LIMIT ${limit}
        `;

        const queryResult = await queryGraph(cypher);

        const nodesMap = new Map();
        const links = [];

        // Parse FalkorDB result
        if (queryResult.data && Array.isArray(queryResult.data)) {
            for (const row of queryResult.data) {
                const sourceNode = row.n ?? row[0];
                const relationship = row.r ?? row[1];
                const targetNode = row.m ?? row[2];

                if (sourceNode) {
                    const id = String(sourceNode.id ?? (sourceNode.properties && (sourceNode.properties.customerId || sourceNode.properties.propertyId || sourceNode.properties.listingId || sourceNode.properties.agentId)));
                    const label = (sourceNode.labels && sourceNode.labels[0]) || 'Node';
                    const name = sourceNode.properties?.name || sourceNode.properties?.description || `${label} #${id}`;
                    nodesMap.set(id, {
                        id,
                        label,
                        name,
                        properties: sourceNode.properties || {}
                    });
                }

                if (targetNode) {
                    const id = String(targetNode.id ?? (targetNode.properties && (targetNode.properties.customerId || targetNode.properties.propertyId || targetNode.properties.listingId || targetNode.properties.agentId)));
                    const label = (targetNode.labels && targetNode.labels[0]) || 'Node';
                    const name = targetNode.properties?.name || targetNode.properties?.description || `${label} #${id}`;
                    nodesMap.set(id, {
                        id,
                        label,
                        name,
                        properties: targetNode.properties || {}
                    });
                }

                if (relationship && sourceNode && targetNode) {
                    const sourceId = String(sourceNode.id ?? (sourceNode.properties && (sourceNode.properties.customerId || sourceNode.properties.propertyId || sourceNode.properties.listingId || sourceNode.properties.agentId)));
                    const targetId = String(targetNode.id ?? (targetNode.properties && (targetNode.properties.customerId || targetNode.properties.propertyId || targetNode.properties.listingId || targetNode.properties.agentId)));
                    links.push({
                        source: sourceId,
                        target: targetId,
                        type: relationship.type || 'RELATED_TO',
                        properties: relationship.properties || {}
                    });
                }
            }
        }

        return res.status(200).json({
            success: true,
            network: {
                nodes: Array.from(nodesMap.values()),
                links
            },
            executionTimeMs: queryResult.executionTimeMs
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Collaborative Filtering: Recommends properties using multi-hop graph affinity
 */
async function getRecommendations(req, res, next) {
    try {
        const customerId = Number(req.params.customerId) || 1;

        // Multi-hop recommendation query:
        // Finds what properties other patrons who made offers on the same listings have also targeted
        const cypher = `
            MATCH (c1:Customer { customerId: $customerId })-[:MADE_OFFER]->(:Listing)-[:FOR_PROPERTY]->(p1:Property)
            MATCH (c2:Customer)-[:MADE_OFFER]->(:Listing)-[:FOR_PROPERTY]->(p1)
            MATCH (c2)-[:MADE_OFFER]->(l2:Listing)-[:FOR_PROPERTY]->(rec:Property)
            WHERE c1 <> c2 AND NOT (c1)-[:MADE_OFFER]->(:Listing)-[:FOR_PROPERTY]->(rec)
            RETURN DISTINCT 
                rec.propertyId AS propertyId, 
                rec.description AS description, 
                rec.price AS price, 
                rec.areaSqFt AS areaSqFt,
                rec.typeName AS typeName, 
                count(*) AS affinityScore
            ORDER BY affinityScore DESC
            LIMIT 5
        `;

        let queryResult = await queryGraph(cypher, { customerId });
        let recommendations = [];

        if (queryResult.data && queryResult.data.length > 0) {
            recommendations = queryResult.data.map(row => ({
                propertyId: row.propertyId ?? row[0],
                propertyName: row.description ?? row[1],
                price: row.price ?? row[2],
                areaSqFt: row.areaSqFt ?? row[3],
                propertyType: row.typeName ?? row[4],
                affinityScore: Number(row.affinityScore ?? row[5] ?? 1)
            }));
        } else {
            // Fallback: If no co-offer history, return top properties linked to highest-rated listings
            const fallbackCypher = `
                MATCH (p:Property)<-[:FOR_PROPERTY]-(l:Listing)<-[r:REVIEWED]-(:Customer)
                RETURN 
                    p.propertyId AS propertyId, 
                    p.description AS description, 
                    p.price AS price, 
                    p.areaSqFt AS areaSqFt,
                    p.typeName AS typeName, 
                    avg(r.rating) AS avgRating
                ORDER BY avgRating DESC
                LIMIT 4
            `;
            const fallbackResult = await queryGraph(fallbackCypher);
            if (fallbackResult.data) {
                recommendations = fallbackResult.data.map(row => ({
                    propertyId: row.propertyId ?? row[0],
                    propertyName: row.description ?? row[1],
                    price: row.price ?? row[2],
                    areaSqFt: row.areaSqFt ?? row[3],
                    propertyType: row.typeName ?? row[4],
                    affinityScore: Number(Number(row.avgRating ?? row[5] ?? 5).toFixed(1))
                }));
            }
        }

        return res.status(200).json({
            success: true,
            customerId,
            recommendations,
            executionTimeMs: queryResult.executionTimeMs
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Execute raw OpenCypher query from the frontend console
 */
async function executeCypherQuery(req, res, next) {
    try {
        const { query: cypherText, params } = req.body;
        if (!cypherText || typeof cypherText !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Query parameter is required and must be a valid Cypher string.'
            });
        }

        const result = await queryGraph(cypherText, params || {});
        return res.status(200).json({
            success: true,
            headers: result.headers,
            rows: result.data,
            metadata: result.metadata,
            executionTimeMs: result.executionTimeMs
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            error: {
                message: err.message
            }
        });
    }
}

/**
 * Performance Benchmark: Side-by-side SQL vs FalkorDB GraphBLAS multi-hop traversal
 */
async function runBenchmark(req, res, next) {
    try {
        // 1. Relational SQL 4-hop query via PostgreSQL
        const sqlQuery = `
            SELECT p.PropertyID, p.Price, count(DISTINCT ofr.OfferID) as total_offers
            FROM PROPERTY p
            JOIN OWNERSHIP o ON p.PropertyID = o.PropertyID
            JOIN CUSTOMER c ON o.CustomerID = c.CustomerID
            JOIN OFFER ofr ON c.CustomerID = ofr.CustomerID
            JOIN LISTING l ON ofr.ListingID = l.ListingID
            JOIN AGENT a ON l.AgentID = a.AgentID
            GROUP BY p.PropertyID, p.Price
            LIMIT 10;
        `;
        const sqlStart = performance.now();
        const sqlResult = await pgDb.query(sqlQuery);
        const sqlTimeMs = Number((performance.now() - sqlStart).toFixed(2));

        // 2. FalkorDB GraphBLAS Cypher 4-hop query
        const cypherQuery = `
            MATCH (a:Agent)<-[:REPRESENTS]-(l:Listing)<-[:MADE_OFFER]-(c:Customer)-[:OWNS]->(p:Property)
            RETURN p.propertyId, p.price, count(*)
            LIMIT 10
        `;
        let falkorTimeMs = 0;
        let falkorSuccess = false;
        try {
            const falkorRes = await queryGraph(cypherQuery);
            falkorTimeMs = falkorRes.executionTimeMs;
            falkorSuccess = true;
        } catch (e) {
            falkorTimeMs = -1;
        }

        const speedup = (falkorSuccess && falkorTimeMs > 0)
            ? Number((sqlTimeMs / falkorTimeMs).toFixed(2))
            : null;

        return res.status(200).json({
            success: true,
            benchmark: {
                queryType: '4-Hop Multi-Entity Traversal (Property -> Ownership -> Customer -> Offer -> Listing -> Agent)',
                postgres: {
                    executionTimeMs: sqlTimeMs,
                    rowsReturned: sqlResult.rows.length,
                    engine: 'PostgreSQL Relational B-Tree & Hash Joins'
                },
                falkordb: {
                    executionTimeMs: falkorTimeMs,
                    engine: 'FalkorDB GraphBLAS (Sparse Matrix Multiplication)',
                    status: falkorSuccess ? 'CONNECTED' : 'CONTAINER_OFFLINE'
                },
                speedupComparison: speedup ? `${speedup}x faster with GraphBLAS matrix operations` : 'Start FalkorDB container to view speedup'
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getGraphHealth,
    getGraphNetwork,
    getRecommendations,
    executeCypherQuery,
    runBenchmark
};
