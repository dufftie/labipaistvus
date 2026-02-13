import React from 'react';
import styles from './article-analysis.module.scss';
// import { ArticleData, MediaData } from '@/src/types/article';
// import Hint from '../hint';
// import { formatDate } from '@/lib/utils/helpers';

// const titlePrompt = (
//   <pre>
//     Оцени объективность *заголовка* статьи по шкале от 0 до 10 (0 - крайне предвзятый, 10 -
//     абсолютно объективный). Предоставь обоснование. Учитывай, отражает ли заголовок содержание
//     статьи, использует ли он эмоционально окрашенную лексику, преувеличения или искажения.
//   </pre>
// );

// const articlePrompt = (
//   <pre>
//     Оцени объективность *всего текста* статьи по шкале от 0 до 10 (0 - крайне предвзятый, 10 -
//     абсолютно объективный). Предоставь обоснование. Учитывай, представлены ли разные точки зрения,
//     используются ли достоверные источники, есть ли признаки манипуляции фактами или мнениями.
//   </pre>
// );

interface ArticleAnalysisProps {
  title_score: number;
  title_explanation: string;
  body_score: number;
  body_explanation: string;
}

export default function ArticleAnalysis({
  title_score,
  title_explanation,
  body_score,
  body_explanation,
}: ArticleAnalysisProps) {
  // TODO: AI analysis prompt is different for different articles and should come from the backend
  // Uncomment once backend is ready

  return (
    <div className={styles.analysis}>
      <div className={styles.item}>
        <b>
          Title objectivity: {title_score}/10
          {/* <Hint title="AI prompt" content={titlePrompt} className={styles.hint} /> */}
        </b>
        <p>{title_explanation}</p>
      </div>
      <div className={styles.item}>
        <b>
          Article objectivity: {body_score}/10
          {/* <Hint title="AI prompt" content={articlePrompt} /> */}
        </b>
        <p>{body_explanation}</p>
      </div>
    </div>
  );
}
