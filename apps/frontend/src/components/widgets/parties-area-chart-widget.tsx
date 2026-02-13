'use client';

import PartyAreaChart from '@/src/components/graphs/party-area-chart/party-area-chart';
import GraphWidget from '@/src/components/graphs/graph-widget/graph-widget';
import { useState } from 'react';
import partiesList from '@/src/lib/dictionaries/partiesList';
import PartySelect from '@/src/components/party-select';

interface PartiesMonthlySentimentsAreaChartProps {
  media_id: string;
}

export default function PartiesMonthlySentimentsAreaChart({ media_id }: PartiesMonthlySentimentsAreaChartProps) {
  const [party, setParty] = useState(partiesList[0].value);

  return (
    <GraphWidget
      title="Sentiment area chart"
      description="This area chart shows how sentiment for a specific party changes over time, expressed as a percentage of total mentions."
      extra={<PartySelect value={party} onChange={setParty} />}
      legend="Negative ≤3; Neutral 4-6; Positive ≥7"
    >
      <PartyAreaChart
        media_id={media_id}
        party={party}
        positiveThreshold={7}
        negativeThreshold={3}
      />
    </GraphWidget>
  );
};
