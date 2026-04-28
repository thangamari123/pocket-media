import supabase from './supabase';

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function buildGoogleUrl(appName) {
  // Hardcoded for Vercel stability
  const clientId = '1065078894672-rmp5kp8vfjns5rn9kp5psfp16g691043.apps.googleusercontent.com';
  const redirectUri = 'https://designarena.ai/auth/google/callback';
  const supabaseUrl = 'https://pzpgrgfzerknrolrwtms.supabase.co';
  const supabaseAnonKey = 'sb_publishable_AXSkZvov8puScFGBACDpiw_WhqcZla4';

  if (!clientId || !redirectUri) return null;
  const state = btoa(JSON.stringify({ origin: window.location.origin, appName, supabaseUrl, supabaseAnonKey }));
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account&state=${encodeURIComponent(state)}`;
}

export function signInWithGoogle(appName = 'Pocket Media') {
  const url = buildGoogleUrl(appName);
  if (!url) { console.warn('[google-auth] Missing Config'); return; }
  window.open(url, 'google-auth', isMobile() ? '' : 'width=500,height=600');

  const handler = async (event) => {
    if (event.data?.type === 'google-auth-denied') {
      window.removeEventListener('message', handler);
      return;
    }
    if (event.data?.type !== 'google-auth-success') return;
    window.removeEventListener('message', handler);
    if (event.data.access_token && event.data.refresh_token) {
      const { error } = await supabase.auth.setSession({ 
        access_token: event.data.access_token, 
        refresh_token: event.data.refresh_token 
      });
      if (error) console.error('[google-auth] setSession failed:', error.message);
    } else if (event.data.id_token) {
      const { error } = await supabase.auth.signInWithIdToken({ 
        provider: 'google', 
        token: event.data.id_token 
      });
      if (error) console.error('[google-auth] signInWithIdToken failed:', error.message);
    }
  };
  window.addEventListener('message', handler);
}

export async function handleGoogleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('google_id_token');
  if (!token) return;
  window.history.replaceState({}, '', window.location.pathname);
  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token });
  if (error) { console.error('[google-auth] signInWithIdToken failed:', error.message); return; }
  try { window.close(); } catch {}
}
