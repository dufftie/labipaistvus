'use client';

import { JSX, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import MediaSelectOption from '@/components/media-select/media-select-option';
import { groupBy, indexOf, sortBy } from 'lodash';
import map from 'lodash/map';
import MediaSelectDetail from '@/components/media-select/media-select-detail';
import classNames from 'classnames';
import styles from './media-select.module.scss';
import detailStyles from './media-select-detail.module.scss';
import { MediaData, MediaDataOrPlaceholder } from '@/src/types/article';

export type SetActiveMedia = (media: MediaDataOrPlaceholder | null | undefined) => void;

interface MediaSelectProps {
  media: MediaData[];
  primary?: boolean;
}

const MediaSelect = ({ media, primary = false }: MediaSelectProps): JSX.Element => {
  const scopeRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [activeMedia, setActiveMedia] = useState<MediaDataOrPlaceholder | null | undefined>(undefined);

  useGSAP(
    () => {
      const description = detailRef.current?.querySelector(`.${detailStyles.description}`);
      if (description) {
        gsap.fromTo(
          description,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.inOut' }
        );
      }
    },
    { scope: scopeRef, dependencies: [activeMedia] }
  );

  useGSAP(
    () => {
      const options = scopeRef.current?.querySelectorAll(`.${styles.option}`);
      if (options && options.length > 0) {
        gsap.fromTo(
          options,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: 'power2.out' }
        );
      }
    },
    { scope: scopeRef }
  );

  const fullMediasList = [
    ...media,
    // MEDIA CHANNELS THAT WEREN'T YET ANALYSED
    { disabled: true, title: 'Delfi', language_code: 'et', id: 'delfi' },
    { disabled: true, title: 'rus.Delfi', language_code: 'ru', id: 'rus-delfi' },
    { disabled: true, title: 'ERR', language_code: 'et', id: 'err' },
    { disabled: true, title: 'rus.ERR', language_code: 'ru', id: 'rus-err' },
    { disabled: true, title: 'Õhtuleht', language_code: 'et', id: 'ohtuleht' },
  ];

  const groupedMedias = groupBy(fullMediasList, 'language_code');

  const languageOrder = ['et', 'ru', 'en'];

  const orderedLists = sortBy(
    map(groupedMedias, (items, code) => ({ title: code, items })),
    group => indexOf(languageOrder, group.title) // Sort based on languageOrder array
  );

  return (
    <div className={classNames(styles.root, { [styles.primary]: primary })} ref={scopeRef}>
      <div className={styles.title}>Medias</div>
      <div className={styles.options}>
        {orderedLists.map((list, index) => (
          <div className={styles.group} key={index}>
            <div className={styles.groupTitle}>{list.title}</div>
            {list.items.map((media, index) => (
              <MediaSelectOption key={index} media={media} setActiveMedia={setActiveMedia} />
            ))}
          </div>
        ))}
      </div>
      <div className={styles.details} ref={detailRef}>
        <MediaSelectDetail media={activeMedia} />
      </div>
    </div>
  );
};

export default MediaSelect;
