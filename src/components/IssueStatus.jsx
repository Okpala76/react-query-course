import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StatusSelect } from "./StatusSelect";



export default function IssueStatus({status , issueNumber}) {
    const queryClient = useQueryClient();
    const setStatus = useMutation({
        mutationFn: async (status) => {
            const response = await fetch(`/api/issues/${issueNumber}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log(response);
            return response.json();
        },
        onMutate: async (status) => {
            await queryClient.cancelQueries(["issues", issueNumber]);

            const previousIssue = queryClient.getQueryData(["issues", issueNumber]);

            queryClient.setQueryData(["issues", issueNumber], (old) => ({
                ...old,
                status,
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
                <span>Status</span>
                <StatusSelect noEmptyOption={status} onChange={(event)  => {
                    setStatus.mutate(event.target.value)
                }}/>
            </div>
        </div>
    )
}