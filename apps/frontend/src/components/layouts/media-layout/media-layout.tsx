import React, { JSX } from 'react';
import { MediaData } from '@/src/types/article';
import MediaHeader from '@/src/components/media-detail/media-header';
import AnalysisProgress from '@/src/components/graphs/analysis-progress/';
import Card from '@/src/components/card';
import RangeDateSelect from '@/src/components/range-date-select';
import { DateRangeProvider } from '@/src/contexts/date-range-context';
import PartyScatterPlotWidget from '@/src/components/widgets/party-scatter-plot-widget';
import PartiesAreaChartWidget from '@/src/components/widgets/parties-area-chart-widget';
import PartiesBarChartWidget from '@/src/components/widgets/parties-bar-chart-widget';
import PoliticiansBarChartWidget from '@/src/components/widgets/politicians-bar-chart-widget';
import ScoresBarChartWidget from '@/src/components/widgets/scores-bar-chart-widget';
import styles from './media-layout.module.scss';

interface MediaLayoutProps {
  media: MediaData;
  analyzed_count: number;
  total_count: number;
}

export default function MediaLayout({
  media,
  analyzed_count,
  total_count,
}: MediaLayoutProps): JSX.Element {
  // ToDo: Replace with actual hint text
  const hintText = `The number of articles analyzed for the selected period`;

  return (
    <DateRangeProvider>
      <div className={styles.layout}>
        <MediaHeader
          title={media.title}
          url={media.base_url}
          description={media.description}
          analyzed_count={analyzed_count}
          total_count={total_count}
        />

        <div className={styles.content}>
          <div className={styles.meta}>
            <Card label="Analysis progress" primary hint={hintText}>
              <AnalysisProgress media_id={media.id} className={styles.graph} />
            </Card>
            <RangeDateSelect />
          </div>

          <div className={styles.graphs}>
            <PartyScatterPlotWidget media_id={media.id} />
            <PartiesAreaChartWidget media_id={media.id} />
            <PartiesBarChartWidget media_id={media.id} />
            <PoliticiansBarChartWidget media_id={media.id} />
            <ScoresBarChartWidget media_id={media.id} />
          </div>
        </div>
      </div>
    </DateRangeProvider>
  );
};
