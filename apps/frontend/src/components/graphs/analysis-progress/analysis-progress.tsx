'use client';

import { BarChart, Bar, XAxis, Tooltip } from 'recharts';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import BaseGraph from '@/src/components/graphs/base-graph/';
import { useDateRange } from '@/src/contexts/date-range-context';
import { useMemo, useCallback } from 'react';
import ProceededArticleTooltip from '@/src/components/graphs/analysis-progress/analysis-progress-tooltip/analysis-progress-tooltip';
import styles from './analysis-progress.module.scss';
import classNames from 'classnames';

// Extend dayjs with the required plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface AnalysisProgressProps {
  media_id: string;
  className?: string;
}

export default function AnalysisProgress({ media_id, className }: AnalysisProgressProps) {
  const { formattedRequestDateRange, formattedDomainDateRange } = useDateRange();
  const [startDate, endDate] = formattedRequestDateRange;

  // Memoize the fetchUrl so it only changes when request range changes
  const fetchUrl = useMemo(
    () => `/sentiments/daily-stats/media/${media_id}/?start_date=${startDate}&end_date=${endDate}`,
    [media_id, startDate, endDate]
  );

  // Memoize the base data processing function that doesn't depend on domain range
  const processData = useMemo(() => {
    return (data: any[]) =>
      data.map(entry => ({
        ...entry,
        date: dayjs(entry.date).format('YYYY-MM-DD'),
        timestamp: dayjs(entry.date).valueOf(),
        displayDate: dayjs(entry.date).format('YYYY'),
        non_analyzed_articles: entry.articles_count - entry.analysed_count,
      }));
  }, []); // No dependencies as it doesn't use any external values

  // Memoize the filter function
  const filterDataToDomainRange = useCallback(
    (data: any[]) => {
      const [domainStart, domainEnd] = formattedDomainDateRange;
      const domainStartDate = dayjs(domainStart);
      const domainEndDate = dayjs(domainEnd);

      // Filter data to domain range
      return data.filter(entry => {
        const entryDate = dayjs(entry.date);
        return entryDate.isSameOrAfter(domainStartDate) && entryDate.isSameOrBefore(domainEndDate);
      });
    },
    [formattedDomainDateRange]
  );

  // Memoize the format function
  const formatXAxis = useCallback(
    (timestamp: number) => {
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
    },
    [formattedDomainDateRange]
  );

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

  return (
    <BaseGraph
      fetchUrl={fetchUrl}
      processData={processData}
      className={classNames(styles.chart, className)}
    >
      {data => {
        // Filter data to domain range
        const filteredData = filterDataToDomainRange(data);

        // Calculate domain for even distribution
        const [domainStart, domainEnd] = formattedDomainDateRange;
        const startTimestamp = dayjs(domainStart).valueOf();
        const endTimestamp = dayjs(domainEnd).valueOf();
        const ticks = calculateTicks(startTimestamp, endTimestamp);

        // Disable animations if there are more than 200 data points
        const shouldAnimate = filteredData.length <= 200;

        return (
          <BarChart
            data={filteredData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            maxBarSize={30}
          >
            <XAxis
              dataKey="timestamp"
              scale="time"
              type="number"
              interval="preserveStartEnd"
              domain={[startTimestamp, endTimestamp]}
              tickFormatter={formatXAxis}
              ticks={ticks}
              tickSize={15}
              tickMargin={5}
              padding={{ left: 30, right: 30 }}
              minTickGap={50}
            />
            <Tooltip content={<ProceededArticleTooltip />} />
            <Bar
              dataKey="analysed_count"
              fill="#EA2525"
              stackId="a"
              isAnimationActive={shouldAnimate}
            />
            <Bar
              dataKey="non_analyzed_articles"
              fill="#B8B8B8"
              stackId="a"
              isAnimationActive={shouldAnimate}
            />
          </BarChart>
        );
      }}
    </BaseGraph>
  );
}
