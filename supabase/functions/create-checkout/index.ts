/**
 * create-checkout — NEW: Stripe checkout session / payment intent
 * Replaces all the fake payment flows in Premium.jsx, SubscribeButton, etc.
 */
import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      type, // 'premium_subscription' | 'creator_subscription' | 'tip' | 'donation' | 'ppv'
      priceId, // Stripe Price ID (for subscriptions)
      amount, // in cents (for one-time payments)
      currency = 'usd',
      recipientEmail, // for tips/donations
      metadata = {},
      successUrl,
      cancelUrl,
    } = await req.json();

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userEmail = '';
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userEmail = user?.email || '';
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('email', userEmail)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId && userEmail) {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: profile?.full_name || userEmail,
      });
      customerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('email', userEmail);
    }

    const origin = successUrl ? new URL(successUrl).origin : 'https://sportsphere.app';

    if (type === 'premium_subscription' || type === 'creator_subscription') {
      // Subscription checkout
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl || `${origin}/Premium?success=true`,
        cancel_url: cancelUrl || `${origin}/Premium`,
        metadata: { type, userEmail, recipientEmail, ...metadata },
      });
      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // One-time payment (tip, donation, ppv)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount || 500,
        currency,
        customer: customerId || undefined,
        metadata: { type, userEmail, recipientEmail, ...metadata },
        automatic_payment_methods: { enabled: true },
      });
      return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
