ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'instapay';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT 'admin';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type varchar(20) NOT NULL DEFAULT 'pickup';
ALTER TABLE orders ALTER COLUMN address SET DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_receipt text;
CREATE TABLE IF NOT EXISTS store_settings (
  id integer PRIMARY KEY DEFAULT 1,
  delivery_enabled boolean NOT NULL DEFAULT false,
  instapay_number varchar(80) NOT NULL DEFAULT '',
  delivery_fee numeric(12,2) NOT NULL DEFAULT '0',
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
CREATE TABLE IF NOT EXISTS delivery_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name varchar(160),
  phone varchar(20),
  was_enabled boolean NOT NULL DEFAULT false,
  acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS delivery_requests_created_idx ON delivery_requests(created_at);
CREATE INDEX IF NOT EXISTS delivery_requests_ack_idx ON delivery_requests(acknowledged_at);
