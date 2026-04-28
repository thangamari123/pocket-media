import { createClient } from '@supabase/supabase-js';

// Hardcoded for Vercel stability since public keys are intended to be public
const supabase = createClient(
  'https://pzpgrgfzerknrolrwtms.supabase.co',
  'sb_publishable_AXSkZvov8puScFGBACDpiw_WhqcZla4'
);

export default supabase;
