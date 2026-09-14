// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/services/authService.js
// Authentication Service: Multi-table Atomic Registration & JWT Issuance
// ============================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const personRepo = require('../repositories/personRepo');
const customerRepo = require('../repositories/customerRepo');
const agentRepo = require('../repositories/agentRepo');

const authService = {
    /**
     * Atomic User Registration: PERSON + CUSTOMER/AGENT in a single DB Transaction
     */
    async register({ firstName, middleName, lastName, email, phoneNo, dateOfBirth, password, role }) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Check if email already exists
            const existingPerson = await personRepo.findByEmail(email);
            if (existingPerson) {
                const err = new Error('A user with this email address already exists.');
                err.statusCode = 409;
                err.code = 'EMAIL_ALREADY_EXISTS';
                throw err;
            }

            // 2. Validate Role
            const normalizedRole = (role || 'CUSTOMER').toUpperCase();
            if (!['CUSTOMER', 'AGENT'].includes(normalizedRole)) {
                const err = new Error('Invalid role specified. Role must be either CUSTOMER or AGENT.');
                err.statusCode = 400;
                err.code = 'INVALID_ROLE';
                throw err;
            }

            // 3. Hash Password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 4. Create PERSON record
            const person = await personRepo.create({
                firstName,
                middleName,
                lastName,
                email,
                phoneNo,
                dateOfBirth,
                passwordHash
            }, client);

            // 5. Create Subtype record
            let customerRecord = null;
            let agentRecord = null;

            if (normalizedRole === 'CUSTOMER') {
                customerRecord = await customerRepo.create(person.personid, client);
            } else if (normalizedRole === 'AGENT') {
                agentRecord = await agentRepo.create(person.personid, client);
            }

            await client.query('COMMIT');

            // 6. Issue JWT Token
            const tokenPayload = {
                personId: person.personid,
                email: person.email,
                role: normalizedRole,
                customerId: customerRecord ? customerRecord.customerid : null,
                agentId: agentRecord ? agentRecord.agentid : null
            };

            const token = jwt.sign(
                tokenPayload,
                process.env.JWT_SECRET || 'supersecretjwtkey_realestate_management_system_2024',
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            return {
                token,
                user: {
                    personId: person.personid,
                    firstName: person.firstname,
                    lastName: person.lastname,
                    email: person.email,
                    role: normalizedRole,
                    customerId: tokenPayload.customerId,
                    agentId: tokenPayload.agentId
                }
            };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    /**
     * User Login: Verify password hash & generate JWT
     */
    async login({ email, password }) {
        if (!email || !password) {
            const err = new Error('Email and password are required.');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            throw err;
        }

        const person = await personRepo.findByEmail(email);
        if (!person) {
            const err = new Error('Invalid email or password.');
            err.statusCode = 401;
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }

        const isMatch = await bcrypt.compare(password, person.passwordhash);
        if (!isMatch) {
            const err = new Error('Invalid email or password.');
            err.statusCode = 401;
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }

        // Determine subtype role
        const customer = await customerRepo.findByPersonId(person.personid);
        const agent = await agentRepo.findByPersonId(person.personid);

        let role = 'CUSTOMER';
        if (agent) {
            role = 'AGENT';
        }

        const tokenPayload = {
            personId: person.personid,
            email: person.email,
            role,
            customerId: customer ? customer.customerid : null,
            agentId: agent ? agent.agentid : null
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET || 'supersecretjwtkey_realestate_management_system_2024',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return {
            token,
            user: {
                personId: person.personid,
                firstName: person.firstname,
                lastName: person.lastname,
                email: person.email,
                role,
                customerId: tokenPayload.customerId,
                agentId: tokenPayload.agentId
            }
        };
    },

    async getCurrentUser(personId) {
        const person = await personRepo.findById(personId);
        if (!person) {
            const err = new Error('User not found.');
            err.statusCode = 404;
            err.code = 'USER_NOT_FOUND';
            throw err;
        }

        const customer = await customerRepo.findByPersonId(personId);
        const agent = await agentRepo.findByPersonId(personId);

        return {
            personId: person.personid,
            firstName: person.firstname,
            middleName: person.middlename,
            lastName: person.lastname,
            email: person.email,
            phoneNo: person.phoneno,
            dateOfBirth: person.dateofbirth,
            role: agent ? 'AGENT' : 'CUSTOMER',
            customerId: customer ? customer.customerid : null,
            agentId: agent ? agent.agentid : null
        };
    }
};

module.exports = authService;
