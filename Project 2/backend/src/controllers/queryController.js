// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/controllers/queryController.js
// Interactive SQL Query Controller & Schema Introspection
// ============================================================================

const db = require('../config/db');
const { performance } = require('perf_hooks');

/**
 * Executes an arbitrary SQL query against the PostgreSQL database.
 * Returns execution latency, affected row count, column definitions, and row data.
 */
exports.executeQuery = async (req, res) => {
    const { sql } = req.body;

    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'A non-empty SQL query string is required.',
                code: 'INVALID_QUERY'
            }
        });
    }

    const trimmedSql = sql.trim();
    const startTime = performance.now();

    try {
        const rawResult = await db.query(trimmedSql);
        const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

        // In node-postgres, multi-statement queries return an array of results
        if (Array.isArray(rawResult)) {
            // Find the last statement that returned rows, or the last statement executed
            const lastWithRows = [...rawResult].reverse().find(r => r.rows && r.rows.length > 0);
            const finalResult = lastWithRows || rawResult[rawResult.length - 1];

            return res.status(200).json({
                success: true,
                command: rawResult.map(r => r.command).join('; '),
                rowCount: finalResult ? (finalResult.rowCount || 0) : 0,
                fields: finalResult ? (finalResult.fields || []).map(f => ({
                    name: f.name,
                    dataTypeID: f.dataTypeID
                })) : [],
                rows: finalResult ? (finalResult.rows || []) : [],
                totalStatements: rawResult.length,
                executionTimeMs
            });
        }

        return res.status(200).json({
            success: true,
            command: rawResult.command,
            rowCount: rawResult.rowCount || 0,
            fields: (rawResult.fields || []).map(f => ({
                name: f.name,
                dataTypeID: f.dataTypeID
            })),
            rows: rawResult.rows || [],
            executionTimeMs
        });
    } catch (err) {
        const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

        // Return HTTP 200 with success: false so the UI query console can display PostgreSQL error diagnostics cleanly
        return res.status(200).json({
            success: false,
            error: {
                message: err.message,
                code: err.code || 'SQL_EXEC_ERROR',
                position: err.position || null,
                detail: err.detail || null,
                hint: err.hint || null,
                table: err.table || null,
                constraint: err.constraint || null
            },
            executionTimeMs
        });
    }
};

/**
 * Returns the live relational schema (tables and columns) from PostgreSQL information_schema.
 */
exports.getSchema = async (req, res, next) => {
    try {
        const queryText = `
            SELECT 
                t.table_name AS "tableName",
                c.column_name AS "columnName",
                c.data_type AS "dataType",
                c.is_nullable AS "isNullable",
                c.column_default AS "columnDefault"
            FROM information_schema.tables t
            JOIN information_schema.columns c 
                ON t.table_name = c.table_name 
               AND t.table_schema = c.table_schema
            WHERE t.table_schema = 'public' 
              AND t.table_type = 'BASE TABLE'
            ORDER BY t.table_name, c.ordinal_position;
        `;

        const result = await db.query(queryText);

        // Group columns by table name
        const tablesMap = {};
        for (const row of result.rows) {
            if (!tablesMap[row.tableName]) {
                tablesMap[row.tableName] = {
                    tableName: row.tableName,
                    columns: []
                };
            }
            tablesMap[row.tableName].columns.push({
                columnName: row.columnName,
                dataType: row.dataType,
                isNullable: row.isNullable === 'YES',
                columnDefault: row.columnDefault
            });
        }

        res.status(200).json({
            success: true,
            tables: Object.values(tablesMap)
        });
    } catch (err) {
        next(err);
    }
};
