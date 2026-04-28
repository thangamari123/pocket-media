import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, Copy, Check, Calendar, Instagram, Facebook,
  Linkedin, Youtube, Sparkles, RefreshCw, Save, Send,
  Link2, ExternalLink, AlertCircle, CheckCircle2,
  Upload, X, Image as ImageIcon, Film, Trash2, Zap,
  Type, Target, MapPin, Tag, Lightbulb
} from 'lucide-react';

const languages = ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam'];
const allPlatforms = ['instagram', 'facebook', 'linkedin', 'youtube'];

const platformIcons: Record<string, any> = {
  instagram: Instagram, facebook: Facebook, linkedin: Linkedin, youtube: Youtube
};

const platformConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  instagram: { color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', label: 'Instagram' },
  facebook: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Facebook' },
  linkedin: { color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', label: 'LinkedIn' },
  youtube: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'YouTube' },
};

interface GeneratedContent {
  caption: string;
  hashtags: string;
  post_idea: string;
  image_suggestion: string;
  platform_tips: Record<string, string>;
  template_id?: number;
  ai_generated?: boolean;
  model?: string;
}

interface Business {
  id: number;
  name: string;
  type: string;
  location: string;
  language: string;
}

interface SocialAccount {
  id: number;
  platform: string;
  account_name: string;
  account_handle: string;
  follower_count: number;
  status: string;
  profile_url: string;
}

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export default function ContentGenerator() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<number | ''>('');
  const [businessType, setBusinessType] = useState('');
  const [businessTypeInput, setBusinessTypeInput] = useState('');
  const [goal, setGoal] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [offerDetails, setOfferDetails] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<Record<string, any>>({});
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBusinesses();
    fetchSocialAccounts();
  }, []);

  useEffect(() => {
    if (selectedBiz) {
      const biz = businesses.find(b => b.id === selectedBiz);
      if (biz) {
        setBusinessType(biz.type);
        setBusinessTypeInput(biz.type);
        setLanguage(biz.language || 'English');
        setLocation(biz.location || '');
      }
    }
  }, [selectedBiz, businesses]);

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/businesses');
      const data = await res.json();
      setBusinesses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSocialAccounts = async () => {
    try {
      const res = await fetch('/api/social-accounts');
      const data = await res.json();
      setSocialAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const getConnectedAccount = (platform: string) =>
    socialAccounts.find(a => a.platform === platform && a.status === 'connected');

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaFile({
        file,
        preview: reader.result as string,
        type: isVideo ? 'video' : 'image'
      });
    };
    reader.readAsDataURL(file);
  };

  const uploadMedia = async (): Promise<string> => {
    if (!mediaFile) return '';
    setMediaUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: mediaFile.preview,
          fileName: mediaFile.file.name,
          fileType: mediaFile.file.type,
          tags: 'generator'
        })
      });
      const data = await res.json();
      setUploadedMediaUrl(data.publicUrl || data.url);
      return data.publicUrl || data.url;
    } catch (err) {
      console.error(err);
      return '';
    } finally {
      setMediaUploading(false);
    }
  };

  const generate = async () => {
    setLoading(true);
    setResult(null);
    setPublishResults({});

    let mediaUrl = uploadedMediaUrl;
    if (mediaFile && !uploadedMediaUrl) {
      mediaUrl = await uploadMedia();
    }

    try {
      const biz = businesses.find(b => b.id === selectedBiz);
      const finalBizType = businessTypeInput || businessType || 'business';
      const finalGoal = goalInput || goal || 'awareness';

      const res = await fetch('/api/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_type: finalBizType,
          goal: finalGoal,
          language,
          business_name: biz?.name || 'Your Business',
          offer_details: offerDetails,
          location: location || biz?.location || '',
          media_base64: mediaFile?.preview,
          media_type: mediaFile?.type,
          media_mime: mediaFile?.file?.type
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const schedulePost = async () => {
    if (!result || selectedPlatforms.length === 0) return;
    setSaving(true);
    setSaveMsg('');
    try {
      for (const platform of selectedPlatforms) {
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: selectedBiz || 1,
            content: result.caption.slice(0, 100),
            caption: result.caption,
            hashtags: result.hashtags,
            platform,
            status: scheduleDate ? 'scheduled' : 'draft',
            scheduled_at: scheduleDate || new Date().toISOString(),
            template_used: result.template_id
          })
        });
      }
      setSaveMsg('Post saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg('Error saving post.');
    } finally {
      setSaving(false);
    }
  };

  const publishNow = async () => {
    if (!result || selectedPlatforms.length === 0) return;
    setPublishing(true);
    setPublishResults({});
    const results: Record<string, any> = {};

    try {
      for (const platform of selectedPlatforms) {
        const postRes = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: selectedBiz || 1,
            content: result.caption.slice(0, 100),
            caption: result.caption,
            hashtags: result.hashtags,
            platform,
            status: 'published',
            scheduled_at: new Date().toISOString(),
            template_used: result.template_id
          })
        });
        const postData = await postRes.json();

        const pubRes = await fetch('/api/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            post_id: postData.id,
            platform,
            caption: result.caption,
            hashtags: result.hashtags
          })
        });
        const pubData = await pubRes.json();
        results[platform] = pubData;
      }
      setPublishResults(results);
      setSaveMsg('Published successfully to all selected platforms!');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      setSaveMsg('Error publishing post.');
    } finally {
      setPublishing(false);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setUploadedMediaUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const connectedCount = allPlatforms.filter(p => getConnectedAccount(p)).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Connected Accounts Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-stone-200 p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-stone-800">Connected Social Accounts</h3>
          </div>
          <span className="text-xs text-stone-500">{connectedCount}/4 connected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allPlatforms.map(p => {
            const Icon = platformIcons[p];
            const acc = getConnectedAccount(p);
            const cfg = platformConfig[p];
            return (
              <div
                key={p}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
                  acc ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="capitalize">{cfg.label}</span>
                {acc ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    @{acc.account_handle}
                  </span>
                ) : (
                  <a href="/accounts" className="text-stone-400 hover:text-orange-600 transition-colors">
                    <AlertCircle className="w-3 h-3" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Generator Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-stone-200 p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Wand2 className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-bold text-stone-900">AI Content Generator</h2>
          {result?.ai_generated && (
            <span className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded-full border border-purple-200">
              <Zap className="w-3 h-3" /> AI Powered
            </span>
          )}
        </div>

        {/* Media Upload */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-stone-600 mb-1.5">Upload Image or Video (Optional)</label>
          {!mediaFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-colors cursor-pointer"
            >
              <Upload className="w-6 h-6 text-stone-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-600">Click to upload image or video</p>
              <p className="text-xs text-stone-400 mt-1">AI will generate caption based on your media</p>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-stone-200">
              {mediaFile.type === 'video' ? (
                <video src={mediaFile.preview} className="w-full h-48 object-cover" controls />
              ) : (
                <img src={mediaFile.preview} alt="Preview" className="w-full h-48 object-cover" />
              )}
              <button
                onClick={removeMedia}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/50 text-white text-[10px] rounded-lg">
                {mediaFile.type === 'video' ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                {mediaFile.file.name}
              </div>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Business</label>
            <select
              value={selectedBiz}
              onChange={e => setSelectedBiz(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="">Select a business...</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Business Type - Manual Input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> Business Type <span className="text-stone-400 font-normal">(type anything)</span>
          </label>
          <input
            type="text"
            value={businessTypeInput}
            onChange={e => setBusinessTypeInput(e.target.value)}
            placeholder="e.g. salon, bakery, textile shop, real estate agency, yoga studio..."
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* Goal - Manual Input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" /> Goal <span className="text-stone-400 font-normal">(type anything)</span>
          </label>
          <input
            type="text"
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            placeholder="e.g. awareness, offer, festival post, testimonial, before/after, new launch, discount..."
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Location
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Chennai, Bangalore, Hyderabad"
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Offer / Details
            </label>
            <input
              type="text"
              value={offerDetails}
              onChange={e => setOfferDetails(e.target.value)}
              placeholder="e.g. 20% off this weekend"
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || mediaUploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {loading || mediaUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {mediaUploading ? 'Uploading media...' : loading ? 'AI Generating...' : 'Generate Content'}
        </button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* AI Badge */}
            {result.ai_generated && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Generated by AI ({result.model || 'Gemini'})</span>
              </div>
            )}

            {/* Caption */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-stone-800 text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Generated Caption
                </h3>
                <button
                  onClick={() => copyToClipboard(result.caption + '\n\n' + result.hashtags)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy All'}
                </button>
              </div>
              <div className="bg-stone-50 rounded-lg p-4 text-sm text-stone-700 whitespace-pre-line leading-relaxed">
                {result.caption}
              </div>
            </div>

            {/* Hashtags */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-semibold text-stone-800 text-sm mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" /> AI-Generated Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.split(' ').map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100 hover:bg-orange-100 cursor-pointer transition-colors"
                    onClick={() => copyToClipboard(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Post Idea */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-semibold text-stone-800 text-sm mb-2">Post Idea & Image Suggestion</h3>
              <p className="text-sm text-stone-600">{result.post_idea}</p>
              <p className="text-xs text-stone-400 mt-1">{result.image_suggestion}</p>
            </div>

            {/* Platform Tips */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-semibold text-stone-800 text-sm mb-3">Platform-Specific Tips</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(result.platform_tips).map(([platform, tip]) => {
                  const Icon = platformIcons[platform] || Instagram;
                  const acc = getConnectedAccount(platform);
                  return (
                    <div key={platform} className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
                      <Icon className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-stone-700 capitalize">{platform}</p>
                          {acc ? (
                            <span className="flex items-center gap-0.5 text-[10px] text-green-600">
                              <CheckCircle2 className="w-3 h-3" /> @{acc.account_handle}
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400">Not connected</span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{tip}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Schedule / Publish */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-semibold text-stone-800 text-sm mb-3">Schedule, Save, or Publish Now</h3>

              <div className="mb-4">
                <p className="text-xs font-medium text-stone-600 mb-2">Select Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {allPlatforms.map(p => {
                    const Icon = platformIcons[p];
                    const active = selectedPlatforms.includes(p);
                    const acc = getConnectedAccount(p);
                    const cfg = platformConfig[p];
                    return (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          active ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="capitalize">{cfg.label}</span>
                        {acc && active && <CheckCircle2 className="w-3 h-3" />}
                        {!acc && active && <AlertCircle className="w-3 h-3 text-amber-500" />}
                      </button>
                    );
                  })}
                </div>
                {selectedPlatforms.some(p => !getConnectedAccount(p)) && (
                  <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Some selected platforms are not connected. Posts will be saved as drafts.
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <button
                  onClick={schedulePost}
                  disabled={saving || selectedPlatforms.length === 0}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {scheduleDate ? 'Schedule Post' : 'Save as Draft'}
                </button>
                <button
                  onClick={publishNow}
                  disabled={publishing || selectedPlatforms.length === 0 || selectedPlatforms.some(p => !getConnectedAccount(p))}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-stone-300 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {publishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {publishing ? 'Publishing...' : 'Publish Now'}
                </button>
              </div>

              {Object.keys(publishResults).length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-2">
                  {Object.entries(publishResults).map(([platform, data]: [string, any]) => {
                    const Icon = platformIcons[platform];
                    return (
                      <div key={platform} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <Icon className="w-4 h-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-green-800 capitalize">Published to {platform}</p>
                          {data.post_url && (
                            <a href={data.post_url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> View post
                            </a>
                          )}
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {saveMsg && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs font-medium text-emerald-600">
                  {saveMsg}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
