
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface SentimentChartProps {
  distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export const SentimentChart = ({ distribution }: SentimentChartProps) => {
  const data = [
    { name: 'Positive', value: distribution.positive },
    { name: 'Negative', value: distribution.negative },
    { name: 'Neutral', value: distribution.neutral },
  ];

  const COLORS = ['#22c55e', '#ef4444', '#6b7280'];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
