import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://your-project.supabase.co';
const DEFAULT_SUPABASE_ANON = 'your-anon-key';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON;

if (supabaseUrl === DEFAULT_SUPABASE_URL || supabaseAnonKey === DEFAULT_SUPABASE_ANON) {
	console.error('Supabase not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const isSupabaseConfigured = supabaseUrl !== DEFAULT_SUPABASE_URL && supabaseAnonKey !== DEFAULT_SUPABASE_ANON;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
