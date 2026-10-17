import { GoogleGenAI } from '@google/genai';
import { SocialPlatform, PlatformContent } from '../src/types';

interface GenerationRequest {
  topic: string;
  niche: string;
  audience?: string;
  region?: string;
  language: string;
  tone: string;
  format?: string;
  callToAction?: string;
  brandName?: string;
  brandDescription?: string;
  keywordsToInclude?: string[];
  wordsToAvoid?: string[];
  targetPlatforms: SocialPlatform[];
  apiKey?: string;
  model?: string;
}

export class AiService {
  private getClient(customKey?: string) {
    const key = customKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('No Gemini API key provided. Please configure your key in AI API Settings.');
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  public async validateKey(apiKey: string): Promise<{ isValid: boolean; models: string[]; latencyMs: number; error?: string }> {
    const startTime = Date.now();
    try {
      const client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Quick test probe with flash model
      const res = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Ping check. Respond with single word "OK".'
      });

      const latencyMs = Date.now() - startTime;
      if (res && res.text) {
        return {
          isValid: true,
          models: ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon'],
          latencyMs
        };
      }
      return { isValid: false, models: [], latencyMs, error: 'Empty response received from Gemini.' };
    } catch (err: any) {
      return {
        isValid: false,
        models: [],
        latencyMs: Date.now() - startTime,
        error: err.message || 'Key validation failed. Please check quota and key permissions.'
      };
    }
  }

  public async generateSocialPost(req: GenerationRequest): Promise<{
    title: string;
    caption: string;
    shortCaption: string;
    longCaption: string;
    hashtags: string[];
    callToAction: string;
    mediaConcept: string;
    platformContents: Record<SocialPlatform, PlatformContent>;
  }> {
    const modelName = req.model || 'gemini-3.8-flash';
    const client = this.getClient(req.apiKey);

    const prompt = `
You are the world's top social media strategist and viral copywriter.
Generate a high-converting, tailored multi-platform social media post for the following specifications:

Topic: "${req.topic}"
Niche/Category: "${req.niche}"
Target Audience: "${req.audience || 'Tech-savvy professionals and digital creators'}"
Country/Region: "${req.region || 'Global'}"
Language: "${req.language}" (If Hindi or Hinglish, write natural colloquial phrasing as requested)
Tone: "${req.tone}"
Content Format: "${req.format || 'Standard Post'}"
Brand Name: "${req.brandName || 'Brand'}"
Brand Description: "${req.brandDescription || ''}"
Keywords to include: ${req.keywordsToInclude && req.keywordsToInclude.length ? req.keywordsToInclude.join(', ') : 'None specified'}
Words or claims to avoid: ${req.wordsToAvoid && req.wordsToAvoid.length ? req.wordsToAvoid.join(', ') : 'None specified'}
Preferred CTA: "${req.callToAction || 'Engage in comments and share thoughts'}"
Selected Platforms: ${req.targetPlatforms.join(', ')}

Platform-specific requirements:
- x (Twitter): Must strictly be under 280 characters including hashtags. Punchy, viral hook, no fluff.
- linkedin: Thought-leadership structure with attention-grabbing first line, whitespace, 3-4 bullet takeaways, professional reflection, 3-5 clean industry hashtags.
- telegram: Channel broadcast message with bold headlines (<b>Title</b>), readable bullet points, direct call to join/react.
- facebook: Engaging conversational story, open-ended question to drive comment engagement.
- instagram: Aesthetic hook, formatted line breaks, actionable caption, 15-20 relevant hashtags.
- youtube: Catchy high-CTR video title, 2-3 paragraph SEO description with suggested chapter timestamps, 10 tags.
- pinterest: Engaging pin title (under 100 chars), keyword-dense description for search ranking.
- tiktok: Script hook (0-3 sec), sound vibe suggestion, concise caption with viral hashtags.

CRITICAL: Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Main compelling post title",
  "caption": "Primary master caption",
  "shortCaption": "Condensed version under 140 chars",
  "longCaption": "In-depth storytelling version with paragraphs",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "callToAction": "Clear call to action line",
  "mediaConcept": "Visual idea for image, carousel slide, or video clip",
  "platformContents": {
    "x": {
      "caption": "Twitter post text strictly under 280 characters",
      "hashtags": ["#Tag1", "#Tag2"],
      "characterCount": 180,
      "isValid": true
    },
    "linkedin": {
      "title": "Headline",
      "caption": "Full professional LinkedIn copy",
      "hashtags": ["#Tag1", "#Tag2", "#Tag3"],
      "characterCount": 450,
      "isValid": true
    },
    "telegram": {
      "caption": "Telegram channel formatted text with <b>bold</b> and bullets",
      "hashtags": ["#Tag1"],
      "characterCount": 320,
      "isValid": true
    },
    "facebook": {
      "title": "Headline",
      "caption": "Facebook post copy",
      "hashtags": ["#Tag1", "#Tag2"],
      "characterCount": 350,
      "isValid": true
    },
    "instagram": {
      "caption": "Instagram caption with emojis and spacing",
      "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4"],
      "characterCount": 400,
      "isValid": true
    },
    "youtube": {
      "title": "Video Title",
      "caption": "Video description with timestamps and tags",
      "hashtags": ["#Tag1", "#Tag2"],
      "characterCount": 500,
      "isValid": true
    },
    "pinterest": {
      "title": "Pin Title",
      "caption": "Pin description",
      "hashtags": ["#Tag1", "#Tag2"],
      "characterCount": 250,
      "isValid": true
    },
    "tiktok": {
      "title": "Hook",
      "caption": "TikTok caption and sound advice",
      "hashtags": ["#Tag1", "#Tag2"],
      "characterCount": 190,
      "isValid": true
    }
  }
}
`;

    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);

      // Validate character limits and guarantee all platforms have fallback structure
      const allPlatforms: SocialPlatform[] = ['telegram', 'facebook', 'instagram', 'youtube', 'linkedin', 'x', 'pinterest', 'tiktok'];
      const finalizedPlatformContents: Record<SocialPlatform, PlatformContent> = {} as any;

      for (const p of allPlatforms) {
        if (parsed.platformContents && parsed.platformContents[p]) {
          const content = parsed.platformContents[p];
          const fullText = `${content.caption || ''} ${(content.hashtags || []).join(' ')}`;
          const length = fullText.length;
          const isXOverLimit = p === 'x' && length > 280;
          finalizedPlatformContents[p] = {
            title: content.title || parsed.title || '',
            caption: content.caption || parsed.caption || '',
            hashtags: Array.isArray(content.hashtags) ? content.hashtags : parsed.hashtags || [],
            callToAction: parsed.callToAction,
            mediaConcept: parsed.mediaConcept,
            characterCount: length,
            isValid: !isXOverLimit,
            validationErrors: isXOverLimit ? ['Exceeds X (Twitter) 280 character limit'] : []
          };
        } else {
          finalizedPlatformContents[p] = {
            title: parsed.title || '',
            caption: p === 'x' ? (parsed.shortCaption || parsed.caption.slice(0, 240)) : parsed.caption || '',
            hashtags: parsed.hashtags || [],
            callToAction: parsed.callToAction,
            mediaConcept: parsed.mediaConcept,
            characterCount: (parsed.caption || '').length,
            isValid: true
          };
        }
      }

      return {
        title: parsed.title || req.topic,
        caption: parsed.caption || '',
        shortCaption: parsed.shortCaption || (parsed.caption || '').slice(0, 140),
        longCaption: parsed.longCaption || parsed.caption || '',
        hashtags: parsed.hashtags || [],
        callToAction: parsed.callToAction || '',
        mediaConcept: parsed.mediaConcept || 'High-contrast graphic matching topic aesthetic',
        platformContents: finalizedPlatformContents
      };
    } catch (err: any) {
      console.error('Gemini generation error:', err);
      throw new Error(`AI generation failed: ${err.message}`);
    }
  }

  public async transformText(params: {
    text: string;
    action: 'rewrite' | 'shorten' | 'expand' | 'translate' | 'change_tone';
    targetValue?: string;
    apiKey?: string;
    model?: string;
  }): Promise<string> {
    const client = this.getClient(params.apiKey);
    const model = params.model || 'gemini-3.8-flash';

    let instruction = '';
    switch (params.action) {
      case 'shorten':
        instruction = 'Make this text significantly more concise, punchy, and impactful while keeping the core message.';
        break;
      case 'expand':
        instruction = 'Expand this text with deep practical points, context, and engaging narrative.';
        break;
      case 'translate':
        instruction = `Translate this social media text naturally to ${params.targetValue || 'Hindi'}. Preserve professional tone and emojis.`;
        break;
      case 'change_tone':
        instruction = `Rewrite this text to adopt a ${params.targetValue || 'witty and humorous'} tone while preserving key information.`;
        break;
      case 'rewrite':
      default:
        instruction = 'Rewrite this social media copy to maximize viral engagement, curiosity, and clarity.';
        break;
    }

    const res = await client.models.generateContent({
      model,
      contents: `${instruction}\n\nOriginal Text:\n"""${params.text}"""\n\nProvide only the updated text, no preamble or quotes.`
    });

    return (res.text || '').trim();
  }
}

export const aiService = new AiService();
