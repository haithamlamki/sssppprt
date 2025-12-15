import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2, Loader2 } from "lucide-react";
import { Reactions } from "@/components/Reactions";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface MediaComment {
  id: string;
  mediaType: string;
  mediaId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    fullName: string;
  };
}

interface MediaCommentsProps {
  mediaType: string; // gallery, highlight, news
  mediaId: string;
}

export function MediaComments({ mediaType, mediaId }: MediaCommentsProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");

  const { data: comments = [], isLoading } = useQuery<MediaComment[]>({
    queryKey: ["/api/media", mediaType, mediaId, "comments"],
    enabled: !!mediaId,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/media/${mediaType}/${mediaId}/comments`, { content });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/media", mediaType, mediaId, "comments"] });
      toast({
        title: "تم إضافة التعليق",
      });
    },
    onError: () => {
      toast({
        title: "فشل إضافة التعليق",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return await apiRequest("DELETE", `/api/media/comments/${commentId}`, {});
    },
    onSuccess: () => {
      toast({ title: "تم حذف التعليق" });
      queryClient.invalidateQueries({ queryKey: ["/api/media", mediaType, mediaId, "comments"] });
    },
    onError: () => {
      toast({ title: "فشل حذف التعليق", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-semibold">التعليقات ({comments.length})</h3>
      
      {isLoading ? (
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">لا توجد تعليقات بعد</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 bg-muted/50 rounded-lg p-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-base">{comment.user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{comment.user.fullName}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), "dd/MM/yyyy - HH:mm", { locale: ar })}
                    </span>
                  </div>
                  {user?.id === comment.userId && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                      disabled={deleteCommentMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-sm mb-2">{comment.content}</p>
                <Reactions commentType="media" commentId={comment.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقاً..."
            className="flex-1 min-h-[60px]"
            dir="rtl"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={commentMutation.isPending || !newComment.trim()}
            className="self-end"
          >
            {commentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          سجل دخولك لإضافة تعليق
        </p>
      )}
    </div>
  );
}
