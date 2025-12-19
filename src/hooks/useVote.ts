import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface SubmitVoteInput {
  pollId: string;
  optionIds: string[];
}

export function useSubmitVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pollId, optionIds }: SubmitVoteInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create vote
      const { data: vote, error: voteError } = await supabase
        .from("votes")
        .insert({
          poll_id: pollId,
          user_id: user.id,
        })
        .select()
        .single();

      if (voteError) {
        if (voteError.code === "23505") {
          throw new Error("You have already voted on this poll");
        }
        throw voteError;
      }

      // Create vote answers
      const answersToInsert = optionIds.map((optionId) => ({
        vote_id: vote.id,
        option_id: optionId,
      }));

      const { error: answersError } = await supabase
        .from("vote_answers")
        .insert(answersToInsert);

      if (answersError) throw answersError;

      return vote;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["poll_results", variables.pollId] });
      queryClient.invalidateQueries({ queryKey: ["user_vote", variables.pollId] });
    },
  });
}
