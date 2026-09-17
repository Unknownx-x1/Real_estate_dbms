import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Database, 
  Clock, 
  AlertCircle, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  Terminal, 
  ArrowLeft,
  RotateCcw,
  FileCode,
  Table as TableIcon
} from 'lucide-react';
import { apiClient, type QueryResult, type SchemaTable } from '../services/api';

interface SqlQueryWindowProps {
  onBack: () => void;
  onNavigatePatron?: () => void;
  onNavigateAgent?: () => void;
}

// Curated SQL Preset Templates directly from project specifications
interface PresetQuery {
  id: string;
  name: string;
  category: 'Relational Joins' | 'Aggregates' | 'Advanced (CTE / Window)' | 'Database Views' | 'Trigger Invariant Tests' | 'EXPLAIN ANALYZE';
  description: string;
  sql: string;
}

const PRESET_QUERIES: PresetQuery[] = [
  {
    id: 'five-table-join',
    name: '5-Table Relational Master Join',
    category: 'Relational Joins',
    description: 'Combines LISTING, PROPERTY, PROPERTY_TYPE, AGENT, and PERSON to produce full real estate dossiers.',
    sql: `SELECT 
    l.ListingID,
    l.ListPrice,
    l.ListedDate,
    l.Status AS ListingStatus,
    p.PropertyID,
    p.AreaSqFt,
    p.Price AS AppraisedValue,
    pt.TypeName AS ArchitecturalCategory,
    a.AgentID,
    CONCAT(per.FirstName, ' ', COALESCE(per.MiddleName || ' ', ''), per.LastName) AS AgentName,
    per.Email AS AgentEmail
FROM LISTING l
INNER JOIN PROPERTY p ON l.PropertyID = p.PropertyID
INNER JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
INNER JOIN AGENT a ON l.AgentID = a.AgentID
INNER JOIN PERSON per ON a.PersonID = per.PersonID
ORDER BY l.ListPrice DESC;`
  },
  {
    id: 'agent-performance',
    name: 'Agent Consignments & 3% Commission Yield',
    category: 'Aggregates',
    description: 'GROUP BY aggregation computing active listings, closed volume, and Atelier gross commission yield.',
    sql: `SELECT 
    a.AgentID,
    CONCAT(per.FirstName, ' ', per.LastName) AS AgentName,
    per.Email,
    COUNT(l.ListingID) AS TotalListings,
    COUNT(CASE WHEN l.Status = 'ACTIVE' THEN 1 END) AS ActiveListings,
    COUNT(CASE WHEN l.Status = 'SOLD' THEN 1 END) AS SoldListings,
    COALESCE(SUM(CASE WHEN l.Status = 'SOLD' THEN st.SalePrice ELSE 0 END), 0) AS ClosedSaleVolume,
    ROUND(COALESCE(SUM(CASE WHEN l.Status = 'SOLD' THEN st.SalePrice * 0.03 ELSE 0 END), 0), 2) AS CommissionYield3Percent
FROM AGENT a
JOIN PERSON per ON a.PersonID = per.PersonID
LEFT JOIN LISTING l ON a.AgentID = l.AgentID
LEFT JOIN TRANSACTION t ON l.ListingID = t.ListingID AND t.TransactionType = 'SALE'
LEFT JOIN SALE_TRANSACTION st ON t.TransactionID = st.TransactionID
GROUP BY a.AgentID, per.FirstName, per.LastName, per.Email
ORDER BY ClosedSaleVolume DESC;`
  },
  {
    id: 'typology-pricing',
    name: 'Typology Market Pricing Summary',
    category: 'Aggregates',
    description: 'Computes property volume, average valuation, and price ranges grouped by architectural typology.',
    sql: `SELECT 
    pt.PropertyTypeID,
    pt.TypeName AS ArchitecturalTypology,
    COUNT(p.PropertyID) AS TotalProperties,
    ROUND(AVG(p.Price), 2) AS AveragePrice,
    ROUND(MIN(p.Price), 2) AS MinimumPrice,
    ROUND(MAX(p.Price), 2) AS MaximumPrice,
    ROUND(AVG(p.Price / NULLIF(p.AreaSqFt, 0)), 2) AS AvgPricePerSqFt
FROM PROPERTY_TYPE pt
LEFT JOIN PROPERTY p ON pt.PropertyTypeID = p.PropertyTypeID
GROUP BY pt.PropertyTypeID, pt.TypeName
ORDER BY AveragePrice DESC;`
  },
  {
    id: 'cte-ranked-offers',
    name: 'CTE & Window Function (DENSE_RANK)',
    category: 'Advanced (CTE / Window)',
    description: 'Partitions incoming patron bids by listing and ranks offers by tender amount using DENSE_RANK().',
    sql: `WITH RankedOffers AS (
    SELECT 
        o.OfferID,
        o.ListingID,
        o.CustomerID,
        CONCAT(per.FirstName, ' ', per.LastName) AS PatronName,
        o.OfferAmount,
        o.OfferDate,
        o.Status,
        DENSE_RANK() OVER (PARTITION BY o.ListingID ORDER BY o.OfferAmount DESC) AS OfferRank
    FROM OFFER o
    JOIN CUSTOMER c ON o.CustomerID = c.CustomerID
    JOIN PERSON per ON c.PersonID = per.PersonID
)
SELECT * 
FROM RankedOffers 
WHERE OfferRank <= 3
ORDER BY ListingID, OfferRank ASC;`
  },
  {
    id: 'view-active-listings',
    name: 'Database View: active_listings_view',
    category: 'Database Views',
    description: 'Queries the pre-compiled database view with active listings, appraisal values, and agent assignments.',
    sql: `SELECT * FROM active_listings_view ORDER BY ListPrice DESC;`
  },
  {
    id: 'view-ownership-summary',
    name: 'Database View: property_ownership_summary',
    category: 'Database Views',
    description: 'Queries aggregated title allocations, deedholder counts, and remaining unassigned title percentages.',
    sql: `SELECT * FROM property_ownership_summary;`
  },
  {
    id: 'trigger-violation-test',
    name: 'Trigger Test: Invariant Violation (>100% Share)',
    category: 'Trigger Invariant Tests',
    description: 'Tests trg_validate_ownership_share: attempts to grant a 70% share on Property 1 (already 60% deeded) to trigger rejection.',
    sql: `-- Attempting to exceed 100% property ownership cap:
-- Property 1 already has 60% allocated to Customer 1.
-- This insert triggers EXCLUSION_VIOLATION in trg_validate_ownership_share:
INSERT INTO OWNERSHIP (CustomerID, PropertyID, OwnershipShare, SinceDate)
VALUES (2, 1, 70.00, CURRENT_DATE);`
  },
  {
    id: 'explain-analyze',
    name: 'EXPLAIN ANALYZE Query Profiler',
    category: 'EXPLAIN ANALYZE',
    description: 'Profiles PostgreSQL execution plan, sequential vs index scans, and timing buffers.',
    sql: `EXPLAIN ANALYZE
SELECT 
    l.ListingID, l.ListPrice, l.ListedDate, p.AreaSqFt, pt.TypeName
FROM LISTING l
JOIN PROPERTY p ON l.PropertyID = p.PropertyID
JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
WHERE l.Status = 'ACTIVE' 
  AND l.ListPrice BETWEEN 2000000 AND 9000000
ORDER BY l.ListedDate DESC;`
  }
];

