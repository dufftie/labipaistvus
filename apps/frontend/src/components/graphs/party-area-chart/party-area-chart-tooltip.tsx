import { TooltipProps } from 'recharts';
import React from 'react';
import { formatDate } from '@/lib/utils/helpers';
import BaseTooltip from '@/src/components/graphs/base-tooltip/base-tooltip';
import styles from '@/src/components/graphs/base-tooltip/base-tooltip.module.scss';

interface PartyAreaData {
  date: string;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;
  total_count: number;
}

const PartyAreaTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const entry = payload[0].payload as PartyAreaData;
  if (!entry) {
    return null;
  }

  return (
    <BaseTooltip processData={data => data}>
      {() => (
        <>
          <div className={styles.title}>
            {entry.date && formatDate(entry.date, 'DD MMMM YYYY')}
          </div>
          <div className={styles.values}>
            <div className={styles.item}>
              <span className={styles.label}>Positive:</span>
              <span className={styles.value}>
                {entry.positive_count} ({entry.positive_percentage}%)
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Neutral:</span>
              <span className={styles.value}>
                {entry.neutral_count} ({entry.neutral_percentage}%)
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Negative:</span>
              <span className={styles.value}>
                {entry.negative_count} ({entry.negative_percentage}%)
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Total:</span>
              <span className={styles.value}>{entry.total_count}</span>
            </div>
          </div>
        </>
      )}
    </BaseTooltip>
  );
};

export default PartyAreaTooltip;
