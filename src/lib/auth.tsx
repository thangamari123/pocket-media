import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import supabase from './supabase.ts';

interface Profile {
  id: number;
  auth_id: string;
  name: string;
  email: string;
  avatar_url: string;
  plan_type: string;
  plan_expires_at: string;
}

interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authId: string) => {
    try {
      const res = await fetch(`/api/users`);
      const users = await res.json();
      const found = users.find((u: any) => u.auth_id === authId);
      if (found) setProfile(found);
    } catch (e) { console.error(e); }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_id: data.user.id, name, email, plan_type: 'free' })
      });
    }
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
