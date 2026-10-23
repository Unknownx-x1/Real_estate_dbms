// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/personRepo.js
// Parameterized SQL Repository for PERSON Entity
// ============================================================================

const db = require('../config/db');

const personRepo = {
    async create({ firstName, middleName, lastName, email, phoneNo, dateOfBirth, passwordHash }, client = null) {
        const sql = `
            INSERT INTO PERSON (FirstName, MiddleName, LastName, Email, PhoneNo, DateOfBirth, PasswordHash)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING PersonID, FirstName, MiddleName, LastName, Email, PhoneNo, DateOfBirth, CreatedAt;
        `;
        const params = [firstName, middleName || null, lastName, email.toLowerCase(), phoneNo || null, dateOfBirth, passwordHash];
        const res = client ? await client.query(sql, params) : await db.query(sql, params);
        return res.rows[0];
    },

    async findById(personId) {
        const sql = `
            SELECT PersonID, FirstName, MiddleName, LastName, Email, PhoneNo, DateOfBirth, CreatedAt
            FROM PERSON
            WHERE PersonID = $1;
        `;
        const res = await db.query(sql, [personId]);
        return res.rows[0] || null;
    },

    async findByEmail(email) {
        const sql = `
            SELECT PersonID, FirstName, MiddleName, LastName, Email, PhoneNo, DateOfBirth, PasswordHash, CreatedAt
            FROM PERSON
            WHERE LOWER(Email) = LOWER($1);
        `;
        const res = await db.query(sql, [email]);
        return res.rows[0] || null;
    },

    async update(personId, { firstName, middleName, lastName, phoneNo }) {
        const sql = `
            UPDATE PERSON
            SET FirstName = COALESCE($2, FirstName),
                MiddleName = COALESCE($3, MiddleName),
                LastName = COALESCE($4, LastName),
                PhoneNo = COALESCE($5, PhoneNo)
            WHERE PersonID = $1
            RETURNING PersonID, FirstName, MiddleName, LastName, Email, PhoneNo, DateOfBirth, CreatedAt;
        `;
        const res = await db.query(sql, [personId, firstName, middleName, lastName, phoneNo]);
        return res.rows[0] || null;
    },

    async delete(personId) {
        const sql = `DELETE FROM PERSON WHERE PersonID = $1 RETURNING PersonID;`;
        const res = await db.query(sql, [personId]);
        return res.rows[0] || null;
    }
};

module.exports = personRepo;
