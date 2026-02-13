import BaseTooltip from '@/src/components/graphs/base-tooltip/base-tooltip';
import ArticlePreview from '@/src/components/article-preview';
import { TooltipProps } from 'recharts';
import React from 'react';
import { ExportOutlined } from '@ant-design/icons';
import { formatDate } from '@/lib/utils/helpers';
import styles from './party-scatter-plot-tooltip.module.scss';

interface PartyScatterPlotTooltipData {
  article_id?: string;
  authors?: string;
  title?: string;
  preview_url?: string;
  date_time?: string;
}

export default function PartyScatterPlotTooltip(props: TooltipProps<any, any>) {
  const article_id = props.payload?.[0]?.payload?.article_id;
  const fetchUrl = article_id ? `/articles/${article_id}/tooltip` : undefined;

  return (
    <BaseTooltip fetchUrl={fetchUrl} processData={data => data}>
      {data => {
        const article = data as PartyScatterPlotTooltipData;

        const title = article?.title;
        const authors = article?.authors;
        const preview_url = article?.preview_url;
        const date_time = article?.date_time;

        return (
          <div className={styles.tooltip}>
            <ExportOutlined className={styles.icon} />
            {authors && <span className={styles.authors}>{authors}</span>}
            {title && <span className={styles.title}>{title}</span>}
            {preview_url && <ArticlePreview preview_url={preview_url} className={styles.preview} />}
            <div className={styles.date}>{date_time && formatDate(date_time, 'DD MMMM YYYY')}</div>
          </div>
        );
      }}
    </BaseTooltip>
  );
};
