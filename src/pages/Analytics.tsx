import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Heart, MessageCircle, Share2, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';

interface AnalyticsItem {
  id: number;
  post_id: number;
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  posted_at: string;
  posts: { content: string; platform: string };
}

const platformIcons: Record<string, any> = {
  instagram: Instagram, facebook: Facebook, linkedin: Linkedin, youtube: Youtube
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalLikes = analytics.reduce((s, a) => s + (a.likes || 0), 0);
  const totalComments = analytics.reduce((s, a) => s + (a.comments || 0), 0);
  const totalShares = analytics.reduce((s, a) => s + (a.shares || 0), 0);
  const totalReach = analytics.reduce((s, a) => s + (a.reach || 0), 0);

  const platformStats = ['instagram', 'facebook', 'linkedin', 'youtube'].map(p => {
    const items = analytics.filter(a => a.platform === p);
    return {
      platform: p,
      posts: items.length,
      likes: items.reduce((s, a) => s + (a.likes || 0), 0),
      reach: items.reduce((s, a) => s + (a.reach || 0), 0),
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Likes', value: totalLikes, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Comments', value: totalComments, icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Shares', value: totalShares, icon: Share2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Reach', value: totalReach.toLocaleString('en-IN'), icon: Eye, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl p-4 border border-stone-200"
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

      {/* Platform Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-stone-200 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-800">Platform Performance</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {platformStats.map(ps => {
            const Icon = platformIcons[ps.platform] || Instagram;
            return (
              <div key={ps.platform} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-stone-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-800 capitalize">{ps.platform}</p>
                  <p className="text-xs text-stone-500">{ps.posts} posts</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-stone-900">{ps.likes.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-stone-500">likes</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-stone-900">{ps.reach.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-stone-500">reach</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Top Posts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-stone-200 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-800">Top Performing Posts</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {analytics.length === 0 ? (
            <div className="px-5 py-8 text-center text-stone-400 text-sm">
              No analytics data yet. Publish posts to see performance.
            </div>
          ) : (
            [...analytics]
              .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
              .slice(0, 8)
              .map(item => {
                const Icon = platformIcons[item.platform] || Instagram;
                const engagement = item.likes + item.comments + item.shares;
                return (
                  <div key={item.id} className="px-5 py-3.5 flex items-center gap-3">
                    <Icon className="w-4 h-4 text-stone-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{item.posts?.content || 'Post #' + item.post_id}</p>
                      <p className="text-xs text-stone-500">{new Date(item.posted_at).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-stone-600">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {item.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {item.comments}</span>
                      <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {item.shares}</span>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-semibold text-stone-900">{engagement}</p>
                      <p className="text-xs text-stone-500">engagement</p>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </motion.div>
    </div>
  );
}
