# Order-to-Cash Graph Explorer

An interactive graph-based data modeling and query system for SAP Order-to-Cash (O2C) business processes. Users can visually explore interconnected business entities and query the dataset using natural language, powered by an LLM that dynamically generates SQL.

**Live Demo:** [https://id-preview--8b432772-a70d-46dd-b6cd-41d88665020e.lovable.app](https://id-preview--8b432772-a70d-46dd-b6cd-41d88665020e.lovable.app)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  Graph Viz        │  │  Chat Panel (streaming)  │  │
│  │  react-force-     │  │  - Markdown rendering    │  │
│  │  graph-2d         │  │  - SSE stream parsing    │  │
│  └──────────────────┘  └──────────┬───────────────┘  │
└──────────────────────────────────┬────────────────────┘
                                   │ POST /functions/v1/graph-chat
                                   ▼
┌─────────────────────────────────────────────────────┐
│              Supabase Edge Function                  │
│  ┌────────────┐  ┌───────────┐  ┌────────────────┐  │
│  │ Step 1:    │→ │ Step 2:   │→ │ Step 3:        │  │
│  │ LLM +     │  │ Execute   │  │ LLM streams    │  │
│  │ Tool Call  │  │ SQL via   │  │ final answer   │  │
│  │ (generate  │  │ RPC       │  │ grounded in    │  │
│  │  _sql)     │  │           │  │ query results  │  │
│  └────────────┘  └───────────┘  └────────────────┘  │
└──────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL (Supabase)                    │
│  12 tables: sales_order_headers, deliveries,         │
│  billing_documents, journal_entries, payments,       │
│  business_partners, products, plants, etc.           │
│  + execute_readonly_query() RPC function             │
└─────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React + Vite + TypeScript | Fast dev cycle, type safety |
| **Graph Visualization** | `react-force-graph-2d` | Force-directed layout handles 800+ nodes, supports hover/click interactions, zoom/pan |
| **Styling** | Tailwind CSS + shadcn/ui | Semantic design tokens, dark theme, consistent UI |
| **Chat Rendering** | `react-markdown` | Renders LLM markdown responses (tables, bold, lists) |
| **Backend** | Supabase (PostgreSQL + Edge Functions) | Managed Postgres, serverless functions, built-in RLS |
| **LLM** | Google Gemini 3 Flash (via Lovable AI Gateway) | Fast inference, tool-calling support, streaming |

---

## Database Choice: PostgreSQL (via Supabase)

### Why Relational over Graph DB?

The O2C dataset is inherently **tabular** — it arrives as structured JSONL files with well-defined schemas and foreign-key relationships. PostgreSQL was chosen over a graph database (e.g., Neo4j) because:

1. **Natural fit**: The data already has clear table structures (headers + items pattern)
2. **SQL generation**: LLMs are significantly better at generating SQL than Cypher/Gremlin queries
3. **RPC security**: Supabase's `execute_readonly_query()` function restricts execution to SELECT-only, preventing data mutation
4. **No additional infrastructure**: Supabase provides Postgres + Edge Functions + Auth in one platform
5. **Row-Level Security**: All tables have public read-only RLS policies — no writes allowed via API

### Schema Design

The database mirrors the SAP O2C document flow:

```
Sales Order Headers ──┐
Sales Order Items ────┤──→ Outbound Delivery Headers ──→ Billing Document Headers ──→ Journal Entry Items ──→ Payments
                      │    Outbound Delivery Items        Billing Document Items
                      │
Products ◄────────────┘
Business Partners ◄───┘
Plants ◄──────────────┘
```

**Key design decisions:**
- All amounts stored as `text` (preserving original SAP format, avoiding floating-point issues)
- No foreign key constraints (data is denormalized as-is from SAP; joins use business keys like `sales_order`, `delivery_document`, etc.)
- Indexes on all join columns for query performance

### Graph Layer

The graph visualization uses a **pre-computed JSON file** (`public/graph_data.json`) containing 841 nodes and 1,275 edges. This was generated from the raw dataset during ingestion:

- **Nodes**: Each unique entity (Sales Order, Delivery, Billing Document, etc.) becomes a node with metadata
- **Edges**: Relationships are derived from foreign key references in the data (e.g., `outbound_delivery_items.reference_sd_document → sales_order`)

This separation means the graph UI loads instantly without querying the database, while the chat interface queries live data.

---

## LLM Prompting Strategy

### Two-Phase Architecture

The edge function uses a **two-phase LLM call pattern**:

**Phase 1 — Tool Calling (Structured)**
```
System Prompt (with full schema description)
+ User conversation history
+ Tool definition: generate_sql(sql, explanation)
→ LLM decides: answer directly OR generate SQL
```

**Phase 2 — Response Generation (Streaming)**
```
System Prompt
+ Conversation history
+ SQL query executed + results (if any)
→ LLM generates natural language answer grounded in data
→ Streamed to client via SSE
```

### System Prompt Design

The system prompt includes:

1. **Full schema description**: All 12 tables with column names and types
2. **Relationship map**: Explicit documentation of how tables join (e.g., "billing_document_items.reference_sd_document = delivery_document")
3. **Role definition**: "You are Dodge AI, a Graph Agent specialized in analyzing Order-to-Cash processes"
4. **Output formatting rules**: Bold key values, use tables for multiple records, show full document flow chains
5. **SQL constraints**: SELECT only, no semicolons (Supabase RPC requirement)

### Why Tool Calling over Prompt-Based SQL Extraction?

- **Structured output**: Tool calling guarantees JSON with `sql` and `explanation` fields
- **Optional execution**: The LLM can choose NOT to call the tool for conversational responses
- **Separation of concerns**: SQL generation is isolated from response formatting

---

## Guardrails

### Domain Restriction

The system prompt explicitly restricts the LLM to O2C dataset questions:

```
"You MUST ONLY answer questions related to this O2C dataset. If asked about unrelated topics
(general knowledge, creative writing, coding help, etc.), respond: 'This system is designed
to answer questions related to the Order-to-Cash dataset only.'"
```

### SQL Safety

Multiple layers prevent harmful queries:

1. **LLM-level**: System prompt instructs "Only use SELECT statements"
2. **Edge function validation**: `sqlQuery.toUpperCase().startsWith("SELECT")` check before execution
3. **Database-level**: The `execute_readonly_query()` RPC function is defined as a `SECURITY DEFINER` function that only executes SELECT statements
4. **RLS policies**: All tables have read-only public policies — even if SQL injection succeeded, no writes are possible

### Error Handling

- Rate limiting (429) and credit exhaustion (402) are caught and surfaced as user-friendly messages
- SQL execution errors are caught and included in the LLM context so it can explain what went wrong
- Network/streaming errors display gracefully in the chat UI

---

## Features

### Core
- ✅ **Graph visualization** with 841 nodes across 9 entity types
- ✅ **Interactive exploration**: Click nodes to inspect metadata, view connections
- ✅ **Granular overlay toggle**: Show/hide Sales Order Items for cleaner views
- ✅ **Natural language chat**: Ask questions about the O2C process
- ✅ **Dynamic SQL generation**: LLM translates questions to SQL in real-time
- ✅ **Data-grounded responses**: All answers backed by actual query results

### Bonus Features Implemented
- ✅ **Streaming responses**: SSE-based streaming for real-time chat feedback
- ✅ **Conversation memory**: Full message history sent with each request
- ✅ **NL-to-SQL translation**: Tool-calling based SQL generation
- ✅ **Domain guardrails**: Off-topic queries are rejected

### Example Queries Supported
- "Which products are associated with the highest number of billing documents?"
- "Trace the full flow of sales order 1"
- "Find sales orders that were delivered but not billed"
- "What is the total revenue by customer?"
- "Show me all payments and their clearing dates"

---

## Project Structure

```
├── public/
│   └── graph_data.json          # Pre-computed graph (841 nodes, 1275 edges)
├── src/
│   ├── components/
│   │   ├── ChatPanel.tsx         # Streaming chat UI with markdown
│   │   ├── GraphVisualization.tsx # Force-directed graph with legend
│   │   └── NodeDetailPanel.tsx   # Node metadata + connections panel
│   ├── lib/
│   │   └── graphData.ts          # Graph types, colors, data loader
│   └── pages/
│       └── Index.tsx             # Main layout (graph + chat)
├── supabase/
│   ├── functions/
│   │   └── graph-chat/
│   │       └── index.ts          # Edge function: NL → SQL → Response
│   └── migrations/               # Database schema + data loading
└── README.md
```

---

## Running Locally

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (`.env`):
   ```
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
   ```
4. Start dev server: `npm run dev`

The Supabase Edge Function requires:
- `LOVABLE_API_KEY` (for LLM access)
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (auto-provided in Supabase)

---

## Built With

- [Lovable](https://lovable.dev) — AI-powered development platform
- [Supabase](https://supabase.com) — Backend (Postgres + Edge Functions)
- [Google Gemini](https://ai.google.dev) — LLM for natural language understanding
- [react-force-graph-2d](https://github.com/vasturiano/react-force-graph-2d) — Graph visualization
