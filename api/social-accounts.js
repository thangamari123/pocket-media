import db from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const data = db.prepare('SELECT * FROM social_accounts ORDER BY id ASC').all();
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { platform, account_name, account_handle, page_id, profile_url, follower_count, status } = req.body;
      const result = db.prepare(`
        INSERT INTO social_accounts (platform, account_name, account_handle, page_id, profile_url, follower_count, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(platform, account_name, account_handle, page_id, profile_url, follower_count || 0, status || 'connected');
      
      const newData = db.prepare('SELECT * FROM social_accounts WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(newData);
    }
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      const keys = Object.keys(updates);
      const values = Object.values(updates);
      
      if (keys.length > 0) {
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        db.prepare(`UPDATE social_accounts SET ${setClause} WHERE id = ?`).run(...values, id);
      }
      
      const updatedData = db.prepare('SELECT * FROM social_accounts WHERE id = ?').get(id);
      return res.status(200).json(updatedData);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      db.prepare('DELETE FROM social_accounts WHERE id = ?').run(id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('SQLite API error:', err);
    res.status(500).json({ error: err.message });
  }
}
