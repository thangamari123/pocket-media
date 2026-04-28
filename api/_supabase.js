import { createClient } from '@supabase/supabase-js';
import { triggerRestore } from './_wake.js';

// Support both Frontend (VITE) and Backend (NEXT/SUPABASE) env styles + hardcoded fallback
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pzpgrgfzerknrolrwtms.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AXSkZvov8puScFGBACDpiw_WhqcZla4';

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    global: {
      fetch: async (url, options) => {
        const res = await fetch(url, options);
        if (!res.ok && res.status >= 500) triggerRestore();
        return res;
      },
    },
  }
);

export default supabase;
