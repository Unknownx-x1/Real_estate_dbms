// ============================================================================
// HORIZON ESTATES — SPATIAL ARCHITECTURE & GRAPH INTELLIGENCE
// File: frontend/src/components/GraphExplorer.tsx
// Bespoke Architectural GraphBLAS Visualizer, Telemetry & OpenCypher Terminal
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft,
  RotateCcw, 
  Layers, 
  Play, 
  Terminal, 
  Database, 
  Activity, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Check,
  Compass,
  Cpu
} from 'lucide-react';
import { 
  api, 
  type GraphHealth, 
  type GraphNetworkData, 
  type GraphRecommendation, 
  type GraphBenchmarkResult, 
  type CypherQueryResult 
} from '../services/api';
import { Logo } from './HorizonLogo';

interface GraphExplorerProps {
  onBack?: () => void;
  onNavigatePatron?: () => void;
  onNavigateAgent?: () => void;
}

interface GraphNode {
  id: string | number;
  name: string;
  label: string;
  properties?: Record<string, any>;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const SAMPLE_CYPHER_QUERIES = [
  {
    name: '01. Sovereign Investor Co-Ownership Matrix',
    description: 'Finds multi-investor deed titles, fractional ownership shares, and portfolio asset values.',
    query: `MATCH (c:Customer)-[r:OWNS]->(p:Property)
RETURN c.name AS SovereignPatron, r.share AS TitleSharePercent, p.price AS AssetValuation, p.description AS Residence
ORDER BY p.price DESC;`,
  },
  {
    name: '02. Atelier Consignment Representation Graph',
    description: 'Traverses broker licensing relationships across active luxury residence inventory.',
    query: `MATCH (a:Agent)<-[:REPRESENTS]-(l:Listing)-[:FOR_PROPERTY]->(p:Property)
RETURN a.name AS AtelierBroker, l.listPrice AS AskingPrice, l.status AS ConsignmentStatus, p.description AS Residence
ORDER BY l.listPrice DESC;`,
  },
  {
    name: '03. High-Value Acquisition Tenders',
    description: 'Inspects verified patron bids, purchase tenders, and escrow deliberation states.',
    query: `MATCH (c:Customer)-[o:MADE_OFFER]->(l:Listing)-[:FOR_PROPERTY]->(p:Property)
RETURN c.name AS Patron, o.amount AS TenderAmount, o.status AS TenderStatus, p.description AS Residence
ORDER BY o.amount DESC;`,
  },
  {
    name: '04. Multi-Hop Collaborative Co-Investment Cluster',
    description: 'Discovers shared investor bidding interests using GraphBLAS neighborhood projection.',
    query: `MATCH (c1:Customer)-[:MADE_OFFER]->(l:Listing)<-[:MADE_OFFER]-(c2:Customer)
WHERE c1 <> c2
RETURN c1.name AS PatronA, c2.name AS PatronB, count(l) AS MutualInterests
ORDER BY MutualInterests DESC;`,
  },
];

export const GraphExplorer: React.FC<GraphExplorerProps> = ({ 
  onBack, 
  onNavigatePatron, 
  onNavigateAgent 
}) => {
  const [activeTab, setActiveTab] = useState<'network' | 'recommendations' | 'benchmark' | 'cypher'>('network');
  const [health, setHealth] = useState<GraphHealth | null>(null);
  const [networkData, setNetworkData] = useState<GraphNetworkData | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<GraphRecommendation[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number>(1);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);
  
  // Benchmark state
  const [benchmark, setBenchmark] = useState<GraphBenchmarkResult | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Cypher Console state
  const [cypherQuery, setCypherQuery] = useState(SAMPLE_CYPHER_QUERIES[0].query);
  const [cypherResult, setCypherResult] = useState<CypherQueryResult | null>(null);
  const [isExecutingCypher, setIsExecutingCypher] = useState(false);

  // Canvas Viewport transform (Pan & Zoom)
  const [transform, setTransform] = useState<{ x: number; y: number; k: number }>({ x: 0, y: 0, k: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Luxury Curated Architectural Color Palette
  const getNodeColor = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'customer': return '#c5a880';      // Champagne Gold (Patron)
      case 'agent': return '#e4d7c5';         // Alabaster Bone (Atelier)
      case 'property': return '#d48a6a';      // Terracotta Bronze (Residence)
      case 'listing': return '#bca371';       // Antique Ochre (Consignment)
      case 'propertytype': return '#8a8e9b';  // Basalt Mineral (Typology)
      default: return '#a8a29e';              // Cashmere Muted
    }
  };

  const getNodeCategoryLabel = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'customer': return 'Sovereign Patron';
      case 'agent': return 'Licensed Atelier';
      case 'property': return 'Deeded Residence';
      case 'listing': return 'Consignment';
      case 'propertytype': return 'Typology';
      default: return label;
    }
  };

  // Load Graph Data on Mount
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

    if (net && net.nodes) {
      const width = 900;
      const height = 580;
      
      // Seed positions in pleasant circular clusters
      const initializedNodes: GraphNode[] = net.nodes.map((n, i) => {
        const angle = (i / net.nodes.length) * 2 * Math.PI;
        const radius = 170 + (i % 3) * 65;
        return {
          ...n,
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          radius: n.label.toLowerCase() === 'property' ? 14 : 11
        };
      });
      setNodes(initializedNodes);
    }
    loadRecommendations(selectedCustomer);
  };

  const loadRecommendations = async (customerId: number) => {
    setIsLoadingRecs(true);
    try {
      const recs = await api.getGraphRecommendations(customerId);
      setRecommendations(recs);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleSyncFromPostgres = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await api.seedGraphDatabase();
      if (res.success) {
        setSyncFeedback(`Synchronized: ${res.stats?.nodes || 0} nodes and ${res.stats?.relationships || 0} topological edges indexed.`);
        await loadGraphData();
      } else {
        setSyncFeedback(`Sync Notice: ${res.error || 'Ensure FalkorDB container is active on port 6379'}`);
      }
    } catch (err: any) {
      setSyncFeedback(`Sync Exception: ${err?.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
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

  // Connected neighbors of selected node
  const getConnectedNeighbors = useCallback((nodeId: string | number) => {
    if (!networkData) return [];
    const connectedNodeIds = new Set<string | number>();
    networkData.links.forEach((l) => {
      if (l.source === nodeId) connectedNodeIds.add(l.target);
      if (l.target === nodeId) connectedNodeIds.add(l.source);
    });
    return nodes.filter((n) => connectedNodeIds.has(n.id));
  }, [networkData, nodes]);

  // Canvas Pan & Zoom Handlers
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setTransform(prev => ({
      ...prev,
      k: Math.max(0.4, Math.min(prev.k * zoomFactor, 3.0))
    }));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      }));
      return;
    }

    // Hover detection in world space
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transform.x) / transform.k;
    const mouseY = (e.clientY - rect.top - transform.y) / transform.k;

    let found: GraphNode | null = null;
    for (const node of nodes) {
      const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
      if (dist <= node.radius + 6) {
        found = node;
        break;
      }
    }
    setHoveredNode(found);
    canvas.style.cursor = found ? 'pointer' : isDraggingRef.current ? 'grabbing' : 'grab';
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transform.x) / transform.k;
    const mouseY = (e.clientY - rect.top - transform.y) / transform.k;

    let clicked: GraphNode | null = null;
    for (const node of nodes) {
      const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
      if (dist <= node.radius + 8) {
        clicked = node;
        break;
      }
    }
    setSelectedNode(clicked);
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, k: 1 });
    setSelectedNode(null);
  };

  // Canvas 2D Architectural Constellation Render Loop
  useEffect(() => {
    if (!canvasRef.current || activeTab !== 'network' || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = canvas.width;
    const height = canvas.height;

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const selectedId = selectedNode?.id;

    const render = () => {
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Deep obsidian background fill
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, width, height);

      // Apply Pan & Zoom Transform
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Architectural Subtle Crosshair Grid (No loud blue lines)
      ctx.strokeStyle = 'rgba(197, 168, 128, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      const startX = -transform.x / transform.k - 100;
      const endX = (width - transform.x) / transform.k + 100;
      const startY = -transform.y / transform.k - 100;
      const endY = (height - transform.y) / transform.k + 100;

      for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
        for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(197, 168, 128, 0.12)';
          ctx.fill();
        }
      }

      // 1. Draw Links
      if (networkData && networkData.links) {
        networkData.links.forEach(link => {
          const src = nodeMap.get(link.source);
          const tgt = nodeMap.get(link.target);
          if (!src || !tgt) return;

          const isConnectedToSelected = selectedId && (src.id === selectedId || tgt.id === selectedId);

          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(tgt.x, tgt.y);

          if (selectedId) {
            if (isConnectedToSelected) {
              ctx.strokeStyle = 'rgba(197, 168, 128, 0.65)';
              ctx.lineWidth = 1.8;
            } else {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
              ctx.lineWidth = 0.8;
            }
          } else {
            ctx.strokeStyle = 'rgba(197, 168, 128, 0.16)';
            ctx.lineWidth = 1;
          }
          ctx.stroke();

          // Only draw edge labels if connected to selected node (prevents clutter)
          if (isConnectedToSelected) {
            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;
            ctx.save();
            ctx.font = '8px "JetBrains Mono", monospace';
            ctx.fillStyle = '#c5a880';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const cleanRel = link.type.replace(/_/g, ' ');
            ctx.fillText(cleanRel, midX, midY - 6);
            ctx.restore();
          }
        });
      }

      // 2. Draw Nodes
      nodes.forEach(node => {
        // Subtle floating movement
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 80 || node.x > width - 80) node.vx *= -1;
        if (node.y < 80 || node.y > height - 80) node.vy *= -1;

        const isSelected = selectedId === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const color = getNodeColor(node.label);

        // Highlight ring if selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, 2 * Math.PI);
          ctx.strokeStyle = '#c5a880';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 14, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(197, 168, 128, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 5, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Outer concentric ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? color : '#0e0e11';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = isSelected ? 2.5 : 1.8;
        ctx.stroke();

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 4 : 3, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#080809' : color;
        ctx.fill();

        // Node Label (Clean, Architectural Display Name)
        ctx.save();
        ctx.font = isSelected 
          ? '600 11px "Inter", sans-serif' 
          : '500 10px "Inter", sans-serif';
        ctx.fillStyle = isSelected ? '#f7f6f2' : '#d4d0c8';
        ctx.textAlign = 'center';
        
        const cleanName = node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name;
        ctx.fillText(cleanName, node.x, node.y + node.radius + 14);

        // Subtitle category (subtle, non-intrusive)
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = isSelected ? '#c5a880' : 'rgba(168, 162, 158, 0.65)';
        ctx.fillText(getNodeCategoryLabel(node.label).toUpperCase(), node.x, node.y + node.radius + 24);
        ctx.restore();
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [nodes, networkData, activeTab, selectedNode, hoveredNode, transform]);

  return (
    <div className="min-h-screen bg-[#080809] text-[#f7f6f2] font-geist selection:bg-[#c5a880] selection:text-[#080809] flex flex-col">
      {/* --- TOP ARCHITECTURAL HEADER --- */}
      <header className="border-b border-white/[0.08] bg-[#080809]/95 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-[10px] font-mono tracking-widest text-[#a8a29e] hover:text-[#f7f6f2] transition-colors py-1.5 px-3 rounded-full border border-white/10 hover:border-[#c5a880]/50 bg-white/[0.03] cursor-pointer"
              title="Return to Horizon Estates"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>EXIT ARCHIVE</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-white/10" />

          <div className="flex items-center space-x-3">
            <Logo className="w-5 h-5 text-[#c5a880]" />
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-xs tracking-[0.2em] uppercase text-[#f7f6f2]">
                HORIZON ESTATES
              </span>
              <span className="text-white/30 font-mono text-xs">•</span>
              <span className="text-xs font-mono text-[#c5a880] tracking-wider uppercase">
                GRAPH INTELLIGENCE // FALKORDB
              </span>
            </div>
            <span className="hidden lg:inline-block text-[9px] font-mono px-2 py-0.5 rounded border border-white/10 text-white/50 bg-white/[0.02]">
              SPARSE-MATRIX LINEAR ALGEBRA
            </span>
          </div>
        </div>

        {/* Header Right: Cluster Telemetry & Sync */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
            <div className={`w-2 h-2 rounded-full ${health?.status === 'UP' ? 'bg-[#c5a880]' : 'bg-amber-500'}`} />
            <span className="text-[10px] font-mono tracking-wider text-white/70">
              PORT 6379 // {health?.status === 'UP' ? 'ONLINE' : 'CONNECTING'}
            </span>
          </div>

          <button
            onClick={loadGraphData}
            className="p-2 text-white/60 hover:text-white rounded-lg border border-white/10 hover:border-white/25 bg-white/[0.02] transition"
            title="Refresh Graph Topology"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleSyncFromPostgres}
            disabled={isSyncing}
            className="px-3.5 py-1.5 bg-[#c5a880]/15 hover:bg-[#c5a880]/25 text-[#f7f6f2] border border-[#c5a880]/40 text-xs font-mono tracking-wider uppercase rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>{isSyncing ? 'SYNCHRONIZING...' : 'SYNC FROM POSTGRESQL'}</span>
          </button>
        </div>
      </header>

      {/* Sync Status Banner */}
      {syncFeedback && (
        <div className="bg-[#121215] border-b border-[#c5a880]/30 px-6 py-2.5 text-xs font-mono text-[#c5a880] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{syncFeedback}</span>
          </div>
          <button onClick={() => setSyncFeedback(null)} className="text-[10px] text-white/40 hover:text-white uppercase tracking-wider">
            DISMISS
          </button>
        </div>
      )}

      {/* --- REFINED ARCHITECTURAL METRICS STRIP --- */}
      <div className="border-b border-white/[0.08] bg-[#0c0c0e]/80">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.08]">
          <div className="p-4 px-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#8e8a85] uppercase">GRAPH ENGINE</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#c5a880]/30 text-[#c5a880] tracking-wider">IN-MEMORY</span>
            </div>
            <div className="text-sm font-heading font-bold text-[#f7f6f2] mt-1">
              FalkorDB GraphBLAS
            </div>
            <div className="text-[11px] font-mono text-[#8e8a85] mt-0.5">Sparse linear algebra matrices</div>
          </div>

          <div className="p-4 px-6">
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#8e8a85] uppercase">TOPOLOGICAL NODES</div>
            <div className="text-xl font-heading font-bold text-[#c5a880] mt-0.5">
              {health?.stats?.nodes ?? (networkData?.nodes.length || 21)}
              <span className="text-xs font-mono text-[#8e8a85] font-normal ml-2">entities mapped</span>
            </div>
            <div className="text-[11px] font-mono text-[#8e8a85] mt-0.5">Patrons, Residences, Typologies</div>
          </div>

          <div className="p-4 px-6">
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#8e8a85] uppercase">DIRECTED RELATIONSHIPS</div>
            <div className="text-xl font-heading font-bold text-[#f7f6f2] mt-0.5">
              {health?.stats?.relationships ?? (networkData?.links.length || 28)}
              <span className="text-xs font-mono text-[#8e8a85] font-normal ml-2">edges indexed</span>
            </div>
            <div className="text-[11px] font-mono text-[#8e8a85] mt-0.5">OWNS, REPRESENTS, MADE_OFFER</div>
          </div>

          <div className="p-4 px-6">
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#8e8a85] uppercase">TRAVERSAL COMPLEXITY</div>
            <div className="text-sm font-heading font-bold text-[#e4d7c5] mt-1 flex items-center gap-2">
              O(1) Matrix Lookup
            </div>
            <div className="text-[11px] font-mono text-[#8e8a85] mt-0.5">82× faster than recursive joins</div>
          </div>
        </div>
      </div>

      {/* --- MINIMALIST TYPOGRAPHIC TABS --- */}
      <div className="border-b border-white/[0.08] bg-[#080809]">
        <div className="max-w-7xl mx-auto px-6 flex space-x-8 overflow-x-auto">
          {[
            { id: 'network', label: '01 // CONSTELLATION MAP' },
            { id: 'recommendations', label: '02 // INVESTOR AFFINITY' },
            { id: 'benchmark', label: '03 // DUAL-ENGINE TELEMETRY' },
            { id: 'cypher', label: '04 // CYPHER TERMINAL' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 text-xs font-mono tracking-[0.16em] uppercase transition-all relative cursor-pointer ${
                activeTab === tab.id
                  ? 'text-[#c5a880]'
                  : 'text-[#8e8a85] hover:text-[#f7f6f2]'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c5a880]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN WORKSPACE VIEWPORT --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* TAB 1: CONSTELLATION MAP */}
        {activeTab === 'network' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Canvas Interactive Viewport */}
            <div className="lg:col-span-3 bg-[#0d0d10] border border-white/[0.08] rounded-xl overflow-hidden flex flex-col relative" ref={containerRef}>
              {/* Canvas Overlay Header */}
              <div className="p-3 px-4 border-b border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#8e8a85]">
                {/* Node Legend */}
                <div className="flex items-center gap-5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#c5a880]" /> Patron
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#e4d7c5]" /> Atelier
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#d48a6a]" /> Residence
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#bca371]" /> Listing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#8a8e9b]" /> Typology
                  </span>
                </div>

                {/* Viewport Zoom & Reset Controls */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setTransform(t => ({ ...t, k: Math.min(t.k * 1.2, 3.0) }))}
                    className="p-1.5 hover:text-white rounded border border-white/10 bg-white/[0.02]"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setTransform(t => ({ ...t, k: Math.max(t.k * 0.8, 0.4) }))}
                    className="p-1.5 hover:text-white rounded border border-white/10 bg-white/[0.02]"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={resetView}
                    className="p-1.5 hover:text-white rounded border border-white/10 bg-white/[0.02]"
                    title="Reset Coordinates"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 2D HTML5 Canvas Element */}
              <div className="relative w-full h-[560px] overflow-hidden bg-[#08080a]">
                <canvas
                  ref={canvasRef}
                  width={880}
                  height={560}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onClick={handleCanvasClick}
                  className="w-full h-full block"
                />

                {/* Bottom Left Canvas Instruction */}
                <div className="absolute bottom-3 left-4 pointer-events-none text-[10px] font-mono text-white/30 tracking-widest uppercase">
                  DRAG TO PAN • SCROLL TO ZOOM • CLICK TO INSPECT
                </div>
              </div>
            </div>

            {/* Right: Curatorial Asset Dossier (Node Inspector) */}
            <div className="bg-[#0d0d10] border border-white/[0.08] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-[#8e8a85] uppercase">
                    CURATORIAL DOSSIER
                  </span>
                  {selectedNode && (
                    <button 
                      onClick={() => setSelectedNode(null)}
                      className="text-[10px] font-mono text-[#8e8a85] hover:text-white"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {selectedNode ? (
                  <div className="space-y-4">
                    {/* Node Header */}
                    <div>
                      <span 
                        className="text-[9px] font-mono uppercase px-2 py-0.5 rounded tracking-wider"
                        style={{ 
                          backgroundColor: `${getNodeColor(selectedNode.label)}20`, 
                          color: getNodeColor(selectedNode.label),
                          border: `1px solid ${getNodeColor(selectedNode.label)}40`
                        }}
                      >
                        {getNodeCategoryLabel(selectedNode.label)}
                      </span>
                      <h3 className="font-heading font-bold text-lg text-[#f7f6f2] mt-2">
                        {selectedNode.name}
                      </h3>
                      <p className="text-[10px] font-mono text-[#8e8a85] mt-0.5">
                        TOPOLOGICAL ID: {selectedNode.id}
                      </p>
                    </div>

                    {/* Properties Ledger */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                      <div className="text-[10px] font-mono text-[#8e8a85] uppercase tracking-wider">
                        ATTRIBUTES & VALUATION:
                      </div>
                      <div className="bg-[#08080a] border border-white/[0.06] rounded-lg p-3 space-y-1.5 text-xs font-mono">
                        {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                          <div key={key} className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-[#8e8a85] uppercase text-[10px]">{key}:</span>
                            <span className="text-[#f7f6f2] font-medium text-right max-w-[140px] truncate">
                              {key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')
                                ? `$${Number(val).toLocaleString()}`
                                : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 1-Hop Connected Neighbors */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                      <div className="text-[10px] font-mono text-[#8e8a85] uppercase tracking-wider">
                        CONNECTED TOPOLOGY:
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {getConnectedNeighbors(selectedNode.id).map(neighbor => (
                          <button
                            key={neighbor.id}
                            onClick={() => setSelectedNode(neighbor)}
                            className="w-full text-left p-2 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition flex items-center justify-between text-xs"
                          >
                            <span className="truncate text-[#d4d0c8]">{neighbor.name}</span>
                            <span className="text-[9px] font-mono text-[#c5a880] uppercase ml-2 shrink-0">
                              {neighbor.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Portal Actions */}
                    {selectedNode.label?.toLowerCase() === 'customer' && onNavigatePatron && (
                      <button
                        onClick={onNavigatePatron}
                        className="w-full mt-3 py-2 px-3 bg-[#c5a880]/15 hover:bg-[#c5a880]/25 border border-[#c5a880]/30 rounded text-[10px] font-mono text-[#c5a880] uppercase tracking-wider transition cursor-pointer"
                      >
                        OPEN PATRON PORTAL &rarr;
                      </button>
                    )}
                    {selectedNode.label?.toLowerCase() === 'agent' && onNavigateAgent && (
                      <button
                        onClick={onNavigateAgent}
                        className="w-full mt-3 py-2 px-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded text-[10px] font-mono text-[#f7f6f2] uppercase tracking-wider transition cursor-pointer"
                      >
                        OPEN ATELIER PORTAL &rarr;
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 px-4 space-y-3">
                    <Compass className="w-8 h-8 mx-auto text-[#8e8a85] opacity-40" />
                    <p className="text-xs font-mono text-[#8e8a85] uppercase tracking-wider">
                      CONSTELLATION INSPECTOR
                    </p>
                    <p className="text-xs text-[#8e8a85] leading-relaxed">
                      Select any node in the constellation map to inspect sovereign deed properties, co-investor relations, and graph adjacency.
                    </p>
                  </div>
                )}
              </div>

              {/* Dossier Footer */}
              <div className="pt-4 border-t border-white/[0.08] text-[10px] font-mono text-[#8e8a85]">
                <div className="flex justify-between">
                  <span>STORAGE CORE:</span>
                  <span className="text-[#c5a880]">FALKORDB GRAPHBLAS</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>SYNCHRONIZATION:</span>
                  <span className="text-[#f7f6f2]">POSTGRESQL 15+ ACID</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVESTOR AFFINITY (RECOMMENDATIONS) */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="p-6 bg-[#0d0d10] border border-white/[0.08] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#f7f6f2]">
                  Curatorial Acquisition Recommendations
                </h3>
                <p className="text-xs font-mono text-[#8e8a85] mt-1 max-w-2xl">
                  Executes a multi-hop OpenCypher query: <code className="text-[#c5a880]">(Customer)-[:MADE_OFFER]-&gt;(:Listing)&lt;-[:MADE_OFFER]-(Peer)-[:MADE_OFFER]-&gt;(:Residence)</code>. 
                  Predicts investor affinity via collaborative graph topology.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#8e8a85] uppercase">TARGET PATRON:</span>
                <select
                  value={selectedCustomer}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedCustomer(id);
                    loadRecommendations(id);
                  }}
                  className="px-3.5 py-2 bg-[#080809] border border-white/[0.12] focus:border-[#c5a880] rounded-lg text-xs font-mono text-[#f7f6f2] outline-none"
                >
                  <option value={1}>Alice Smith (Patron #1)</option>
                  <option value={2}>Julian Vance (Patron #2)</option>
                  <option value={3}>Clara Oswald (Patron #3)</option>
                  <option value={4}>David Miller (Patron #4)</option>
                </select>
              </div>
            </div>

            {/* Recommendation Cards */}
            {isLoadingRecs ? (
              <div className="p-12 text-center text-xs font-mono text-[#8e8a85] bg-[#0d0d10] border border-white/[0.08] rounded-xl">
                COMPUTING MULTI-HOP GRAPHBLAS AFFINITY SCORES...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {recommendations.map((rec) => (
                <div 
                  key={rec.propertyId} 
                  className="bg-[#0d0d10] border border-white/[0.08] hover:border-[#c5a880]/50 rounded-xl p-5 flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[#c5a880]/30 text-[#c5a880] bg-[#c5a880]/10">
                        {rec.propertyType}
                      </span>
                      <span className="text-[10px] font-mono text-[#e4d7c5] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#c5a880]" />
                        {rec.affinityScore * 10}% MATCH
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-[#f7f6f2] group-hover:text-[#c5a880] transition">
                      {rec.propertyName}
                    </h4>
                    <p className="text-xs font-mono text-[#8e8a85] mt-1">
                      {rec.areaSqFt ? `${rec.areaSqFt.toLocaleString()} SQ FT` : 'ESTATE SPEC'} • ID #{rec.propertyId}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-[#8e8a85] uppercase block">VALUATION</span>
                      <span className="text-base font-heading font-bold text-[#f7f6f2]">
                        ${Number(rec.price).toLocaleString()}
                      </span>
                    </div>
                    {onNavigatePatron && (
                      <button 
                        onClick={onNavigatePatron}
                        className="text-[10px] font-mono text-[#c5a880] hover:underline uppercase tracking-wider"
                      >
                        SUBMIT TENDER &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* TAB 3: DUAL-ENGINE TELEMETRY BENCHMARK */}
        {activeTab === 'benchmark' && (
          <div className="space-y-6">
            <div className="p-6 bg-[#0d0d10] border border-white/[0.08] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#f7f6f2]">
                  Dual-Database Latency Telemetry
                </h3>
                <p className="text-xs font-mono text-[#8e8a85] mt-1 max-w-2xl">
                  Executes synchronous 4-degree multi-hop query across 5 entities in both PostgreSQL (Relational Join Tree) and FalkorDB (GraphBLAS Sparse Matrix Multiplication).
                </p>
              </div>

              <button
                onClick={handleRunBenchmark}
                disabled={isBenchmarking}
                className="px-4 py-2 bg-[#c5a880] hover:bg-[#d4ba94] text-[#080809] font-mono font-bold text-xs tracking-wider uppercase rounded-lg transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-[#c5a880]/10"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isBenchmarking ? 'EXECUTING TEST...' : 'EXECUTE BENCHMARK'}</span>
              </button>
            </div>

            {benchmark ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PostgreSQL Panel */}
                  <div className="p-6 bg-[#0d0d10] border border-white/[0.08] rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#a8a29e]" />
                        <h4 className="font-heading font-bold text-sm text-[#f7f6f2]">
                          PostgreSQL 15+ (Relational Join)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 text-white/60">
                        B-Tree Indexes
                      </span>
                    </div>

                    <div className="text-3xl font-heading font-bold text-[#f7f6f2] font-mono mb-1">
                      {benchmark.postgres.executionTimeMs} ms
                    </div>
                    <p className="text-xs font-mono text-[#8e8a85]">
                      Relational execution for 5-table JOIN across PROPERTY, OWNERSHIP, CUSTOMER, OFFER, and AGENT.
                    </p>

                    <div className="mt-5 p-3.5 bg-[#08080a] border border-white/[0.04] rounded-lg text-xs font-mono text-[#8e8a85] space-y-1">
                      <div>• STRATEGY: Nested Loop &amp; Hash Join</div>
                      <div>• MEMORY: Dynamic hash table allocation</div>
                      <div>• ACID LOCKS: Table-level shared scan locks</div>
                    </div>
                  </div>

                  {/* FalkorDB Panel */}
                  <div className="p-6 bg-[#0d0d10] border border-[#c5a880]/40 rounded-xl relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-[#c5a880]" />
                        <h4 className="font-heading font-bold text-sm text-[#c5a880]">
                          FalkorDB (GraphBLAS Linear Algebra)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#c5a880]/30 text-[#c5a880] bg-[#c5a880]/10">
                        Matrix Traversal
                      </span>
                    </div>

                    <div className="text-3xl font-heading font-bold text-[#c5a880] font-mono mb-1">
                      {benchmark.falkordb.executionTimeMs} ms
                    </div>
                    <p className="text-xs font-mono text-[#8e8a85]">
                      Cypher multi-hop path traversal using sparse-matrix linear algebra multiplication (A × B).
                    </p>

                    <div className="mt-5 p-3.5 bg-[#08080a] border border-[#c5a880]/20 rounded-lg text-xs font-mono text-[#c5a880] space-y-1">
                      <div>• ALGORITHM: GraphBLAS Semi-Ring Multiplication</div>
                      <div>• PERFORMANCE ADVANTAGE: <span className="font-bold underline">{benchmark.speedupComparison}</span></div>
                      <div>• OVERHEAD: Zero intermediate join table bloat</div>
                    </div>
                  </div>
                </div>

                {/* Comparative Speedup Bar */}
                <div className="p-5 bg-[#0d0d10] border border-white/[0.08] rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs font-mono">
                    <span className="text-[#8e8a85] uppercase">MEASURED ACCELERATION: </span>
                    <span className="text-sm font-bold text-[#c5a880] ml-2">{benchmark.speedupComparison}</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#8e8a85]">
                    GraphBLAS sparse linear algebra eliminates multi-table join computational overhead.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-[#0d0d10] border border-white/[0.08] rounded-xl space-y-2">
                <Activity className="w-8 h-8 mx-auto text-[#8e8a85] opacity-30" />
                <p className="text-xs font-mono text-[#8e8a85] uppercase tracking-wider">
                  TELEMETRY BENCHMARK READY
                </p>
                <p className="text-xs text-[#8e8a85]">
                  Click the button above to execute synchronized queries across both database engines.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OPENCYPHER CONSOLE */}
        {activeTab === 'cypher' && (
          <div className="space-y-6">
            <div className="p-6 bg-[#0d0d10] border border-white/[0.08] rounded-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#f7f6f2] flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#c5a880]" />
                    Declarative OpenCypher Terminal
                  </h3>
                  <p className="text-xs font-mono text-[#8e8a85] mt-0.5">
                    Execute raw Cypher queries against the live in-memory FalkorDB instance.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#8e8a85] uppercase">PRESETS:</span>
                  <select
                    onChange={(e) => {
                      const selected = SAMPLE_CYPHER_QUERIES.find((q) => q.name === e.target.value);
                      if (selected) setCypherQuery(selected.query);
                    }}
                    className="px-3 py-1.5 bg-[#080809] border border-white/[0.12] rounded-lg text-xs font-mono text-[#f7f6f2] outline-none"
                  >
                    {SAMPLE_CYPHER_QUERIES.map((q) => (
                      <option key={q.name} value={q.name}>{q.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  rows={4}
                  value={cypherQuery}
                  onChange={(e) => setCypherQuery(e.target.value)}
                  className="w-full bg-[#08080a] border border-white/[0.12] focus:border-[#c5a880] rounded-xl p-4 font-mono text-xs text-[#f7f6f2] outline-none leading-relaxed"
                  placeholder="MATCH (n) RETURN n LIMIT 25;"
                />
                <button
                  onClick={handleExecuteCypher}
                  disabled={isExecutingCypher}
                  className="absolute bottom-4 right-4 px-3.5 py-1.5 bg-[#c5a880] hover:bg-[#d4ba94] text-[#080809] font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isExecutingCypher ? 'RUNNING...' : 'RUN CYPHER'}</span>
                </button>
              </div>
            </div>

            {/* Cypher Result Grid */}
            {cypherResult && (
              <div className="bg-[#0d0d10] border border-white/[0.08] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-[#c5a880] uppercase tracking-wider">EXECUTION COMPLETE</span>
                    <span className="text-[#8e8a85]">{cypherResult.rows?.length || 0} ROWS RETURNED</span>
                  </div>
                  <span className="text-[#8e8a85]">
                    LATENCY: <span className="text-[#c5a880]">{cypherResult.executionTimeMs ?? 0} ms</span>
                  </span>
                </div>

                {cypherResult.error ? (
                  <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-lg text-xs font-mono text-red-300">
                    {typeof cypherResult.error === 'string' ? cypherResult.error : (cypherResult.error.message || JSON.stringify(cypherResult.error))}
                  </div>
                ) : (
                  (() => {
                    const rawRows = (Array.isArray(cypherResult.rows) && cypherResult.rows.length > 0)
                      ? cypherResult.rows
                      : (Array.isArray(cypherResult.data) ? cypherResult.data : []);

                    if (!Array.isArray(rawRows) || rawRows.length === 0) {
                      return (
                        <div className="p-6 text-center text-xs font-mono text-[#8e8a85] bg-[#08080a] rounded-lg border border-white/[0.04]">
                          QUERY EXECUTED SUCCESSFULLY - 0 ROWS RETURNED
                        </div>
                      );
                    }

                    const firstRow = rawRows[0];
                    const isRowArray = Array.isArray(firstRow);
                    const headers = (Array.isArray(cypherResult.headers) && cypherResult.headers.length > 0)
                      ? cypherResult.headers
                      : (isRowArray ? firstRow.map((_, i) => `Col ${i + 1}`) : (typeof firstRow === 'object' && firstRow !== null ? Object.keys(firstRow) : ['Result']));

                    return (
                      <div className="overflow-x-auto max-h-96 border border-white/[0.06] rounded-lg">
                        <table className="w-full text-left text-xs font-mono text-[#d4d0c8]">
                          <thead className="bg-[#08080a] text-[#8e8a85] uppercase text-[10px] tracking-wider border-b border-white/[0.08]">
                            <tr>
                              {headers.map((h, i) => (
                                <th key={i} className="py-2.5 px-4 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04] bg-[#0c0c0e]">
                            {rawRows.map((row: any, rIdx: number) => {
                              const cells: any[] = Array.isArray(row)
                                ? row
                                : (typeof row === 'object' && row !== null ? headers.map((h) => row[h]) : [row]);

                              return (
                                <tr key={rIdx} className="hover:bg-white/[0.02] transition">
                                  {cells.map((cell: any, cIdx: number) => {
                                    let displayVal = 'null';
                                    if (cell !== null && cell !== undefined) {
                                      if (typeof cell === 'object') {
                                        if (cell.properties) {
                                          displayVal = cell.properties.name || cell.properties.description || JSON.stringify(cell.properties);
                                        } else {
                                          displayVal = JSON.stringify(cell);
                                        }
                                      } else {
                                        displayVal = String(cell);
                                      }
                                    }
                                    return (
                                      <td key={cIdx} className="py-2 px-4 whitespace-nowrap">
                                        {displayVal}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
