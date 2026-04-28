import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Linkedin, Youtube, Link2, Users, ExternalLink } from 'lucide-react';

interface SocialAccount {
  id: number;
  platform: string;
  account_name: string;
  account_handle: string;
  follower_count: number;
  status: string;
  profile_url: string;
}

const platformConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  instagram: { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', label: 'Instagram' },
  facebook: { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Facebook' },
  linkedin: { icon: Linkedin, color: 'text-sky-600', bg: 'bg-sky-50', label: 'LinkedIn' },
  youtube: { icon: Youtube, color: 'text-red-600', bg: 'bg-red-50', label: 'YouTube' },
};

export default function SocialAccountsWidget() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social-accounts');
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const connected = accounts.filter(a => a.status === 'connected');
  const allPlatforms = ['instagram', 'facebook', 'linkedin', 'youtube'];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-stone-200 rounded animate-pulse" />
          <div className="w-32 h-4 bg-stone-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-stone-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-stone-800">Social Accounts</h3>
        </div>
        <a href="/accounts" className="text-xs text-orange-600 font-medium hover:underline">Manage</a>
      </div>

      <div className="p-4 space-y-3">
        {allPlatforms.map(platform => {
          const cfg = platformConfig[platform];
          const Icon = cfg.icon;
          const acc = connected.find(a => a.platform === platform);

          return (
            <div
              key={platform}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                acc ? 'bg-white border-stone-200' : 'bg-stone-50/50 border-stone-100'
              }`}
            >
              <div className={`w-9 h-9 ${acc ? cfg.bg : 'bg-stone-100'} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${acc ? cfg.color : 'text-stone-300'}`} />
              </div>
              <div className="flex-1 min-w-0">
                {acc ? (
                  <>
                    <p className="text-sm font-medium text-stone-800 truncate">{acc.account_name}</p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {acc.follower_count?.toLocaleString('en-IN')} followers
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-stone-400">{cfg.label}</p>
                    <p className="text-xs text-stone-400">Not connected</p>
                  </>
                )}
              </div>
              {acc ? (
                <a
                  href={acc.profile_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <a
                  href="/accounts"
                  className="px-2.5 py-1 text-[10px] font-medium text-orange-600 bg-orange-50 border border-orange-100 rounded-full hover:bg-orange-100 transition-colors"
                >
                  Connect
                </a>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
