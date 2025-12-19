import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Poll, PollOption } from "@/lib/supabase";
import { useSubmitVote } from "@/hooks/useVote";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VotingFormProps {
  poll: Poll;
  options: PollOption[];
  onVoteComplete: () => void;
}

export function VotingForm({ poll, options, onVoteComplete }: VotingFormProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const submitVote = useSubmitVote();

  const handleSingleSelect = (optionId: string) => {
    setSelectedOptions([optionId]);
  };

  const handleMultiSelect = (optionId: string, checked: boolean) => {
    if (checked) {
      if (poll.max_selections && selectedOptions.length >= poll.max_selections) {
        toast.error(`You can only select up to ${poll.max_selections} options`);
        return;
      }
      setSelectedOptions([...selectedOptions, optionId]);
    } else {
      setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) {
      toast.error("Please select at least one option");
      return;
    }

    try {
      await submitVote.mutateAsync({
        pollId: poll.id,
        optionIds: selectedOptions,
      });
      toast.success("Your vote has been recorded!");
      onVoteComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit vote");
    }
  };

  const isSingleChoice = poll.poll_type === "single_choice" || poll.poll_type === "yes_no";

  return (
    <div className="space-y-6">
      {isSingleChoice ? (
        <RadioGroup
          value={selectedOptions[0] || ""}
          onValueChange={handleSingleSelect}
          className="space-y-3"
        >
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Label
                htmlFor={option.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200",
                  selectedOptions.includes(option.id)
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <span className="flex-1 text-foreground">{option.option_text}</span>
                {selectedOptions.includes(option.id) && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </Label>
            </motion.div>
          ))}
        </RadioGroup>
      ) : (
        <div className="space-y-3">
          {poll.max_selections && (
            <p className="text-sm text-muted-foreground">
              Select up to {poll.max_selections} options
            </p>
          )}
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Label
                htmlFor={option.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200",
                  selectedOptions.includes(option.id)
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) =>
                    handleMultiSelect(option.id, checked as boolean)
                  }
                />
                <span className="flex-1 text-foreground">{option.option_text}</span>
                {selectedOptions.includes(option.id) && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </Label>
            </motion.div>
          ))}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={selectedOptions.length === 0 || submitVote.isPending}
        className="w-full"
        size="lg"
      >
        {submitVote.isPending ? "Submitting..." : "Submit Vote"}
      </Button>
    </div>
  );
}
