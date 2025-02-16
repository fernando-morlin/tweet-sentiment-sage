
export interface Tweet {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  sentiment: SentimentAnalysis;
}

export interface SentimentAnalysis {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface StockSentiment {
  symbol: string;
  overallScore: number;
  tweetCount: number;
  distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  latestTweets: Tweet[];
}
