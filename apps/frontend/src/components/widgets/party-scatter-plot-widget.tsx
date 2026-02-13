'use client';

import PartyScatterPlotGraph from '@/src/components/graphs/party-scatter-plot/party-scatter-plot';
import GraphWidget from '@/src/components/graphs/graph-widget/graph-widget';
import { useState } from 'react';
import partiesList from '@/src/lib/dictionaries/partiesList';
import PartySelect from '@/src/components/party-select';

interface PartyScatterPlotWidgetProps {
  media_id: string;
}

export default function PartyScatterPlotWidget({ media_id }: PartyScatterPlotWidgetProps) {
  const [party, setParty] = useState(partiesList[0].value);

  return (
    <GraphWidget
      title="Scatter plot of all sentiments per party"
      description="This scatter plot visualizes party sentiments, with each clickable dot representing a specific article."
      extra={<PartySelect value={party} onChange={setParty} />}
      legend="0 – very negative; 5 – neutral; 10 – very positive"
    >
      <PartyScatterPlotGraph media_id={media_id} party={party} />
    </GraphWidget>
  );
}
