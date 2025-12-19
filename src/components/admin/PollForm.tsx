import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PollCategory, PollType, PollStatus, CATEGORY_LABELS, POLL_TYPE_LABELS } from "@/lib/supabase";
import { useCreatePoll } from "@/hooks/usePolls";
import { toast } from "sonner";

const pollFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(1000).optional(),
  poll_type: z.enum(["single_choice", "multiple_choice", "yes_no"]),
  category: z.enum(["educational", "political", "market_research", "social", "economical", "corporate"]),
  status: z.enum(["draft", "active", "closed"]),
  max_selections: z.number().min(1).optional(),
});

type PollFormData = z.infer<typeof pollFormSchema>;

interface PollFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const demographicOptions = [
  { id: "age_range", label: "Age Range" },
  { id: "location", label: "Location" },
  { id: "job_title", label: "Job Title" },
  { id: "occupation_category", label: "Occupation Category" },
  { id: "employment_status", label: "Employment Status" },
];

export function PollForm({ onSuccess, onCancel }: PollFormProps) {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [requiredDemographics, setRequiredDemographics] = useState<string[]>([]);
  const createPoll = useCreatePoll();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PollFormData>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      poll_type: "single_choice",
      category: "social",
      status: "draft",
    },
  });

  const pollType = watch("poll_type");

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const toggleDemographic = (id: string, checked: boolean) => {
    if (checked) {
      setRequiredDemographics([...requiredDemographics, id]);
    } else {
      setRequiredDemographics(requiredDemographics.filter((d) => d !== id));
    }
  };

  const onSubmit = async (data: PollFormData) => {
    const validOptions = options.filter((o) => o.trim() !== "");
    
    if (pollType !== "yes_no" && validOptions.length < 2) {
      toast.error("Please add at least 2 options");
      return;
    }

    try {
      await createPoll.mutateAsync({
        title: data.title,
        description: data.description,
        poll_type: data.poll_type,
        category: data.category,
        status: data.status,
        max_selections: data.max_selections,
        required_demographics: requiredDemographics,
        options: validOptions,
      });
      toast.success("Poll created successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to create poll");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter poll question"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value as PollCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Poll Type *</Label>
              <Select
                value={watch("poll_type")}
                onValueChange={(value) => setValue("poll_type", value as PollType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POLL_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as PollStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {pollType === "multiple_choice" && (
            <div className="space-y-2">
              <Label htmlFor="max_selections">Max Selections (optional)</Label>
              <Input
                id="max_selections"
                type="number"
                min={1}
                placeholder="Leave empty for unlimited"
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  setValue("max_selections", value);
                }}
              />
            </div>
          )}

          {pollType !== "yes_no" && (
            <div className="space-y-3">
              <Label>Options *</Label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <Label>Required Demographics (optional)</Label>
            <div className="grid grid-cols-2 gap-3">
              {demographicOptions.map((demo) => (
                <div key={demo.id} className="flex items-center gap-2">
                  <Checkbox
                    id={demo.id}
                    checked={requiredDemographics.includes(demo.id)}
                    onCheckedChange={(checked) =>
                      toggleDemographic(demo.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={demo.id} className="font-normal cursor-pointer">
                    {demo.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating..." : "Create Poll"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
