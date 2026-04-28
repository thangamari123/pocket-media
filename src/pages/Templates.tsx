import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Tag, Search, Filter } from 'lucide-react';

interface Template {
  id: number;
  category: string;
  title: string;
  content_template: string;
  hashtags: string;
  image_suggestion: string;
  language: string;
  business_type: string;
  goal: string;
}

const categories = ['festival', 'offer', 'testimonial', 'before_after', 'awareness', 'general'];
const businessTypes = ['salon', 'bakery', 'textile', 'restaurant', 'grocery', 'jewelry', 'pharmacy', 'real_estate'];
const goals = ['awareness', 'offer', 'festival', 'testimonial', 'before_after'];

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBiz, setFilterBiz] = useState('');
  const [filterGoal, setFilterGoal] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set('category', filterCategory);
      if (filterBiz) params.set('business_type', filterBiz);
      if (filterGoal) params.set('goal', filterGoal);
      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filterCategory, filterBiz, filterGoal]);

  const filtered = templates.filter(t =>
    search === '' ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.content_template.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-stone-200 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-800">Filter Templates</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
          </select>
          <select
            value={filterBiz}
            onChange={e => setFilterBiz(e.target.value)}
            className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <option value="">All Business Types</option>
            {businessTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
          </select>
          <select
            value={filterGoal}
            onChange={e => setFilterGoal(e.target.value)}
            className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <option value="">All Goals</option>
            {goals.map(g => <option key={g} value={g}>{g.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Templates Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-stone-800">{template.title}</h3>
              </div>
              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-medium rounded-full capitalize">
                {template.language}
              </span>
            </div>
            <p className="text-xs text-stone-500 mb-3 line-clamp-3 leading-relaxed">{template.content_template}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-medium rounded-full border border-orange-100 capitalize">
                {template.category}
              </span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full border border-blue-100 capitalize">
                {template.business_type?.replace('_', ' ')}
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-full border border-emerald-100 capitalize">
                {template.goal?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-stone-400">
              <Tag className="w-3 h-3" />
              <span className="truncate">{template.hashtags}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-sm text-stone-500">No templates match your filters.</p>
        </div>
      )}
    </div>
  );
}
