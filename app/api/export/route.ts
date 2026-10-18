import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Every user-owned table. RLS scopes each query to the signed-in user,
// so this can never include another account's rows.
const TABLES = [
  'profiles',
  'cycle_settings',
  'periods',
  'symptoms',
  'pain_logs',
  'mood_logs',
  'wellness_logs',
  'cravings',
  'journal_entries',
  'preferences',
  'movie_watchlist',
  'partner_connections',
  'partner_permissions',
  'partner_suggestions',
  'partner_audit_log',
] as const;

/**
 * GET /api/export — downloads a complete JSON copy of the caller's data.
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const data: Record<string, unknown> = {};

  for (const table of TABLES) {
    const { data: rows, error } = await supabase.from(table).select('*');
    if (error) {
      // Message-only server log; client gets a per-table placeholder.
      console.error(`[export] table ${table} failed:`, error.message);
      data[table] = { error: 'This table could not be exported.' };
    } else {
      data[table] = rows;
    }
  }

  const payload = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    data,
  };

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="lunara-export-${date}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
