import db from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { post_id, platform, caption, hashtags, media_url } = req.body;

    // Get the social account for this platform from SQLite
    const account = db.prepare('SELECT * FROM social_accounts WHERE platform = ? AND status = ? LIMIT 1')
      .get(platform, 'connected');

    // Simulate API publish
    const publishResult = {
      success: true,
      platform,
      published_at: new Date().toISOString(),
      post_url: `https://${platform}.com/p/${Math.random().toString(36).substring(2, 10)}`,
      external_post_id: `ext_${Math.random().toString(36).substring(2, 12)}`,
      account_used: account?.account_handle || platform,
      simulated: true,
      note: 'This is a simulated publish. In production, this would call the actual social media API.'
    };

    // Update post status to published in SQLite
    db.prepare('UPDATE posts SET status = ? WHERE id = ?').run('published', post_id);

    // Create analytics entry in SQLite
    db.prepare(`
      INSERT INTO analytics (post_id, platform, likes, comments, shares, reach, posted_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(post_id, platform, 0, 0, 0, 0);

    return res.status(200).json(publishResult);
  } catch (err) {
    console.error('SQLite Publish error:', err);
    res.status(500).json({ error: err.message });
  }
}
