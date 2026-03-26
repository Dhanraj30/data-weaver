
GRANT EXECUTE ON FUNCTION public.execute_readonly_query(TEXT) TO anon, authenticated, service_role;

DELETE FROM sales_order_headers WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM sales_order_headers GROUP BY sales_order);
DELETE FROM sales_order_items WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM sales_order_items GROUP BY sales_order, sales_order_item);
DELETE FROM outbound_delivery_headers WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM outbound_delivery_headers GROUP BY delivery_document);
DELETE FROM outbound_delivery_items WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM outbound_delivery_items GROUP BY delivery_document, delivery_document_item);
DELETE FROM billing_document_headers WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM billing_document_headers GROUP BY billing_document);
DELETE FROM billing_document_items WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM billing_document_items GROUP BY billing_document, billing_document_item);
DELETE FROM journal_entry_items WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM journal_entry_items GROUP BY accounting_document, accounting_document_item);
DELETE FROM payments WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM payments GROUP BY accounting_document, accounting_document_item);
DELETE FROM business_partners WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM business_partners GROUP BY business_partner);
DELETE FROM products WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM products GROUP BY product);
DELETE FROM product_descriptions WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM product_descriptions GROUP BY product, language);
DELETE FROM plants WHERE id NOT IN (SELECT MIN(id::text)::uuid FROM plants GROUP BY plant);
