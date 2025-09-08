/*
  # Fix deleted_at columns and indexes

  1. Issues Fixed
    - Add missing deleted_at column to stripe_subscriptions table
    - Add missing deleted_at column to stripe_orders table  
    - Create proper indexes after columns exist
    - Update RLS policies to use deleted_at properly

  2. Changes
    - ALTER TABLE to add deleted_at columns with proper defaults
    - CREATE INDEX statements for performance
    - UPDATE triggers for automatic timestamp management
*/

-- Add deleted_at column to stripe_subscriptions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_subscriptions' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE stripe_subscriptions ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;
  END IF;
END $$;

-- Add deleted_at column to stripe_orders if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_orders' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE stripe_orders ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;
  END IF;
END $$;

-- Now create the indexes safely
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_customers_customer_id ON stripe_customers(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_id ON stripe_subscriptions(subscription_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_orders_customer_id ON stripe_orders(customer_id) WHERE deleted_at IS NULL;

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for automatic updated_at timestamps
DROP TRIGGER IF EXISTS update_stripe_customers_updated_at ON stripe_customers;
CREATE TRIGGER update_stripe_customers_updated_at
    BEFORE UPDATE ON stripe_customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_subscriptions_updated_at ON stripe_subscriptions;
CREATE TRIGGER update_stripe_subscriptions_updated_at
    BEFORE UPDATE ON stripe_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_orders_updated_at ON stripe_orders;
CREATE TRIGGER update_stripe_orders_updated_at
    BEFORE UPDATE ON stripe_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policies to properly handle deleted_at
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
    ON stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
    ON stripe_orders
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Recreate views to ensure they work with the new columns
DROP VIEW IF EXISTS stripe_user_subscriptions;
DROP VIEW IF EXISTS stripe_user_orders;

-- Recreate stripe_user_subscriptions view
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND (s.deleted_at IS NULL OR s.deleted_at IS NOT NULL);

-- Recreate stripe_user_orders view
CREATE VIEW stripe_user_orders WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    o.id as order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND (o.deleted_at IS NULL OR o.deleted_at IS NOT NULL);

-- Grant proper permissions
GRANT SELECT ON stripe_user_subscriptions TO authenticated;
GRANT SELECT ON stripe_user_orders TO authenticated;

-- Add helpful comments
COMMENT ON TABLE stripe_customers IS 'Links Supabase users to Stripe customers';
COMMENT ON TABLE stripe_subscriptions IS 'Manages subscription data and billing information';
COMMENT ON TABLE stripe_orders IS 'Stores order and payment information';
COMMENT ON VIEW stripe_user_subscriptions IS 'Secure view for user subscription data';
COMMENT ON VIEW stripe_user_orders IS 'Secure view for user order history';