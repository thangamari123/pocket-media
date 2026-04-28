import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { post_id, platform, caption, hashtags, media_url } = req.body;

    // Get the social account for this platform
    const { data: accounts, error: acctErr } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('platform', platform)
      .eq('status', 'connected')
      .limit(1);

    if (acctErr) throw acctErr;

    // Simulate API publish (since we don't have real API keys)
    const publishResult = {
      success: true,
      platform,
      published_at: new Date().toISOString(),
      post_url: `https://${platform}.com/p/${Math.random().toString(36).substring(2, 10)}`,
      external_post_id: `ext_${Math.random().toString(36).substring(2, 12)}`,
      account_used: accounts?.[0]?.account_handle || platform,
      simulated: true,
      note: 'This is a simulated publish. In production, this would call the actual social media API.'
    };

    // Update post status to published
    await supabase.from('posts').update({
      status: 'published'
    }).eq('id', post_id);

    // Create analytics entry
    await supabase.from('analytics').insert({
      post_id,
      platform,
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      posted_at: new Date().toISOString()
    });

    return res.status(200).json(publishResult);
  } catch (err) {
    console.error('Publish error:', err);
    res.status(500).json({ error: err.message });
  }
}
