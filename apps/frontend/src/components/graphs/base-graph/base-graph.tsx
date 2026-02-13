'use client';

import { ResponsiveContainer } from 'recharts';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useDataFetching } from '@/src/lib/utils/data-fetching';
import styles from './base-graph.module.scss';
import classNames from 'classnames';

export interface BaseGraphProps {
  fetchUrl: string;
  processData: (data: any[]) => any[];
  children: (data: any[], loading: boolean) => JSX.Element;
  className?: string;
}

const BaseGraph = ({ fetchUrl, processData, children, className }: BaseGraphProps) => {
  const { data, loading, showSpinner } = useDataFetching({
    fetchUrl,
    processData,
  });

  return (
    <div className={classNames(styles.graph, className)}>
      <div className={`${styles.spinner} ${showSpinner ? styles['spinner--active'] : ''}`}>
        <Spin
          size="large"
          indicator={<LoadingOutlined spin />}
          className={showSpinner ? styles['spinner--active'] : ''}
        />
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          {children(data, loading)}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BaseGraph;
