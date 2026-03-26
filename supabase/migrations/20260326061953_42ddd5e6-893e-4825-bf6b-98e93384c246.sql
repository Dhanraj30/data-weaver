
-- Sales Order Headers
CREATE TABLE public.sales_order_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order TEXT NOT NULL,
  sales_order_type TEXT,
  sales_organization TEXT,
  distribution_channel TEXT,
  organization_division TEXT,
  sold_to_party TEXT,
  creation_date TEXT,
  total_net_amount TEXT,
  transaction_currency TEXT,
  overall_delivery_status TEXT
);

-- Sales Order Items
CREATE TABLE public.sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order TEXT NOT NULL,
  sales_order_item TEXT NOT NULL,
  material TEXT,
  requested_quantity TEXT,
  requested_quantity_unit TEXT,
  net_amount TEXT,
  transaction_currency TEXT,
  production_plant TEXT,
  storage_location TEXT
);

-- Outbound Delivery Headers
CREATE TABLE public.outbound_delivery_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_document TEXT NOT NULL,
  creation_date TEXT,
  shipping_point TEXT,
  overall_goods_movement_status TEXT,
  overall_picking_status TEXT
);

-- Outbound Delivery Items
CREATE TABLE public.outbound_delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_document TEXT NOT NULL,
  delivery_document_item TEXT,
  actual_delivery_quantity TEXT,
  delivery_quantity_unit TEXT,
  plant TEXT,
  reference_sd_document TEXT,
  reference_sd_document_item TEXT,
  storage_location TEXT
);

-- Billing Document Headers
CREATE TABLE public.billing_document_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_document TEXT NOT NULL,
  billing_document_type TEXT,
  billing_document_date TEXT,
  billing_document_is_cancelled TEXT,
  total_net_amount TEXT,
  transaction_currency TEXT,
  company_code TEXT,
  fiscal_year TEXT,
  accounting_document TEXT,
  sold_to_party TEXT
);

-- Billing Document Items
CREATE TABLE public.billing_document_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_document TEXT NOT NULL,
  billing_document_item TEXT,
  material TEXT,
  billing_quantity TEXT,
  billing_quantity_unit TEXT,
  net_amount TEXT,
  transaction_currency TEXT,
  reference_sd_document TEXT,
  reference_sd_document_item TEXT
);

-- Journal Entry Items
CREATE TABLE public.journal_entry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_code TEXT,
  fiscal_year TEXT,
  accounting_document TEXT NOT NULL,
  gl_account TEXT,
  reference_document TEXT,
  cost_center TEXT,
  profit_center TEXT,
  transaction_currency TEXT,
  amount_in_transaction_currency TEXT,
  posting_date TEXT,
  accounting_document_type TEXT,
  accounting_document_item TEXT
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_code TEXT,
  fiscal_year TEXT,
  accounting_document TEXT NOT NULL,
  accounting_document_item TEXT,
  clearing_date TEXT,
  clearing_accounting_document TEXT,
  amount_in_transaction_currency TEXT,
  transaction_currency TEXT,
  customer TEXT,
  posting_date TEXT
);

-- Business Partners
CREATE TABLE public.business_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_partner TEXT NOT NULL,
  customer TEXT,
  business_partner_name TEXT,
  business_partner_full_name TEXT,
  creation_date TEXT
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product TEXT NOT NULL,
  product_type TEXT,
  creation_date TEXT
);

-- Product Descriptions
CREATE TABLE public.product_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product TEXT NOT NULL,
  language TEXT,
  product_description TEXT
);

-- Plants
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant TEXT NOT NULL,
  plant_name TEXT,
  sales_organization TEXT
);

-- Enable RLS on all tables (public read-only for this demo)
ALTER TABLE public.sales_order_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_delivery_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_document_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_document_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (no auth required for this demo)
CREATE POLICY "Public read" ON public.sales_order_headers FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.sales_order_items FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.outbound_delivery_headers FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.outbound_delivery_items FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.billing_document_headers FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.billing_document_items FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.journal_entry_items FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.business_partners FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.product_descriptions FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.plants FOR SELECT USING (true);

-- Indexes for common joins
CREATE INDEX idx_soi_sales_order ON public.sales_order_items(sales_order);
CREATE INDEX idx_odi_delivery_doc ON public.outbound_delivery_items(delivery_document);
CREATE INDEX idx_odi_ref_sd ON public.outbound_delivery_items(reference_sd_document);
CREATE INDEX idx_bdi_billing_doc ON public.billing_document_items(billing_document);
CREATE INDEX idx_bdi_ref_sd ON public.billing_document_items(reference_sd_document);
CREATE INDEX idx_jei_ref_doc ON public.journal_entry_items(reference_document);
CREATE INDEX idx_jei_acct_doc ON public.journal_entry_items(accounting_document);
CREATE INDEX idx_pay_clearing ON public.payments(clearing_accounting_document);
CREATE INDEX idx_pay_acct_doc ON public.payments(accounting_document);
