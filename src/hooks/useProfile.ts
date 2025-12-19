import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Profile, AgeRange, EmploymentStatus } from "@/lib/supabase";

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Profile | null;
    },
    enabled: !!userId,
  });
}

interface UpdateProfileInput {
  full_name?: string;
  age_range?: AgeRange;
  location?: string;
  job_title?: string;
  occupation_category?: string;
  employment_status?: EmploymentStatus;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update(input as any)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", data?.id] });
    },
  });
}
