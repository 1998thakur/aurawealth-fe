import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Server-side Supabase client for direct database queries.
 * Used in server components and generateMetadata to skip the API round-trip.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
