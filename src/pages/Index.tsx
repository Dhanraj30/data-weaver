import { useEffect, useState } from 'react';
import { Minimize2, Maximize2, Layers } from 'lucide-react';
import GraphVisualization from '@/components/GraphVisualization';
import NodeDetailPanel from '@/components/NodeDetailPanel';
import ChatPanel from '@/components/ChatPanel';
import { type GraphData, type GraphNode, loadGraphData } from '@/lib/graphData';
import { Button } from '@/components/ui/button';

export default function Index() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [showGranular, setShowGranular] = useState(true);

  useEffect(() => {
    loadGraphData().then(setGraphData);
  }, []);

  const filteredData = graphData
    ? showGranular
      ? graphData
      : {
          nodes: graphData.nodes.filter(n => !['SalesOrderItem'].includes(n.type)),
          edges: graphData.edges.filter(e => e.type !== 'has_item' && e.type !== 'references_material'),
        }
    : null;

  if (!filteredData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading graph data…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card">
        <div className="w-7 h-7 rounded bg-foreground flex items-center justify-center">
          <span className="text-background text-xs font-bold">☐</span>
        </div>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer">Mapping</span>
          <span>/</span>
          <span className="text-foreground font-semibold">Order to Cash</span>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Graph Area */}
        <div className="flex-1 relative">
          {/* Controls */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 bg-card/90 backdrop-blur-sm text-xs">
              <Minimize2 size={14} />
              Minimize
            </Button>
            <Button
              variant={showGranular ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setShowGranular(!showGranular)}
            >
              <Layers size={14} />
              {showGranular ? 'Hide' : 'Show'} Granular Overlay
            </Button>
          </div>

          <GraphVisualization
            graphData={filteredData}
            onNodeClick={setSelectedNode}
            highlightNodes={highlightNodes}
          />

          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode}
              graphData={filteredData}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>

        {/* Chat Panel */}
        <div className="w-[380px] flex-shrink-0">
          <ChatPanel
            onHighlightNodes={(ids) => setHighlightNodes(new Set(ids))}
          />
        </div>
      </div>
    </div>
  );
}
