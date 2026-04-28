declare module './lib/supabase' {
  const supabase: any;
  export default supabase;
}
declare module '../lib/supabase' {
  const supabase: any;
  export default supabase;
}
declare module './lib/googleAuth' {
  export function signInWithGoogle(appName?: string): void;
  export function handleGoogleRedirect(): Promise<void>;
}
declare module '../lib/googleAuth' {
  export function signInWithGoogle(appName?: string): void;
  export function handleGoogleRedirect(): Promise<void>;
}
declare module './lib/auth' {
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
  export function useAuth(): any;
}
declare module '../lib/auth' {
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
  export function useAuth(): any;
}
