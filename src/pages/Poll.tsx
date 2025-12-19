import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VotingForm } from "@/components/polls/VotingForm";
import { DemographicsForm } from "@/components/polls/DemographicsForm";
import { usePoll, usePollOptions, useUserVote, usePollResults } from "@/hooks/usePolls";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORY_LABELS, POLL_TYPE_LABELS, Profile } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

export default function Poll() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: poll, isLoading: loadingPoll } = usePoll(id);
  const { data: options } = usePollOptions(id);
  const { data: userVote } = useUserVote(id, user?.id);
  const { data: profile, refetch: refetchProfile } = useProfile(user?.id);
  const { data: results } = usePollResults(id);
  const [demographicsComplete, setDemographicsComplete] = useState(false);

  if (loadingPoll) {
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

  const requiresDemographics = poll.required_demographics === true;
  const hasVoted = !!userVote;
  const isActive = poll.status === "active";

  const checkDemographicsMissing = () => {
    if (!requiresDemographics) return false;
    // Check if any common demographic fields are missing
    return !profile?.age_range || !profile?.location || !profile?.employment_status;
  };

  const demographicsMissing = checkDemographicsMissing() && !demographicsComplete;

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{CATEGORY_LABELS[poll.category]}</Badge>
                <Badge variant="secondary">{POLL_TYPE_LABELS[poll.poll_type]}</Badge>
              </div>
              <CardTitle className="font-display text-2xl">{poll.title}</CardTitle>
              {poll.description && (
                <p className="text-muted-foreground mt-2">{poll.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{results?.totalVotes || 0} votes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!user ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Sign in to vote on this poll</p>
                  <Button asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </div>
              ) : hasVoted ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You've already voted on this poll</p>
                  <Button asChild>
                    <Link to={`/results/${poll.id}`}>View Results</Link>
                  </Button>
                </div>
              ) : !isActive ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">This poll is no longer active</p>
                  <Button asChild>
                    <Link to={`/results/${poll.id}`}>View Results</Link>
                  </Button>
                </div>
              ) : demographicsMissing ? (
                <DemographicsForm
                  profile={profile}
                  requiredFields={["age_range", "location", "employment_status"]}
                  onComplete={() => {
                    refetchProfile();
                    setDemographicsComplete(true);
                  }}
                />
              ) : options ? (
                <VotingForm
                  poll={poll}
                  options={options}
                  onVoteComplete={() => navigate(`/results/${poll.id}`)}
                />
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
