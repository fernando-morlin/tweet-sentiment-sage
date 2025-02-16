
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Settings2 } from 'lucide-react';
import { format } from 'date-fns';

interface AnalysisSettingsProps {
  onSettingsChange: (settings: AnalysisSettings) => void;
}

export interface AnalysisSettings {
  startDate: Date;
  endDate: Date;
  subreddits: string[];
}

export const AnalysisSettings = ({ onSettingsChange }: AnalysisSettingsProps) => {
  const defaultSubreddits = ['wallstreetbets', 'stocks', 'investing'];
  const [subreddits, setSubreddits] = useState<string[]>(defaultSubreddits);
  const [newSubreddit, setNewSubreddit] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleAddSubreddit = () => {
    if (newSubreddit && !subreddits.includes(newSubreddit)) {
      const updatedSubreddits = [...subreddits, newSubreddit];
      setSubreddits(updatedSubreddits);
      setNewSubreddit('');
      onSettingsChange({ startDate, endDate, subreddits: updatedSubreddits });
    }
  };

  const handleRemoveSubreddit = (subreddit: string) => {
    const updatedSubreddits = subreddits.filter(s => s !== subreddit);
    setSubreddits(updatedSubreddits);
    onSettingsChange({ startDate, endDate, subreddits: updatedSubreddits });
  };

  const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;
    if (type === 'start') {
      setStartDate(date);
      onSettingsChange({ startDate: date, endDate, subreddits });
    } else {
      setEndDate(date);
      onSettingsChange({ startDate, endDate: date, subreddits });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Analysis Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Date Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-gray-500">Start Date</label>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => handleDateChange('start', date)}
                  className="rounded-md border"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">End Date</label>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => handleDateChange('end', date)}
                  className="rounded-md border"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Subreddits</h4>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add subreddit"
                value={newSubreddit}
                onChange={(e) => setNewSubreddit(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddSubreddit} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subreddits.map((subreddit) => (
                <div
                  key={subreddit}
                  className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  r/{subreddit}
                  <button
                    onClick={() => handleRemoveSubreddit(subreddit)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
