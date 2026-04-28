import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Trash2, Tag, Link2, Check, FileImage, Film } from 'lucide-react';

interface MediaAsset {
  id: number;
  url: string;
  type: string;
  tags: string;
  created_at: string;
}

export default function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [tags, setTags] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Reading file...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileData = reader.result as string;
        setUploadProgress('Uploading...');

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData,
            fileName: file.name,
            fileType: file.type,
            tags: tags || 'general'
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Upload failed');
        }

        setTags('');
        setUploadProgress('Done!');
        setTimeout(() => {
          setUploadProgress('');
          fetchAssets();
        }, 500);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setUploadProgress('Error: ' + err.message);
      setTimeout(() => setUploadProgress(''), 3000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteAsset = async (id: number) => {
    if (!confirm('Delete this media?')) return;
    try {
      await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchAssets();
    } catch (err) {
      console.error(err);
    }
  };

  const copyUrl = (url: string, id: number) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-stone-200 p-6"
      >
        <h2 className="text-lg font-bold text-stone-900 mb-4">Upload Media</h2>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-colors cursor-pointer"
        >
          <Upload className="w-8 h-8 text-stone-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-700">Click to upload image or video</p>
          <p className="text-xs text-stone-400 mt-1">PNG, JPG, MP4 up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div className="mt-4 flex gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Tag className="w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="flex-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>
        {uploading && (
          <p className="mt-3 text-xs text-orange-600 font-medium flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
            {uploadProgress || 'Uploading...'}
          </p>
        )}
      </motion.div>

      {/* Grid */}
      <div>
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Your Media ({assets.length})</h3>
        {assets.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-500">No media uploaded yet.</p>
            <p className="text-xs text-stone-400 mt-1">Upload images or videos to use in your posts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map(asset => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-white rounded-xl border border-stone-200 overflow-hidden"
              >
                {asset.type === 'video' ? (
                  <video src={asset.url} className="w-full h-36 object-cover" controls />
                ) : (
                  <img src={asset.url} alt="" className="w-full h-36 object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                  <button
                    onClick={() => copyUrl(asset.url, asset.id)}
                    className="p-2 bg-white/90 rounded-lg text-stone-700 hover:bg-white transition-colors"
                    title="Copy public URL"
                  >
                    {copiedId === asset.id ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="p-2 bg-white/90 rounded-lg text-red-600 hover:bg-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {asset.type === 'video' ? (
                      <Film className="w-3 h-3 text-stone-400" />
                    ) : (
                      <FileImage className="w-3 h-3 text-stone-400" />
                    )}
                    <p className="text-[10px] text-stone-400 truncate flex-1">{asset.url}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(asset.tags || 'general').split(',').map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-stone-100 text-stone-600 text-[10px] rounded">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
