/*
  # Create categories table

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `name` (text, category name)
      - `order_index` (integer, display order)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `categories` table
    - Add policy for users to manage their own categories
    - Add policy for public read access (for QR code access)
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own categories
CREATE POLICY "Users can manage own categories"
  ON categories
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
CREATE POLICY "Public can read categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS categories_restaurant_id_idx ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS categories_order_idx ON categories(restaurant_id, order_index);