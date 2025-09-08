/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `category_id` (uuid, foreign key to categories)
      - `name` (text, product name)
      - `description` (text, product description)
      - `price` (decimal, product price)
      - `image_url` (text, product image URL)
      - `is_available` (boolean, product availability)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for users to manage their own products
    - Add policy for public read access (for QR code access)
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  image_url text DEFAULT '',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own products
CREATE POLICY "Users can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Policy for public read access (for QR code menu)
CREATE POLICY "Public can read available products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_restaurant_id_idx ON products(restaurant_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_available_idx ON products(is_available);