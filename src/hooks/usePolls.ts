import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Poll, PollOption, PollCategory, PollStatus, PollType } from "@/lib/supabase";

export function usePolls(status?: PollStatus, category?: PollCategory) {
  return useQuery({
    queryKey: ["polls", status, category],
    queryFn: async () => {
      let query = supabase
        .from("polls")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status as any);
      }
      if (category) {
        query = query.eq("category", category as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Poll[];
    },
  });
}

export function usePoll(pollId: string | undefined) {
  return useQuery({
    queryKey: ["poll", pollId],
    queryFn: async () => {
      if (!pollId) return null;
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .eq("id", pollId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Poll | null;
    },
    enabled: !!pollId,
  });
}

export function usePollOptions(pollId: string | undefined) {
  return useQuery({
    queryKey: ["poll_options", pollId],
    queryFn: async () => {
      if (!pollId) return [];
      const { data, error } = await supabase
        .from("poll_options")
        .select("*")
        .eq("poll_id", pollId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as PollOption[];
    },
    enabled: !!pollId,
  });
}

export function usePollResults(pollId: string | undefined) {
  return useQuery({
    queryKey: ["poll_results", pollId],
    queryFn: async () => {
      if (!pollId) return { totalVotes: 0, optionCounts: {} };

      // Get total votes
      const { count: totalVotes, error: votesError } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("poll_id", pollId);

      if (votesError) throw votesError;

      // Get vote answers with option info
      const { data: voteAnswers, error: answersError } = await supabase
        .from("vote_answers")
        .select(`
          id,
          option_id,
          votes!inner (poll_id)
        `)
        .eq("votes.poll_id", pollId);

      if (answersError) throw answersError;

      // Count votes per option
      const optionCounts: Record<string, number> = {};
      voteAnswers?.forEach((answer: any) => {
        optionCounts[answer.option_id] = (optionCounts[answer.option_id] || 0) + 1;
      });

      return { totalVotes: totalVotes || 0, optionCounts };
    },
    enabled: !!pollId,
  });
}

export function useUserVote(pollId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["user_vote", pollId, userId],
    queryFn: async () => {
      if (!pollId || !userId) return null;
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .eq("poll_id", pollId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!pollId && !!userId,
  });
}

interface CreatePollInput {
  title: string;
  description?: string;
  poll_type: PollType;
  category: PollCategory;
  status: PollStatus;
  required_demographics?: boolean;
  max_selections?: number;
  end_date?: string;
  options: string[];
}

export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePollInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create poll
      const { data: poll, error: pollError } = await supabase
        .from("polls")
        .insert({
          title: input.title,
          description: input.description,
          poll_type: input.poll_type as any,
          category: input.category as any,
          status: input.status as any,
          required_demographics: input.required_demographics || false,
          max_selections: input.max_selections,
          end_date: input.end_date,
          created_by: user.id,
        } as any)
        .select()
        .single();

      if (pollError) throw pollError;
      if (!poll) throw new Error("Failed to create poll");

      // Create options
      const optionsToInsert = input.poll_type === "yes_no"
        ? [{ poll_id: poll.id, option_text: "Yes" }, { poll_id: poll.id, option_text: "No" }]
        : input.options.map((text) => ({ poll_id: poll.id, option_text: text }));

      const { error: optionsError } = await supabase
        .from("poll_options")
        .insert(optionsToInsert as any);

      if (optionsError) throw optionsError;

      return poll as unknown as Poll;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

export function useUpdatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Poll> & { id: string }) => {
      const { data, error } = await supabase
        .from("polls")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Poll;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      queryClient.invalidateQueries({ queryKey: ["poll", data.id] });
    },
  });
}

export function useDeletePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase
        .from("polls")
        .delete()
        .eq("id", pollId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}
