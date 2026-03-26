import { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { type GraphData, type GraphNode, NODE_COLORS, NODE_TYPE_LABELS } from '@/lib/graphData';

interface Props {
  graphData: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  highlightNodes?: Set<string>;
}

export default function GraphVisualization({ graphData, onNodeClick, highlightNodes }: Props) {
  const fgRef = useRef<ForceGraphMethods | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    const obs = new ResizeObserver(updateSize);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Convert data for force-graph
  const forceData = {
    nodes: graphData.nodes.map(n => ({ ...n })),
    links: graphData.edges.map(e => ({ source: e.source, target: e.target, type: e.type })),
  };

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label || node.id;
    const fontSize = Math.max(10 / globalScale, 1.5);
    const size = highlightNodes?.has(node.id) ? 6 : 4;
    const color = NODE_COLORS[node.type] || '#999';
    const isHighlighted = highlightNodes?.has(node.id);
    const isHovered = hoveredNode === node.id;

    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI);
    ctx.fillStyle = isHighlighted ? color : (isHovered ? color : color + '99');
    ctx.fill();

    if (isHighlighted || isHovered) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();
    }

    // Label only when zoomed in enough or highlighted
    if (globalScale > 1.5 || isHighlighted || isHovered) {
      ctx.font = `${fontSize}px 'IBM Plex Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'hsl(220, 25%, 10%)';
      ctx.fillText(label.length > 20 ? label.slice(0, 18) + '…' : label, node.x!, node.y! + size + 2);
    }
  }, [highlightNodes, hoveredNode]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <ForceGraph2D
        ref={fgRef as any}
        width={dimensions.width}
        height={dimensions.height}
        graphData={forceData}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, 6, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        linkColor={() => 'rgba(150, 180, 220, 0.3)'}
        linkWidth={0.5}
        onNodeClick={(node: any) => onNodeClick?.(node as GraphNode)}
        onNodeHover={(node: any) => setHoveredNode(node?.id || null)}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs">
        <div className="font-semibold mb-1.5 text-foreground">Entity Types</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(NODE_COLORS).filter(([k]) => !k.includes('Item')).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{NODE_TYPE_LABELS[type] || type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