const TABLES_LIST = [
  'PERSON', 'CUSTOMER', 'AGENT', 'PROPERTY_TYPE', 'PROPERTY', 
  'OWNERSHIP', 'LISTING', 'OFFER', 'TRANSACTION', 'SALE_TRANSACTION', 
  'RENTAL_CONTRACT', 'PAYMENT', 'REVIEW'
];

export const SqlQueryWindow: React.FC<SqlQueryWindowProps> = ({ 
  onBack, 
  onNavigatePatron, 
  onNavigateAgent 
}) => {
  const [sql, setSql] = useState<string>(PRESET_QUERIES[0].sql);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [schemaTables, setSchemaTables] = useState<SchemaTable[]>([]);
  const [isSchemaOpen, setIsSchemaOpen] = useState<boolean>(true);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({ PERSON: true, PROPERTY: true });
  const [copied, setCopied] = useState<boolean>(false);
  const [reseedStatus, setReseedStatus] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Fetch schema on mount
  useEffect(() => {
    apiClient.getSchema().then((data) => {
      if (data.tables) {
        setSchemaTables(data.tables);
      }
    });
  }, []);

  // Execute SQL Query
  const handleExecute = async () => {
    if (!sql.trim()) return;
    setIsExecuting(true);
    setResult(null);

    try {
      const res = await apiClient.executeQuery(sql);
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        error: {
          message: err.message || 'An unexpected error occurred during query execution.',
          code: 'CLIENT_ERROR'
        },
        executionTimeMs: 0
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Keyboard shortcut (Ctrl+Enter or Cmd+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  // 1-Click Select Table Query
  const handleSelectTable = (tableName: string) => {
    const newSql = `SELECT * FROM ${tableName} LIMIT 25;`;
    setSql(newSql);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 50);
  };

  // Load Preset Query
  const handleLoadPreset = (preset: PresetQuery) => {
    setSql(preset.sql);
    setResult(null);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Copy SQL to clipboard
  const handleCopySql = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Export Results as CSV
  const handleExportCSV = () => {
    if (!result?.rows || result.rows.length === 0) return;

    const headers = result.fields?.map(f => f.name) || Object.keys(result.rows[0]);
    const csvRows: string[] = [headers.join(',')];

    for (const row of result.rows) {
      const values = headers.map(header => {
        const val = row[header];
        if (val === null || val === undefined) return '';
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `query_result_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Results as JSON
  const handleExportJSON = () => {
    if (!result?.rows || result.rows.length === 0) return;
    const blob = new Blob([JSON.stringify(result.rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `query_result_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Re-seed Database
  const handleReseedDb = async () => {
    if (!window.confirm('Reset and re-seed all 13 tables with demonstration data?')) return;
    setReseedStatus('Re-seeding database...');
    const res = await apiClient.seedDatabase();
    setReseedStatus(res.message);
    setTimeout(() => setReseedStatus(null), 3000);
  };

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  return (
    <div className="min-h-screen w-full bg-[#121416] text-[#ECE8E1] font-sans flex flex-col selection:bg-[#E5DFD5] selection:text-[#121416]">
      {/* --- TOP TERMINAL HEADER --- */}
      <header className="border-b border-[#282C30] bg-[#16181B] px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-[11px] font-mono tracking-widest text-[#B0AAA0] hover:text-[#ECE8E1] transition-colors py-1.5 px-3 rounded border border-[#2D3237] hover:border-[#4B5259] bg-[#1A1D21]"
            title="Return to Main Presentation"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT TERMINAL</span>
          </button>

          <div className="h-4 w-[1px] bg-[#2D3237]" />

          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            <h1 className="font-sans font-bold text-sm tracking-widest-editorial uppercase text-[#ECE8E1]">
              POSTGRESQL RELATIONAL QUERY CONSOLE
            </h1>
            <span className="hidden sm:inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-[#23272C] text-[#9A9488] border border-[#323840]">
              RAW SQL / ZERO ORM / BCNF
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {reseedStatus && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
              {reseedStatus}
            </span>
          )}

          <button
            onClick={handleReseedDb}
            className="flex items-center space-x-1.5 text-[10px] font-mono tracking-wider text-[#A09A8F] hover:text-[#ECE8E1] bg-[#1E2126] hover:bg-[#252A30] border border-[#2F353C] px-3 py-1.5 rounded transition-all"
            title="Re-seed all 13 tables with standard project demonstration dataset"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET / RE-SEED DB</span>
          </button>

          {onNavigatePatron && (
            <button
              onClick={onNavigatePatron}
              className="text-[10px] font-mono tracking-widest text-[#9A9488] hover:text-[#ECE8E1] px-2.5 py-1.5 rounded border border-[#2F353C] hover:border-[#464E57] transition-all"
            >
              PATRON
            </button>
          )}

          {onNavigateAgent && (
            <button
              onClick={onNavigateAgent}
              className="text-[10px] font-mono tracking-widest text-[#9A9488] hover:text-[#ECE8E1] px-2.5 py-1.5 rounded border border-[#2F353C] hover:border-[#464E57] transition-all"
            >
              ATELIER
            </button>
          )}
        </div>
      </header>

      {/* --- QUICK RELATIONAL TABLE SELECTOR STRIP --- */}
      <div className="bg-[#181A1D] border-b border-[#25282D] px-6 py-2.5 flex items-center space-x-2 overflow-x-auto scrollbar-thin">
        <span className="text-[9px] font-mono text-[#7B756C] uppercase tracking-widest shrink-0 mr-1 flex items-center space-x-1">
          <Database className="w-3 h-3 text-[#A8A095]" />
          <span>13 RELATIONS:</span>
        </span>
        {TABLES_LIST.map((tbl) => (
          <button
            key={tbl}
            onClick={() => handleSelectTable(tbl)}
            className="text-[10px] font-mono text-[#B8B2A6] hover:text-[#ECE8E1] bg-[#1E2125] hover:bg-[#282D33] border border-[#2C3138] hover:border-[#525B66] px-2 py-1 rounded transition-all shrink-0"
            title={`Quick Inspect: SELECT * FROM ${tbl} LIMIT 25;`}
          >
            {tbl}
          </button>
        ))}
      </div>

      {/* --- MAIN INTERFACE: WORKSPACE GRID --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* --- LEFT: SCHEMA EXPLORER (COLLAPSIBLE) --- */}
        <aside
          className={`border-r border-[#262A2F] bg-[#141619] transition-all duration-300 flex flex-col shrink-0 ${
            isSchemaOpen ? 'w-72 md:w-80' : 'w-12'
          }`}
        >
          <div className="p-3 border-b border-[#24282D] flex items-center justify-between bg-[#171A1E]">
            {isSchemaOpen ? (
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-[#A8A095]" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#ECE8E1] font-semibold">
                  SCHEMA EXPLORER ({schemaTables.length || 13})
                </span>
              </div>
            ) : (
              <Layers className="w-4 h-4 text-[#A8A095] mx-auto" />
            )}

            <button
              onClick={() => setIsSchemaOpen(!isSchemaOpen)}
              className="p-1 text-[#8A847A] hover:text-[#ECE8E1] hover:bg-[#202429] rounded transition-colors"
              title={isSchemaOpen ? 'Collapse Schema Explorer' : 'Expand Schema Explorer'}
            >
              {isSchemaOpen ? <ChevronRight className="w-3.5 h-3.5 rotate-180" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isSchemaOpen && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-mono">
              <div className="text-[9px] text-[#7A756D] uppercase tracking-wider px-1 pb-1">
                Click table to view attributes or insert query
              </div>

              {schemaTables.map((t) => {
                const isExpanded = !!expandedTables[t.tableName];
                return (
                  <div key={t.tableName} className="border border-[#262A30] rounded bg-[#181B1F] overflow-hidden">
                    <div className="flex items-center justify-between px-2.5 py-1.5 hover:bg-[#20242A] transition-colors">
                      <button
                        onClick={() => toggleTable(t.tableName)}
                        className="flex items-center space-x-1.5 flex-1 text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-[#8E887E]" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-[#8E887E]" />
                        )}
                        <span className="font-bold text-[11px] text-[#E0DBD1]">{t.tableName}</span>
                        <span className="text-[9px] text-[#6E6960] font-normal">({t.columns.length})</span>
                      </button>

                      <button
                        onClick={() => handleSelectTable(t.tableName)}
                        className="text-[9px] text-[#9A9386] hover:text-[#ECE8E1] hover:bg-[#2C323A] px-1.5 py-0.5 rounded border border-[#343A43] transition-all"
                        title="Query this table"
                      >
                        SELECT
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[#23272C] bg-[#131518] px-3 py-2 space-y-1.5">
                        {t.columns.map((col) => (
                          <div
                            key={col.columnName}
                            className="flex items-baseline justify-between text-[10px] text-[#9E978C] font-mono hover:text-[#ECE8E1]"
                          >
                            <span className="font-medium text-[#CCC6BA]">{col.columnName}</span>
                            <span className="text-[9px] text-[#787268] tracking-tight ml-2 truncate max-w-[120px]" title={col.dataType}>
                              {col.dataType}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* --- RIGHT: SQL WORKSPACE (EDITOR + RESULTS) --- */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#121416]">
          {/* --- PRESET TEMPLATES SELECTOR --- */}
          <div className="border-b border-[#23262B] bg-[#15171A] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-[#A8A095]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B4ADA2] font-semibold">
                CURATED PRESETS:
              </span>
              <select
                onChange={(e) => {
                  const selected = PRESET_QUERIES.find(p => p.id === e.target.value);
                  if (selected) handleLoadPreset(selected);
                }}
                defaultValue=""
                className="bg-[#1C1F24] text-[#E0DBD1] text-[11px] font-mono border border-[#30363E] rounded px-3 py-1.5 focus:outline-none focus:border-[#606975] cursor-pointer"
              >
                <option value="" disabled>Select demonstration query template...</option>
                {PRESET_QUERIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.category}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[10px] font-mono text-[#7D776E] flex items-center space-x-2">
              <span>Shortcut:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#202429] border border-[#343A42] text-[#CCC6BA]">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#202429] border border-[#343A42] text-[#CCC6BA]">Enter</kbd>
              <span>to run</span>
            </div>
          </div>

          {/* --- SQL QUERY EDITOR --- */}
          <div className="border-b border-[#262A30] bg-[#16181C] p-4 flex flex-col">
            <div className="flex items-center justify-between pb-2 text-[10px] font-mono text-[#8C867C] uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>SQL Query Editor</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCopySql}
                  className="flex items-center space-x-1 hover:text-[#ECE8E1] transition-colors"
                  title="Copy SQL to clipboard"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
                <button
                  onClick={() => setSql('')}
                  className="flex items-center space-x-1 hover:text-rose-400 transition-colors"
                  title="Clear Editor"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>CLEAR</span>
                </button>
              </div>
            </div>

            <textarea
              ref={editorRef}
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={8}
              placeholder="Write SQL statement (SELECT, INSERT, UPDATE, DELETE, EXPLAIN ANALYZE)..."
              className="w-full bg-[#101214] text-[#F0EBE1] font-mono text-xs md:text-sm p-4 rounded border border-[#2B3037] focus:outline-none focus:border-[#5C6572] resize-y leading-relaxed"
              spellCheck={false}
            />

            {/* Run Query Action Bar */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-[10px] font-mono text-[#787268]">
                Execute raw queries directly against PostgreSQL 15 connection pool.
              </div>

              <button
                onClick={handleExecute}
                disabled={isExecuting || !sql.trim()}
                className={`flex items-center space-x-2 px-5 py-2 rounded text-xs font-mono font-bold tracking-wider transition-all shadow-md ${
                  isExecuting || !sql.trim()
                    ? 'bg-[#2A2E35] text-[#696359] cursor-not-allowed border border-[#353B44]'
                    : 'bg-[#E5DFD5] text-[#121416] hover:bg-[#FAF7F2] border border-[#F4EFE6] active:scale-[0.98]'
                }`}
              >
                <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
                <span>{isExecuting ? 'EXECUTING...' : 'RUN QUERY'}</span>
              </button>
            </div>
          </div>

          {/* --- EXECUTION STATUS & METRICS STRIP --- */}
          {result && (
            <div
              className={`border-b px-6 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs ${
                result.success
                  ? 'bg-[#141A17] border-emerald-900/60 text-emerald-400'
                  : 'bg-[#1F1416] border-rose-900/60 text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5 font-bold">
                  {result.success ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>QUERY EXECUTED SUCCESSFULLY</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>DATABASE EXCEPTION</span>
                    </>
                  )}
                </span>

                {result.command && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/30 border border-white/10 text-white/80">
                    {result.command}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-5 text-[11px] text-[#A09A8F]">
                {result.executionTimeMs !== undefined && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[#888175]" />
                    <span>Latency: <strong className="text-[#ECE8E1]">{result.executionTimeMs} ms</strong></span>
                  </span>
                )}

                {result.success && result.rowCount !== undefined && (
                  <span className="flex items-center space-x-1">
                    <TableIcon className="w-3.5 h-3.5 text-[#888175]" />
                    <span>Rows: <strong className="text-[#ECE8E1]">{result.rowCount}</strong></span>
                  </span>
                )}

                {result.success && result.rows && result.rows.length > 0 && (
                  <div className="flex items-center space-x-2 pl-3 border-l border-[#353A42]">
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center space-x-1 text-[10px] text-[#CCC6BA] hover:text-white bg-black/40 hover:bg-black/60 px-2 py-1 rounded border border-white/10 transition-colors"
                      title="Download as CSV file"
                    >
                      <Download className="w-3 h-3" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="flex items-center space-x-1 text-[10px] text-[#CCC6BA] hover:text-white bg-black/40 hover:bg-black/60 px-2 py-1 rounded border border-white/10 transition-colors"
                      title="Download as JSON file"
                    >
                      <Download className="w-3 h-3" />
                      <span>JSON</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- RESULTS AREA --- */}
          <div className="flex-1 p-6">
            {/* 1. Error Display */}
            {result && !result.success && result.error && (
              <div className="bg-[#1C1214] border border-rose-900/80 rounded-lg p-5 text-rose-200 font-mono space-y-3">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>PostgreSQL Error Diagnostic</span>
                </div>

                <div className="p-3 bg-black/40 rounded border border-rose-950 text-xs md:text-sm font-semibold text-rose-300">
                  {result.error.message}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px] pt-1">
                  {result.error.code && (
                    <div className="bg-black/30 p-2 rounded border border-rose-950">
                      <span className="text-[#8E867A] block text-[9px] uppercase">SQLSTATE Code:</span>
                      <span className="text-[#E0DBD1] font-bold">{result.error.code}</span>
                    </div>
                  )}

                  {result.error.table && (
                    <div className="bg-black/30 p-2 rounded border border-rose-950">
                      <span className="text-[#8E867A] block text-[9px] uppercase">Target Table:</span>
                      <span className="text-[#E0DBD1] font-bold">{result.error.table}</span>
                    </div>
                  )}

                  {result.error.constraint && (
                    <div className="bg-black/30 p-2 rounded border border-rose-950">
                      <span className="text-[#8E867A] block text-[9px] uppercase">Violated Constraint:</span>
                      <span className="text-[#E0DBD1] font-bold">{result.error.constraint}</span>
                    </div>
                  )}

                  {result.error.position && (
                    <div className="bg-black/30 p-2 rounded border border-rose-950">
                      <span className="text-[#8E867A] block text-[9px] uppercase">Syntax Position:</span>
                      <span className="text-[#E0DBD1] font-bold">Char {result.error.position}</span>
                    </div>
                  )}
                </div>

                {result.error.detail && (
                  <div className="text-xs text-[#BFA8A8] pt-1">
                    <span className="text-[#8E867A]">Detail:</span> {result.error.detail}
                  </div>
                )}

                {result.error.hint && (
                  <div className="text-xs text-amber-300/80 pt-1">
                    <span className="text-amber-500 font-bold">Hint:</span> {result.error.hint}
                  </div>
                )}
              </div>
            )}

            {/* 2. Empty State / No Query Run Yet */}
            {!result && (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#262B32] rounded-lg">
                <Database className="w-10 h-10 text-[#3A404A] mb-3 stroke-[1.2]" />
                <h3 className="font-sans font-bold text-sm tracking-wider uppercase text-[#7A746A]">
                  Query Window Ready
                </h3>
                <p className="text-xs font-mono text-[#5E584F] max-w-md mt-1.5 leading-relaxed">
                  Enter any standard SQL query above or choose a curated demonstration preset to inspect live PostgreSQL data, triggers, and execution plans.
                </p>
              </div>
            )}

            {/* 3. Non-SELECT Success (INSERT/UPDATE/DELETE/DDL) */}
            {result && result.success && (!result.rows || result.rows.length === 0) && (
              <div className="bg-[#141A17] border border-emerald-900/60 rounded-lg p-6 font-mono text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-emerald-300">
                  Command Executed Successfully
                </h4>
                <p className="text-xs text-[#9E988D]">
                  {result.command || 'Statement'} completed. {result.rowCount || 0} row(s) affected in {result.executionTimeMs} ms.
                </p>
              </div>
            )}

            {/* 4. Tabular Results Grid for SELECT */}
            {result && result.success && result.rows && result.rows.length > 0 && (
              <div className="border border-[#262A30] rounded-lg overflow-hidden bg-[#15171B] shadow-xl">
                <div className="max-h-[500px] overflow-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    {/* Sticky Table Header */}
                    <thead className="bg-[#1C2025] sticky top-0 z-10 border-b border-[#2E343D]">
                      <tr>
                        <th className="px-3 py-2.5 text-[10px] text-[#787268] uppercase tracking-wider font-semibold border-r border-[#2A3038] w-12 text-center">
                          #
                        </th>
                        {(result.fields?.map(f => f.name) || Object.keys(result.rows[0])).map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2.5 text-[10px] text-[#D0C9BD] uppercase tracking-wider font-semibold border-r border-[#2A3038] last:border-r-0 whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-[#1F2328]">
                      {result.rows.map((row, idx) => {
                        const headers = result.fields?.map(f => f.name) || Object.keys(result.rows![0]);
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-[#1C2026] transition-colors odd:bg-[#141619] even:bg-[#16191D]"
                          >
                            <td className="px-3 py-2 text-[10px] text-[#635E55] border-r border-[#22272E] text-center select-none">
                              {idx + 1}
                            </td>
                            {headers.map((header) => {
                              const val = row[header];
                              const isNull = val === null || val === undefined;
                              return (
                                <td
                                  key={header}
                                  className="px-4 py-2 border-r border-[#22272E] last:border-r-0 whitespace-nowrap text-[#ECE8E1]"
                                >
                                  {isNull ? (
                                    <span className="text-[#8A6D3B] italic text-[10px]">NULL</span>
                                  ) : typeof val === 'boolean' ? (
                                    <span className={val ? 'text-emerald-400' : 'text-rose-400'}>
                                      {val ? 'TRUE' : 'FALSE'}
                                    </span>
                                  ) : typeof val === 'object' ? (
                                    <span className="text-[#A59F93]">{JSON.stringify(val)}</span>
                                  ) : (
                                    <span>{'' + val}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Count Bar */}
                <div className="bg-[#181B1F] px-4 py-2.5 border-t border-[#262B32] text-[10px] font-mono text-[#8C867C] flex items-center justify-between">
                  <span>Displaying {result.rows.length} rows</span>
                  <span>Execution: {result.executionTimeMs} ms</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
