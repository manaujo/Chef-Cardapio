import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
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
    console.log('=== CHECKOUT REQUEST START ===');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
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

    console.log('Request body:', { price_id, success_url, cancel_url, mode });

    // Validate required fields
    if (!price_id || !success_url || !cancel_url || !mode) {
      console.error('Missing required fields:', { price_id, success_url, cancel_url, mode });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: price_id, success_url, cancel_url, mode' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
      supabaseServiceKey: supabaseServiceKey ? 'SET' : 'MISSING',
      stripeSecretKey: stripeSecretKey ? 'SET' : 'MISSING'
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Supabase not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!stripeSecretKey) {
      console.error('Missing Stripe secret key');
      return new Response(
        JSON.stringify({ 
          error: 'Payment service not configured. Please configure STRIPE_SECRET_KEY in Supabase Edge Functions environment variables.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize clients
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    console.log('Clients initialized successfully');

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

    // Check if customer exists
    let { data: customer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (customerError) {
      console.error('Error fetching customer:', customerError);
      return new Response(
        JSON.stringify({ error: 'Database error while fetching customer' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let customerId: string;

    if (!customer) {
      console.log('Creating new Stripe customer for user:', user.id);
      
      try {
        // Create new Stripe customer
        const stripeCustomer = await stripe.customers.create({
          email: user.email!,
          metadata: { user_id: user.id },
        });

        console.log('Stripe customer created:', stripeCustomer.id);

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
      } catch (stripeError: any) {
        console.error('Stripe customer creation error:', stripeError);
        return new Response(
          JSON.stringify({ error: `Failed to create Stripe customer: ${stripeError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else {
      customerId = customer.customer_id;
      console.log('Using existing customer:', customerId);
    }

    // Create checkout session
    console.log('Creating checkout session...');
    
    try {
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

      console.log('Checkout session created successfully:', session.id);
      console.log('Checkout URL:', session.url);
      
      // Verificar se a URL foi criada corretamente
      if (!session.url) {
        throw new Error('Stripe did not return a checkout URL');
      }

      return new Response(
        JSON.stringify({ 
          url: session.url, 
          sessionId: session.id,
          customer_id: customerId,
          success: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (stripeError: any) {
      console.error('Stripe checkout session creation error:', stripeError);
      return new Response(
        JSON.stringify({ error: `Failed to create checkout session: ${stripeError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error: any) {
    console.error('=== CHECKOUT ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
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