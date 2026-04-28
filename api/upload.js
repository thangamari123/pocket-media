import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
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

    // Extract base64 data
    const base64Data = fileData.replace(/^data:\w+\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const ext = fileName.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const uniqueName = `${timestamp}-${random}.${ext}`;

    // Save to public/uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = join(uploadsDir, uniqueName);
    writeFileSync(filePath, buffer);

    // Public URL
    const publicUrl = `/uploads/${uniqueName}`;

    // Save to database
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
      message: 'File uploaded successfully'
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
}
