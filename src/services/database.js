import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://awibemxtrwthrltvufkb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aWJlbXh0cnd0aHJsdHZ1ZmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTcwMjEsImV4cCI6MjA4NjY3MzAyMX0.7Lsvu33fUHULS-W5lA3fyc45GZKbJOE5O9jp5WoZr_k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
