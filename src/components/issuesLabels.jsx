import { GoGear } from 'react-icons/go';
import { useLabelsData } from '../helpers/useLabelsData';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function IssuesLabels({ labels, issueNumber }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const labelsQuery = useLabelsData(issueNumber);

  const queryClient = useQueryClient();

  const setLabel = useMutation({
    mutationFn: async (labelId) => {
      const newLabels = labels.includes(labelId)
        ? labels.filter((currentLabel) => currentLabel !== labelId)
        : [...labels, labelId];

      const response = await fetch(`/api/issues/${issueNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labels: newLabels }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log(response);
      return response.json();
    },
    onMutate: async (labelId) => {
      await queryClient.cancelQueries(['issues', issueNumber]);

      const oldLabels = queryClient.getQueryData([
        'issues',
        issueNumber,
      ]).labels;

      const newLabels = oldLabels.includes(labelId)
        ? oldLabels.filter((label) => label !== labelId)
        : [...oldLabels, labelId];

      queryClient.setQueryData(['issues', issueNumber], (old) => ({
        ...old,
        labels: newLabels,
      }));

      return function rollback() {
        queryClient.setQueryData(['issues', issueNumber], (old) => {
          const rollbackLabels = old.labels.includes(labelId)
            ? [...old.labels, labelId]
            : old.labels.filter((label) => label !== labelId);

          return {
            ...old,
            labels: rollbackLabels,
          };
        });
      };
    },
    onError: (err, variables, rollback) => {
      if (rollback) rollback();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueNumber] });
    },
  });

  return (
    <div className="issue-options">
      <div>
        <span>Labels</span>
        {labelsQuery.isLoading
          ? null
          : labels.map((label) => {
              const labelObject = labelsQuery.data.find(
                (queryLabel) => queryLabel.id === label // Change label.id to just labelId
              );

              if (!labelObject) return null;

              return (
                <span key={label} className={`label ${labelObject.color}`}>
                  {labelObject.name}
                </span>
              );
            })}
      </div>
      <div>
        <GoGear
          onClick={() => !labelsQuery.isLoading && setMenuOpen((open) => !open)}
        />
        {menuOpen && (
          <div className="picker-menu labels">
            {labelsQuery.data?.map((label) => {
              const selected = labels.includes(label.id);
              return (
                <div
                  key={label.id}
                  className={selected ? 'selected' : ''}
                  onClick={() => {
                    setLabel.mutate(label.id);
                  }}
                >
                  <span
                    className={`label-dot`}
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
