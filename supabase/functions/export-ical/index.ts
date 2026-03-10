/**
 * export-ical — generates iCal (.ics) feed for team training sessions + user events
 *
 * Modes:
 *   ?org_id=xxx            — org schedule (public)
 *   ?u=user_id&s=signature — user's personal feed (HMAC-signed)
 *
 * HMAC signing: URL format webcal://…?u=user_id&s=HMAC_SHA256(user_id, SERVER_SECRET)
 * Server secret stored as ICAL_SIGNING_SECRET in Edge Function secrets.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/calendar; charset=utf-8',
};

function escapeIcal(str: string): string {
  return (str || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function toIcalDate(dateStr: string): string {
  return new Date(dateStr).toISOString().replace(/[-:]/g, '').replace('.000', '');
}

async function hmacVerify(userId: string, signature: string): Promise<boolean> {
  const secret = Deno.env.get('ICAL_SIGNING_SECRET');
  if (!secret) return true; // If no secret configured, allow (dev mode)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(userId));
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return expected === signature;
}

function addVEvent(lines: string[], uid: string, start: string, end: string, summary: string, description?: string, location?: string, url?: string) {
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${uid}@sportsphere.app`);
  lines.push(`DTSTAMP:${toIcalDate(new Date().toISOString())}`);
  lines.push(`DTSTART:${start}`);
  lines.push(`DTEND:${end}`);
  lines.push(`SUMMARY:${escapeIcal(summary)}`);
  if (description) lines.push(`DESCRIPTION:${escapeIcal(description)}`);
  if (location) lines.push(`LOCATION:${escapeIcal(location)}`);
  if (url) lines.push(`URL:${escapeIcal(url)}`);
  // 1-hour reminder
  lines.push('BEGIN:VALARM');
  lines.push('TRIGGER:-PT1H');
  lines.push('ACTION:DISPLAY');
  lines.push(`DESCRIPTION:${escapeIcal(summary)} starts in 1 hour`);
  lines.push('END:VALARM');
  lines.push('END:VEVENT');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const url = new URL(req.url);
    const organizationId = url.searchParams.get('org_id');
    const userId = url.searchParams.get('u');
    const signature = url.searchParams.get('s');

    if (!organizationId && !userId) {
      return new Response('org_id or u parameter required', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sportsphere//Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-TIMEZONE:UTC',
    ];

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    // ── User personal feed (HMAC-signed) ──
    if (userId) {
      if (!await hmacVerify(userId, signature || '')) {
        return new Response('Invalid signature', { status: 403 });
      }

      // Get user email
      const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', userId).single();
      if (!profile) return new Response('User not found', { status: 404 });

      lines.push(`X-WR-CALNAME:${escapeIcal(`${profile.full_name || 'My'} Sportsphere`)}`);

      // 1. RSVPd events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .contains('attendees', [profile.email])
        .gte('date', thirtyDaysAgo);

      for (const event of events || []) {
        const start = toIcalDate(event.date);
        const endDate = event.end_date || new Date(new Date(event.date).getTime() + 2 * 3600000).toISOString();
        addVEvent(lines, `event-${event.id}`, start, toIcalDate(endDate), event.title, event.description, event.location);
      }

      // 2. Org sessions (if member)
      const { data: memberships } = await supabase.from('org_members').select('organization_id').eq('user_email', profile.email);
      for (const mem of memberships || []) {
        const { data: sessions } = await supabase
          .from('training_sessions')
          .select('*')
          .eq('organization_id', mem.organization_id)
          .neq('status', 'cancelled')
          .gte('scheduled_date', thirtyDaysAgo);

        for (const s of sessions || []) {
          const start = toIcalDate(s.scheduled_date);
          const endDate = new Date(s.scheduled_date);
          endDate.setMinutes(endDate.getMinutes() + (s.duration_minutes || 60));
          addVEvent(lines, `session-${s.id}`, start, toIcalDate(endDate.toISOString()), s.title || 'Training', s.description, s.location, s.meeting_link);
        }
      }

      // 3. Games (if org member)
      for (const mem of memberships || []) {
        const { data: games } = await supabase
          .from('games')
          .select('*')
          .eq('organization_id', mem.organization_id)
          .gte('scheduled_at', thirtyDaysAgo);

        for (const g of games || []) {
          const start = toIcalDate(g.scheduled_at);
          const endDate = new Date(new Date(g.scheduled_at).getTime() + 2 * 3600000).toISOString();
          addVEvent(lines, `game-${g.id}`, start, toIcalDate(endDate), `${g.home_team_name} vs ${g.away_team_name}`, `${g.sport} game`, g.venue);
        }
      }
    }

    // ── Org schedule feed ──
    if (organizationId) {
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();

      lines.push(`X-WR-CALNAME:${escapeIcal(org?.name || 'Team Schedule')}`);

      const { data: sessions } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('organization_id', organizationId)
        .neq('status', 'cancelled')
        .gte('scheduled_date', thirtyDaysAgo)
        .order('scheduled_date', { ascending: true });

      for (const session of sessions || []) {
        const start = toIcalDate(session.scheduled_date);
        const endDate = new Date(session.scheduled_date);
        endDate.setMinutes(endDate.getMinutes() + (session.duration_minutes || 60));
        addVEvent(lines, `session-${session.id}`, start, toIcalDate(endDate.toISOString()), session.title || 'Training Session', session.description, session.location, session.meeting_link);
      }
    }

    lines.push('END:VCALENDAR');

    const calName = organizationId ? 'schedule' : 'my-calendar';
    return new Response(lines.join('\r\n'), {
      headers: {
        ...corsHeaders,
        'Content-Disposition': `attachment; filename="${calName}.ics"`,
      },
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
});
