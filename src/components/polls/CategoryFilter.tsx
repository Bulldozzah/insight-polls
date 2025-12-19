import { motion } from "framer-motion";
import { PollCategory, CATEGORY_LABELS } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selected: PollCategory | null;
  onChange: (category: PollCategory | null) => void;
}

const categories: (PollCategory | null)[] = [
  null,
  "educational",
  "political",
  "market_research",
  "social",
  "economical",
  "corporate",
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <motion.button
          key={category ?? "all"}
          onClick={() => onChange(category)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            selected === category
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {category ? CATEGORY_LABELS[category] : "All"}
        </motion.button>
      ))}
    </div>
  );
}
