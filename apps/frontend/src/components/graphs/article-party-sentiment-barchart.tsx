'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer, LabelList,
} from 'recharts';
import partiesList from '@/src/lib/dictionaries/partiesList';

interface ArticlePartySentimentData {
  name: string;
  score: number;
  explanation: string;
}

interface ArticlePartySentimentBarchartProps {
  parties: ArticlePartySentimentData[];
  className?: string;
}

const ArticlePartySentimentBarchart = ({ parties }: ArticlePartySentimentBarchartProps) => {
  const processData = () => {
    if (!parties || parties.length === 0) return [];

    return parties.map(party => {
      const partyInfo = partiesList.find(p => p.value === party.name);

      return {
        party: party.name,
        partyLabel: partyInfo?.label || party.name,
        score: party.score,
        explanation: party.explanation,
        color: partyInfo?.color || '#8FCC7E',
      };
    });
  };

  const data = processData();
  return (
    <div className="article-party-sentiment-barchart">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="partyLabel"
            type="category"
            axisLine={false}
            tickLine={false}
            fontSize={10}
          />

          <YAxis
            type="number"
            domain={[0, 10]}
            scale='linear'
            axisLine={false}
            tickLine={false}
            width={20}
            fontSize={10}
          />

          <Bar dataKey="score" maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList
              dataKey="score"
              position="insideBottom"
              fill="white"
              fontWeight="bold"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ArticlePartySentimentBarchart;
