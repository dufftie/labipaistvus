import { useDataFetching } from '@/src/lib/utils/data-fetching';
import { JSX } from 'react';
import styles from './base-tooltip.module.scss';

interface BaseTooltipProps {
  fetchUrl?: string;
  processData?: (data: any[]) => any[];
  children: (data?: any[]) => JSX.Element;
}

const BaseTooltip = ({ fetchUrl, processData, children }: BaseTooltipProps) => {
  const { data } = useDataFetching({
    fetchUrl,
    processData: processData || ((data) => data),
  });

  return (
    <div className={styles.tooltip}>
      {fetchUrl ? children(data) : children()}
    </div>
  );
};

export default BaseTooltip;
