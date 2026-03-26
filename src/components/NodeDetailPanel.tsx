import { X } from 'lucide-react';
import { type GraphNode, NODE_COLORS, NODE_TYPE_LABELS, EDGE_TYPE_LABELS, type GraphData } from '@/lib/graphData';

interface Props {
  node: GraphNode;
  graphData: GraphData;
  onClose: () => void;
}

export default function NodeDetailPanel({ node, graphData, onClose }: Props) {
  // Find connected edges
  const connections = graphData.edges.filter(
    e => e.source === node.id || e.target === node.id
  );

  const color = NODE_COLORS[node.type] || '#999';

  return (
    <div className="absolute top-4 left-4 bg-card border border-border rounded-xl shadow-lg max-w-sm w-80 z-10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-semibold text-sm text-foreground">
            {NODE_TYPE_LABELS[node.type] || node.type}
          </span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="px-4 py-3 max-h-80 overflow-y-auto custom-scrollbar">
        <div className="space-y-1.5 text-xs">
          {Object.entries(node.metadata).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-2">
              <span className="text-muted-foreground font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-foreground text-right font-mono">
                {String(value || '—')}
              </span>
            </div>
          ))}
        </div>

        {connections.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground font-medium">
              Connections: {connections.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
