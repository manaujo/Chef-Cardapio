/*
  # Fix Stripe Views Creation

  1. Issues Fixed
    - Fixed syntax error in stripe_user_orders view definition
    - Ensured proper view creation with security invoker
    - Added proper grants for authenticated users

  2. Views
    - `stripe_user_subscriptions`: Secure view for user subscription data
    - `stripe_user_orders`: Secure view for user order history (fixed syntax)

  3. Security
    - Both views use security invoker for proper RLS enforcement
    - Proper grants for authenticated users
*/

-- Drop existing views if they exist (to recreate them properly)
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

-- Recreate stripe_user_orders view (fix syntax error)
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

-- Force schema cache refresh
COMMENT ON VIEW stripe_user_subscriptions IS 'User subscription data view - refreshed';
COMMENT ON VIEW stripe_user_orders IS 'User order history view - refreshed';