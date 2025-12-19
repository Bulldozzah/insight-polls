import { supabase } from "@/integrations/supabase/client";

export { supabase };

// Type definitions matching the database schema
export type PollType = "single_choice" | "multiple_choice" | "yes_no";
export type PollStatus = "draft" | "active" | "scheduled" | "closed";
export type PollCategory = "politics" | "entertainment" | "sports" | "technology" | "lifestyle" | "other";
export type AppRole = "admin" | "moderator" | "user";
export type AgeRange = "18-26" | "27-35" | "36-45" | "46-55" | "56-65" | "65+";
export type EmploymentStatus = "employed" | "self_employed" | "unemployed" | "student" | "retired" | "other";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  age_range: AgeRange | null;
  location: string | null;
  job_title: string | null;
  occupation_category: string | null;
  employment_status: EmploymentStatus | null;
  created_at: string;
  updated_at: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  poll_type: PollType;
  category: PollCategory;
  status: PollStatus;
  required_demographics: boolean;
  max_selections: number | null;
  created_by: string | null;
  start_date: string | null;
  end_date: string | null;
  total_votes: number;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
  created_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  user_id: string;
  created_at: string;
}

export interface VoteAnswer {
  id: string;
  vote_id: string;
  option_id: string;
  created_at: string;
}

export const CATEGORY_LABELS: Record<PollCategory, string> = {
  politics: "Politics",
  entertainment: "Entertainment",
  sports: "Sports",
  technology: "Technology",
  lifestyle: "Lifestyle",
  other: "Other",
};

export const POLL_TYPE_LABELS: Record<PollType, string> = {
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  yes_no: "Yes / No",
};

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  "18-26": "18-26",
  "27-35": "27-35",
  "36-45": "36-45",
  "46-55": "46-55",
  "56-65": "56-65",
  "65+": "65+",
};

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  employed: "Employed",
  self_employed: "Self-Employed",
  unemployed: "Unemployed",
  student: "Student",
  retired: "Retired",
  other: "Other",
};
