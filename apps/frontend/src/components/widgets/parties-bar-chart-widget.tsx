'use client';

import StackedBarChart from '@/src/components/graphs/stacked-bar-chart/stacked-bar-chart';
import GraphWidget from '@/src/components/graphs/graph-widget/graph-widget';
import { useState } from 'react';
import partiesList from '@/src/lib/dictionaries/partiesList';
import map from 'lodash/map';
import { DateRangeProvider } from '@/src/contexts/date-range-context';

interface PartiesMonthlySentimentsBarchartProps {
  media_id: string;
}

const PartiesMonthlySentimentsBarchart = ({ media_id }: PartiesMonthlySentimentsBarchartProps) => {
  // TODO: Add functionality to filter by party
  // State for sentiment visibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [visibleSentiments, setVisibleSentiments] = useState<string[]>([
    'positive',
    'neutral',
    'negative',
  ]);

  return (
    <DateRangeProvider>
      <GraphWidget
        title="Sentiment Distribution by Party"
        description="This chart shows the distribution of sentiment for each party"
      >
        <StackedBarChart
          media_id={media_id}
          showNames={map(partiesList, party => party.value)}
          positiveThreshold={7}
          negativeThreshold={3}
          visibleSentiments={visibleSentiments}
          dataType="parties"
        />
      </GraphWidget>
    </DateRangeProvider>
  );
};

export default PartiesMonthlySentimentsBarchart;
