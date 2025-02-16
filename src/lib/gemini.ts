
import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: GoogleGenerativeAI | null = null;

export const initGemini = (apiKey: string) => {
  geminiClient = new GoogleGenerativeAI(apiKey);
};

export const analyzeSentiment = async (text: string) => {
  if (!geminiClient) throw new Error('Gemini client not initialized');

  const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
  
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
    return {
      score: 0,
      label: 'neutral',
      confidence: 0
    };
  }
};
