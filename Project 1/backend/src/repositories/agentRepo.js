// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/agentRepo.js
// Parameterized SQL Repository for AGENT Subtype
// ============================================================================

const db = require('../config/db');

const agentRepo = {
    async create(personId, client = null) {
        const sql = `
            INSERT INTO AGENT (PersonID)
            VALUES ($1)
            RETURNING AgentID, PersonID;
        `;
        const res = client ? await client.query(sql, [personId]) : await db.query(sql, [personId]);
        return res.rows[0];
    },

    async findById(agentId) {
        const sql = `
            SELECT a.AgentID, a.PersonID, p.FirstName, p.MiddleName, p.LastName, p.Email, p.PhoneNo, p.DateOfBirth
            FROM AGENT a
            JOIN PERSON p ON a.PersonID = p.PersonID
            WHERE a.AgentID = $1;
        `;
        const res = await db.query(sql, [agentId]);
        return res.rows[0] || null;
    },

    async findByPersonId(personId, client = null) {
        const sql = `
            SELECT AgentID, PersonID
            FROM AGENT
            WHERE PersonID = $1;
        `;
        const res = client ? await client.query(sql, [personId]) : await db.query(sql, [personId]);
        return res.rows[0] || null;
    },

    async findAll() {
        const sql = `
            SELECT a.AgentID, a.PersonID, p.FirstName, p.LastName, p.Email, p.PhoneNo
            FROM AGENT a
            JOIN PERSON p ON a.PersonID = p.PersonID
            ORDER BY a.AgentID ASC;
        `;
        const res = await db.query(sql);
        return res.rows;
    }
};

module.exports = agentRepo;
