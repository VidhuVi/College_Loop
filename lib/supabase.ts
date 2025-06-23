// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iraaznhokljylmfqnfum.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyYWF6bmhva2xqeWxtZnFuZnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI2NTgsImV4cCI6MjA2NjIzODY1OH0.lqTu7vgP4n7ujVjuZJePwahjT-VnvilF4Ntsx6qS-aQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
