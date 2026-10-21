// ============================================================================
// REAL ESTATE PROPERTY PLATFORM
// File: frontend/src/components/GraphExplorer.tsx
// FalkorDB GraphBLAS Explorer, Visualizer, Recommendations & Benchmark Console
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  Cpu, 
  Zap, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Activity, 
  Database, 
  Search, 
  ExternalLink, 
  Layers 
} from 'lucide-react';
import { 
  api, 
  type GraphHealth, 
  type GraphNetworkData, 
  type GraphRecommendation, 
  type GraphBenchmarkResult, 
  type CypherQueryResult 
} from '../services/api';

const SAMPLE_CYPHER_QUERIES = [
  {
    name: '1. Customer Co-Ownership Network',
    query: 'MATCH (c:Customer)-[r:OWNS]->(p:Property)\nRETURN c.name AS Owner, r.share AS SharePercent, p.price AS Price, p.description AS Property\nORDER BY p.price DESC;',
  },
  {
    name: '2. Multi-Hop Listing & Agent Representation',
    query: 'MATCH (a:Agent)<-[:REPRESENTS]-(l:Listing)-[:FOR_PROPERTY]->(p:Property)\nRETURN a.name AS Agent, l.listPrice AS ListPrice, l.status AS Status, p.typeName AS Type\nLIMIT 10;',
  },
  {
    name: '3. Pending Offers & High-Net-Worth Buyers',
    query: 'MATCH (c:Customer)-[o:MADE_OFFER]->(l:Listing)-[:FOR_PROPERTY]->(p:Property)\nRETURN c.name AS Patron, o.amount AS OfferAmount, o.status AS OfferStatus, p.description AS Residence\nORDER BY o.amount DESC;',
  },
  {
    name: '4. GraphBLAS Neighborhood Proximity Traversal',
    query: 'MATCH (c1:Customer)-[:MADE_OFFER]->(l:Listing)<-[:MADE_OFFER]-(c2:Customer)\nWHERE c1 <> c2\nRETURN c1.name AS BuyerA, c2.name AS BuyerB, count(l) AS MutualInterests;',
  },
];

