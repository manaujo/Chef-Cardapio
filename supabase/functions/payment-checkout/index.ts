import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const requestBody = await req.json();
    const { price_id, success_url, cancel_url, mode } = requestBody;

    console.log('Received checkout request:', { price_id, mode });

    // Validate required fields
    if (!price_id || !success_url || !cancel_url || !mode) {
      console.error('Missing required fields:', { price_id, success_url, cancel_url, mode });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Invalid user:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User authenticated:', user.id);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing Stripe secret key');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Check if customer exists
    let { data: customer } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId: string;

    if (!customer) {
      console.log('Creating new Stripe customer for user:', user.id);
      
      // Create new Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: user.email!,
        metadata: { user_id: user.id },
      });

      // Save to database
      const { error: insertError } = await supabase
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          customer_id: stripeCustomer.id,
        });

      if (insertError) {
        console.error('Failed to save customer:', insertError);
        // Cleanup Stripe customer
        await stripe.customers.del(stripeCustomer.id);
        return new Response(
          JSON.stringify({ error: 'Failed to create customer record' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      customerId = stripeCustomer.id;
    } else {
      customerId = customer.customer_id;
    }

    console.log('Using customer ID:', customerId);

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode: mode as 'payment' | 'subscription',
      success_url,
      cancel_url,
      locale: 'pt-BR',
      currency: 'brl',
    };

    // Add metadata based on mode
    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: { user_id: user.id },
      };
    } else {
      sessionParams.payment_intent_data = {
        metadata: { user_id: user.id },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('Created checkout session:', session.id);

    return new Response(
      JSON.stringify({ 
        url: session.url, 
        sessionId: session.id,
        customer_id: customerId 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});