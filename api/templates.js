import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { category, language, business_type, goal } = req.query;
      let query = supabase.from('templates').select('*').order('id', { ascending: true });
      if (category) query = query.eq('category', category);
      if (language) query = query.eq('language', language);
      if (business_type) query = query.eq('business_type', business_type);
      if (goal) query = query.eq('goal', goal);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { category, title, content_template, hashtags, image_suggestion, language, business_type, goal } = req.body;
      const { data, error } = await supabase.from('templates').insert({
        category, title, content_template, hashtags, image_suggestion, language, business_type, goal
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