export const GraphExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'network' | 'recommendations' | 'benchmark' | 'cypher'>('network');
  const [health, setHealth] = useState<GraphHealth | null>(null);
  const [networkData, setNetworkData] = useState<GraphNetworkData | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<GraphRecommendation[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number>(1);
  const [benchmark, setBenchmark] = useState<GraphBenchmarkResult | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Cypher Console state
  const [cypherQuery, setCypherQuery] = useState(SAMPLE_CYPHER_QUERIES[0].query);
  const [cypherResult, setCypherResult] = useState<CypherQueryResult | null>(null);
  const [isExecutingCypher, setIsExecutingCypher] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load Initial Graph Health & Network
  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    const [h, net] = await Promise.all([
      api.getGraphHealth(),
      api.getGraphNetwork(80)
    ]);
    setHealth(h);
    setNetworkData(net);
    loadRecommendations(selectedCustomer);
  };

  const loadRecommendations = async (customerId: number) => {
    const recs = await api.getGraphRecommendations(customerId);
    setRecommendations(recs);
  };

  const handleSyncFromPostgres = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.seedGraphDatabase();
      if (res.success) {
        setSyncMessage(`✓ Synced successfully: ${res.stats?.nodes || 0} nodes & ${res.stats?.relationships || 0} relationships populated.`);
        await loadGraphData();
      } else {
        setSyncMessage(`Warning: ${res.error || 'Check if FalkorDB container is running.'}`);
      }
    } catch (err: any) {
      setSyncMessage(`Error: ${err?.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await api.getGraphBenchmark();
      setBenchmark(res);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleExecuteCypher = async () => {
    setIsExecutingCypher(true);
    try {
      const res = await api.executeCypherQuery(cypherQuery);
      setCypherResult(res);
    } finally {
      setIsExecutingCypher(false);
    }
  };

  // Node Color Coding
  const getNodeColor = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'customer': return '#3b82f6'; // Blue
      case 'agent': return '#10b981'; // Emerald
      case 'property': return '#f59e0b'; // Amber
      case 'listing': return '#8b5cf6'; // Purple
      case 'propertytype': return '#06b6d4'; // Cyan
      default: return '#94a3b8'; // Slate
    }
  };

  // Canvas 2D Force-Graph Renderer
  useEffect(() => {
    if (!networkData || !canvasRef.current || activeTab !== 'network') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = canvas.width;
    const height = canvas.height;

    // Assign initial positions if not present
    const nodes = networkData.nodes.map((n, i) => {
      const angle = (i / networkData.nodes.length) * 2 * Math.PI;
      const radius = 180 + (i % 3) * 60;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      };
    });

    const nodeIndexMap = new Map(nodes.map((n) => [n.id, n]));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Grid Lines Background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Links
      networkData.links.forEach((link) => {
        const source = nodeIndexMap.get(link.source);
        const target = nodeIndexMap.get(link.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Link Label text in center
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.font = '9px monospace';
          ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
          ctx.fillText(link.type, midX, midY);
        }
      });

      // Draw Nodes
      nodes.forEach((node) => {
        // Floating gentle physics motion
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 50 || node.x > width - 50) node.vx *= -1;
        if (node.y < 50 || node.y > height - 50) node.vy *= -1;

        const isSelected = selectedNode?.id === node.id;
        const color = getNodeColor(node.label);

        // Glow ring if selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 22, 0, 2 * Math.PI);
          ctx.fillStyle = `${color}33`;
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 14 : 10, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node Label
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#f1f5f9';
        ctx.textAlign = 'center';
        ctx.fillText(node.name?.length > 18 ? node.name.slice(0, 15) + '...' : node.name, node.x, node.y + 24);

        // Category Tag
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillText(`:${node.label}`, node.x, node.y + 36);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Canvas Click Listener for Node Selection
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let found = null;
      for (const node of nodes) {
        const dist = Math.hypot(node.x - clickX, node.y - clickY);
        if (dist <= 18) {
          found = node;
          break;
        }
      }
      setSelectedNode(found);
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [networkData, activeTab, selectedNode]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 rounded-xl">
                <Network className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">FalkorDB Graph Engine</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    GraphBLAS In-Memory
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Advanced DBMS Module: Sparse-Matrix Linear Algebra Graph Traversal & Polyglot Persistence
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Sync */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadGraphData}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg flex items-center gap-2 border border-slate-700 transition"
              title="Refresh graph from FalkorDB"
            >
              <RotateCcw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleSyncFromPostgres}
              disabled={isSyncing}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              <Layers className="w-4 h-4" />
              {isSyncing ? 'Syncing...' : 'Sync from PostgreSQL'}
            </button>
          </div>
        </div>

        {/* Sync message alert */}
        {syncMessage && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-lg text-sm text-amber-200 flex items-center justify-between">
            <span>{syncMessage}</span>
            <button onClick={() => setSyncMessage(null)} className="text-xs text-amber-400 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Engine Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400">Database Engine</p>
              <p className="text-base font-semibold text-slate-100 flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                FalkorDB
              </p>
              <p className="text-xs text-slate-500">GraphBLAS Linear Algebra</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${health?.status === 'UP' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <p className="text-xs font-mono uppercase text-slate-400">Total Graph Nodes</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">
              {health?.stats?.nodes ?? (networkData?.nodes.length || 0)}
            </p>
            <p className="text-xs text-slate-500">Customers, Properties, Agents, Listings</p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <p className="text-xs font-mono uppercase text-slate-400">Relationships (Edges)</p>
            <p className="text-2xl font-bold text-purple-400 mt-0.5">
              {health?.stats?.relationships ?? (networkData?.links.length || 0)}
            </p>
            <p className="text-xs text-slate-500">OWNS, REPRESENTS, MADE_OFFER</p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <p className="text-xs font-mono uppercase text-slate-400">Traversal Algorithm</p>
            <p className="text-base font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              Sparse Matrix Mult
            </p>
            <p className="text-xs text-slate-500">O(1) memory overhead</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-1">
          <button
            onClick={() => setActiveTab('network')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'network'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4" />
            Interactive Graph Visualizer
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'recommendations'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Graph Recommendation Engine
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'benchmark'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            PostgreSQL vs FalkorDB Benchmark
          </button>

          <button
            onClick={() => setActiveTab('cypher')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'cypher'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            OpenCypher Query Console
          </button>
        </div>

        {/* TAB 1: INTERACTIVE NETWORK VISUALIZER */}
        {activeTab === 'network' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Customer</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Agent</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Property</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Listing</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> PropertyType</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">Click any node to inspect properties</span>
              </div>

              <div className="w-full h-[540px] bg-slate-950/70 border border-slate-800/80 rounded-xl overflow-hidden flex items-center justify-center">
                <canvas 
                  ref={canvasRef} 
                  width={850} 
                  height={540} 
                  className="w-full h-full cursor-pointer"
                />
              </div>
            </div>

            {/* Node Inspector Sidebar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  Node Property Inspector
                </h3>

                {selectedNode ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span 
                        className="text-xs font-mono uppercase px-2 py-0.5 rounded font-semibold"
                        style={{ 
                          backgroundColor: `${getNodeColor(selectedNode.label)}22`, 
                          color: getNodeColor(selectedNode.label) 
                        }}
                      >
                        :{selectedNode.label}
                      </span>
                      <h4 className="text-lg font-bold text-slate-100 mt-2">{selectedNode.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedNode.id}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-mono text-slate-400">Node Properties:</p>
                      <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-300 max-h-60 overflow-y-auto space-y-1">
                        {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                          <div key={key} className="flex justify-between py-1 border-b border-slate-900">
                            <span className="text-slate-400">{key}:</span>
                            <span className="text-amber-300 font-medium">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 px-4 text-slate-500">
                    <Network className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-400" />
                    <p className="text-sm font-medium">No node selected</p>
                    <p className="text-xs mt-1">Click on any node in the canvas to examine its real-time graph properties.</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-slate-400 mt-6">
                <p className="font-semibold text-slate-300 mb-1">Graph Topology</p>
                <p>Nodes: <span className="text-amber-400 font-mono">{networkData?.nodes.length || 0}</span></p>
                <p>Edges: <span className="text-purple-400 font-mono">{networkData?.links.length || 0}</span></p>
                <p className="mt-2 text-slate-500">Powered by FalkorDB GraphBLAS in-memory matrix traversal.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GRAPH RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Collaborative Filtering Property Recommendations
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Cypher query traverses 3 hops: 
                  <code className="text-amber-300 mx-1 px-1 py-0.5 bg-slate-950 rounded">
                    {"(Customer)-[:MADE_OFFER]->(:Listing)-[:FOR_PROPERTY]->(:Property)"}
                  </code> 
                  to predict patron affinity based on community bidding graph topology.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-mono text-slate-400">Target Patron:</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedCustomer(id);
                    loadRecommendations(id);
                  }}
                  className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 font-medium focus:outline-none focus:border-amber-400"
                >
                  <option value={1}>Alice Smith (Customer #1)</option>
                  <option value={2}>Julian Vance (Customer #2)</option>
                  <option value={3}>Clara Oswald (Customer #3)</option>
                  <option value={4}>David Miller (Customer #4)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <div key={rec.propertyId} className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition rounded-2xl p-5 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        {rec.propertyType}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        Affinity: {rec.affinityScore}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition">
                      {rec.propertyName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Property ID: #{rec.propertyId} • {rec.areaSqFt ? `${rec.areaSqFt.toLocaleString()} sq ft` : 'Curated Area'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-mono block">Estimated Valuation</span>
                      <span className="text-lg font-bold text-amber-400">
                        ${Number(rec.price).toLocaleString()}
                      </span>
                    </div>
                    <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BENCHMARK */}
        {activeTab === 'benchmark' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Multi-Hop Traversal Performance Benchmark
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Executes a 4-degree multi-hop query across 5 entities in both PostgreSQL (Relational B-Tree / Hash Joins) and FalkorDB (GraphBLAS Sparse Matrix Multiplication).
                </p>
              </div>

              <button
                onClick={handleRunBenchmark}
                disabled={isBenchmarking}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                {isBenchmarking ? 'Benchmarking...' : 'Execute Live Comparison'}
              </button>
            </div>

            {benchmark ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PostgreSQL Result */}
                <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-400" />
                      <h4 className="font-bold text-slate-100">PostgreSQL (Relational Baseline)</h4>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      B-Tree Indexes
                    </span>
                  </div>

                  <div className="text-4xl font-extrabold text-blue-400 font-mono mb-2">
                    {benchmark.postgres.executionTimeMs} ms
                  </div>
                  <p className="text-xs text-slate-400">
                    Execution time for 5-table JOIN pipeline across PROPERTY, OWNERSHIP, CUSTOMER, OFFER, LISTING, and AGENT.
                  </p>

                  <div className="mt-6 p-4 bg-slate-950 rounded-xl text-xs font-mono text-slate-400 space-y-1">
                    <p>• Rows Scanned: Relational Join Tree</p>
                    <p>• Join Strategy: Nested Loop & Hash Join</p>
                    <p>• Memory: Dynamic Hash Table allocation</p>
                  </div>
                </div>

                {/* FalkorDB Result */}
                <div className="p-6 bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/40 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-amber-300">FalkorDB (GraphBLAS Engine)</h4>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Matrix Traversal
                    </span>
                  </div>

                  <div className="text-4xl font-extrabold text-amber-400 font-mono mb-2">
                    {benchmark.falkordb.executionTimeMs} ms
                  </div>
                  <p className="text-xs text-slate-300">
                    Execution time for equivalent Cypher multi-hop path traversal using sparse matrix multiplication.
                  </p>

                  <div className="mt-6 p-4 bg-slate-950/80 border border-amber-500/20 rounded-xl text-xs font-mono text-amber-200/90 space-y-1">
                    <p>• Algorithm: GraphBLAS Linear Algebra</p>
                    <p>• Multiplier: <span className="font-bold text-amber-400">{benchmark.speedupComparison}</span></p>
                    <p>• Overhead: Zero intermediate JOIN table bloat</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-3 text-amber-400/50" />
                <p className="font-medium">Ready to run benchmark</p>
                <p className="text-xs text-slate-500 mt-1">Click the button above to execute synchronous multi-hop queries on both engines.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OPEN CYPHER QUERY CONSOLE */}
        {activeTab === 'cypher' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    OpenCypher Query Console
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Execute raw declarative OpenCypher queries against the live FalkorDB GraphBLAS instance.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Presets:</span>
                  <select
                    onChange={(e) => {
                      const selected = SAMPLE_CYPHER_QUERIES.find((q) => q.name === e.target.value);
                      if (selected) setCypherQuery(selected.query);
                    }}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  >
                    {SAMPLE_CYPHER_QUERIES.map((q) => (
                      <option key={q.name} value={q.name}>{q.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cypher Text Area */}
              <div className="relative">
                <textarea
                  rows={4}
                  value={cypherQuery}
                  onChange={(e) => setCypherQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm text-amber-300 focus:outline-none focus:border-amber-500/80 transition"
                  placeholder="MATCH (n) RETURN n LIMIT 25;"
                />
                <button
                  onClick={handleExecuteCypher}
                  disabled={isExecutingCypher}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isExecutingCypher ? 'Running...' : 'Run Cypher'}
                </button>
              </div>
            </div>

            {/* Cypher Result Table */}
            {cypherResult && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Success
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {cypherResult.rows?.length || 0} rows returned
                    </span>
                  </div>
                  <span className="text-xs font-mono text-amber-400">
                    Execution Time: {cypherResult.executionTimeMs ?? 0} ms
                  </span>
                </div>

                {cypherResult.error ? (
                  <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-xs font-mono text-red-300">
                    {cypherResult.error.message}
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-96 border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs font-mono text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          {(cypherResult.headers || ['Result']).map((h, i) => (
                            <th key={i} className="py-2.5 px-4">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/50">
                        {(cypherResult.rows || []).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/60 transition">
                            {row.map((cell: any, cIdx: number) => (
                              <td key={cIdx} className="py-2 px-4 whitespace-nowrap">
                                {typeof cell === 'object' && cell !== null
                                  ? JSON.stringify(cell)
                                  : String(cell ?? 'null')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
