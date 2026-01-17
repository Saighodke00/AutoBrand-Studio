
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

const fontStyleCues: Record<string, string> = {
  'modern': 'sleek sans-serif, geometric, high-tech, balanced weights, clean lines',
  'classic': 'traditional serif, authoritative, timeless, elegant proportions, high readability',
  'playful': 'rounded, bubbly, friendly, informal, expressive curves, jovial',
  'luxury': 'high-contrast serif, thin hairline strokes, expensive, sophisticated, fashion-forward',
  'minimal': 'ultra-thin sans-serif, spacious, stark, functional, hidden details'
};

/**
 * Utility to retry API calls with exponential backoff
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      const errorMessage = e.message || '';
      if (errorMessage.includes('429') || errorMessage.includes('Resource has been exhausted') || errorMessage.includes('500') || errorMessage.includes('503')) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

// Helper for Base64 decoding
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper for PCM decoding
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const geminiService = {
  async generateLogo(params: {
    companyName: string;
    industryType: string;
    targetAudience: string;
    brandColors: string[];
    personality: string;
    tagline?: string;
    iconStyle: string;
    brandFontStyle: string;
  }): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `A professional minimalist logo for "${params.companyName}". Industry: ${params.industryType}. Colors: ${params.brandColors.join(', ')}. Icon style: ${params.iconStyle}. Overall vibe: ${params.personality}.`;

    try {
      // Fix: Explicitly type response as GenerateContentResponse to avoid property 'candidates' on 'unknown' error
      const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { 
          imageConfig: { 
            aspectRatio: '1:1' 
          } 
        },
      }));
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (e) { 
      console.error("Logo Generation Error:", e);
      return null; 
    }
  },

  async generateAIImage(params: {
    userPrompt: string;
    style: string;
    brandPersonality?: string;
    industryType?: string;
    targetAudience?: string;
    brandColors?: string[];
  }): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Commercial artwork for a brand. Subject: ${params.userPrompt}. Style: ${params.style}. Brand Personality: ${params.brandPersonality || 'Modern'}. Colors: ${params.brandColors?.join(', ') || 'Vibrant'}.`;
    try {
      // Fix: Explicitly type response as GenerateContentResponse to avoid property 'candidates' on 'unknown' error
      const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { 
          imageConfig: { 
            aspectRatio: '9:16' 
          } 
        },
      }));
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (e) { 
      console.error("Image Generation Error:", e);
      return null; 
    }
  },

  async generateAIVideo(params: {
    prompt: string;
    resolution: '720p' | '1080p';
    aspectRatio: '16:9' | '9:16';
  }): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      let operation = await withRetry(() => ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: params.prompt,
        config: { numberOfVideos: 1, resolution: params.resolution, aspectRatio: params.aspectRatio }
      })) as any;
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation }) as any;
      }
      return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
    } catch (e) { return null; }
  },

  /**
   * Generates TTS audio using Gemini 2.5 Flash TTS
   */
  async generateTTS(text: string, voice: string = 'Kore', language: 'en' | 'hi' = 'en'): Promise<AudioBuffer | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = language === 'hi' 
      ? `Speak this in Hindi: ${text}` 
      : `Say cheerfully: ${text}`;

    try {
      // Fix: Added explicit type to response for consistency and robustness
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return null;

      // Safe initialization of AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.error("AudioContext not supported in this browser.");
        return null;
      }
      
      const audioCtx = new AudioContextClass();
      const decodedData = decodeBase64(base64Audio);
      // Gemini TTS is 24kHz
      return await decodeAudioData(decodedData, audioCtx, 24000, 1);
    } catch (e) {
      console.error("TTS Generation Error:", e);
      return null;
    }
  }
};
