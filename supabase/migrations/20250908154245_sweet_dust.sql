/*
  # Add Subscription Management Features

  1. New Functions
    - Add indexes for better performance on subscription queries
    - Add updated_at triggers for automatic timestamp updates

  2. Performance Improvements
    - Index on customer_id for faster lookups
    - Index on user_id for customer queries
    - Index on subscription_id for webhook updates

  3. Triggers
    - Auto-update timestamps on record changes
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_customers_customer_id ON stripe_customers(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_id ON stripe_subscriptions(subscription_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_orders_customer_id ON stripe_orders(customer_id) WHERE deleted_at IS NULL;

-- Function to update updated_at timestamp
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

-- Add helpful comments
COMMENT ON TABLE stripe_customers IS 'Links Supabase users to Stripe customers';
COMMENT ON TABLE stripe_subscriptions IS 'Manages subscription data and billing information';
COMMENT ON TABLE stripe_orders IS 'Stores order and payment information';
COMMENT ON VIEW stripe_user_subscriptions IS 'Secure view for user subscription data';
COMMENT ON VIEW stripe_user_orders IS 'Secure view for user order history';