import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AddIssue() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Mutation function to add an issue
  const addIssueMutation = useMutation({
    mutationFn: async (issueBody) => {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issueBody),
      }).then((res) => res.json());
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["issues"]});
      queryClient.setQueryData(["issues", data.number.toString()], data);
      navigate(`/issue/${data.number}`);
    },
    onSettled: () => {
      console.log("Mutation settled, success or failure");
    },
  });

  return (
    <div className="add-issue">
      <h2>Add Issues</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (addIssueMutation.isPending) return;

          const title = event.target.title.value.trim();
          const comment = event.target.comment.value.trim();

          if (!title || !comment) {
            alert("Please fill in all fields");
            return;
          }

          addIssueMutation.mutate({ title, comment });
        }}
      >
        <label htmlFor="title">Title</label>
        <input type="text" id="title" name="title" placeholder="Title" />
        <label htmlFor="comment">Comment</label>
        <textarea id="comment" name="comment" placeholder="Comment"></textarea>
        <button type="submit" disabled={addIssueMutation.isPending}>
          {addIssueMutation.isPending ? "Loading ..." : "Add Issue"}
        </button>
      </form>
    </div>
  );
}
