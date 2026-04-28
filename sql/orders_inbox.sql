CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checkout_session_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'checkout_started',
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT NOT NULL,
  notes TEXT,
  source_page TEXT,
  public_origin TEXT,
  checkout_url TEXT,
  stripe_customer_id TEXT,
  stripe_payment_intent TEXT,
  stripe_invoice_id TEXT,
  stripe_invoice_number TEXT,
  stripe_invoice_hosted_url TEXT,
  stripe_invoice_pdf_url TEXT,
  amount_dkk INTEGER NOT NULL DEFAULT 2495,
  currency TEXT NOT NULL DEFAULT 'dkk',
  checkout_created_at TEXT NOT NULL,
  paid_at TEXT,
  last_reconciled_at TEXT,
  approved_at TEXT,
  approved_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_status_updated_at
  ON orders (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_checkout_created_at
  ON orders (checkout_created_at DESC);
