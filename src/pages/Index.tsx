
import { useState } from 'react';
import { StockSearch } from '@/components/StockSearch';
import { SentimentChart } from '@/components/SentimentChart';
import { TweetList } from '@/components/TweetList';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { StockSentiment } from '@/types';
import { initGemini } from '@/lib/gemini';

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState<StockSentiment | null>(null);

  const handleSearch = async (symbol: string) => {
    setLoading(true);
    // TODO: Implement actual API call
    // For now, we'll use mock data
    const mockData: StockSentiment = {
      symbol,
      overallScore: 0.65,
      tweetCount: 150,
      distribution: {
        positive: 70,
        negative: 30,
        neutral: 50,
      },
      latestTweets: [
        {
          id: '1',
          text: `Really impressed with ${symbol}'s latest earnings report. Strong growth indicators! #stocks`,
          author: '@investor123',
          timestamp: new Date().toISOString(),
          sentiment: {
            score: 0.8,
            label: 'positive',
            confidence: 0.92,
          },
        },
        // Add more mock tweets as needed
      ],
    };
    
    setTimeout(() => {
      setSentiment(mockData);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Stock Sentiment Analyzer
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Analyze the sentiment of tweets about any stock in real-time
          </p>
        </div>

        <Card className="p-6 glass-card">
          <StockSearch onSearch={handleSearch} isLoading={loading} />
        </Card>

        {sentiment && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 glass-card">
              <h2 className="text-xl font-semibold mb-4">Sentiment Overview</h2>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold">
                  {Math.round(sentiment.overallScore * 100)}%
                </div>
                <div className="text-sm text-gray-500">
                  Positive Sentiment
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Based on {sentiment.tweetCount} tweets
                </div>
              </div>
              <SentimentChart distribution={sentiment.distribution} />
            </Card>

            <Card className="p-6 glass-card">
              <h2 className="text-xl font-semibold mb-4">Latest Tweets</h2>
              <TweetList tweets={sentiment.latestTweets} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
