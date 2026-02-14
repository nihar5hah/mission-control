import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qbtlslagwbgrnnuaasma.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidGxzbGFnd2Jncm5udWFhc21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTAzNzksImV4cCI6MjA4NjY2NjM3OX0.95mIKqkW4Q6wtx6vvJk_XdDVK8vobmX2v98f1KRITSk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Shorthand query helpers
export const db = {
  activities: () => supabase.from('activities'),
  tasks: () => supabase.from('tasks'),
  documents: () => supabase.from('documents'),
};
