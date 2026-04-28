import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, Sparkles } from 'lucide-react';

interface Post {
  id: number;
  content: string;
  platform: string;
  status: string;
  scheduled_at: string;
  businesses: { name: string };
}

interface Festival {
  id: number;
  name: string;
  date: string;
  description: string;
}

const platformColors: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-700 border-pink-200',
  facebook: 'bg-blue-100 text-blue-700 border-blue-200',
  linkedin: 'bg-sky-100 text-sky-700 border-sky-200',
  youtube: 'bg-red-100 text-red-700 border-red-200',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-stone-100 text-stone-600',
};

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const [postsRes, festRes] = await Promise.all([
        fetch('/api/posts'),
        fetch(`/api/festivals?month=${month}`)
      ]);
      const postsData = await postsRes.json();
      const festData = await festRes.json();
      setPosts(Array.isArray(postsData) ? postsData : []);
      setFestivals(Array.isArray(festData) ? festData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getPostsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter(p => p.scheduled_at?.startsWith(dateStr));
  };

  const getFestivalsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return festivals.filter(f => f.date?.startsWith(dateStr));
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-stone-900 min-w-[180px] text-center">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <a href="/generate" className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Sparkles className="w-4 h-4" /> New Post
        </a>
      </div>

      {/* Festivals bar */}
      {festivals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 overflow-x-auto pb-2"
        >
          {festivals.map(f => (
            <div key={f.id} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <CalendarDays className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-xs font-semibold text-amber-800">{f.name}</p>
                <p className="text-xs text-amber-600">{new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-stone-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="px-2 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-stone-50 bg-stone-50/30" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPosts = getPostsForDay(day);
            const dayFestivals = getFestivalsForDay(day);
            const todayClass = isToday(day) ? 'ring-2 ring-orange-500 ring-inset' : '';

            return (
              <div
                key={day}
                className={`min-h-[100px] border-b border-r border-stone-100 p-2 hover:bg-stone-50 transition-colors ${todayClass}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-orange-600 text-white' : 'text-stone-700'}`}>
                    {day}
                  </span>
                  {dayFestivals.length > 0 && (
                    <span className="w-2 h-2 bg-amber-500 rounded-full" title={dayFestivals[0].name} />
                  )}
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map(post => (
                    <div
                      key={post.id}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate border ${platformColors[post.platform] || 'bg-stone-100 text-stone-600 border-stone-200'}`}
                    >
                      {post.businesses?.name}
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <p className="text-[10px] text-stone-400 pl-1">+{dayPosts.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming List */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-800">All Posts This Month</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {posts.filter(p => {
            const d = new Date(p.scheduled_at);
            return d.getMonth() === month && d.getFullYear() === year;
          }).length === 0 ? (
            <div className="px-5 py-8 text-center text-stone-400 text-sm">
              No posts scheduled for this month.
            </div>
          ) : (
            posts.filter(p => {
              const d = new Date(p.scheduled_at);
              return d.getMonth() === month && d.getFullYear() === year;
            }).map(post => (
              <div key={post.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${statusColors[post.status] || 'bg-stone-100 text-stone-600'}`}>
                  {post.status}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{post.content || 'Untitled'}</p>
                  <p className="text-xs text-stone-500">{post.businesses?.name} • {new Date(post.scheduled_at).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize border ${platformColors[post.platform] || 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                  {post.platform}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
