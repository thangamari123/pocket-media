import supabase from './_supabase.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fileData, fileName, fileType, business_id, tags } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({ error: 'Missing file data or filename' });
    }

    // Extract base64 and convert to Buffer
    const base64Data = fileData.replace(/^data:\w+\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const ext = fileName.split('.').pop() || 'jpg';
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Upload to Supabase Storage 'media' bucket
    const { data: storageData, error: storageError } = await supabase.storage
      .from('media')
      .upload(filePath, buffer, {
        contentType: fileType,
        cacheControl: '3600',
        upsert: false
      });

    if (storageError) throw storageError;

    // Get the Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    // Save metadata to media_assets table
    const { data, error } = await supabase.from('media_assets').insert({
      business_id: business_id || null,
      url: publicUrl,
      type: fileType?.startsWith('video') ? 'video' : 'image',
      tags: tags || 'general'
    }).select().single();

    if (error) throw error;

    return res.status(201).json({
      ...data,
      publicUrl,
      message: 'File uploaded successfully to Supabase Storage'
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
}
