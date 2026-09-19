import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Download, 
  Terminal, 
  Database, 
  Table as TableIcon, 
  Clock, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Trash2, 
  ArrowLeft,
  FileCode,
  Layers
} from 'lucide-react';
import { apiClient, type QueryResult, type SchemaTable } from '../services/api';
import { Logo } from './HorizonLogo';

interface SqlQueryWindowProps {
  onBack: () => void;
  onNavigatePatron?: () => void;
  onNavigateAgent?: () => void;
}

interface PresetQuery {
  id: string;
  name: string;
  category: string;
  description: string;
  sql: string;
}

const PRESET_QUERIES: PresetQuery[] = [
  {
    id: 'master-join',
    name: '5-Table Relational Master Join',
    category: 'Relational Joins',
    description: 'Combines LISTING, PROPERTY, PROPERTY_TYPE, AGENT, and PERSON to produce a complete market inventory ledger.',
    sql: `SELECT 
    l.ListingID,
    p.Description AS PropertyName,
    pt.TypeName AS PropertyType,
    l.ListPrice,
    p.AreaSqFt,
    ROUND(l.ListPrice / p.AreaSqFt, 2) AS PricePerSqFt,
    CONCAT(per.FirstName, ' ', per.LastName) AS BrokerName,
    l.Status,
    l.ListedDate
FROM LISTING l
JOIN PROPERTY p ON l.PropertyID = p.PropertyID
JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
JOIN AGENT a ON l.AgentID = a.AgentID
JOIN PERSON per ON a.PersonID = per.PersonID
ORDER BY l.ListPrice DESC;`
  },
  {
    id: 'agent-commission',
    name: 'Agent Consignments & 3% Commission Yield',
    category: 'Aggregations',
    description: 'Calculates active listings, settled deal volume, and 3% gross luxury commission yield per broker.',
    sql: `SELECT 
    a.AgentID,
    CONCAT(per.FirstName, ' ', per.LastName) AS AgentName,
    per.Email AS AgentEmail,
    COUNT(l.ListingID) AS TotalListings,
    COALESCE(SUM(l.ListPrice), 0) AS TotalPortfolioValue,
    ROUND(AVG(l.ListPrice), 2) AS AvgListingPrice,
    ROUND(COALESCE(SUM(l.ListPrice), 0) * 0.03, 2) AS PotentialAtelierCommission
FROM AGENT a
JOIN PERSON per ON a.PersonID = per.PersonID
LEFT JOIN LISTING l ON a.AgentID = l.AgentID
GROUP BY a.AgentID, per.FirstName, per.LastName, per.Email
ORDER BY TotalPortfolioValue DESC;`
  },
  {
    id: 'typology-pricing',
    name: 'Typology Market Pricing Summary',
    category: 'Market Analytics',
    description: 'Aggregates asking prices, living area, and average price per sq ft across architectural typologies.',
    sql: `SELECT 
    pt.TypeName,
    COUNT(p.PropertyID) AS TotalProperties,
    ROUND(AVG(l.ListPrice), 2) AS AvgPrice,
    MIN(l.ListPrice) AS MinPrice,
    MAX(l.ListPrice) AS MaxPrice,
    ROUND(AVG(p.AreaSqFt), 0) AS AvgSqFt,
    ROUND(AVG(l.ListPrice / p.AreaSqFt), 2) AS AvgPricePerSqFt
FROM PROPERTY_TYPE pt
JOIN PROPERTY p ON pt.PropertyTypeID = p.PropertyTypeID
JOIN LISTING l ON p.PropertyID = l.PropertyID
GROUP BY pt.PropertyTypeID, pt.TypeName
ORDER BY AvgPrice DESC;`
  },
  {
    id: 'window-ranks',
    name: 'Window Functions: Rank Listings in Typology',
    category: 'Advanced SQL',
    description: 'Uses DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...) to rank properties within their category.',
    sql: `SELECT 
    pt.TypeName,
    p.Description AS PropertyName,
    l.ListPrice,
    p.AreaSqFt,
    DENSE_RANK() OVER (PARTITION BY pt.TypeName ORDER BY l.ListPrice DESC) AS PriceRankInType,
    ROUND(AVG(l.ListPrice) OVER (PARTITION BY pt.TypeName), 2) AS CategoryAvgPrice,
    ROUND(l.ListPrice - AVG(l.ListPrice) OVER (PARTITION BY pt.TypeName), 2) AS DiffFromCategoryAvg
FROM LISTING l
JOIN PROPERTY p ON l.PropertyID = p.PropertyID
JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
ORDER BY pt.TypeName, PriceRankInType;`
  },
  {
    id: 'view-inspection',
    name: 'Inspect Database View: Active Listings',
    category: 'Views & Virtual Tables',
    description: 'Queries the pre-defined active_listings_full relation.',
    sql: `SELECT * FROM active_listings_full ORDER BY ListPrice DESC;`
  },
  {
    id: 'trigger-test',
    name: 'Trigger Invariant Test (100% Ownership Cap)',
    category: 'Trigger Validation',
    description: 'Tests trg_validate_ownership_share trigger by inspecting ownership distribution.',
    sql: `SELECT 
    p.Description AS PropertyName,
    c.CustomerID,
    CONCAT(per.FirstName, ' ', per.LastName) AS OwnerName,
    o.OwnershipShare,
    o.SinceDate
FROM OWNERSHIP o
JOIN PROPERTY p ON o.PropertyID = p.PropertyID
JOIN CUSTOMER c ON o.CustomerID = c.CustomerID
JOIN PERSON per ON c.PersonID = per.PersonID
ORDER BY p.PropertyID, o.OwnershipShare DESC;`
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
  AND l.ListPrice BETWEEN 2000000 AND 20000000
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
    try {
      const res = await apiClient.executeQuery(sql);
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        error: {
          message: err.message || 'Execution failed due to network or server error.',
        }
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to execute
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  // Quick Table Query
  const handleSelectTable = (tableName: string) => {
    const query = `SELECT * FROM ${tableName} LIMIT 25;`;
    setSql(query);
    setResult(null);
    if (editorRef.current) {
      editorRef.current.focus();
    }
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

    const jsonStr = JSON.stringify(result.rows, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
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
    <div className="min-h-screen w-full bg-black text-white font-geist flex flex-col selection:bg-white selection:text-black">
      {/* --- TOP TERMINAL HEADER --- */}
      <header className="border-b border-white/10 bg-black/90 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-[10px] font-mono tracking-widest text-white/70 hover:text-white transition-colors py-1.5 px-3 rounded-full border border-white/20 hover:border-white bg-white/5 cursor-pointer"
            title="Return to Main Presentation"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT TERMINAL</span>
          </button>

          <div className="h-4 w-[1px] bg-white/20" />

          <div className="flex items-center space-x-3">
            <Logo className="w-5 h-5 text-white" />
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm tracking-widest uppercase text-white">
                HORIZON ESTATES
              </span>
              <span className="text-white/40 font-mono text-xs">•</span>
              <span className="text-xs font-mono text-emerald-400">POSTGRESQL RELATIONAL CONSOLE</span>
            </div>
            <span className="hidden sm:inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/60 border border-white/15">
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
            className="flex items-center space-x-1.5 text-[10px] font-mono tracking-wider text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 px-3 py-1.5 rounded-full transition-all cursor-pointer"
            title="Re-seed all 13 tables with standard project demonstration dataset"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET / RE-SEED DB</span>
          </button>

          {onNavigatePatron && (
            <button
              onClick={onNavigatePatron}
              className="text-[10px] font-mono tracking-widest text-white/70 hover:text-white px-2.5 py-1.5 rounded border border-white/20 hover:border-white transition-all cursor-pointer"
            >
              PATRON
            </button>
          )}

          {onNavigateAgent && (
            <button
              onClick={onNavigateAgent}
              className="text-[10px] font-mono tracking-widest text-white/70 hover:text-white px-2.5 py-1.5 rounded border border-white/20 hover:border-white transition-all cursor-pointer"
            >
              ATELIER
            </button>
          )}
        </div>
      </header>

      {/* --- QUICK RELATIONAL TABLE SELECTOR STRIP --- */}
      <div className="bg-[#080808] border-b border-white/10 px-6 py-2.5 flex items-center space-x-2 overflow-x-auto scrollbar-thin">
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest shrink-0 mr-1 flex items-center space-x-1">
          <Database className="w-3 h-3 text-rose-300" />
          <span>13 RELATIONS:</span>
        </span>
        {TABLES_LIST.map((tbl) => (
          <button
            key={tbl}
            onClick={() => handleSelectTable(tbl)}
            className="text-[10px] font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 px-2.5 py-1 rounded transition-all shrink-0 cursor-pointer"
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
          className={`border-r border-white/10 bg-[#080808] transition-all duration-300 flex flex-col shrink-0 ${
            isSchemaOpen ? 'w-72 md:w-80' : 'w-12'
          }`}
        >
          <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[#0d0d0d]">
            {isSchemaOpen ? (
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-rose-300" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-white font-medium">
                  SCHEMA EXPLORER ({schemaTables.length || 13})
                </span>
              </div>
            ) : (
              <Layers className="w-4 h-4 text-rose-300 mx-auto" />
            )}

            <button
              onClick={() => setIsSchemaOpen(!isSchemaOpen)}
              className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title={isSchemaOpen ? 'Collapse Schema Explorer' : 'Expand Schema Explorer'}
            >
              {isSchemaOpen ? <ChevronRight className="w-3.5 h-3.5 rotate-180" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isSchemaOpen && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-mono">
              <div className="text-[9px] text-white/40 uppercase tracking-wider px-1 pb-1">
                Click table to view attributes or insert query
              </div>

              {schemaTables.map((t) => {
                const isExpanded = !!expandedTables[t.tableName];
                return (
                  <div key={t.tableName} className="border border-white/10 rounded-lg bg-[#0d0d0d] overflow-hidden">
                    <div className="flex items-center justify-between px-2.5 py-1.5 hover:bg-white/5 transition-colors">
                      <button
                        onClick={() => toggleTable(t.tableName)}
                        className="flex items-center space-x-1.5 flex-1 text-left cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-white/60" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-white/60" />
                        )}
                        <span className="font-bold text-[11px] text-white">{t.tableName}</span>
                        <span className="text-[9px] text-white/40 font-normal">({t.columns.length})</span>
                      </button>

                      <button
                        onClick={() => handleSelectTable(t.tableName)}
                        className="text-[9px] text-white/70 hover:text-white hover:bg-white/15 px-1.5 py-0.5 rounded border border-white/15 transition-all cursor-pointer"
                        title="Query this table"
                      >
                        SELECT
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-white/10 bg-black/50 px-3 py-2 space-y-1.5">
                        {t.columns.map((col) => (
                          <div
                            key={col.columnName}
                            className="flex items-baseline justify-between text-[10px] text-white/70 font-mono hover:text-white"
                          >
                            <span className="font-medium text-white/90">{col.columnName}</span>
                            <span className="text-[9px] text-white/40 tracking-tight ml-2 truncate max-w-[120px]" title={col.dataType}>
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
        <main className="flex-1 flex flex-col overflow-y-auto bg-black">
          {/* --- PRESET TEMPLATES SELECTOR --- */}
          <div className="border-b border-white/10 bg-[#080808] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-rose-300" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/70 font-medium">
                CURATED PRESETS:
              </span>
              <select
                onChange={(e) => {
                  const selected = PRESET_QUERIES.find(p => p.id === e.target.value);
                  if (selected) handleLoadPreset(selected);
                }}
                defaultValue=""
                className="bg-[#121212] text-white text-[11px] font-mono border border-white/20 rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/50 cursor-pointer"
              >
                <option value="" disabled className="bg-[#121212] text-white/50">Select demonstration query template...</option>
                {PRESET_QUERIES.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#121212] text-white">
                    [{p.category}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[10px] font-mono text-white/40 flex items-center space-x-2">
              <span>Shortcut:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-white/80">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-white/80">Enter</kbd>
              <span>to run</span>
            </div>
          </div>

          {/* --- SQL QUERY EDITOR --- */}
          <div className="border-b border-white/10 bg-[#0a0a0a] p-4 flex flex-col">
            <div className="flex items-center justify-between pb-2 text-[10px] font-mono text-white/60 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>SQL Query Editor</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCopySql}
                  className="flex items-center space-x-1 text-white/60 hover:text-white transition-colors cursor-pointer"
                  title="Copy SQL to clipboard"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
                <button
                  onClick={() => setSql('')}
                  className="flex items-center space-x-1 text-white/60 hover:text-rose-400 transition-colors cursor-pointer"
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
              className="w-full bg-[#050505] text-white font-mono text-xs md:text-sm p-4 rounded-xl border border-white/15 focus:outline-none focus:border-white/40 resize-y leading-relaxed"
              spellCheck={false}
            />

            {/* Run Query Action Bar */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-[10px] font-mono text-white/40">
                Execute raw queries directly against PostgreSQL 15 connection pool.
              </div>

              <button
                onClick={handleExecute}
                disabled={isExecuting || !sql.trim()}
                className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-mono font-medium tracking-wider transition-all shadow-md cursor-pointer ${
                  isExecuting || !sql.trim()
                    ? 'bg-white/10 text-white/30 cursor-not-allowed border border-white/10'
                    : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'
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
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5 font-bold">
                  {result.success ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/15 text-white/90">
                    {result.command}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-5 text-[11px] text-white/70">
                {result.executionTimeMs !== undefined && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-white/40" />
                    <span>Latency: <strong className="text-white">{result.executionTimeMs} ms</strong></span>
                  </span>
                )}

                {result.success && result.rowCount !== undefined && (
                  <span className="flex items-center space-x-1">
                    <TableIcon className="w-3.5 h-3.5 text-white/40" />
                    <span>Rows: <strong className="text-white">{result.rowCount}</strong></span>
                  </span>
                )}

                {result.success && result.rows && result.rows.length > 0 && (
                  <div className="flex items-center space-x-2 pl-3 border-l border-white/15">
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center space-x-1 text-[10px] text-white hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded border border-white/20 transition-colors cursor-pointer"
                      title="Download as CSV file"
                    >
                      <Download className="w-3 h-3" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="flex items-center space-x-1 text-[10px] text-white hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded border border-white/20 transition-colors cursor-pointer"
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
              <div className="bg-[#140809] border border-rose-500/40 rounded-xl p-5 text-rose-200 font-mono space-y-3">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>PostgreSQL Error Diagnostic</span>
                </div>

                <div className="p-3 bg-black/60 rounded-lg border border-rose-950 text-xs md:text-sm font-semibold text-rose-300">
                  {result.error.message}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px] pt-1">
                  {result.error.code && (
                    <div className="bg-black/40 p-2.5 rounded-lg border border-rose-900/30">
                      <span className="text-white/40 block text-[9px] uppercase">SQLSTATE Code:</span>
                      <span className="text-white font-bold">{result.error.code}</span>
                    </div>
                  )}

                  {result.error.table && (
                    <div className="bg-black/40 p-2.5 rounded-lg border border-rose-900/30">
                      <span className="text-white/40 block text-[9px] uppercase">Target Table:</span>
                      <span className="text-white font-bold">{result.error.table}</span>
                    </div>
                  )}

                  {result.error.constraint && (
                    <div className="bg-black/40 p-2.5 rounded-lg border border-rose-900/30">
                      <span className="text-white/40 block text-[9px] uppercase">Violated Constraint:</span>
                      <span className="text-white font-bold">{result.error.constraint}</span>
                    </div>
                  )}

                  {result.error.position && (
                    <div className="bg-black/40 p-2.5 rounded-lg border border-rose-900/30">
                      <span className="text-white/40 block text-[9px] uppercase">Syntax Position:</span>
                      <span className="text-white font-bold">Char {result.error.position}</span>
                    </div>
                  )}
                </div>

                {result.error.detail && (
                  <div className="text-xs text-rose-300/80 pt-1">
                    <span className="text-white/50">Detail:</span> {result.error.detail}
                  </div>
                )}

                {result.error.hint && (
                  <div className="text-xs text-amber-300/90 pt-1">
                    <span className="text-amber-400 font-bold">Hint:</span> {result.error.hint}
                  </div>
                )}
              </div>
            )}

            {/* 2. Empty State / No Query Run Yet */}
            {!result && (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/15 rounded-xl bg-white/5">
                <Database className="w-10 h-10 text-white/30 mb-3 stroke-[1.2]" />
                <h3 className="font-heading text-sm tracking-wider uppercase text-white/70">
                  Query Window Ready
                </h3>
                <p className="text-xs font-mono text-white/40 max-w-md mt-1.5 leading-relaxed">
                  Enter any standard SQL query above or choose a curated demonstration preset to inspect live PostgreSQL data, triggers, and execution plans.
                </p>
              </div>
            )}

            {/* 3. Non-SELECT Success (INSERT/UPDATE/DELETE/DDL) */}
            {result && result.success && (!result.rows || result.rows.length === 0) && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-6 font-mono text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-emerald-300">
                  Command Executed Successfully
                </h4>
                <p className="text-xs text-white/60">
                  {result.command || 'Statement'} completed. {result.rowCount || 0} row(s) affected in {result.executionTimeMs} ms.
                </p>
              </div>
            )}

            {/* 4. Tabular Results Grid for SELECT */}
            {result && result.success && result.rows && result.rows.length > 0 && (
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d0d0d] shadow-2xl">
                <div className="max-h-[500px] overflow-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    {/* Sticky Table Header */}
                    <thead className="bg-white/5 sticky top-0 z-10 border-b border-white/10">
                      <tr>
                        <th className="px-3 py-2.5 text-[10px] text-white/50 uppercase tracking-wider font-semibold border-r border-white/10 w-12 text-center">
                          #
                        </th>
                        {(result.fields?.map(f => f.name) || Object.keys(result.rows[0])).map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2.5 text-[10px] text-white/80 uppercase tracking-wider font-semibold border-r border-white/10 last:border-r-0 whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-white/5">
                      {result.rows.map((row, idx) => {
                        const headers = result.fields?.map(f => f.name) || Object.keys(result.rows![0]);
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-white/5 transition-colors odd:bg-black/30 even:bg-black/50"
                          >
                            <td className="px-3 py-2 text-[10px] text-white/40 border-r border-white/10 text-center select-none">
                              {idx + 1}
                            </td>
                            {headers.map((header) => {
                              const val = row[header];
                              const isNull = val === null || val === undefined;
                              return (
                                <td
                                  key={header}
                                  className="px-4 py-2 border-r border-white/10 last:border-r-0 whitespace-nowrap text-white/90"
                                >
                                  {isNull ? (
                                    <span className="text-amber-500/70 italic text-[10px]">NULL</span>
                                  ) : typeof val === 'boolean' ? (
                                    <span className={val ? 'text-emerald-400' : 'text-rose-400'}>
                                      {val ? 'TRUE' : 'FALSE'}
                                    </span>
                                  ) : typeof val === 'object' ? (
                                    <span className="text-white/60">{JSON.stringify(val)}</span>
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
                <div className="bg-black/40 px-4 py-2.5 border-t border-white/10 text-[10px] font-mono text-white/50 flex items-center justify-between">
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
