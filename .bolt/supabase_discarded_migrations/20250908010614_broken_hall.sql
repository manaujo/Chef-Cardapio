/*
  # Create restaurants table

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, restaurant name)
      - `delivery_time` (text, delivery time info)
      - `whatsapp` (text, WhatsApp number)
      - `working_hours` (text, working hours)
      - `address` (text, restaurant address)
      - `theme_color` (text, theme color hex)
      - `whatsapp_orders_enabled` (boolean, WhatsApp orders enabled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `restaurants` table
    - Add policy for users to manage their own restaurant data
    - Add policy for public read access (for QR code access)
*/

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Meu Restaurante',
  delivery_time text DEFAULT '30-40 min',
  whatsapp text DEFAULT '',
  working_hours text DEFAULT 'Seg - Dom: 18h às 23h',
  address text DEFAULT '',
  theme_color text DEFAULT '#EA580C',
  whatsapp_orders_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own restaurant
CREATE POLICY "Users can manage own restaurant"
  ON restaurants
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for public read access (for QR code menu)
CREATE POLICY "Public can read restaurants"
  ON restaurants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create unique index to ensure one restaurant per user
CREATE UNIQUE INDEX IF NOT EXISTS restaurants_user_id_key ON restaurants(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();