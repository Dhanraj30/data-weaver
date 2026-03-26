import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SCHEMA_DESCRIPTION = `
You have access to a SAP Order-to-Cash (O2C) database with these tables:

1. sales_order_headers: sales_order, sales_order_type, sales_organization, distribution_channel, sold_to_party, creation_date, total_net_amount, transaction_currency, overall_delivery_status
2. sales_order_items: sales_order, sales_order_item, material, requested_quantity, requested_quantity_unit, net_amount, transaction_currency, production_plant
3. outbound_delivery_headers: delivery_document, creation_date, shipping_point, overall_goods_movement_status, overall_picking_status
4. outbound_delivery_items: delivery_document, delivery_document_item, actual_delivery_quantity, plant, reference_sd_document (links to sales_order), reference_sd_document_item
5. billing_document_headers: billing_document, billing_document_type, billing_document_date, billing_document_is_cancelled, total_net_amount, transaction_currency, company_code, fiscal_year, accounting_document, sold_to_party
6. billing_document_items: billing_document, billing_document_item, material, billing_quantity, net_amount, reference_sd_document (links to delivery_document), reference_sd_document_item
7. journal_entry_items: company_code, fiscal_year, accounting_document, gl_account, reference_document (links to billing_document), amount_in_transaction_currency, posting_date, accounting_document_type
8. payments: company_code, fiscal_year, accounting_document, clearing_date, clearing_accounting_document (links to journal_entry accounting_document), amount_in_transaction_currency, customer, posting_date
9. business_partners: business_partner, customer, business_partner_name, business_partner_full_name
10. products: product, product_type, creation_date
11. product_descriptions: product, language, product_description
12. plants: plant, plant_name, sales_organization

Key relationships (Order to Cash flow):
- Sales Order → Sales Order Items (via sales_order)
- Sales Order Items → Products (via material = product)
- Sales Order → Customer (via sold_to_party = customer in business_partners)
- Sales Order → Delivery (via outbound_delivery_items.reference_sd_document = sales_order)
- Delivery → Billing (via billing_document_items.reference_sd_document = delivery_document)
- Billing → Journal Entry (via journal_entry_items.reference_document = billing_document)
- Billing → Accounting Document (via billing_document_headers.accounting_document = journal_entry_items.accounting_document)
- Payment → Journal Entry (via payments.clearing_accounting_document = journal_entry_items.accounting_document)
`;

const SYSTEM_PROMPT = `You are Dodge AI, a Graph Agent specialized in analyzing Order-to-Cash (O2C) business processes. You help users explore relationships between sales orders, deliveries, billing documents, journal entries, and payments.

${SCHEMA_DESCRIPTION}

RULES:
1. You MUST ONLY answer questions related to this O2C dataset. If asked about unrelated topics (general knowledge, creative writing, coding help, etc.), respond: "This system is designed to answer questions related to the Order-to-Cash dataset only. Please ask about sales orders, deliveries, billing, payments, or related business processes."
2. When you need data, generate a SQL query using the generate_sql tool. Only use SELECT statements. Never modify data.
3. Always ground your answers in actual data from the database. Never make up numbers or facts.
4. Present results clearly with bold key values. Use tables when showing multiple records.
5. When tracing document flows, show the full chain: Sales Order → Delivery → Billing → Journal Entry → Payment.
6. Keep responses concise and data-focused.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, check if we need SQL by asking the LLM with tool calling
    const toolCallResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_sql",
              description: "Generate a SQL SELECT query to answer the user's question about the O2C dataset. Only SELECT queries are allowed.",
              parameters: {
                type: "object",
                properties: {
                  sql: { type: "string", description: "The SQL SELECT query to execute" },
                  explanation: { type: "string", description: "Brief explanation of what this query does" },
                },
                required: ["sql", "explanation"],
              },
            },
          },
        ],
      }),
    });

    if (!toolCallResp.ok) {
      const errText = await toolCallResp.text();
      console.error("AI tool call error:", toolCallResp.status, errText);
      if (toolCallResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (toolCallResp.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${errText}`);
    }

    const toolCallData = await toolCallResp.json();
    const choice = toolCallData.choices?.[0];
    const toolCalls = choice?.message?.tool_calls;

    let sqlResults: any = null;
    let sqlQuery: string | null = null;

    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      let args: any;
      try {
        args = typeof toolCall.function.arguments === 'string' 
          ? JSON.parse(toolCall.function.arguments) 
          : toolCall.function.arguments;
      } catch {
        args = { sql: '', explanation: '' };
      }
      
      sqlQuery = args.sql;

      // Validate it's a SELECT query
      if (sqlQuery && sqlQuery.trim().toUpperCase().startsWith("SELECT")) {
        try {
          const { data, error } = await supabase.rpc("", {}).maybeSingle();
          // Use raw SQL via postgrest
          const queryResp = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          });

          // Actually execute via direct pg query through supabase
          // Use the supabase client to query
          // Since we can't run raw SQL via supabase-js, we'll use PostgREST
          // Let's use a different approach - fetch from each table as needed
          
          // Actually, let's create an RPC function approach
          // For now, use the postgrest endpoint directly
          const pgResp = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_readonly_query`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              Prefer: "return=representation",
            },
            body: JSON.stringify({ query_text: sqlQuery }),
          });

          if (pgResp.ok) {
            sqlResults = await pgResp.json();
          } else {
            const errText = await pgResp.text();
            console.error("SQL execution error:", errText);
            sqlResults = { error: "Query execution failed", details: errText };
          }
        } catch (e) {
          console.error("SQL execution error:", e);
          sqlResults = { error: "Query execution failed" };
        }
      }
    }

    // Now generate the final response with the data
    const finalMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    if (sqlQuery && sqlResults) {
      finalMessages.push({
        role: "system",
        content: `SQL Query executed: ${sqlQuery}\n\nResults (JSON): ${JSON.stringify(sqlResults).slice(0, 4000)}\n\nUse these results to answer the user's question. Format the answer clearly with markdown.`,
      });
    } else if (choice?.message?.content) {
      // No tool call needed, the model answered directly (likely a guardrail response)
      // Stream the direct response
    }

    // Stream the final response
    const streamResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: finalMessages,
        stream: true,
      }),
    });

    if (!streamResp.ok) {
      const t = await streamResp.text();
      console.error("AI stream error:", streamResp.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(streamResp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
