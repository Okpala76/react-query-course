import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IssueItem } from "./IssueItem";
import fetchWithError from "../helpers/fetchWithError";
import Loader from "./Loader";

export default function IssuesList({ labels, status }) {
    const queryClient = useQueryClient();
  const issuesQuery = useQuery({
    queryKey: ['issues', { labels, status }],
    queryFn: async ({signal}) => {
      const statusString = status ? `&status=${status}` : "";
      const labelsString = labels.map((label) => `labels[]=${label}`).join("&");
      const results =  await fetchWithError(`/api/issues?${labelsString}${statusString}`,{signal});
     
      results.forEach((issue) => {
        queryClient.setQueryData(['issues', issue.number.toString()], issue);
      });

      return results;
    }

    
    

  });

  const [searchValue, setSearchValue] = useState("")

  const searchQuery = useQuery({
    queryKey: ["issues", "search", searchValue],
    queryFn: ({signal}) => fetchWithError(`/api/search/issues?q=${searchValue}`,{signal}),
    enabled: searchValue.length > 0,
    
  });

  return (
    <div>
      <form onSubmit={(event) => {
        event.preventDefault();
        setSearchValue(event.target.elements.search.value);
      }}>
        <label htmlFor="search">Search Issues</label>
        <input type="search" placeholder="Search" name="search" id="search" onChange={(event) => {
          if(event.target.value.length === 0) {
            setSearchValue("");
          }
        }}/>
      </form>

      {searchQuery.isLoading ? (
        <p>Loading search results...</p>
      ) : searchQuery.data && searchValue.length > 0 ? (
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
      ) : issuesQuery.isLoading ? (
        <p>Loading issues...</p>
      ) : issuesQuery.isError ? (<p>{issuesQuery.error.message}</p>) : (
        <>
          <h2>Issues List {issuesQuery.isFetching ? <Loader/> : null} </h2>
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
        </>
      )}
    </div>
  );
}
