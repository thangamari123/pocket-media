import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pzpgrgfzerknrolrwtms.supabase.co',
  'sb_publishable_AXSkZvov8puScFGBACDpiw_WhqcZla4'
);

export default supabase;
