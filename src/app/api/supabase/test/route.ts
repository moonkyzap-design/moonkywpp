import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test query on organizations table
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('count', { count: 'exact', head: true });

    // Test query on channels table
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('count', { count: 'exact', head: true });

    // Test query on conversations table
    const { data: convs, error: convsError } = await supabase
      .from('conversations')
      .select('count', { count: 'exact', head: true });

    return NextResponse.json({
      connected: !orgsError,
      supabaseUrl: SUPABASE_URL,
      projectRef: 'awsmysjmittjvgpbopay',
      tablesChecked: {
        organizations: !orgsError ? 'OK (accessible)' : orgsError.message,
        channels: !channelsError ? 'OK (accessible)' : channelsError.message,
        conversations: !convsError ? 'OK (accessible)' : convsError.message
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        connected: false,
        error: message,
        supabaseUrl: SUPABASE_URL
      },
      { status: 500 }
    );
  }
}
