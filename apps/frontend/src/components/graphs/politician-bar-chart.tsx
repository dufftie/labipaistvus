'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

interface PoliticianSentimentData {
  name: string;
  score: number;
  explanation: string;
}

interface PoliticianBarChartProps {
  politicians: PoliticianSentimentData[];
  className?: string;
}

const PoliticianBarChart = ({ politicians }: PoliticianBarChartProps) => {
  const processData = () => {
    if (!politicians || politicians.length === 0) return [];

    return politicians.map(politician => {
      return {
        name: politician.name,
        score: politician.score,
        explanation: politician.explanation,
        color: '#8FCC7E',
      };
    });
  };

  const data = processData();

  return (
    <div className="politician-bar-chart">
      <ResponsiveContainer
        width="100%"
        height={250}
      >
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />

          <XAxis
            type="number"
            domain={[0, 10]}
            tickCount={11}
            axisLine={false}
            tickLine={false}
            fontSize={10}
          />

          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            fontSize={10}
            width={100}
          />

          <Bar dataKey="score" maxBarSize={30}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList dataKey="score" position="insideLeft" fill="white" fontWeight="bold" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PoliticianBarChart;
