
import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: GoogleGenerativeAI | null = null;

export type GeminiModel = 'gemini-pro' | 'gemini-pro-vision';

export const initGemini = (apiKey: string) => {
  geminiClient = new GoogleGenerativeAI(apiKey);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeSentiment = async (
  text: string,
  modelName: GeminiModel = 'gemini-pro',
  retryCount = 0
): Promise<{
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}> => {
  if (!geminiClient) throw new Error('Gemini client not initialized');

  try {
    const model = geminiClient.getGenerativeModel({ model: modelName });
    
    const prompt = `Analyze the sentiment of this tweet about stocks. Return the response in JSON format with these fields:
    - score (number between -1 and 1)
    - label (one of: "positive", "negative", "neutral")
    - confidence (number between 0 and 1)
    
    Tweet: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text();
    
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      // Fallback values if parsing fails
      return {
        score: 0,
        label: 'neutral',
        confidence: 0
      };
    }
  } catch (error: any) {
    // Handle rate limiting (429 error)
    if (error?.status === 429 && retryCount < 3) {
      // Exponential backoff: wait longer between each retry
      const waitTime = Math.pow(2, retryCount) * 1000;
      console.log(`Rate limited. Retrying in ${waitTime}ms...`);
      await delay(waitTime);
      return analyzeSentiment(text, modelName, retryCount + 1);
    }

    // If we've exhausted retries or hit a different error
    if (error?.status === 429) {
      throw new Error('API quota exceeded. Please try again later or use a different API key.');
    }

    // For other errors, return neutral sentiment
    console.error('Error analyzing sentiment:', error);
    return {
      score: 0,
      label: 'neutral',
      confidence: 0
    };
  }
};
