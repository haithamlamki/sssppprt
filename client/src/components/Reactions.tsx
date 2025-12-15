import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThumbsUp, Heart, PartyPopper, HandHeart } from "lucide-react";

const reactionTypes = [
  { type: "like", label: "إعجاب", icon: ThumbsUp, emoji: "👍" },
  { type: "love", label: "حب", icon: Heart, emoji: "❤️" },
  { type: "celebrate", label: "احتفال", icon: PartyPopper, emoji: "🎉" },
  { type: "support", label: "دعم", icon: HandHeart, emoji: "🤝" },
];

interface ReactionsProps {
  commentType: string; // match, tournament, media, forum
  commentId: string;
}

export function Reactions({ commentType, commentId }: ReactionsProps) {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { data: reactions = [] } = useQuery<{ reactionType: string; count: number; userReaction?: string }[]>({
    queryKey: ["/api/comments", commentType, commentId, "reactions"],
    enabled: !!commentId,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const addReactionMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      return await apiRequest("POST", `/api/comments/${commentType}/${commentId}/reactions`, {
        reactionType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", commentType, commentId, "reactions"] });
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/comments/${commentType}/${commentId}/reactions`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", commentType, commentId, "reactions"] });
    },
  });

  const userReaction = reactions.find(r => r.userReaction)?.reactionType;
  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  const handleReaction = (reactionType: string) => {
    if (!isAuthenticated) return;
    if (userReaction === reactionType) {
      removeReactionMutation.mutate();
    } else {
      addReactionMutation.mutate(reactionType);
    }
    setIsOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        {reactions.map((reaction) => (
          <span key={reaction.reactionType} className="text-sm text-muted-foreground">
            {reactionTypes.find(r => r.type === reaction.reactionType)?.emoji} {reaction.count}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
          >
            {userReaction ? (
              <span>{reactionTypes.find(r => r.type === userReaction)?.emoji}</span>
            ) : (
              <ThumbsUp className="h-3 w-3" />
            )}
            {totalReactions > 0 && <span className="mr-1">{totalReactions}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-2">
            {reactionTypes.map((reaction) => (
              <Button
                key={reaction.type}
                variant={userReaction === reaction.type ? "default" : "ghost"}
                size="sm"
                className="h-10 w-10 p-0"
                onClick={() => handleReaction(reaction.type)}
                title={reaction.label}
              >
                <span className="text-lg">{reaction.emoji}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {reactions.filter(r => r.reactionType !== userReaction && r.count > 0).map((reaction) => (
        <span key={reaction.reactionType} className="text-xs text-muted-foreground">
          {reactionTypes.find(r => r.type === reaction.reactionType)?.emoji} {reaction.count}
        </span>
      ))}
    </div>
  );
}
