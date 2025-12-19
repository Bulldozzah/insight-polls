import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, MoreVertical, Eye, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Poll, CATEGORY_LABELS, POLL_TYPE_LABELS } from "@/lib/supabase";
import { useDeletePoll, useUpdatePoll } from "@/hooks/usePolls";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface PollListProps {
  polls: Poll[];
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  closed: "bg-destructive/10 text-destructive",
};

export function PollList({ polls }: PollListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deletePoll = useDeletePoll();
  const updatePoll = useUpdatePoll();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePoll.mutateAsync(deleteId);
      toast.success("Poll deleted successfully");
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete poll");
    }
  };

  const handleStatusChange = async (pollId: string, newStatus: "active" | "closed") => {
    try {
      await updatePoll.mutateAsync({ id: pollId, status: newStatus });
      toast.success(`Poll ${newStatus === "active" ? "activated" : "closed"}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update poll status");
    }
  };

  if (polls.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No polls found. Create your first poll!
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {polls.map((poll, index) => (
              <motion.tr
                key={poll.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border-b last:border-0"
              >
                <TableCell className="font-medium">{poll.title}</TableCell>
                <TableCell>{CATEGORY_LABELS[poll.category]}</TableCell>
                <TableCell>{POLL_TYPE_LABELS[poll.poll_type]}</TableCell>
                <TableCell>
                  <Badge className={statusColors[poll.status]}>
                    {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(poll.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/results/${poll.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Results
                        </Link>
                      </DropdownMenuItem>
                      {poll.status === "draft" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(poll.id, "active")}>
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      {poll.status === "active" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(poll.id, "closed")}>
                          <Square className="h-4 w-4 mr-2" />
                          Close
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setDeleteId(poll.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Poll</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this poll? This action cannot be undone.
              All votes and data associated with this poll will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
