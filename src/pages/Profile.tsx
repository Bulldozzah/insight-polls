import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { AGE_RANGE_LABELS, EMPLOYMENT_STATUS_LABELS, AgeRange, EmploymentStatus } from "@/lib/supabase";
import { toast } from "sonner";

const profileSchema = z.object({
  full_name: z.string().max(100).optional(),
  age_range: z.string().optional(),
  location: z.string().max(100).optional(),
  job_title: z.string().max(100).optional(),
  occupation_category: z.string().max(100).optional(),
  employment_status: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name || "",
      age_range: profile?.age_range || "",
      location: profile?.location || "",
      job_title: profile?.job_title || "",
      occupation_category: profile?.occupation_category || "",
      employment_status: profile?.employment_status || "",
    },
  });

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="h-96 rounded-xl bg-muted animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync({
        full_name: data.full_name,
        age_range: data.age_range as AgeRange | undefined,
        location: data.location,
        job_title: data.job_title,
        occupation_category: data.occupation_category,
        employment_status: data.employment_status as EmploymentStatus | undefined,
      });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" {...register("full_name")} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age Range</Label>
                    <Select value={watch("age_range") || ""} onValueChange={(v) => setValue("age_range", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(AGE_RANGE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="City, Country" {...register("location")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input id="job_title" {...register("job_title")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation_category">Occupation Category</Label>
                    <Input id="occupation_category" {...register("occupation_category")} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Employment Status</Label>
                    <Select value={watch("employment_status") || ""} onValueChange={(v) => setValue("employment_status", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
