import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Poster } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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
import { useState } from "react";

interface PosterCardProps {
  poster: Poster;
}

export function PosterCard({ poster }: PosterCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingVote, setPendingVote] = useState<boolean | null>(null);
  const [imageError, setImageError] = useState(false);

  const voteMutation = useMutation({
    mutationFn: async ({ isUpvote }: { isUpvote: boolean }) => {
      const response = await apiRequest('POST', `/api/posters/${poster.id}/vote`, { isUpvote });
      const data = await response.json();
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posters'] });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVoteClick = (isUpvote: boolean) => {
    setPendingVote(isUpvote);
    setShowConfirmDialog(true);
  };

  const handleConfirmVote = () => {
    if (pendingVote !== null) {
      voteMutation.mutate({ isUpvote: pendingVote });
    }
    setShowConfirmDialog(false);
    setPendingVote(null);
  };

  const handleImageError = () => {
    setImageError(true);
    toast({
      title: "Image Loading Error",
      description: "Unable to load the poster image. Please try refreshing the page.",
      variant: "destructive",
    });
  };

  const score = poster.upvotes - poster.downvotes;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-video relative">
            {imageError ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground text-sm">Image unavailable</p>
              </div>
            ) : (
              <img
                src={poster.imageUrl}
                alt={`Poster by ${poster.teamName}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            )}
          </div>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold text-center mb-4">{poster.teamName}</h2>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 ${score > 0 ? 'text-green-600' : ''}`}
                onClick={() => handleVoteClick(true)}
                disabled={voteMutation.isPending}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{poster.upvotes}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 ${score < 0 ? 'text-red-600' : ''}`}
                onClick={() => handleVoteClick(false)}
                disabled={voteMutation.isPending}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{poster.downvotes}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Vote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {pendingVote ? 'upvote' : 'downvote'} this poster? 
              This action cannot be changed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmVote}>
              Confirm Vote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}