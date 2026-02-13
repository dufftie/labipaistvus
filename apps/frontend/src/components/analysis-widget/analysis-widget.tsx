import React from 'react';
import map from 'lodash/map';
import { Collapse, Empty } from 'antd';
import styles from './analysis-widget.module.scss';

interface AnalysisDataProps {
  name: string;
  explanation: string;
  score: number;
}

interface AnalysisTableProps {
  title: string;
  data: AnalysisDataProps[];
  chart: React.ReactNode;
}

export default function AnalysisWidget(props: AnalysisTableProps) {
  const { data, title, chart } = props;

  const isEmpty = !data || data.length === 0;

  const collapseItems = [
    {
      key: 'explanation',
      label: 'Explanation',
      children: (
        <div className={styles.explanations}>
          {map(data, explanation => (
            <div className={styles.explanation} key={explanation.name}>
              <span className={styles.name}>
                <b>{explanation.name} – {explanation.score}</b>
              </span>
              <div className={styles.text}>{explanation.explanation}</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <h3>{title}</h3>
      {!isEmpty ? chart : <Empty description="No data found" />}
      {!isEmpty && <Collapse items={collapseItems} bordered={false} />}
    </div>
  );
}