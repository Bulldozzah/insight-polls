import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PollCard } from "@/components/polls/PollCard";
import { CategoryFilter } from "@/components/polls/CategoryFilter";
import { usePolls } from "@/hooks/usePolls";
import { PollCategory } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Polls() {
  const [selectedCategory, setSelectedCategory] = useState<PollCategory | null>(null);
  const [status, setStatus] = useState<"active" | "closed">("active");
  
  const { data: polls, isLoading } = usePolls(status, selectedCategory || undefined);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Browse Polls</h1>
          <p className="text-muted-foreground">Discover and participate in polls across various categories</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Tabs value={status} onValueChange={(v) => setStatus(v as "active" | "closed")}>
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
            </Tabs>
            <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : polls && polls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {polls.map((poll, index) => (
                <PollCard key={poll.id} poll={poll} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              No {status} polls found{selectedCategory ? ` in ${selectedCategory}` : ""}.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
