import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Users, Vote, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { PollCard } from "@/components/polls/PollCard";
import { CategoryFilter } from "@/components/polls/CategoryFilter";
import { usePolls } from "@/hooks/usePolls";
import { useAuth } from "@/hooks/useAuth";
import { PollCategory } from "@/lib/supabase";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<PollCategory | null>(null);
  const { data: activePolls, isLoading: loadingActive } = usePolls("active", selectedCategory || undefined);
  const { data: closedPolls, isLoading: loadingClosed } = usePolls("closed");
  const { user } = useAuth();

  const totalVotes = 0; // Would compute from actual data
  const totalPolls = (activePolls?.length || 0) + (closedPolls?.length || 0);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Your Voice Matters.{" "}
              <span className="gradient-text">Make It Count.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              PulseVote is a secure polling platform for gathering insights across 
              education, politics, market research, and more. Join thousands making their opinions heard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button variant="hero" size="xl" asChild>
                  <Link to="/polls">
                    Browse Polls
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="hero" size="xl" asChild>
                    <Link to="/auth">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="hero-outline" size="xl" asChild>
                    <Link to="/polls">View Polls</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
          >
            {[
              { icon: Vote, label: "Active Polls", value: activePolls?.length || 0 },
              { icon: Users, label: "Total Participants", value: "1,200+" },
              { icon: BarChart3, label: "Categories", value: 6 },
              { icon: TrendingUp, label: "Completed Polls", value: closedPolls?.length || 0 },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-card/50 border border-border/50 text-center"
              >
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Active Polls */}
      <section className="py-16 container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Active Polls
            </h2>
            <p className="text-muted-foreground mt-1">
              Cast your vote and make your voice heard
            </p>
          </div>
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {loadingActive ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : activePolls && activePolls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePolls.slice(0, 6).map((poll, index) => (
              <PollCard key={poll.id} poll={poll} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No active polls at the moment. Check back soon!
          </div>
        )}

        {activePolls && activePolls.length > 6 && (
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/polls">View All Polls</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Recent Results */}
      {closedPolls && closedPolls.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
              Recent Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedPolls.slice(0, 3).map((poll, index) => (
                <PollCard key={poll.id} poll={poll} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
