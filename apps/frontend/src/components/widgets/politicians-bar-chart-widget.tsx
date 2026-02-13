'use client';

import StackedBarChart from '@/src/components/graphs/stacked-bar-chart/stacked-bar-chart';
import GraphWidget from '@/src/components/graphs/graph-widget/graph-widget';
import { useState } from 'react';
import { DateRangeProvider } from '@/src/contexts/date-range-context';

interface PoliticiansMonthlySentimentsBarchartProps {
  media_id: string;
}

const PoliticiansMonthlySentimentsBarchart = ({ media_id }: PoliticiansMonthlySentimentsBarchartProps) => {
    // TODO: Add functionality to filter

  // State for sorting
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortBy, setSortBy] = useState<'name' | 'total' | 'positive' | 'negative'>('total'); // Default sort by name
  
  // State for sentiment visibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [visibleSentiments, setVisibleSentiments] = useState<string[]>([
    'positive', 'neutral', 'negative'
  ]);

  return (
    <DateRangeProvider>
      <GraphWidget
        title="Sentiment Distribution by Politician"
        description="This chart shows the distribution of sentiment for each politician"
      >
        <StackedBarChart
          media_id={media_id}
          positiveThreshold={7}
          negativeThreshold={3}
          sortBy={sortBy}
          visibleSentiments={visibleSentiments}
          dataType="politicians"
        />
      </GraphWidget>
    </DateRangeProvider>
  );
};

export default PoliticiansMonthlySentimentsBarchart; 