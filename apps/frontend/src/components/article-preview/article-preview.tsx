import React, { useState, useEffect, useRef } from 'react';
import { Empty, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import styles from './article-preview.module.scss';

interface ArticlePreviewProps {
  preview_url: string;
  className?: string;
}

export default function ArticlePreview({ preview_url, className }: ArticlePreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Only set loading to true if preview_url has actually changed
    if (prevUrlRef.current !== null && prevUrlRef.current !== preview_url) {
      setIsLoading(true);
    }
    prevUrlRef.current = preview_url;
  }, [preview_url]);

  if (!preview_url) return <Empty description={false} />;

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loading}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
      )}
      <img
        className={classNames(styles.preview, className, {
          [styles.isLoading]: isLoading,
          [styles.loaded]: !isLoading,
        })}
        src={preview_url}
        alt="article preview image"
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
    </div>
  );
}