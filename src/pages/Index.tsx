
import { useState } from 'react';
import { StockSearch } from '@/components/StockSearch';
import { SentimentChart } from '@/components/SentimentChart';
import { TweetList } from '@/components/TweetList';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnalysisSettings, type AnalysisSettings as Settings } from '@/components/AnalysisSettings';
import type { StockSentiment } from '@/types';
import { initGemini, analyzeSentiment } from '@/lib/gemini';
import { fetchRedditPosts } from '@/lib/reddit';
import { useToast } from '@/components/ui/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState<StockSentiment | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    subreddits: ['wallstreetbets', 'stocks', 'investing'],
  });
  const { toast } = useToast();

  const handleInitialize = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      initGemini(apiKey);
      setIsInitialized(true);
      toast({
        title: "API Initialized",
        description: "Gemini API has been successfully initialized.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize Gemini API. Please check your API key.",
        variant: "destructive"
      });
    }
  };

  const handleSearch = async (symbol: string) => {
    if (!isInitialized) {
      toast({
        title: "API Not Initialized",
        description: "Please enter your Gemini API key first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch Reddit posts with settings
      const posts = await fetchRedditPosts(symbol, settings);
      
      if (posts.length === 0) {
        toast({
          title: "No posts found",
          description: "Couldn't find any recent posts about this stock. Try another symbol or adjust your search settings.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // 2. Analyze sentiment for each post
      const analyzedPosts = await Promise.all(
        posts.map(async (post) => {
          const sentimentResult = await analyzeSentiment(post.text);
          return {
            ...post,
            sentiment: sentimentResult
          };
        })
      );

      // 3. Calculate overall sentiment
      const sentimentScores = analyzedPosts.map(post => post.sentiment.score);
      const overallScore = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;

      // 4. Calculate distribution and prepare analytics
      const distribution = analyzedPosts.reduce(
        (acc, post) => {
          acc[post.sentiment.label]++;
          return acc;
        },
        { positive: 0, negative: 0, neutral: 0 }
      );

      // Prepare subreddit breakdown
      const subredditAnalytics = analyzedPosts.reduce((acc: any, post) => {
        if (!acc[post.subreddit]) {
          acc[post.subreddit] = {
            name: post.subreddit,
            posts: 0,
            avgSentiment: 0,
            totalScore: 0,
          };
        }
        acc[post.subreddit].posts++;
        acc[post.subreddit].totalScore += post.sentiment.score;
        acc[post.subreddit].avgSentiment = acc[post.subreddit].totalScore / acc[post.subreddit].posts;
        return acc;
      }, {});

      // 5. Update state with real data
      setSentiment({
        symbol,
        overallScore: (overallScore + 1) / 2, // Convert from [-1,1] to [0,1]
        tweetCount: posts.length,
        distribution,
        latestTweets: analyzedPosts,
        analytics: {
          subredditBreakdown: Object.values(subredditAnalytics),
        },
      });

      toast({
        title: "Analysis Complete",
        description: `Analyzed ${posts.length} posts about ${symbol}`
      });
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      toast({
        title: "Error",
        description: "Something went wrong while analyzing the sentiment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Stock Sentiment Analyzer
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Analyze the sentiment of Reddit posts about any stock in real-time
          </p>
        </div>

        {!isInitialized && (
          <Card className="p-6 glass-card">
            <form onSubmit={handleInitialize} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Initialize Gemini API</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Please enter your Gemini API key to start analyzing sentiments.
                  You can get one from the{" "}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!apiKey}>
                  Initialize
                </Button>
              </div>
            </form>
          </Card>
        )}

        {isInitialized && (
          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <StockSearch onSearch={handleSearch} isLoading={loading} />
              <AnalysisSettings onSettingsChange={setSettings} />
            </div>
          </Card>
        )}

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
                  Based on {sentiment.tweetCount} posts from Reddit
                </div>
              </div>
              <SentimentChart distribution={sentiment.distribution} />
            </Card>

            <Card className="p-6 glass-card">
              <h2 className="text-xl font-semibold mb-4">Latest Posts</h2>
              <TweetList tweets={sentiment.latestTweets} />
            </Card>

            <Card className="p-6 glass-card col-span-full">
              <h2 className="text-xl font-semibold mb-4">Subreddit Analysis</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentiment.analytics.subredditBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="posts" fill="#8884d8" name="Number of Posts" />
                    <Bar
                      dataKey="avgSentiment"
                      fill="#82ca9d"
                      name="Average Sentiment"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
