import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Wand2, Calendar, Image, BarChart3, FileText,
  Menu, X, ChevronRight, Sparkles, Link2, LogOut, Crown,
  User, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth.tsx';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/generate', label: 'AI Generator', icon: Wand2 },
  { path: '/calendar', label: 'Content Calendar', icon: Calendar },
  { path: '/templates', label: 'Templates', icon: FileText },
  { path: '/accounts', label: 'Social Accounts', icon: Link2 },
  { path: '/media', label: 'Media Library', icon: Image },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isLifetime = profile?.plan_type === 'lifetime';

  return (
    <div className="flex h-screen bg-stone-50 text-stone-800 overflow-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">Pocket Media</h1>
              <p className="text-xs text-slate-400">AI Social Manager</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }
                `}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          {isLifetime && (
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-400" />
                <p className="text-xs font-bold text-amber-400">Lifetime Pro</p>
              </div>
              <p className="text-[10px] text-amber-300/70">Unlimited AI + all platforms forever</p>
            </div>
          )}
          {!isLifetime && (
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-xs font-medium text-slate-300 mb-1">Free Plan</p>
              <p className="text-[10px] text-slate-500 mb-2">10 AI posts/month</p>
              <button className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-xs font-medium text-white transition-colors">
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-stone-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-stone-800">
            {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Ready
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`}
                  alt=""
                  className="w-8 h-8 rounded-full bg-stone-100"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-stone-800 leading-tight">{profile?.name || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-[10px] text-stone-400">{profile?.plan_type === 'lifetime' ? 'Lifetime Pro' : 'Free Plan'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-stone-200 shadow-lg z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-stone-100">
                        <p className="text-sm font-semibold text-stone-800">{profile?.name || user?.email?.split('@')[0]}</p>
                        <p className="text-xs text-stone-500">{user?.email}</p>
                        {isLifetime && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full border border-amber-200">
                            <Crown className="w-3 h-3" /> Lifetime Pro
                          </span>
                        )}
                      </div>
                      <div className="p-1.5">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 rounded-lg transition-colors">
                          <User className="w-4 h-4" /> Profile
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
