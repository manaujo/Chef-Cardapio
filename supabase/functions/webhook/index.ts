import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Chef Cardapio Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
};

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200, 
        headers: corsHeaders 
      });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    // Get signature from header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature found', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Process event in background
    EdgeRuntime.waitUntil(handleEvent(event));

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData || !('customer' in stripeData)) {
    console.log('No customer data in event, skipping');
    return;
  }

  const { customer: customerId } = stripeData;
  if (!customerId || typeof customerId !== 'string') {
    console.error(`Invalid customer ID: ${customerId}`);
    return;
  }

  console.log(`Processing event for customer: ${customerId}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeData as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncCustomerFromStripe(customerId);
        break;
      
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await syncCustomerFromStripe(customerId);
        break;
      
      case 'payment_intent.succeeded':
        // Handle one-time payments if needed
        if (event.data.object.invoice === null) {
          console.log('One-time payment succeeded');
        }
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error);
    throw error;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { mode, payment_status, customer } = session;
  
  console.log(`Checkout completed - Mode: ${mode}, Status: ${payment_status}`);

  if (mode === 'subscription') {
    console.log('Processing subscription checkout');
    await syncCustomerFromStripe(customer as string);
  } else if (mode === 'payment' && payment_status === 'paid') {
    console.log('Processing one-time payment');
    await handleOneTimePayment(session);
  }
}

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  try {
    const {
      id: checkout_session_id,
      payment_intent,
      customer,
      amount_subtotal,
      amount_total,
      currency,
      payment_status,
    } = session;

    const { error: orderError } = await supabase
      .from('stripe_orders')
      .insert({
        checkout_session_id,
        payment_intent_id: payment_intent as string,
        customer_id: customer as string,
        amount_subtotal: amount_subtotal || 0,
        amount_total: amount_total || 0,
        currency: currency || 'brl',
        payment_status: payment_status || 'paid',
        status: 'completed',
      });

    if (orderError) {
      console.error('Error inserting order:', orderError);
      throw new Error('Failed to save order');
    }

    console.log(`One-time payment processed: ${checkout_session_id}`);
  } catch (error) {
    console.error('Error processing one-time payment:', error);
    throw error;
  }
}

async function syncCustomerFromStripe(customerId: string) {
  try {
    console.log(`Syncing customer: ${customerId}`);

    // Fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      console.log(`No subscriptions found for customer: ${customerId}`);
      
      // Update to not_started status
      const { error } = await supabase
        .from('stripe_subscriptions')
        .upsert({
          customer_id: customerId,
          status: 'not_started',
        }, {
          onConflict: 'customer_id',
        });

      if (error) {
        console.error('Error updating subscription status:', error);
        throw error;
      }
      return;
    }

    // Get the most recent subscription
    const subscription = subscriptions.data[0];
    console.log(`Syncing subscription: ${subscription.id}, status: ${subscription.status}`);

    // Prepare subscription data
    const subscriptionData: any = {
      customer_id: customerId,
      subscription_id: subscription.id,
      price_id: subscription.items.data[0]?.price?.id || null,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      status: subscription.status,
    };

    // Add payment method info if available
    if (subscription.default_payment_method && typeof subscription.default_payment_method !== 'string') {
      const paymentMethod = subscription.default_payment_method as Stripe.PaymentMethod;
      subscriptionData.payment_method_brand = paymentMethod.card?.brand || null;
      subscriptionData.payment_method_last4 = paymentMethod.card?.last4 || null;
    }

    // Upsert subscription data
    const { error: subError } = await supabase
      .from('stripe_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'customer_id',
      });

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw subError;
    }

    console.log(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync customer ${customerId}:`, error);
    throw error;
  }
}