import { formatDate } from '@/lib/utils/helpers';
import styles from './article-search-result.module.scss';

interface Article {
  id: number;
  title: string;
  media_title: string;
  date_time: string;
}

interface ArticleSearchResultProps {
  article: Article;
}

export default function ArticleSearchResult({ article }: ArticleSearchResultProps) {
  return (
    <a
      key={article.id}
      id={`article-${article.id}`}
      href={`/articles/${article.id}`}
      className={styles.result}
    >
      <div className={styles.title}>{article.title}</div>
      <div className={styles.meta}>
        <div className={styles.media}>{article.media_title}</div>
        <div className={styles.date}>{formatDate(article.date_time, 'DD.MM.YYYY')}</div>
      </div>
    </a>
  );
}
