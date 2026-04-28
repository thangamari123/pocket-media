import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { month } = req.query;
    let query = supabase.from('festivals').select('*').order('date', { ascending: true });
    if (month) {
      const year = new Date().getFullYear();
      const start = `${year}-${month.padStart(2, '0')}-01`;
      const end = `${year}-${month.padStart(2, '0')}-31`;
      query = query.gte('date', start).lte('date', end);
    }
    const { data, error } = await query;
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
