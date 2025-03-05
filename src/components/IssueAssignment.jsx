import { GoGear } from "react-icons/go";
import { useState } from "react";
import { useUserData } from "../helpers/useUserData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function IssueAssignment({ assignee, issueNumber }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const user = useUserData(assignee);

    const usersQuery = useQuery({
        queryKey: ["users"], 
        queryFn: () => fetch("/api/users").then((res) => res.json())
    });

    const queryClient = useQueryClient();

    const setAssignment = useMutation({
        mutationFn: async (assignee) => {
            const response = await fetch(`/api/issues/${issueNumber}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assignee }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log(response);
            return response.json();
        },
        onMutate: async (assignee) => {
            await queryClient.cancelQueries(["issues", issueNumber]);

            const previousIssue = queryClient.getQueryData(["issues", issueNumber]).assignee;

            queryClient.setQueryData(["issues", issueNumber], (old) => ({
                ...old,
                assignee,
            }));

            return { previousIssue };
        },
        onError: (err, newStatus, context) => {
            queryClient.setQueryData(["issues", issueNumber], context.previousIssue);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["issues", issueNumber] });
        },
    });

    return (
        <div className="issue-options">
            <div>
                <span>Assignment</span>
                {
                    user.isSuccess && (
                        <div>
                            <img src={user.data.profilePictureUrl} alt="Assignee Avatar" />
                            <span>{user.data.name}</span>
                        </div>)
                }
            </div>
            <GoGear onClick={() => !usersQuery.isLoading && setMenuOpen((open) => !open)}/>
                {menuOpen && (
                    <div className="picker-menu">
                        {usersQuery.data?.map((user) => (
                            <div key={user.id} onClick={() => {setAssignment.mutate(user.id); setMenuOpen(false)}}>
                                <img src={user.profilePictureUrl} alt="Assignee Avatar" />
                                {user.name}
                                </div>
                        ))}
                    </div>
                   )}
        </div>
    )}
                