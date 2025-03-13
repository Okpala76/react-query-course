import React, { useState } from 'react';
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { IssueItem } from './IssueItem';
import fetchWithError from '../helpers/fetchWithError';
import Loader from './Loader';

export default function IssuesList({ labels, status, pageNum, setPageNum }) {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState('');

  // Issues Query
  const issuesQuery = useQuery({
    queryKey: ['issues', { labels, status, pageNum }],
    queryFn: async ({ signal }) => {
      const statusString = status ? `&status=${status}` : '';
      const labelsString = labels.length
        ? labels.map((label) => `labels[]=${label}`).join('&')
        : '';
      const paginationString = pageNum ? `&page=${pageNum}` : '';

      const url = `/api/issues?${[labelsString, statusString, paginationString]
        .filter(Boolean)
        .join('&')}`;

      return fetchWithError(url, { signal });
    },
    placeholderData: (previousData) => previousData, // Identity function
  });

  // Search Query
  const searchQuery = useQuery({
    queryKey: ['issues', 'search', searchValue],
    queryFn: ({ signal }) =>
      fetchWithError(`/api/search/issues?q=${searchValue}`, { signal }),
    enabled: searchValue.trim().length > 0, // Ensuring it doesn't trigger with empty input
  });

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSearchValue(event.target.elements.search.value.trim());
        }}
      >
        <label htmlFor="search">Search Issues</label>
        <input
          type="search"
          placeholder="Search"
          name="search"
          id="search"
          onChange={(event) => {
            setSearchValue(event.target.value.trim());
          }}
        />
      </form>

      {/* Search Results */}
      {searchValue.length > 0 ? (
        searchQuery.isLoading ? (
          <p>Loading search results...</p>
        ) : searchQuery.data ? (
          <>
            <h2>Search Results</h2>
            <p>{searchQuery.data.count} Results</p>
            <ul className="issues-list">
              {searchQuery.data.items.map((issue) => (
                <IssueItem
                  key={issue.id}
                  title={issue.title}
                  number={issue.number}
                  assignee={issue.assignee}
                  commentCount={issue.comments.length}
                  createdBy={issue.createdBy}
                  createdDate={issue.createdDate}
                  labels={issue.labels}
                  status={issue.status}
                />
              ))}
            </ul>
          </>
        ) : null
      ) : issuesQuery.isLoading ? (
        <p>Loading issues...</p>
      ) : issuesQuery.isError ? (
        <p>{issuesQuery.error.message}</p>
      ) : (
        <>
          <h2>Issues List {issuesQuery.isFetching ? <Loader /> : null}</h2>
          <ul className="issues-list">
            {issuesQuery.data.map((issue) => (
              <IssueItem
                key={issue.id}
                title={issue.title}
                number={issue.number}
                assignee={issue.assignee}
                commentCount={issue.comments.length}
                createdBy={issue.createdBy}
                createdDate={issue.createdDate}
                labels={issue.labels}
                status={issue.status}
              />
            ))}
          </ul>
          <div className="pagination">
            <button
              onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))}
              disabled={pageNum === 1}
            >
              Previous
            </button>

            <p>
              Page {pageNum} {issuesQuery.isFetching ? '...' : ''}
            </p>

            <button
              disabled={
                issuesQuery.data?.length === 0 || issuesQuery.isPlaceholderData
              }
              onClick={() => setPageNum((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
