// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/scripts/seedGraphDb.js
// FalkorDB Graph Seeder & PostgreSQL-to-Graph Sync Engine
// ============================================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pgDb = require('../src/config/db');
const { getGraph, checkHealth } = require('../src/config/falkorDb');

async function seedGraphFromPostgres() {
    console.log('------------------------------------------------------------');
    console.log('[FalkorDB Seeder] Starting Graph Synchronization Engine...');
    console.log('------------------------------------------------------------');

    const graph = await getGraph();
    if (!graph) {
        throw new Error('FalkorDB is not connected. Ensure container is running at ' + (process.env.FALKORDB_URL || 'redis://localhost:6379'));
    }

    // 1. Clear existing graph to ensure clean baseline
    console.log('[FalkorDB Seeder] Clearing existing graph nodes & edges...');
    try {
        await graph.delete();
        console.log('[FalkorDB Seeder] ✓ Graph cleared.');
    } catch (e) {
        // Graph might not exist yet
    }

    // 2. Fetch all relational data from PostgreSQL
    console.log('[FalkorDB Seeder] Extracting entities & relationships from PostgreSQL...');
    
    // Query Customers & Persons
    const customersRes = await pgDb.query(`
        SELECT c.CustomerID, p.PersonID, p.FirstName || ' ' || p.LastName AS FullName, p.Email, p.PhoneNo
        FROM CUSTOMER c
        JOIN PERSON p ON c.PersonID = p.PersonID
    `);

    // Query Agents & Persons
    const agentsRes = await pgDb.query(`
        SELECT a.AgentID, p.PersonID, p.FirstName || ' ' || p.LastName AS FullName, p.Email, p.PhoneNo
        FROM AGENT a
        JOIN PERSON p ON a.PersonID = p.PersonID
    `);

    // Query Property Types
    const typesRes = await pgDb.query(`SELECT PropertyTypeID, TypeName FROM PROPERTY_TYPE`);

    // Query Properties
    const propertiesRes = await pgDb.query(`
        SELECT p.PropertyID, p.AreaSqFt, p.Price, p.Description, pt.TypeName, pt.PropertyTypeID
        FROM PROPERTY p
        JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
    `);

    // Query Ownerships
    const ownershipsRes = await pgDb.query(`
        SELECT CustomerID, PropertyID, OwnershipShare, SinceDate::text AS SinceDate
        FROM OWNERSHIP
    `);

    // Query Listings
    const listingsRes = await pgDb.query(`
        SELECT l.ListingID, l.PropertyID, l.AgentID, l.ListPrice, l.ListedDate::text AS ListedDate, l.Status
        FROM LISTING l
    `);

    // Query Offers
    const offersRes = await pgDb.query(`
        SELECT OfferID, CustomerID, ListingID, OfferAmount, Status, OfferDate::text AS OfferDate
        FROM OFFER
    `);

    // Query Reviews
    const reviewsRes = await pgDb.query(`
        SELECT ReviewID, CustomerID, ListingID, Rating, Comment, ReviewDate::text AS ReviewDate
        FROM REVIEW
    `);

    console.log(`[FalkorDB Seeder] Loaded ${customersRes.rows.length} Customers, ${agentsRes.rows.length} Agents, ${propertiesRes.rows.length} Properties, ${listingsRes.rows.length} Listings.`);

    // 3. Create Indexes in FalkorDB
    console.log('[FalkorDB Seeder] Creating GraphBLAS Range Indexes...');
    try {
        await graph.createNodeRangeIndex('Customer', 'customerId');
        await graph.createNodeRangeIndex('Agent', 'agentId');
        await graph.createNodeRangeIndex('Property', 'propertyId');
        await graph.createNodeRangeIndex('Listing', 'listingId');
        await graph.createNodeRangeIndex('PropertyType', 'typeId');
    } catch (e) {
        // Indexes might already be present
    }

    // 4. Batch Insert Nodes into FalkorDB
    console.log('[FalkorDB Seeder] Seeding Nodes...');

    // Seed Property Types
    for (const pt of typesRes.rows) {
        await graph.query(
            `CREATE (:PropertyType { typeId: $typeId, name: $name })`,
            { params: { typeId: Number(pt.propertytypeid), name: pt.typename } }
        );
    }

    // Seed Customers
    for (const c of customersRes.rows) {
        await graph.query(
            `CREATE (:Customer { customerId: $customerId, personId: $personId, name: $name, email: $email, phone: $phone })`,
            {
                params: {
                    customerId: Number(c.customerid),
                    personId: Number(c.personid),
                    name: c.fullname,
                    email: c.email,
                    phone: c.phoneno || ''
                }
            }
        );
    }

    // Seed Agents
    for (const a of agentsRes.rows) {
        await graph.query(
            `CREATE (:Agent { agentId: $agentId, personId: $personId, name: $name, email: $email, phone: $phone })`,
            {
                params: {
                    agentId: Number(a.agentid),
                    personId: Number(a.personid),
                    name: a.fullname,
                    email: a.email,
                    phone: a.phoneno || ''
                }
            }
        );
    }

    // Seed Properties & Link to PropertyType
    for (const p of propertiesRes.rows) {
        await graph.query(`
            CREATE (prop:Property { 
                propertyId: $propId, 
                areaSqFt: $area, 
                price: $price, 
                description: $desc,
                typeName: $typeName
            })
            WITH prop
            MATCH (pt:PropertyType { typeId: $typeId })
            CREATE (prop)-[:IS_TYPE]->(pt)
        `, {
            params: {
                propId: Number(p.propertyid),
                area: Number(p.areasqft),
                price: Number(p.price),
                desc: p.description || '',
                typeName: p.typename,
                typeId: Number(p.propertytypeid)
            }
        });
    }

    // Seed Listings & Link to Property & Agent
    for (const l of listingsRes.rows) {
        await graph.query(`
            CREATE (list:Listing { 
                listingId: $listingId, 
                listPrice: $price, 
                listedDate: $date, 
                status: $status 
            })
            WITH list
            MATCH (p:Property { propertyId: $propId })
            MATCH (a:Agent { agentId: $agentId })
            CREATE (list)-[:FOR_PROPERTY]->(p)
            CREATE (a)-[:REPRESENTS]->(list)
        `, {
            params: {
                listingId: Number(l.listingid),
                price: Number(l.listprice),
                date: l.listeddate,
                status: l.status,
                propId: Number(l.propertyid),
                agentId: Number(l.agentid)
            }
        });
    }

    // 5. Seed Relationships: Ownerships
    console.log('[FalkorDB Seeder] Creating OWNS relationships...');
    for (const o of ownershipsRes.rows) {
        await graph.query(`
            MATCH (c:Customer { customerId: $customerId })
            MATCH (p:Property { propertyId: $propertyId })
            CREATE (c)-[:OWNS { share: $share, since: $since }]->(p)
        `, {
            params: {
                customerId: Number(o.customerid),
                propertyId: Number(o.propertyid),
                share: Number(o.ownershipshare),
                since: o.sincedate
            }
        });
    }

    // Seed Relationships: Offers
    console.log('[FalkorDB Seeder] Creating MADE_OFFER relationships...');
    for (const ofr of offersRes.rows) {
        await graph.query(`
            MATCH (c:Customer { customerId: $customerId })
            MATCH (l:Listing { listingId: $listingId })
            CREATE (c)-[:MADE_OFFER { 
                offerId: $offerId, 
                amount: $amount, 
                status: $status, 
                date: $date 
            }]->(l)
        `, {
            params: {
                customerId: Number(ofr.customerid),
                listingId: Number(ofr.listingid),
                offerId: Number(ofr.offerid),
                amount: Number(ofr.offeramount),
                status: ofr.status,
                date: ofr.offerdate
            }
        });
    }

    // Seed Relationships: Reviews
    console.log('[FalkorDB Seeder] Creating REVIEWED relationships...');
    for (const r of reviewsRes.rows) {
        await graph.query(`
            MATCH (c:Customer { customerId: $customerId })
            MATCH (l:Listing { listingId: $listingId })
            CREATE (c)-[:REVIEWED { 
                reviewId: $reviewId, 
                rating: $rating, 
                comment: $comment, 
                date: $date 
            }]->(l)
        `, {
            params: {
                customerId: Number(r.customerid),
                listingId: Number(r.listingid),
                reviewId: Number(r.reviewid),
                rating: Number(r.rating),
                comment: r.comment || '',
                date: r.reviewdate
            }
        });
    }

    const health = await checkHealth();
    console.log('------------------------------------------------------------');
    console.log(`[FalkorDB Seeder] ✓ Graph Seeding Complete!`);
    console.log(`[FalkorDB Seeder] Total Nodes: ${health.stats.nodes}, Total Edges: ${health.stats.relationships}`);
    console.log('------------------------------------------------------------');

    return {
        success: true,
        stats: health.stats
    };
}

module.exports = { seedGraphFromPostgres };

if (require.main === module) {
    seedGraphFromPostgres()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('[FalkorDB Seeder Error]:', err);
            process.exit(1);
        });
}
