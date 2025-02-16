
import { Tweet } from '@/types';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface TweetListProps {
  tweets: Tweet[];
}

export const TweetList = ({ tweets }: TweetListProps) => {
  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <Card key={tweet.id} className="p-4 animate-fade-in glass-card">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{tweet.author}</span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(tweet.timestamp))} ago
              </span>
            </div>
            <span
              className={`sentiment-badge ${
                tweet.sentiment.label === 'positive'
                  ? 'sentiment-positive'
                  : tweet.sentiment.label === 'negative'
                  ? 'sentiment-negative'
                  : 'sentiment-neutral'
              }`}
            >
              {tweet.sentiment.label}
            </span>
          </div>
          <p className="mt-2 text-gray-700">{tweet.text}</p>
          <div className="mt-2 text-sm text-gray-500">
            Confidence: {Math.round(tweet.sentiment.confidence * 100)}%
          </div>
        </Card>
      ))}
    </div>
  );
};
