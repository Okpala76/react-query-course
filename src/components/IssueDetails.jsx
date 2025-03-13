import React from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { IssueHeader } from './IssueHeader';
import { relativeDate } from '../helpers/relativeDate';
import { useUserData } from '../helpers/useUserData';
import IssueStatus from './IssueStatus';
import IssueAssignment from './IssueAssignment';
import IssuesLabels from './issuesLabels';
import useScrollToBottomAction from '../helpers/useScrollToBottomAction';
import Loader from './Loader';

function useIssueData(issueNumber) {
  return useQuery({
    queryKey: ['issues', issueNumber],
    queryFn: ({ signal }) => {
      return fetch(`/api/issues/${issueNumber}`, { signal }).then((res) =>
        res.json()
      );
    },
  });
}

function useIssueComments(issueNumber) {
  return useInfiniteQuery({
    queryKey: ['issues', issueNumber, 'comments'],
    queryFn: ({ signal, pageParam }) => {
      return fetch(`/api/issues/${issueNumber}/comments?page=${pageParam}`, {
        signal,
      }).then((res) => res.json());
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
      if (lastPage.length === 0) return undefined;
      return allPages.length + 1;
    },
  });
}

function Comment({ comment, createdBy, createdDate }) {
  const userQuery = useUserData(createdBy);

  if (userQuery.isLoading)
    return (
      <div className="comment">
        <div>
          <div className="comment-header">Loading...</div>
        </div>
      </div>
    );

  return (
    <div className="comment">
      <img src={userQuery.data.profilePictureUrl} alt="Commenter Avatar" />
      <div className="comment-header">
        <span>{userQuery.data.name}</span> commented{' '}
        <span>{relativeDate(createdDate)}</span>
      </div>
      <div className="comment-body">{comment}</div>
    </div>
  );
}

export default function IssueDetails() {
  const { number } = useParams();
  const issuesQuery = useIssueData(number);
  const commentsQuery = useIssueComments(number);

  useScrollToBottomAction(document, commentsQuery.fetchNextPage, 100);

  return (
    <div className="issue-details">
      {issuesQuery.isLoading ? (
        <p>Loading issue...</p>
      ) : (
        <>
          <IssueHeader {...issuesQuery.data} />

          <main>
            <section>
              {commentsQuery.isLoading ? (
                <p>Loading...</p>
              ) : (
                commentsQuery.data?.pages.map((commentPage) =>
                  commentPage.map((comment) => (
                    <Comment key={comment.id} {...comment} />
                  ))
                )
              )}
              {commentsQuery.isFetchingNextPage && <Loader />}
            </section>
            <aside>
              <IssueStatus
                status={issuesQuery.data.status}
                issueNumber={issuesQuery.data.number.toString()}
              />
              <IssueAssignment
                assignee={issuesQuery.data.assignee}
                issueNumber={issuesQuery.data.number.toString()}
              />
              <IssuesLabels
                labels={issuesQuery.data.labels}
                issueNumber={issuesQuery.data.number.toString()}
              />
            </aside>
          </main>
        </>
      )}
    </div>
  );
}
