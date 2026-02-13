'use client';

import { Input } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchData } from '@/lib/services/api';
import debounce from 'lodash/debounce';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import classNames from 'classnames';
import ArticlesCount from '@/components/articles-count';
import { isEmpty } from 'lodash';
import ArticleSearchResult from '@/components/article-search/article-search-result';
import styles from './article-search.module.scss';

const { Search } = Input;
gsap.registerPlugin(ScrollTrigger);

interface Article {
  id: number;
  title: string;
  media_title: string;
  date_time: string;
}

interface SearchResponse {
  articles: Article[];
}

interface ArticleSearchProps {
  total_articles: number;
  total_sentiments: number;
  defaultValue?: string;
  limit?: number;
  isWidget?: boolean;
}

export default function ArticleSearch({
  total_articles,
  total_sentiments,
  defaultValue,
  limit = 20,
  isWidget = false,
}: ArticleSearchProps) {
  const [searchValue, setSearchValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const scopeRef = useRef(null);

  const requestArticles = useMemo(
    () =>
      debounce(async (value: string) => {
        setIsLoading(true);
        if (!value || value?.length < 3) {
          setArticles([]);
          setIsLoading(false);
          return;
        }
        const { articles } = await fetchData<SearchResponse>('/articles/search', {
          value,
          limit: limit.toString(),
        });
        setArticles(articles);
        setIsLoading(false);
      }, 300),
    [limit]
  );

  useEffect(() => {
    requestArticles(searchValue || '');
  }, [searchValue, requestArticles]);

  useEffect(() => {
    if (articles.length > 0) {
      articles.forEach(article => {
        const articleElement = document.getElementById(`article-${article.id}`);

        gsap.fromTo(
          articleElement,
          { opacity: 0.2, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.2,
            ease: 'power2.in',
            scrollTrigger: {
              trigger: articleElement,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
              markers: false,
            },
          }
        );
      });
    }
  }, [articles]);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <div className={styles.title}>Articles</div>
          <ArticlesCount
            total_count={total_articles}
            analyzed_count={total_sentiments}
            layout="vertical"
          />
        </div>
      </div>
      <div className={styles.content}>
        <Search
          defaultValue={searchValue}
          rootClassName={classNames(styles.input, {
            [styles.inputFocused]: searchValue,
          })}
          placeholder="Search for title"
          onChange={e => setSearchValue(e.target.value)}
          size="large"
          loading={isLoading}
        />
        <div className={styles.results} ref={scopeRef}>
          {isLoading && <div className={styles.loading}>Loading...</div>}
          {!isLoading &&
            articles.map(article => <ArticleSearchResult key={article.id} article={article} />)}
          {!isLoading && searchValue && searchValue.length >= 3 && articles.length === 0 && (
            <div className={styles.noResults}>No results found</div>
          )}
        </div>
        {!isEmpty(articles) && isWidget && (
          <a href={`/articles?search=${searchValue}`} className={styles.link}>
            Open articles
          </a>
        )}
      </div>
    </div>
  );
}
