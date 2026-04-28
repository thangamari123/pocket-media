import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/auth.tsx';
import { signInWithGoogle } from '../lib/googleAuth.ts';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        setIsSignUp(false);
        setError('Account created! Please sign in.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Pocket Media</h1>
          <p className="text-sm text-stone-500 mt-1">AI Social Media Manager for Indian Businesses</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-stone-900 mb-1">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-stone-500 mb-5">
            {isSignUp ? 'Start your free trial today' : 'Sign in to manage your social media'}
          </p>

          {error && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${error.includes('created') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required={isSignUp}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {loading ? 'Please wait...' : <>
                {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </>}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-stone-400">or continue with</span>
            </div>
          </div>

          <button
            onClick={() => signInWithGoogle('Pocket Media')}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-xs text-stone-500 mt-5">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-orange-600 font-medium hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
