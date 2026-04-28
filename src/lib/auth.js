import { createContext, useContext, useState, useEffect } from 'react';
import supabase from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

  const fetchProfile = async (authId) => {
    try {
      const res = await fetch(`/api/users`);
      const users = await res.json();
      const found = users.find(u => u.auth_id === authId);
      if (found) setProfile(found);
    } catch (e) { console.error(e); }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email, password, name) => {
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
  return useContext(AuthContext);
}
