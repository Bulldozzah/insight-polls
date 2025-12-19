import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Profile, AgeRange, EmploymentStatus, AGE_RANGE_LABELS, EMPLOYMENT_STATUS_LABELS } from "@/lib/supabase";
import { useUpdateProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const demographicsSchema = z.object({
  age_range: z.string().optional(),
  location: z.string().max(100).optional(),
  job_title: z.string().max(100).optional(),
  occupation_category: z.string().max(100).optional(),
  employment_status: z.string().optional(),
});

type DemographicsFormData = z.infer<typeof demographicsSchema>;

interface DemographicsFormProps {
  profile: Profile | null;
  requiredFields: string[];
  onComplete: () => void;
}

export function DemographicsForm({ profile, requiredFields, onComplete }: DemographicsFormProps) {
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DemographicsFormData>({
    resolver: zodResolver(demographicsSchema),
    defaultValues: {
      age_range: profile?.age_range || "",
      location: profile?.location || "",
      job_title: profile?.job_title || "",
      occupation_category: profile?.occupation_category || "",
      employment_status: profile?.employment_status || "",
    },
  });

  const onSubmit = async (data: DemographicsFormData) => {
    try {
      await updateProfile.mutateAsync({
        age_range: data.age_range as AgeRange | undefined,
        location: data.location,
        job_title: data.job_title,
        occupation_category: data.occupation_category,
        employment_status: data.employment_status as EmploymentStatus | undefined,
      });
      toast.success("Profile updated successfully!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const isFieldRequired = (field: string) => requiredFields.includes(field);
  const isFieldMissing = (field: string) => {
    if (!isFieldRequired(field)) return false;
    const profileField = profile?.[field as keyof Profile];
    return !profileField;
  };

  const missingFields = requiredFields.filter(isFieldMissing);

  if (missingFields.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-accent/30">
      <CardHeader>
        <CardTitle className="text-lg">Complete Your Profile</CardTitle>
        <CardDescription>
          This poll requires the following information to vote.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {missingFields.includes("age_range") && (
            <div className="space-y-2">
              <Label htmlFor="age_range">Age Range *</Label>
              <Select
                value={watch("age_range")}
                onValueChange={(value) => setValue("age_range", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AGE_RANGE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {missingFields.includes("location") && (
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="City, Country"
                {...register("location")}
              />
            </div>
          )}

          {missingFields.includes("job_title") && (
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title *</Label>
              <Input
                id="job_title"
                placeholder="e.g., Software Engineer"
                {...register("job_title")}
              />
            </div>
          )}

          {missingFields.includes("occupation_category") && (
            <div className="space-y-2">
              <Label htmlFor="occupation_category">Occupation Category *</Label>
              <Input
                id="occupation_category"
                placeholder="e.g., Technology, Healthcare"
                {...register("occupation_category")}
              />
            </div>
          )}

          {missingFields.includes("employment_status") && (
            <div className="space-y-2">
              <Label htmlFor="employment_status">Employment Status *</Label>
              <Select
                value={watch("employment_status")}
                onValueChange={(value) => setValue("employment_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save & Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
