import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Poll, CATEGORY_LABELS, POLL_TYPE_LABELS } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

interface PollCardProps {
  poll: Poll;
  voteCount?: number;
  hasVoted?: boolean;
  index?: number;
}

const categoryColors: Record<string, string> = {
  educational: "bg-category-educational/10 text-category-educational border-category-educational/20",
  political: "bg-category-political/10 text-category-political border-category-political/20",
  market_research: "bg-category-market-research/10 text-category-market-research border-category-market-research/20",
  social: "bg-category-social/10 text-category-social border-category-social/20",
  economical: "bg-category-economical/10 text-category-economical border-category-economical/20",
  corporate: "bg-category-corporate/10 text-category-corporate border-category-corporate/20",
};

export function PollCard({ poll, voteCount = 0, hasVoted = false, index = 0 }: PollCardProps) {
  const isActive = poll.status === "active";
  const isClosed = poll.status === "closed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className={categoryColors[poll.category]}
              >
                {CATEGORY_LABELS[poll.category]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {POLL_TYPE_LABELS[poll.poll_type]}
              </Badge>
            </div>
            {hasVoted && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Voted
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {poll.title}
            </h3>
            {poll.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {poll.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{voteCount} votes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {isActive && !hasVoted && (
              <Button asChild className="flex-1">
                <Link to={`/poll/${poll.id}`}>
                  Vote Now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild className={isActive && !hasVoted ? "" : "flex-1"}>
              <Link to={`/results/${poll.id}`}>
                View Results
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
