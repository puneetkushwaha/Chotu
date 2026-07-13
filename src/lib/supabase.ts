import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pigfqhibxvbwjmfdgzwp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZ2ZxaGlieHZid2ptZmRnendwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MjM4ODAsImV4cCI6MjA5OTI5OTg4MH0.UFP_aU2HdHeoSS6ndZSvr7XM0MYVAH6u2UEBW7wm-Vg';

export const supabase = createClient(supabaseUrl, supabaseKey);
