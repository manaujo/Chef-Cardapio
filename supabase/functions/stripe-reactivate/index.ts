import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '', 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Chef Cardapio Integration',
    version: '1.0.0',
  },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate user' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get customer and subscription from database
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single();

    if (getCustomerError || !customer) {
      return new Response(
        JSON.stringify({ error: 'Customer not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get subscription from database
    const { data: subscription, error: getSubscriptionError } = await supabase
      .from('stripe_subscriptions')
      .select('subscription_id')
      .eq('customer_id', customer.customer_id)
      .is('deleted_at', null)
      .single();

    if (getSubscriptionError || !subscription || !subscription.subscription_id) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Reactivate subscription (remove cancel_at_period_end)
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.subscription_id,
      {
        cancel_at_period_end: false,
      }
    );

    // Update subscription in database
    const { error: updateError } = await supabase
      .from('stripe_subscriptions')
      .update({
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscription.subscription_id);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        current_period_end: updatedSubscription.current_period_end
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Reactivate subscription error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});