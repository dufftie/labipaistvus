import { TooltipProps } from 'recharts';
import React from 'react';
import BaseTooltip from '@/src/components/graphs/base-tooltip/base-tooltip';
import styles from '@/src/components/graphs/base-tooltip/base-tooltip.module.scss';

interface StackedBarData {
  name: string;
  nameLabel: string;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  total_count: number;
  color?: string;
}

const StackedBarTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const entry = payload[0].payload as StackedBarData;
  if (!entry) {
    return null;
  }

  return (
    <BaseTooltip processData={data => data}>
      {() => (
        <>
          <div className={styles.title}>{entry.nameLabel}</div>
          <div className={styles.values}>
            <div className={styles.item}>
              <span className={styles.label}>Positive:</span>
              <span className={styles.value}>{entry.positive_count}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Neutral:</span>
              <span className={styles.value}>{entry.neutral_count}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Negative:</span>
              <span className={styles.value}>{entry.negative_count}</span>
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

export default StackedBarTooltip;
