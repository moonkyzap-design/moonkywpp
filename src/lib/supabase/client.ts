// ===================================================================
// SUPABASE CLIENT INITIALIZATION
// Preconfigured with awsmysjmittjvgpbopay project and env fallbacks
// ===================================================================

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://awsmysjmittjvgpbopay.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_eNMY4wc3i6tEhky5mUOsiQ_f8rSG7iC';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.startsWith('https://') &&
    !SUPABASE_URL.includes('your-project')
  );
};

export const createSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};

export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
