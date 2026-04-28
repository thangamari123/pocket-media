import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram, Facebook, Linkedin, Youtube, Link2, Unlink,
  CheckCircle2, XCircle, Users, ExternalLink, Plus, Trash2,
  Globe, RefreshCw, TrendingUp, Eye, Heart, BarChart3,
  Crown, ArrowUpRight
} from 'lucide-react';

interface SocialAccount {
  id: number;
  platform: string;
  account_name: string;
  account_handle: string;
  page_id: string;
  profile_url: string;
  follower_count: number;
  status: string;
  connected_at: string;
  engagement_rate?: number;
  avg_likes?: number;
  avg_comments?: number;
}

const platformConfig: Record<string, { icon: any; color: string; bg: string; border: string; gradient: string; label: string }> = {
  instagram: {
    icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200',
    gradient: 'from-pink-500 to-purple-600', label: 'Instagram'
  },
  facebook: {
    icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-700', label: 'Facebook'
  },
  linkedin: {
    icon: Linkedin, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200',
    gradient: 'from-sky-500 to-blue-600', label: 'LinkedIn'
  },
  youtube: {
    icon: Youtube, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200',
    gradient: 'from-red-500 to-red-700', label: 'YouTube'
  },
};

export default function SocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    platform: 'instagram',
    account_name: '',
    account_handle: '',
    page_id: '',
    profile_url: '',
    follower_count: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social-accounts');
      const data = await res.json();
      // Add simulated engagement metrics
      const enriched = (Array.isArray(data) ? data : []).map((a: any) => ({
        ...a,
        engagement_rate: (Math.random() * 4 + 1).toFixed(2),
        avg_likes: Math.floor((a.follower_count || 0) * 0.03),
        avg_comments: Math.floor((a.follower_count || 0) * 0.005),
      }));
      setAccounts(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          follower_count: Number(form.follower_count) || 0,
          status: 'connected'
        })
      });
      setShowAddModal(false);
      setForm({ platform: 'instagram', account_name: '', account_handle: '', page_id: '', profile_url: '', follower_count: '' });
      fetchAccounts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async (id: number) => {
    if (!confirm('Disconnect this account?')) return;
    try {
      await fetch('/api/social-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (account: SocialAccount) => {
    const newStatus = account.status === 'connected' ? 'disconnected' : 'connected';
    try {
      await fetch('/api/social-accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: account.id, status: newStatus })
      });
      fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  const connected = accounts.filter(a => a.status === 'connected');
  const disconnected = accounts.filter(a => a.status === 'disconnected');
  const totalFollowers = connected.reduce((s, a) => s + (a.follower_count || 0), 0);
  const avgEngagement = connected.length > 0
    ? (connected.reduce((s, a) => s + parseFloat(String(a.engagement_rate || '0')), 0) / connected.length).toFixed(2)
    : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg font-bold text-stone-900">Social Media Accounts</h2>
          <p className="text-sm text-stone-500 mt-0.5">Connect and manage all your social platforms</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Connect Account
        </button>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Followers', value: totalFollowers.toLocaleString('en-IN'), icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Connected', value: connected.length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Engagement', value: `${avgEngagement}%`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Platforms', value: '4', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => {
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

      {/* Platform Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {['instagram', 'facebook', 'linkedin', 'youtube'].map(platform => {
          const cfg = platformConfig[platform];
          const Icon = cfg.icon;
          const acc = connected.find(a => a.platform === platform);
          return (
            <motion.div
              key={platform}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl p-5 border ${acc ? 'border-green-200' : 'border-stone-200'} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${cfg.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${cfg.color}`} />
                </div>
                {acc ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-stone-400 bg-stone-50 px-2 py-1 rounded-full border border-stone-100">
                    <XCircle className="w-3 h-3" /> Offline
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-stone-800">{cfg.label}</p>
              {acc ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-stone-500">@{acc.account_handle}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-600 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {(acc.follower_count || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-stone-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {acc.engagement_rate}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400 mt-2">Click Connect to link your {cfg.label} account</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Connected Accounts Detail */}
      {connected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-semibold text-stone-800">Active Connections ({connected.length})</h3>
            <span className="text-xs text-stone-400">{totalFollowers.toLocaleString('en-IN')} total followers</span>
          </div>
          <div className="divide-y divide-stone-100">
            {connected.map(account => {
              const cfg = platformConfig[account.platform];
              const Icon = cfg.icon;
              return (
                <div key={account.id} className="px-5 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${cfg.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-stone-800">{account.account_name}</p>
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full border border-green-100">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">@{account.account_handle}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-6 mr-4">
                      <div className="text-center">
                        <p className="text-sm font-bold text-stone-900">{(account.follower_count || 0).toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-stone-400 flex items-center justify-center gap-1"><Users className="w-3 h-3" /> Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-stone-900">{account.engagement_rate}%</p>
                        <p className="text-[10px] text-stone-400 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /> Engagement</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-stone-900">{(account.avg_likes || 0).toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-stone-400 flex items-center justify-center gap-1"><Heart className="w-3 h-3" /> Avg Likes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {account.profile_url && (
                        <a href={account.profile_url} target="_blank" rel="noopener noreferrer"
                          className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => toggleStatus(account)}
                        className="p-2 hover:bg-amber-50 rounded-lg text-stone-400 hover:text-amber-600 transition-colors" title="Disconnect"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteAccount(account.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600 transition-colors" title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Mobile stats */}
                  <div className="flex md:hidden items-center gap-4 mt-3 ml-[72px]">
                    <span className="text-xs text-stone-600 flex items-center gap-1"><Users className="w-3 h-3" /> {`${(account.follower_count || 0).toLocaleString('en-IN')}`}</span>
                    <span className="text-xs text-stone-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {account.engagement_rate}%</span>
                    <span className="text-xs text-stone-600 flex items-center gap-1"><Heart className="w-3 h-3" /> {(account.avg_likes || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Disconnected */}
      {disconnected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-stone-100">
            <h3 className="font-semibold text-stone-800">Disconnected Accounts</h3>
          </div>
          <div className="divide-y divide-stone-100">
            {disconnected.map(account => {
              const cfg = platformConfig[account.platform];
              const Icon = cfg.icon;
              return (
                <div key={account.id} className="px-5 py-4 flex items-center gap-4 opacity-60">
                  <div className={`w-12 h-12 ${cfg.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800">{account.account_name}</p>
                    <p className="text-xs text-stone-500">@{account.account_handle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleStatus(account)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" /> Reconnect
                    </button>
                    <button onClick={() => deleteAccount(account.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-semibold text-stone-800">Connect Social Account</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-stone-400" />
                </button>
              </div>
              <form onSubmit={addAccount} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">Platform</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(platformConfig).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      const active = form.platform === key;
                      return (
                        <button key={key} type="button"
                          onClick={() => setForm(f => ({ ...f, platform: key }))}
                          className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                            active ? `${cfg.bg} border-orange-300` : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${active ? cfg.color : 'text-stone-400'}`} />
                          <span className={`text-[10px] font-medium ${active ? 'text-stone-800' : 'text-stone-500'}`}>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">Account Name</label>
                  <input required value={form.account_name}
                    onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))}
                    placeholder="e.g. Lakshmi Beauty Salon"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">Handle / Username</label>
                  <input required value={form.account_handle}
                    onChange={e => setForm(f => ({ ...f, account_handle: e.target.value }))}
                    placeholder="e.g. lakshmibeauty_chennai"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1.5">Page ID</label>
                    <input value={form.page_id}
                      onChange={e => setForm(f => ({ ...f, page_id: e.target.value }))}
                      placeholder="Page ID"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1.5">Followers</label>
                    <input type="number" value={form.follower_count}
                      onChange={e => setForm(f => ({ ...f, follower_count: e.target.value }))}
                      placeholder="0"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">Profile URL</label>
                  <input value={form.profile_url}
                    onChange={e => setForm(f => ({ ...f, profile_url: e.target.value }))}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                    {saving ? 'Connecting...' : 'Connect Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
