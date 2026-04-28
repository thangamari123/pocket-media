import db from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { post_id } = req.query;
      let sql = `
        SELECT a.*, p.content, p.platform as post_platform 
        FROM analytics a
        LEFT JOIN posts p ON a.post_id = p.id
      `;
      let params = [];
      if (post_id) {
        sql += ` WHERE a.post_id = ?`;
        params.push(post_id);
      }
      sql += ` ORDER BY a.posted_at DESC`;
      
      const data = db.prepare(sql).all(...params);
      // Map to match Supabase structure if needed: { ..., posts: { content, platform } }
      const enriched = data.map(item => ({
        ...item,
        posts: { content: item.content, platform: item.post_platform }
      }));
      
      return res.status(200).json(enriched);
    }
    if (req.method === 'POST') {
      const { post_id, platform, likes, comments, shares, reach } = req.body;
      const result = db.prepare(`
        INSERT INTO analytics (post_id, platform, likes, comments, shares, reach, posted_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(post_id, platform, likes || 0, comments || 0, shares || 0, reach || 0);
      
      const newData = db.prepare('SELECT * FROM analytics WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(newData);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('SQLite Analytics error:', err);
    res.status(500).json({ error: err.message });
  }
}
