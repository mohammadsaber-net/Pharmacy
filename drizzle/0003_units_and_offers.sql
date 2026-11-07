ALTER TABLE products ADD COLUMN units_per_pack integer NOT NULL DEFAULT 1;
ALTER TABLE products ADD COLUMN unit_name varchar(40) NOT NULL DEFAULT 'شريط';
ALTER TABLE order_items ADD COLUMN unit_name varchar(40) NOT NULL DEFAULT 'علبة';
ALTER TABLE order_items ADD COLUMN stock_quantity integer NOT NULL DEFAULT 1;
UPDATE order_items SET stock_quantity = quantity;
CREATE TABLE offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(220) NOT NULL,
  description text,
  image_url text,
  offer_type varchar(20) NOT NULL DEFAULT 'single',
  discount_percent numeric(5,2) NOT NULL DEFAULT '0',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  is_today boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX offers_active_dates_idx ON offers (is_active, starts_at, ends_at);
CREATE INDEX offers_today_idx ON offers (is_today);
CREATE TABLE offer_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  discount_percent numeric(5,2),
  offer_price numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX offer_products_offer_product_unique ON offer_products (offer_id, product_id);
CREATE INDEX offer_products_product_idx ON offer_products (product_id);
ALTER TABLE products ADD CONSTRAINT products_units_per_pack_positive CHECK (units_per_pack >= 1);

ALTER TABLE offers ADD COLUMN featured_date date;
