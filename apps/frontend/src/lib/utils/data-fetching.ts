import { useCallback, useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { fetchData } from '@/src/lib/services/api';

export interface UseDataFetchingProps {
  fetchUrl?: string;
  processData: (data: any[]) => any[];
  debounceTime?: number;
}

export interface UseDataFetchingResult {
  data: any[];
  loading: boolean;
  showSpinner: boolean;
  loadData: () => void;
}

export const useDataFetching = ({
  fetchUrl,
  processData,
  debounceTime = 100,
}: UseDataFetchingProps): UseDataFetchingResult => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    setShowSpinner(loading);
  }, [loading]);

  const loadData = useCallback(
    debounce(async () => {
      if (!fetchUrl) return;

      setLoading(true);
      try {
        const endpoint = formatEndpoint(fetchUrl);
        const result = await fetchData<any[]>(endpoint);
        setData(processData(result));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }, debounceTime),
    [fetchUrl, processData, debounceTime]
  );

  useEffect(() => {
    if (fetchUrl) {
      loadData();
    }
  }, [loadData, fetchUrl]);

  return { data, loading, showSpinner, loadData };
};

export const formatEndpoint = (url: string): string => {
  if (url.startsWith('http') || url.startsWith('/')) {
    return url;
  }
  return `/${url}`;
};
