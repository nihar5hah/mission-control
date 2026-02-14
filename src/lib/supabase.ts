import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Shorthand query helpers
export const db = {
  activities: () => supabase.from('activities'),
  tasks: () => supabase.from('tasks'),
  documents: () => supabase.from('documents'),
};
