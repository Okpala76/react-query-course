import * as React from "react";
import { useQuery , useQueryClient} from "@tanstack/react-query";

/**
 * Create a component that renders a list of issues
 * fetched from
 * `https://ui.dev/api/courses/react-query/issues`.
 *
 * Clicking on an issue should update the `issueNumber`
 * state, which renders the issue details.
 *
 * The issue details component should fetch from the
 * `https://ui.dev/api/courses/react-query/issues/:issueNumber`
 * endpoint. It should also render the comments fetched from
 * `https://ui.dev/api/courses/react-query/issues/:issueNumber/comments`.
 *
 * The issue details should be preloaded with data,
 * either through `initialData` or by priming
 * the cache with `queryClient.setQueryData`.
 * On the issue list component, hovering over
 * the issue should prefetch the comments.
 */
async function fetchIssues(queryClient) {
  const result = await fetch(`https://ui.dev/api/courses/react-query/issues`)
    .then((res) => res.json());

  result.forEach((issue) => {
    queryClient.setQueryData(["issues", issue.number], issue) 
    })
  
  return result;
}

async function fetchIssueDetails(issueNumber) {
  return fetch(`https://ui.dev/api/courses/react-query/issues/${issueNumber}`)
  .then(res => res.json())
}
async function fetchIssueComments(issueNumber) {
  return fetch(`https://ui.dev/api/courses/react-query/issues/${issueNumber}/comments`)
  .then(res => res.json())
}

function Issues({ setIssueNumber }) {
  const queryClient = useQueryClient();

  const issuesQuery = useQuery({
    queryKey:["issues"], 
    queryFn: () => fetchIssues(queryClient)
    })
     
  return (
    <div>
      <h1>Issues</h1>
      <ul>
        {issuesQuery.isLoading ? (<p>Loading...</p>) : (
          issuesQuery.data.map((issue) => (
          <li key={issue.id}>
            <a href="#"  
              onClick={() => setIssueNumber(issue.number)}
              onMouseEnter = {() => {
                queryClient.prefetchQuery(["issues", issue.number, "comments"], () => fetchIssueComments(issue.number));
              }}
              
              >
              {issue.title}
            </a>
          </li>
        )))}
      </ul>
    </div>
  );
}

function IssueDetails({ issueNumber, setIssueNumber }) {
  // Implement the query here
     
  const issueQuery = useQuery({ 
    queryKey:["issues",issueNumber],
    queryFn: () => fetchIssueDetails(issueNumber)});

  return (
    <div>
      <h1>Issue Details</h1>
      <a href="#" onClick={() => setIssueNumber(null)}>
        Back to issues
      </a>
      {issueQuery.isLoading ? (<p>Loading...</p>) : (
      <p>
        #{issueQuery.data.number} {issueQuery.data.title}
      </p>)}
      <IssueComments issueNumber={issueNumber} />
    </div>
  );
}

function IssueComments({ issueNumber }) {
  // Implement the query here
  const commentsQuery = useQuery({
    queryKey:["issues",issueNumber,"comments"],
    queryFn: () => fetchIssueComments(issueNumber)});

  return (
    <div>
      <h2>Comments</h2>
      {commentsQuery.isLoading? (<p>Loading...</p>) : ( 
      <ul>
        {commentsQuery.data.map((comment) => (
          <li key={comment.id}>{comment.comment}</li>
        ))}
      </ul> 
    )}
    </div>
  );
}

export default function Cruise3() {
  const [issueNumber, setIssueNumber] = React.useState(null);
  if (issueNumber === null) {
    return <Issues setIssueNumber={setIssueNumber} />;
  } else {
    return (
      <IssueDetails issueNumber={issueNumber} setIssueNumber={setIssueNumber} />
    );
  }
}
