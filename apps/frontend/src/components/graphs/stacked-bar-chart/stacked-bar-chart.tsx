'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import BaseGraph from '@/src/components/graphs/base-graph';
import partiesList from '@/src/lib/dictionaries/partiesList';
import useIsMobile from '@/src/lib/hooks/isMobile';
import { useDateRange } from '@/src/contexts/date-range-context';
import StackedBarTooltip from './stacked-bar-chart-tooltip/stacked-bar-tooltip';

interface StackedBarChartProps {
  media_id: string;
  showNames?: string[]; // Made optional
  positiveThreshold?: number; // Scores >= this value are considered positive
  negativeThreshold?: number; // Scores <= this value are considered negative
  sortBy?: 'name' | 'total' | 'positive' | 'negative'; // How to sort the data
  visibleSentiments: string[]; // Which sentiment types to display (positive, neutral, negative)
  dataType?: 'parties' | 'politicians'; // Type of data to display
}

const buildUrl = ({
  media_id,
  startDate,
  endDate,
  dataType = 'parties',
}: {
  media_id: string;
  startDate: string;
  endDate: string;
  dataType?: 'parties' | 'politicians';
}) => {
  const params = new URLSearchParams();
  if (media_id) params.append('media_id', media_id);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  return `sentiments/${dataType}/summary/?${params.toString()}`;
};

export default function StackedBarChart({
  media_id,
  showNames, // Removed default value
  positiveThreshold = 7, // Default: scores >= 7 are positive
  negativeThreshold = 3, // Default: scores <= 3 are negative
  sortBy = 'total', // Default: sort by total count
  visibleSentiments = ['positive', 'neutral', 'negative'], // Default: show all sentiments
  dataType = 'parties', // Default: show parties data
}: StackedBarChartProps) {
  const isMobile = useIsMobile();
  const { formattedRequestDateRange } = useDateRange();
  const [startDate, endDate] = formattedRequestDateRange;
  const fetchUrl = buildUrl({ media_id, startDate, endDate, dataType });

  // Process the data for stacked bar chart
  const processData = (data: any[]) => {
    // Filter by requested names if showNames is provided
    const filteredData = showNames ? data.filter(item => showNames.includes(item.name)) : data;

    // Calculate sentiment counts based on configurable thresholds
    let processedData = filteredData.map(item => {
      const nameInfo = partiesList.find(p => p.value === item.name);

      let positiveCount = 0;
      let neutralCount = 0;
      let negativeCount = 0;

      // Iterate through all possible score values (0-10)
      for (let score = 0; score <= 10; score++) {
        const count = parseInt(item[score.toString()]) || 0;

        if (score >= positiveThreshold) {
          positiveCount += count;
        } else if (score <= negativeThreshold) {
          negativeCount += count;
        } else {
          neutralCount += count;
        }
      }

      const totalCount = positiveCount + neutralCount + negativeCount;

      return {
        name: item.name,
        nameLabel: nameInfo?.label || item.name,
        positive_count: positiveCount,
        neutral_count: neutralCount,
        negative_count: negativeCount,
        total_count: totalCount,
        color: nameInfo?.color,
      };
    });

    // Sort the data based on sortBy parameter
    processedData = processedData.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.nameLabel.localeCompare(b.nameLabel);
        case 'total':
          return b.total_count - a.total_count;
        case 'positive':
          return b.positive_count - a.positive_count;
        case 'negative':
          return b.negative_count - a.negative_count;
        default:
          return a.nameLabel.localeCompare(b.nameLabel); // Default to name sort
      }
    });

    return processedData;
  };

  return (
    <BaseGraph fetchUrl={fetchUrl} processData={processData}>
      {data => {
        // Calculate max value for YAxis domain based on visible sentiments
        const maxTotal = Math.max(
          ...data.map(item => {
            let visibleTotal = 0;
            if (visibleSentiments.includes('positive')) {
              visibleTotal += item.positive_count;
            }
            if (visibleSentiments.includes('neutral')) {
              visibleTotal += item.neutral_count;
            }
            if (visibleSentiments.includes('negative')) {
              visibleTotal += item.negative_count;
            }
            return visibleTotal;
          })
        );

        return (
          <BarChart
            data={data}
            layout={isMobile ? 'vertical' : 'horizontal'}
            className="stacked-bar-chart__wrapper"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={isMobile} horizontal={!isMobile} />

            <Tooltip content={<StackedBarTooltip />} />

            {visibleSentiments.includes('negative') && (
              <Bar
                dataKey="negative_count"
                name={`Negative (≤${negativeThreshold})`}
                stackId="a"
                fill="#EA5753"
              />
            )}

            {visibleSentiments.includes('positive') && (
              <Bar
                dataKey="positive_count"
                name={`Positive (≥${positiveThreshold})`}
                stackId="a"
                fill="#8FCC7E"
                opacity="0.8"
              />
            )}

            {visibleSentiments.includes('neutral') && (
              <Bar
                dataKey="neutral_count"
                name={`Neutral (${negativeThreshold + 1}-${positiveThreshold - 1})`}
                stackId="a"
                fill="#D9D9D9"
                opacity="0.8"
              />
            )}

            {isMobile ? (
              <YAxis
                dataKey="nameLabel"
                type="category"
                axisLine={false}
                tickLine={false}
                width={80}
                fontSize={10}
                textAnchor="end"
                orientation="right"
                mirror
              />
            ) : (
              <XAxis
                dataKey="nameLabel"
                axisLine={false}
                tickLine={false}
                interval={0}
                fontSize={10}
              />
            )}

            {isMobile ? (
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                domain={[0, maxTotal]}
                tickCount={6}
                fontSize={10}
              />
            ) : (
              <YAxis
                type="number"
                axisLine={false}
                tickLine={false}
                domain={[0, maxTotal]}
                tickCount={6}
                width={30}
                fontSize={10}
              />
            )}
          </BarChart>
        );
      }}
    </BaseGraph>
  );
}
