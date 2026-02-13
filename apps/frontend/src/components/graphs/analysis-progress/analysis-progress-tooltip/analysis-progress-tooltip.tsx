import { TooltipProps } from 'recharts';
import { formatDate } from '@/lib/utils/helpers';
import BaseTooltip from '@/src/components/graphs/base-tooltip/base-tooltip';
import styles from '@/src/components/graphs/base-tooltip/base-tooltip.module.scss';

interface AnalysisProgressData {
  date: string;
  analysed_count: number;
  non_analyzed_articles: number;
  articles_count: number;
}

export default function AnalysisProgressTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.[0]?.payload) return null;

  const { date, analysed_count = 0, non_analyzed_articles = 0, articles_count = 0 } = payload[0].payload as AnalysisProgressData;

  return (
    <BaseTooltip processData={data => data}>
      {() => (
        <>
          <div className={styles.title}>{date && formatDate(date, 'DD MMMM YYYY')}</div>
          <div className={styles.values}>
            <div className={styles.item}>
              <span className={styles.label}>Analyzed:</span>
              <span className={styles.value}>{analysed_count}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Not Analyzed:</span>
              <span className={styles.value}>{non_analyzed_articles}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Total:</span>
              <span className={styles.value}>{articles_count}</span>
            </div>
          </div>
        </>
      )}
    </BaseTooltip>
  );
}
