import * as React from "react";
import { useQuery , useQueryClient} from "@tanstack/react-query";

/**
 * Create a component that fetches data from the
 * `https://ui.dev/api/courses/react-query/users` endpoint.
 * It should include a loading indicator, and render the
 * data to a list of users (name only). Give the query a
 * stale time of 5 minutes.
 *
 * Finally, include a button that will invalidate the query,
 * causing a refetch.
 */
export default function Cruise() {

  const queryClient = useQueryClient();  // get the query client instance

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: ({signal}) => fetch("https://ui.dev/api/courses/react-query/users", {signal}).then(res => res.json()),
    staleTime: 5 * 1000 * 60
    
}) 
  console.log(usersQuery.data)

  return <div>
    {usersQuery.isLoading ? <p>Loading ...</p> :
      <ul>
        {usersQuery.data.map((user) => <li>{user.name}</li>) }
      </ul>
    }

    {!usersQuery.isStale && (
        <button
          onClick={() => {
            queryClient.invalidateQueries(["users"]);
          }}
        >
          Invalidate Query
        </button>
      )}    
  </div>;
}
