import supabase from './_supabase.js';

function replaceVars(template, vars) {
  let result = template;
  Object.entries(vars).forEach(([key, val]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), val || '');
  });
  return result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { business_type, goal, language, business_name, offer_details, location } = req.body;

    // Find matching templates
    let query = supabase.from('templates').select('*');
    if (business_type) query = query.eq('business_type', business_type);
    if (goal) query = query.eq('goal', goal);
    if (language) query = query.eq('language', language);

    const { data: templates, error } = await query.limit(10);
    if (error) throw error;

    if (!templates || templates.length === 0) {
      return res.status(200).json({
        caption: `✨ ${business_name || 'Your business'} — something special is coming your way! Stay tuned.`,
        hashtags: '#smallbusiness #localbusiness #supportlocal',
        post_idea: 'Share a behind-the-scenes photo of your workspace.',
        image_suggestion: 'A warm, inviting photo of your shop or product',
        platform_tips: { instagram: 'Use Reels for 2x reach', facebook: 'Add a CTA button', linkedin: 'Keep it professional', youtube: 'Create a Short' }
      });
    }

    const picked = templates[Math.floor(Math.random() * templates.length)];
    const vars = { business_name: business_name || 'Your Business', offer_details: offer_details || '', location: location || '' };

    const caption = replaceVars(picked.content_template, vars);
    const hashtags = picked.hashtags;
    const postIdea = picked.image_suggestion;

    const platformTips = {
      instagram: goal === 'awareness' ? 'Use Reels for maximum reach. Add trending audio.' : 'Use carousel posts for offers. Add swipe-up CTA in stories.',
      facebook: goal === 'awareness' ? 'Share in local community groups. Boost post for ₹100.' : 'Create an event for your offer. Pin the post.',
      linkedin: goal === 'awareness' ? 'Share your business journey. Tag local partners.' : 'Post a case study or client success story.',
      youtube: goal === 'awareness' ? 'Create a 30-sec Short showing your process.' : 'Make a tutorial or testimonial video.'
    };

    return res.status(200).json({
      caption,
      hashtags,
      post_idea: postIdea,
      image_suggestion: picked.image_suggestion,
      platform_tips: platformTips,
      template_id: picked.id
    });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message });
  }
}
