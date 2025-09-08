import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Chef Cardapio Integration',
    version: '1.0.0',
  },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight request
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

    const { price_id, success_url, cancel_url, mode } = await req.json();

    // Validate required parameters
    if (!price_id || !success_url || !cancel_url || !mode) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: price_id, success_url, cancel_url, mode' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate mode
    if (!['payment', 'subscription'].includes(mode)) {
      return new Response(
        JSON.stringify({ 
          error: 'Mode must be either "payment" or "subscription"' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError) {
      console.error('Auth error:', getUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate user' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing checkout for user: ${user.id}, price: ${price_id}, mode: ${mode}`);

    // Check if customer already exists
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('Failed to fetch customer information:', getCustomerError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch customer information' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let customerId;

    if (!customer || !customer.customer_id) {
      // Create new Stripe customer
      try {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        });

        console.log(`Created new Stripe customer ${newCustomer.id} for user ${user.id}`);

        // Save customer to database
        const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
          user_id: user.id,
          customer_id: newCustomer.id,
        });

        if (createCustomerError) {
          console.error('Failed to save customer information:', createCustomerError);
          
          // Cleanup: delete the Stripe customer
          try {
            await stripe.customers.del(newCustomer.id);
          } catch (deleteError) {
            console.error('Failed to cleanup Stripe customer:', deleteError);
          }

          return new Response(
            JSON.stringify({ error: 'Failed to create customer mapping' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Create subscription record if needed
        if (mode === 'subscription') {
          const { error: createSubscriptionError } = await supabase.from('stripe_subscriptions').insert({
            customer_id: newCustomer.id,
            status: 'not_started',
          });

          if (createSubscriptionError) {
            console.error('Failed to save subscription:', createSubscriptionError);
            
            // Cleanup
            try {
              await stripe.customers.del(newCustomer.id);
              await supabase.from('stripe_customers').delete().eq('customer_id', newCustomer.id);
            } catch (deleteError) {
              console.error('Failed to cleanup after subscription creation error:', deleteError);
            }

            return new Response(
              JSON.stringify({ error: 'Unable to save the subscription in the database' }),
              {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
        }

        customerId = newCustomer.id;
      } catch (stripeError: any) {
        console.error('Stripe customer creation error:', stripeError);
        return new Response(
          JSON.stringify({ error: `Failed to create Stripe customer: ${stripeError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      customerId = customer.customer_id;

      // Ensure subscription record exists for existing customer
      if (mode === 'subscription') {
        const { data: subscription, error: getSubscriptionError } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('customer_id', customerId)
          .is('deleted_at', null)
          .maybeSingle();

        if (getSubscriptionError) {
          console.error('Failed to fetch subscription information:', getSubscriptionError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch subscription information' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        if (!subscription) {
          const { error: createSubscriptionError } = await supabase.from('stripe_subscriptions').insert({
            customer_id: customerId,
            status: 'not_started',
          });

          if (createSubscriptionError) {
            console.error('Failed to create subscription record:', createSubscriptionError);
            return new Response(
              JSON.stringify({ error: 'Failed to create subscription record' }),
              {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
        }
      }
    }

    // Create Stripe checkout session
    try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: price_id,
            quantity: 1,
          },
        ],
        mode: mode as 'payment' | 'subscription',
        success_url,
        cancel_url,
        locale: 'pt-BR',
        currency: 'brl',
      };

      // Add subscription-specific parameters
      if (mode === 'subscription') {
        sessionParams.subscription_data = {
          metadata: {
            user_id: user.id,
          },
        };
      } else {
        sessionParams.payment_intent_data = {
          metadata: {
            user_id: user.id,
          },
        };
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      console.log(`Created checkout session ${session.id} for customer ${customerId}`);

      return new Response(
        JSON.stringify({ 
          sessionId: session.id, 
          url: session.url,
          customer_id: customerId 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (stripeError: any) {
      console.error('Stripe checkout session creation error:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: `Failed to create checkout session: ${stripeError.message}` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: `Checkout error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});