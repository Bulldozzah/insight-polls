import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Calendar, BarChart2, PieChart } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsChart } from "@/components/polls/ResultsChart";
import { usePoll, usePollOptions, usePollResults } from "@/hooks/usePolls";
import { CATEGORY_LABELS, POLL_TYPE_LABELS } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const { data: poll, isLoading } = usePoll(id);
  const { data: options } = usePollOptions(id);
  const { data: results } = usePollResults(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="h-96 rounded-xl bg-muted animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!poll) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Poll Not Found</h1>
          <Button asChild>
            <Link to="/polls">Back to Polls</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/polls">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Polls
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{CATEGORY_LABELS[poll.category]}</Badge>
                <Badge variant="secondary">{POLL_TYPE_LABELS[poll.poll_type]}</Badge>
                <Badge className={poll.status === "active" ? "bg-primary/10 text-primary" : "bg-muted"}>
                  {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
                </Badge>
              </div>
              <CardTitle className="font-display text-2xl">{poll.title}</CardTitle>
              {poll.description && (
                <p className="text-muted-foreground mt-2">{poll.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{results?.totalVotes || 0} total votes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Bar Chart
                </Button>
                <Button
                  variant={chartType === "pie" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("pie")}
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Pie Chart
                </Button>
              </div>

              {options && results ? (
                <ResultsChart
                  options={options}
                  optionCounts={results.optionCounts}
                  totalVotes={results.totalVotes}
                  chartType={chartType}
                />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Loading results...
                </div>
              )}

              {poll.status === "active" && (
                <div className="mt-6 pt-6 border-t text-center">
                  <Button asChild>
                    <Link to={`/poll/${poll.id}`}>Vote on this Poll</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
