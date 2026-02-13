import { isNull, isUndefined } from 'lodash';
import ArticlesCount from '@/components/articles-count';
import Card from '@/components/card';
import styles from './media-select-detail.module.scss';
import { MediaDataOrPlaceholder } from '@/src/types/article';

interface MediaSelectDetailProps {
  media: MediaDataOrPlaceholder | null | undefined;
}

const MediaSelectDetail = ({ media }: MediaSelectDetailProps) => {
  if (isUndefined(media)) return null;

  if (isNull(media) || media.disabled) {
    return (
      <div className={styles.detail}>
        <p className={styles.detailDescription}>
          Unfortunately this media was not yet analysed. Please consider supporting the project in
          order to cover more media.
        </p>
      </div>
    );
  }

  const { title, editors, description, analyzed_count, total_count } = media;
  const editor = (editors && editors[0]) || null;
  return (
    <div className={styles.detail}>
      <div className={styles.header}>
        <p className={styles.title}>{title}</p>
        {editor && (
          <Card label="Editor-in-Chief" borderless>
            <span>{editor.name}</span>
          </Card>
        )}
      </div>
      <p className={styles.description}>{description}</p>
      {analyzed_count !== undefined && total_count !== undefined && (
        <ArticlesCount
          analyzed_count={analyzed_count}
          total_count={total_count}
        />
      )}
    </div>
  );
};

export default MediaSelectDetail;
