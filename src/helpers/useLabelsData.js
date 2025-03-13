import { useQuery } from '@tanstack/react-query';
import { defaultLabels } from './defaultData';

export function useLabelsData() {
  const labelsQuery = useQuery({
    queryKey: ['labels'],
    queryFn: ({ signal }) =>
      fetch('/api/labels', { signal }).then((res) => res.json()),
    staleTime: 1000 * 60 * 60,
    placeholderData: defaultLabels,
  });

  return labelsQuery;
}
