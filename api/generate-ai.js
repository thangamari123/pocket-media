import supabase from './_supabase.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-1.5-flash';

async function callGemini(prompt, imageBase64, mimeType) {
  if (!GEMINI_API_KEY) {
    return null; // Will fall back to template system
  }

  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: imageBase64.replace(/^data:\w+\/\w+;base64,/, '')
      }
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 800,
        }
      })
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('Gemini API error:', err);
    return null;
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

function parseGeminiResponse(text) {
  const captionMatch = text.match(/CAPTION[:\s]*([\s\S]*?)(?=HASHTAGS|HASHTAG|$)/i);
  const hashtagsMatch = text.match(/HASHTAGS[:\s]*([\s\S]*?)(?=CAPTION|$)/i);

  const caption = captionMatch ? captionMatch[1].trim() : text.split('\n')[0];
  const hashtagsRaw = hashtagsMatch ? hashtagsMatch[1].trim() : '';

  // Parse hashtags
  const hashtags = hashtagsRaw
    .split(/[#\s,]+/)
    .map(h => h.trim())
    .filter(h => h.length > 0)
    .map(h => (h.startsWith('#') ? h : '#' + h))
    .join(' ');

  return { caption, hashtags };
}

function replaceVars(template, vars) {
  let result = template;
  Object.entries(vars).forEach(([key, val]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), val || '');
  });
  return result;
}

