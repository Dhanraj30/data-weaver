export interface GraphNode {
  id: string;
  type: string;
  label: string;
  metadata: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const NODE_COLORS: Record<string, string> = {
  SalesOrder: '#3b72d9',
  SalesOrderItem: '#5b8fe0',
  Delivery: '#38a169',
  Plant: '#7cb342',
  BillingDocument: '#9b59b6',
  JournalEntry: '#e67e22',
  Payment: '#27ae60',
  Customer: '#e74c6c',
  Product: '#2e86c1',
};

export const NODE_TYPE_LABELS: Record<string, string> = {
  SalesOrder: 'Sales Order',
  SalesOrderItem: 'Sales Order Item',
  Delivery: 'Delivery',
  Plant: 'Plant',
  BillingDocument: 'Billing Document',
  JournalEntry: 'Journal Entry',
  Payment: 'Payment',
  Customer: 'Customer',
  Product: 'Product',
};

export const EDGE_TYPE_LABELS: Record<string, string> = {
  has_item: 'Has Item',
  references_material: 'References Material',
  sold_to: 'Sold To',
  delivered_via: 'Delivered Via',
  from_plant: 'From Plant',
  billed_to: 'Billed To',
  billed_as: 'Billed As',
  journal_entry: 'Journal Entry',
  clears: 'Clears',
  paid_by: 'Paid By',
};

export async function loadGraphData(): Promise<GraphData> {
  const resp = await fetch('/graph_data.json');
  return resp.json();
}
