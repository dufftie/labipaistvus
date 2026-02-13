import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import BaseGraph from '@/src/components/graphs/base-graph';
import partiesList from '@/src/lib/dictionaries/partiesList';
import { useDateRange } from '@/src/contexts/date-range-context';
import { useMemo, useCallback } from 'react';
import PartyScatterPlotTooltip from './party-scatter-plot-tooltip';
// Extend dayjs with the required plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface PartyScatterPlotGraphProps {
  party: string;
  media_id: string;
}

const buildUrl = ({
  startDate,
  endDate,
  party,
  media_id,
}: {
  startDate: string;
  endDate: string;
  party: string;
  media_id: string;
}) => {
  const params = new URLSearchParams();
  if (media_id) params.append('media_id', media_id);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (party) params.append('parties', party);

  return `sentiments/parties/?${params.toString()}`;
};

const PartyScatterPlotGraph = ({ media_id, party }: PartyScatterPlotGraphProps) => {
  const { formattedRequestDateRange, formattedDomainDateRange } = useDateRange();
  const [startDate, endDate] = formattedRequestDateRange;
  const fetchUrl = buildUrl({ media_id, startDate, endDate, party });

  // Memoize the base data processing function
  const processData = useMemo(() => {
    return (data: any[]) => {
      const timeline = [];
      let currentDate = dayjs(startDate);

      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
        timeline.push(currentDate.format('YYYY-MM-DD'));
        currentDate = currentDate.add(1, 'day');
      }

      return timeline.map(date => {
        const entry = data.find(d => d.party === party && d.date === date);
        return {
          date,
          timestamp: dayjs(date).valueOf(),
          sentiment_score: entry ? entry.sentiment_score : null,
          article_id: entry ? entry.article_id : null,
        };
      });
    };
  }, [startDate, endDate, party]);

  // Memoize the filter function for domain range
  const filterDataToDomainRange = useCallback((data: any[]) => {
    const [domainStart, domainEnd] = formattedDomainDateRange;
    const domainStartDate = dayjs(domainStart);
    const domainEndDate = dayjs(domainEnd);

    return data.filter(entry => {
      const entryDate = dayjs(entry.date);
      return entryDate.isSameOrAfter(domainStartDate) && entryDate.isSameOrBefore(domainEndDate);
    });
  }, [formattedDomainDateRange]);

  // Memoize the format function for X-axis
  const formatXAxis = useCallback((timestamp: number) => {
    const date = dayjs(timestamp);

    // Calculate the total duration to determine the appropriate format
    const [domainStart, domainEnd] = formattedDomainDateRange;
    const startDate = dayjs(domainStart);
    const endDate = dayjs(domainEnd);
    const totalDuration = endDate.diff(startDate, 'day');

    // For ranges less than 1 year, show month and day
    if (totalDuration < 365) {
      return date.format('MMM D');
    }

    // For ranges between 1-3 years, show month and year
    if (totalDuration < 365 * 3) {
      return date.format('MMM YYYY');
    }

    // For ranges over 3 years, show just the year
    return date.format('YYYY');
  }, [formattedDomainDateRange]);

  // Memoize the ticks calculation
  const calculateTicks = useCallback((startTimestamp: number, endTimestamp: number) => {
    return [
      startTimestamp,
      startTimestamp + (endTimestamp - startTimestamp) * 0.2,
      startTimestamp + (endTimestamp - startTimestamp) * 0.4,
      startTimestamp + (endTimestamp - startTimestamp) * 0.6,
      startTimestamp + (endTimestamp - startTimestamp) * 0.8,
      endTimestamp,
    ];
  }, []);

  const partyColor = partiesList.find(p => p.value === party)?.color || 'gray';

  const openArticle = ({ article_id }: { article_id: string }) => {
    window.open(`/articles/${article_id}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <BaseGraph fetchUrl={fetchUrl} processData={processData}>
      {(data) => {
        // Filter data to domain range
        const filteredData = filterDataToDomainRange(data);

        // Calculate domain for even distribution
        const [domainStart, domainEnd] = formattedDomainDateRange;
        const startTimestamp = dayjs(domainStart).valueOf();
        const endTimestamp = dayjs(domainEnd).valueOf();

        return (
          <ScatterChart margin={{ left: 0, right: 0, top: 30, bottom: 20 }}>
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={[startTimestamp, endTimestamp]}
              tickFormatter={formatXAxis}
              ticks={calculateTicks(startTimestamp, endTimestamp)}
              tickMargin={10}
              fontSize={10}
              tickSize={10}
              axisLine={false}
              orientation='top'
            />

            <YAxis
              dataKey="sentiment_score"
              name="Sentiment Score"
              domain={[0, 10]}
              tickCount={10}
              scale="linear"
              axisLine={false}
              tickLine={false}
              width={30}
              fontSize={10}
            />

            <CartesianGrid strokeDasharray="3 3" />
            
            <Scatter
              name={party}
              data={filteredData}
              fill={partyColor}
              onClick={openArticle}
              isAnimationActive={false}
            />

            <Tooltip content={<PartyScatterPlotTooltip />} />

          </ScatterChart>
        );
      }}
    </BaseGraph>
  );
};

export default PartyScatterPlotGraph;
