/**
 * notify — replaces functions/notifyOnCreate.ts + sendNotification.ts
 * Creates in-app notifications and optionally sends emails via Resend.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EMAIL_TEMPLATES: Record<string, (data: Record<string, string>) => string> = {
  like: (d) => `<p><strong>${d.actor_name}</strong> liked your post.</p>`,
  comment: (d) => `<p><strong>${d.actor_name}</strong> commented: "${d.message}"</p>`,
  follow: (d) => `<p><strong>${d.actor_name}</strong> started following you.</p>`,
  follow_request: (d) => `<p><strong>${d.actor_name}</strong> sent you a follow request.</p>`,
  mention: (d) => `<p><strong>${d.actor_name}</strong> mentioned you in a post.</p>`,
  tip: (d) => `<p><strong>${d.actor_name}</strong> sent you a tip! ${d.message}</p>`,
  donation: (d) => `<p><strong>${d.actor_name}</strong> sent you a donation. ${d.message}</p>`,
  subscription: (d) => `<p><strong>${d.actor_name}</strong> subscribed to your content.</p>`,
  challenge_update: (d) => `<p>Challenge update: ${d.message}</p>`,
  badge_earned: (d) => `<p>You earned a new badge: ${d.message}</p>`,
  training_plan: (d) => `<p><strong>${d.actor_name}</strong> assigned you a new training plan: ${d.message}</p>`,
  session_scheduled: (d) => `<p>New training session scheduled: ${d.message}</p>`,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      recipientEmail,
      type,
      actorName,
      actorEmail,
      actorAvatar,
      message,
      relatedItemId,
      relatedItemType,
      sendEmail = false,
    } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create in-app notification
    await supabase.from('notifications').insert({
      recipient_email: recipientEmail,
      type,
      actor_name: actorName,
      actor_email: actorEmail,
      actor_avatar: actorAvatar,
      message,
      related_item_id: relatedItemId,
      related_item_type: relatedItemType,
      is_read: false,
    });

    // Send email if requested and preferences allow
    if (sendEmail) {
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_email', recipientEmail)
        .single();

      const prefKey = `${type.replace('_request', '')}_email` as keyof typeof prefs;
      const emailEnabled = !prefs || prefs[prefKey] !== false;

      if (emailEnabled) {
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@sportsphere.app';

        if (RESEND_API_KEY) {
          const template = EMAIL_TEMPLATES[type];
          const htmlBody = template
            ? template({ actor_name: actorName, message: message || '' })
            : `<p>${message}</p>`;

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: [recipientEmail],
              subject: `Sportsphere: ${actorName || 'New'} notification`,
              html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a3a6b;">Sportsphere</h2>
                ${htmlBody}
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                  <a href="https://sportsphere.app">Visit Sportsphere</a>
                </p>
              </div>`,
            }),
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