function generateFallback(businessType, goal, language, businessName, offerDetails, location, mediaType) {
  const mediaContext = mediaType === 'video' ? 'Check out this video!' : 'Check out this image!';

  const captions = {
    English: {
      awareness: `✨ ${mediaContext}\n\nDiscover what makes ${businessName} special! We're passionate about delivering the best ${businessType} experience in ${location || 'your area'}.\n\nFollow us for daily updates, tips, and exclusive behind-the-scenes content. Your support means everything to us! 🙏`,
      offer: `🔥 LIMITED TIME OFFER! 🔥\n\n${mediaContext}\n\n${businessName} brings you an exclusive deal you can't miss:\n\n${offerDetails || 'Special discounts on all services'}\n\n✅ Valid for a limited time\n✅ No hidden charges\n✅ Premium quality guaranteed\n\nVisit us today at ${location || 'our store'}!`,
      festival: `🎉 ${mediaContext}\n\nWishing everyone a joyous celebration from ${businessName}!\n\nThis festive season, we're spreading happiness with special offers and warm wishes. May your home be filled with love, laughter, and prosperity.\n\n${offerDetails || 'Visit us for festive specials!'}\n\n${location || ''}`,
      testimonial: `❤️ ${mediaContext}\n\nNothing makes us happier than seeing our customers smile!\n\n"The team at ${businessName} went above and beyond. Truly the best ${businessType} experience I've ever had!" — A Happy Customer\n\nThank you for trusting us with your needs. We promise to keep delivering excellence!\n\n${location || ''}`,
      before_after: `👀 ${mediaContext}\n\nTRANSFORMATION ALERT!\n\nSee the incredible results from ${businessName}. Our experts work magic every single day.\n\n✨ Before: Ordinary\n✨ After: Extraordinary\n\nBook your appointment today and experience the difference!\n\n${location || ''}`,
    },
    Tamil: {
      awareness: `✨ ${mediaContext}\n\n${businessName} இல் சிறந்த அனுபவத்தைப் பெறுங்கள்! ${location || 'உங்கள் பகுதியில்'} சிறந்த ${businessType} சேவை.\n\nதொடர்ந்து பின்தொடருங்கள்! 🙏`,
      offer: `🔥 சிறப்பு சலுகை! 🔥\n\n${mediaContext}\n\n${businessName} இல் அதிரடி தள்ளுபடி:\n\n${offerDetails || 'அனைத்து சேவைகளிலும் சிறப்பு விலை'}\n\n${location || ''}`,
      festival: `🎉 ${mediaContext}\n\n${businessName} சார்பாக வாழ்த்துக்கள்!\n\n${offerDetails || 'சிறப்பு சலுகைகளுக்கு வருக!'}\n\n${location || ''}`,
      testimonial: `❤️ ${mediaContext}\n\n"${businessName} சிறந்த சேவை தந்தார்கள்!" — மகிழ்ச்சியான வாடிக்கையாளர்\n\n${location || ''}`,
      before_after: `👀 ${mediaContext}\n\nமாற்றம்! ${businessName} இல் அற்புதமான மாற்றம்.\n\n${location || ''}`,
    },
    Hindi: {
      awareness: `✨ ${mediaContext}\n\n${businessName} में बेहतरीन अनुभव पाएं! ${location || 'आपके क्षेत्र'} में सर्वश्रेष्ठ ${businessType}।\n\nफॉलो करें! 🙏`,
      offer: `🔥 स्पेशल ऑफर! 🔥\n\n${mediaContext}\n\n${businessName} पर शानदार डील:\n\n${offerDetails || 'सभी सेवाओं पर विशेष छूट'}\n\n${location || ''}`,
      festival: `🎉 ${mediaContext}\n\n${businessName} की ओर से शुभकामनाएं!\n\n${offerDetails || 'त्योहारी ऑफर के लिए आएं!'}\n\n${location || ''}`,
      testimonial: `❤️ ${mediaContext}\n\n"${businessName} ने बेहतरीन सेवा दी!" — एक खुश ग्राहक\n\n${location || ''}`,
      before_after: `👀 ${mediaContext}\n\nट्रांसफॉर्मेशन! ${businessName} में अद्भुत बदलाव।\n\n${location || ''}`,
    },
    Telugu: {
      awareness: `✨ ${mediaContext}\n\n${businessName} లో అద్భుతమైన అనుభవం! ${location || 'మీ ప్రాంతంలో'} మంచి ${businessType}.\n\nఫాలో చేయండి! 🙏`,
      offer: `🔥 స్పెషల్ ఆఫర్! 🔥\n\n${mediaContext}\n\n${businessName} లో అదిరిపోయే డీల్:\n\n${offerDetails || 'అన్ని సేవలపై ప్రత్యేక ధర'}\n\n${location || ''}`,
      festival: `🎉 ${mediaContext}\n\n${businessName} తరఫున శుభాకాంక్షలు!\n\n${offerDetails || 'పండుగ ఆఫర్ల కోసం రండి!'}\n\n${location || ''}`,
      testimonial: `❤️ ${mediaContext}\n\n"${businessName} అత్యుత్తమ సేవ అందించారు!" — సంతోషమైన కస్టమర్\n\n${location || ''}`,
      before_after: `👀 ${mediaContext}\n\nమార్పు! ${businessName} లో అద్భుతమైన మార్పు.\n\n${location || ''}`,
    },
    Kannada: {
      awareness: `✨ ${mediaContext}\n\n${businessName} ನಲ್ಲಿ ಉತ್ತಮ ಅನುಭವ! ${location || 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ'} ಉತ್ತಮ ${businessType}.\n\nಫಾಲೋ ಮಾಡಿ! 🙏`,
      offer: `🔥 ವಿಶೇಷ ಕೊಡುಗೆ! 🔥\n\n${mediaContext}\n\n${businessName} ನಲ್ಲಿ ಅದ್ಭುತ ಡೀಲ್:\n\n${offerDetails || 'ಎಲ್ಲಾ ಸೇವೆಗಳಲ್ಲಿ ವಿಶೇಷ ಬೆಲೆ'}\n\n${location || ''}`,
      festival: `🎉 ${mediaContext}\n\n${businessName} ಪರವಾಗಿ ಶುಭಾಶಯಗಳು!\n\n${offerDetails || 'ಹಬ್ಬದ ಕೊಡುಗೆಗಳಿಗೆ ಬನ್ನಿ!'}\n\n${location || ''}`,
      testimonial: `❤️ ${mediaContext}\n\n"${businessName} ಉತ್ತಮ ಸೇವೆ ನೀಡಿತು!" — ಸಂತೋಷವಾದ ಗ್ರಾಹಕ\n\n${location || ''}`,
      before_after: `👀 ${mediaContext}\n\nಪರಿವರ್ತನೆ! ${businessName} ನಲ್ಲಿ ಅದ್ಭುತ ಪರಿವರ್ತನೆ.\n\n${location || ''}`,
    },
    Malayalam: {
      awareness: `✨ ${mediaContext}\n\n${businessName} ഇൽ മികച്ച അനുഭവം! ${location || 'നിങ്ങളുടെ പ്രദേശത്ത്'} മികച്ച ${businessType}.\n\nഫോളോ ചെയ്യൂ! 🙏`,
      offer: `🔥 സ്പെഷ്യൽ ഓഫർ! 🔥\n\n${mediaContext}\n\n${businessName} ഇൽ അതിശയകരമായ ഡീൽ:\n\n${offerDetails || 'എല്ലാ സേവനങ്ങളിലും പ്രത്യേക വില'}\n\n${location || ''}`,
      festival: `🎉 ${mediaContext}\n\n${businessName} ന്റെ പേരിൽ ആശംസകൾ!\n\n${offerDetails || 'ഉത്സവ ഓഫറുകൾക്ക് വരൂ!'}\n\n${location || ''}`,
      testimonial: `❤️ ${mediaContext}\n\n"${businessName} മികച്ച സേവനം നൽകി!" — സന്തോഷവാനായ കസ്റ്റമർ\n\n${location || ''}`,
      before_after: `👀 ${mediaContext}\n\nമാറ്റം! ${businessName} ഇൽ അത്ഭുതകരമായ മാറ്റം.\n\n${location || ''}`,
    },
  };

  const lang = captions[language] ? language : 'English';
  const goalKey = captions[lang][goal] ? goal : 'awareness';
  const caption = captions[lang][goalKey];

  // Generate contextual hashtags
  const baseHashtags = {
    salon: '#salon #beauty #haircare #hairstyle #makeup #skincare #glowup #selfcare',
    bakery: '#bakery #freshbaked #sweets #cakes #pastry #homemade #delicious #foodie',
    textile: '#textile #fashion #saree #traditional #ethnicwear #handloom #indianwear #style',
    restaurant: '#restaurant #food #indianfood #delicious #foodie #lunch #dinner #yummy',
    grocery: '#grocery #fresh #organic #local #shopping #dailyneeds #supermarket #freshproduce',
    jewelry: '#jewelry #gold #diamond #traditional #wedding #bridal #fashionjewelry #elegant',
    pharmacy: '#pharmacy #health #wellness #medicine #healthcare #fitness #selfcare #healthy',
    real_estate: '#realestate #property #home #investment #dreamhome #apartment #luxury #lifestyle',
  };

  const goalHashtags = {
    awareness: '#followus #supportlocal #smallbusiness #localbusiness #community',
    offer: '#offer #sale #discount #limitedtime #deal #savings #shopnow',
    festival: '#festival #celebration #tradition #festive #happiness #family',
    testimonial: '#testimonial #review #happycustomer #customerlove #feedback #thankyou',
    before_after: '#transformation #beforeandafter #results #makeover #glowup #amazing',
  };

  const locationHashtag = location ? ` #${location.replace(/\s/g, '')}` : '';
  const businessHash = baseHashtags[businessType] || baseHashtags.salon;
  const goalHash = goalHashtags[goal] || goalHashtags.awareness;

  return {
    caption,
    hashtags: `${businessHash} ${goalHash}${locationHashtag} #${businessName.replace(/\s/g, '')}`,
    post_idea: mediaType === 'video' ? 'Show a behind-the-scenes process or customer reaction video' : 'Share a high-quality photo showcasing your best work',
    image_suggestion: mediaType === 'video' ? 'A short 15-30 second engaging video with trending audio' : 'A well-lit, professional photo with your product/service as the hero',
    platform_tips: {
      instagram: mediaType === 'video' ? 'Post as Reel with trending audio. Add text overlays for accessibility.' : 'Use carousel posts for multiple angles. Add location tag.',
      facebook: mediaType === 'video' ? 'Upload native video for better reach. Add captions for sound-off viewing.' : 'Boost post with ₹100 for 2x reach in your locality.',
      linkedin: mediaType === 'video' ? 'Share your business journey story. Keep it under 90 seconds.' : 'Post a professional image with a story-driven caption.',
      youtube: mediaType === 'video' ? 'Create a Short (under 60s) for maximum algorithm boost.' : 'Use the image as a thumbnail for a longer video about your business.',
    },
    template_id: null,
    ai_generated: false,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { business_type, goal, language, business_name, offer_details, location, media_base64, media_type, media_mime } = req.body;

    // Build AI prompt
    const prompt = `You are a professional social media content creator for Indian small businesses.

Business: ${business_name || 'A local business'}
Business Type: ${business_type || 'general'}
Goal: ${goal || 'awareness'}
Language: ${language || 'English'}
Location: ${location || 'India'}
${offer_details ? `Special Offer: ${offer_details}` : ''}
${media_type ? `Media Type: ${media_type}` : ''}

Generate a compelling social media caption and relevant hashtags.

Rules:
- Write in ${language || 'English'} (mix English words naturally if writing in Indian languages)
- Keep caption under 200 words
- Make it engaging with emojis
- Include a call-to-action
- Hashtags should be relevant, trending, and location-aware
- Output format:
CAPTION: [your caption here]
HASHTAGS: [space-separated hashtags with #]`;

    let aiResponse = null;
    if (GEMINI_API_KEY && media_base64) {
      aiResponse = await callGemini(prompt, media_base64, media_mime);
    } else if (GEMINI_API_KEY) {
      aiResponse = await callGemini(prompt);
    }

    if (aiResponse) {
      const parsed = parseGeminiResponse(aiResponse);
      const platformTips = {
        instagram: media_type === 'video' ? 'Post as Reel with trending audio for 3x reach.' : 'Use carousel for multiple images. Tag location and relevant accounts.',
        facebook: media_type === 'video' ? 'Native video gets 8x more engagement than links. Add captions.' : 'Pin this post to the top of your page. Boost for ₹50.',
        linkedin: media_type === 'video' ? 'Keep under 3 minutes. Add professional headline.' : 'Share the story behind the image. Tag partners.',
        youtube: media_type === 'video' ? 'Create a Short under 60 seconds. Use catchy title.' : 'Use as thumbnail. Create a "Day in the life" video.',
      };

      return res.status(200).json({
        caption: parsed.caption,
        hashtags: parsed.hashtags,
        post_idea: media_type === 'video' ? 'Your uploaded video is perfect for showing process or testimonials' : 'Your uploaded image showcases your product/service beautifully',
        image_suggestion: media_type === 'video' ? 'Trim to 15-30 seconds. Add text overlays and trending music.' : 'Apply a warm filter. Add your logo watermark subtly.',
        platform_tips: platformTips,
        ai_generated: true,
        model: GEMINI_MODEL,
      });
    }

    // Fallback to enhanced template system
    const fallback = generateFallback(business_type, goal, language, business_name, offer_details, location, media_type);
    return res.status(200).json(fallback);

  } catch (err) {
    console.error('Generate AI error:', err);
    res.status(500).json({ error: err.message });
  }
}
