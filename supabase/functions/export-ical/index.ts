/**
 * export-ical — NEW: generates iCal (.ics) feed for team training sessions
 * Addresses roadmap requirement: calendar sync for org schedules
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const url = new URL(req.url);
    const organizationId = url.searchParams.get('org_id');

    if (!organizationId) {
      return new Response('org_id parameter required', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    const { data: sessions } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('organization_id', organizationId)
      .neq('status', 'cancelled')
      .gte('scheduled_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('scheduled_date', { ascending: true });

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sportsphere//Training Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${escapeIcal(org?.name || 'Team Schedule')}`,
      'X-WR-TIMEZONE:UTC',
    ];

    for (const session of sessions || []) {
      const start = toIcalDate(session.scheduled_date);
      const endDate = new Date(session.scheduled_date);
      endDate.setMinutes(endDate.getMinutes() + (session.duration_minutes || 60));
      const end = toIcalDate(endDate.toISOString());

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:session-${session.id}@sportsphere.app`);
      lines.push(`DTSTAMP:${toIcalDate(new Date().toISOString())}`);
      lines.push(`DTSTART:${start}`);
      lines.push(`DTEND:${end}`);
      lines.push(`SUMMARY:${escapeIcal(session.title || 'Training Session')}`);
      if (session.description) lines.push(`DESCRIPTION:${escapeIcal(session.description)}`);
      if (session.location) lines.push(`LOCATION:${escapeIcal(session.location)}`);
      if (session.meeting_link) lines.push(`URL:${escapeIcal(session.meeting_link)}`);
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    return new Response(lines.join('\r\n'), {
      headers: {
        ...corsHeaders,
        'Content-Disposition': `attachment; filename="${org?.name || 'schedule'}.ics"`,
      },
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
});
