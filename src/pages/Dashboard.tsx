import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, TrendingUp, Clock, CheckCircle2,
  Instagram, Facebook, Linkedin, Youtube, ArrowRight,
  Crown, Zap, Users, Link2, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../lib/auth.tsx';
import SocialAccountsWidget from '../components/SocialAccountsWidget';

interface Post {
  id: number;
  content: string;
  platform: string;
  status: string;
  scheduled_at: string;
  businesses: { name: string };
}

interface Business {
  id: number;
  name: string;
  type: string;
  location: string;
}

interface SocialAccount {
  id: number;
  platform: string;
  follower_count: number;
  status: string;
}

const platformIcons: Record<string, any> = {
  instagram: Instagram, facebook: Facebook, linkedin: Linkedin, youtube: Youtube,
};

const platformColors: Record<string, string> = {
  instagram: 'bg-pink-50 text-pink-600 border-pink-100',
  facebook: 'bg-blue-50 text-blue-600 border-blue-100',
  linkedin: 'bg-sky-50 text-sky-600 border-sky-100',
  youtube: 'bg-red-50 text-red-600 border-red-100',
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, bizRes, acctRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/businesses'),
        fetch('/api/social-accounts')
      ]);
      const postsData = await postsRes.json();
      const bizData = await bizRes.json();
      const acctData = await acctRes.json();
      setPosts(Array.isArray(postsData) ? postsData : []);
      setBusinesses(Array.isArray(bizData) ? bizData : []);
      setSocialAccounts(Array.isArray(acctData) ? acctData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const upcoming = posts.filter(p => p.status === 'scheduled').slice(0, 5);
  const connectedAccounts = socialAccounts.filter(a => a.status === 'connected');
  const totalFollowers = connectedAccounts.reduce((s, a) => s + (a.follower_count || 0), 0);

  const stats = [
    { label: 'Total Posts', value: posts.length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Scheduled', value: scheduledCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Published', value: publishedCount, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Drafts', value: draftCount, icon: ImageIcon, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isLifetime = profile?.plan_type === 'lifetime';

  return (
    <div className="space-y-6">
      {/* Welcome + Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 text-white ${isLifetime
          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
          : 'bg-gradient-to-r from-orange-500 to-amber-500'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isLifetime && <Crown className="w-5 h-5 text-amber-200" />}
              <h2 className="text-xl font-bold">Welcome back, {profile?.name?.split(' ')[0] || 'there'}! 👋</h2>
            </div>
            <p className="text-sm opacity-90 mb-4">
              You have {scheduledCount} post{scheduledCount !== 1 ? 's' : ''} scheduled.
              {isLifetime ? ' Your Lifetime Pro plan gives you unlimited everything.' : ' Upgrade to Lifetime Pro for unlimited AI posts.'}
            </p>
            <a href="/generate" className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              <Zap className="w-4 h-4" /> Generate Content <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          {isLifetime && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl">
              <Crown className="w-5 h-5 text-amber-200" />
              <div>
                <p className="text-xs font-bold text-amber-100">Lifetime Pro</p>
                <p className="text-[10px] text-amber-200/80">Unlimited Forever</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl p-4 border border-stone-200 hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
              <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Followers + Accounts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Total Followers Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-stone-200 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-stone-800 text-sm">Total Reach</h3>
          </div>
          <p className="text-3xl font-bold text-stone-900">{totalFollowers.toLocaleString('en-IN')}</p>
          <p className="text-xs text-stone-500 mt-1">followers across {connectedAccounts.length} connected accounts</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {connectedAccounts.map(acc => {
              const Icon = platformIcons[acc.platform] || Instagram;
              return (
                <div key={acc.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 rounded-lg border border-stone-100">
                  <Icon className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-xs font-medium text-stone-700">{(acc.follower_count || 0).toLocaleString('en-IN')}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Connected Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl border border-stone-200 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-stone-800 text-sm">Platforms</h3>
            </div>
            <a href="/accounts" className="text-xs text-orange-600 hover:underline">Manage</a>
          </div>
          <div className="space-y-3">
            {['instagram', 'facebook', 'linkedin', 'youtube'].map(p => {
              const Icon = platformIcons[p];
              const acc = connectedAccounts.find(a => a.platform === p);
              return (
                <div key={p} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${acc ? 'bg-stone-100' : 'bg-stone-50'}`}>
                    <Icon className={`w-4 h-4 ${acc ? 'text-stone-600' : 'text-stone-300'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-medium capitalize ${acc ? 'text-stone-700' : 'text-stone-400'}`}>{p}</p>
                  </div>
                  {acc ? (
                    <span className="text-xs font-semibold text-stone-800">{(acc.follower_count || 0).toLocaleString('en-IN')}</span>
                  ) : (
                    <span className="text-[10px] text-stone-400">Not linked</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Social Accounts Widget */}
        <SocialAccountsWidget />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Posts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-semibold text-stone-800">Upcoming Posts</h3>
            <a href="/calendar" className="text-xs text-orange-600 font-medium hover:underline">View Calendar</a>
          </div>
          <div className="divide-y divide-stone-100">
            {upcoming.length === 0 ? (
              <div className="px-5 py-8 text-center text-stone-400 text-sm">
                No scheduled posts yet. <a href="/generate" className="text-orange-600 hover:underline">Create one!</a>
              </div>
            ) : (
              upcoming.map(post => {
                const PlatformIcon = platformIcons[post.platform] || Instagram;
                const pc = platformColors[post.platform] || 'bg-stone-50 text-stone-600 border-stone-100';
                return (
                  <div key={post.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-stone-50 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${pc}`}>
                      <PlatformIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{post.content || 'Untitled Post'}</p>
                      <p className="text-xs text-stone-500">{post.businesses?.name} • {new Date(post.scheduled_at).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100">
                      Scheduled
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Businesses */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-semibold text-stone-800">Your Businesses</h3>
            <span className="text-xs text-stone-400">{businesses.length} total</span>
          </div>
          <div className="divide-y divide-stone-100">
            {businesses.length === 0 ? (
              <div className="px-5 py-8 text-center text-stone-400 text-sm">
                No businesses added yet.
              </div>
            ) : (
              businesses.map(biz => (
                <div key={biz.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-stone-50 transition-colors">
                  <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center text-stone-600 font-bold text-sm">
                    {biz.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-800">{biz.name}</p>
                    <p className="text-xs text-stone-500 capitalize">{biz.type} • {biz.location}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
