/*
  # Create stripe_user_subscriptions view

  1. New Views
    - `stripe_user_subscriptions`
      - Joins stripe_subscriptions and stripe_customers tables
      - Filters by authenticated user
      - Provides subscription data for frontend

  2. Security
    - View automatically filters by auth.uid()
    - Only shows current user's subscription data
    - Grants SELECT permission to authenticated users
*/

-- Create the stripe_user_subscriptions view
CREATE OR REPLACE VIEW public.stripe_user_subscriptions AS
SELECT
  ss.customer_id,
  ss.subscription_id,
  ss.subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4
FROM public.stripe_subscriptions ss
JOIN public.stripe_customers sc ON ss.customer_id = sc.customer_id
WHERE sc.user_id = auth.uid()
  AND ss.deleted_at IS NULL
  AND sc.deleted_at IS NULL;

-- Grant permissions on the view
ALTER VIEW public.stripe_user_subscriptions OWNER TO postgres;
GRANT SELECT ON public.stripe_user_subscriptions TO authenticated;

-- Add comment to the view
COMMENT ON VIEW public.stripe_user_subscriptions IS 'Secure view for user subscription data';