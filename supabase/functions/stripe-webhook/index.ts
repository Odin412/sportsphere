/**
 * stripe-webhook — NEW: handles Stripe lifecycle events
 * Updates is_premium, subscription_status, and records transactions in DB.
 */
import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2024-06-20',
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { type, userEmail, recipientEmail } = session.metadata || {};

        if (type === 'premium_subscription') {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          await supabase.from('profiles').update({
            is_premium: true,
            premium_expires: expiresAt.toISOString(),
          }).eq('email', userEmail);

        } else if (type === 'creator_subscription') {
          await supabase.from('creator_subscriptions').upsert({
            subscriber_email: userEmail,
            creator_email: recipientEmail,
            status: 'active',
            stripe_subscription_id: session.subscription as string,
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: 'subscriber_email,creator_email' });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const { type, userEmail, recipientEmail } = sub.metadata || {};

        if (type === 'premium_subscription') {
          const expiresAt = new Date(sub.current_period_end * 1000);
          await supabase.from('profiles').update({
            is_premium: true,
            premium_expires: expiresAt.toISOString(),
          }).eq('email', userEmail);
        }

        // Record transaction
        await supabase.from('transactions').insert({
          from_email: userEmail,
          to_email: recipientEmail || 'platform',
          type: type || 'subscription',
          amount: invoice.amount_paid / 100,
          status: 'completed',
          stripe_payment_intent_id: invoice.payment_intent as string,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const { type, userEmail, recipientEmail } = sub.metadata || {};

        if (type === 'premium_subscription') {
          await supabase.from('profiles').update({
            is_premium: false,
            premium_expires: null,
          }).eq('email', userEmail);
        } else if (type === 'creator_subscription') {
          await supabase.from('creator_subscriptions').update({
            status: 'cancelled',
          }).eq('stripe_subscription_id', sub.id);
        }

        // Update org subscription status
        await supabase.from('organizations').update({
          subscription_status: 'canceled',
        }).eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { type, userEmail, recipientEmail } = pi.metadata || {};

        // Record one-time payment (tip, donation)
        await supabase.from('transactions').insert({
          from_email: userEmail,
          to_email: recipientEmail,
          type: type || 'tip',
          amount: pi.amount / 100,
          status: 'completed',
          stripe_payment_intent_id: pi.id,
        });
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
