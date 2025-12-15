import { useState } from "react";
import { 
  MessageSquare, Heart, Send, User, Calendar, 
  Loader2, Filter, Plus, Trash2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { ForumPostWithUser, ForumComment } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryLabels: Record<string, string> = {
  general: "عام",
  football: "كرة قدم",
  basketball: "كرة سلة",
  marathon: "جري",
  family: "عائلي",
};

export default function Forum() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery<ForumPostWithUser[]>({
    queryKey: ["/api/forum/posts"],
  });

  const filteredPosts = selectedCategory === "all" 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <Badge variant="outline" className="text-sm px-4 py-2" data-testid="badge-forum">
            المنتدى التفاعلي
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            تواصل مع زملائك
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            شارك أفكارك وتجاربك الرياضية مع الجميع
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]" data-testid="select-category">
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isAuthenticated ? (
            <CreatePostDialog />
          ) : (
            <Button onClick={() => navigate("/login")} data-testid="button-login-to-post">
              <Plus className="h-4 w-4 mr-2" />
              سجل دخولك للمشاركة
            </Button>
          )}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <Card className="text-center p-12">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">لا توجد منشورات بعد</h3>
              <p className="text-muted-foreground">
                كن أول من يشارك في المنتدى!
              </p>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                isExpanded={expandedPost === post.id}
                onToggleExpand={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ 
  post, 
  isExpanded, 
  onToggleExpand 
}: { 
  post: ForumPostWithUser; 
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/forum/posts/${post.id}/like`, {});
    },
    onSuccess: (data: any) => {
      setIsLiked(data.liked);
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/forum/posts/${post.id}`, {});
    },
    onSuccess: () => {
      toast({ title: "تم حذف المنشور" });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "سجل دخولك للإعجاب بالمنشورات",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  return (
    <Card className="hover-elevate transition-all" data-testid={`post-${post.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{post.user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.user.fullName}</p>
              <div className="flex items-center gap-2 text-base text-muted-foreground">
                <span>{post.user.department}</span>
                <span>·</span>
                <span>{new Date(post.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{categoryLabels[post.category] || post.category}</Badge>
            {user?.id === post.userId && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                data-testid={`delete-post-${post.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
        
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt="" 
            className="rounded-lg max-h-96 w-full object-cover"
          />
        )}

        <div className="flex items-center gap-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={isLiked ? "text-destructive" : ""}
            data-testid={`like-post-${post.id}`}
          >
            <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            data-testid={`comments-post-${post.id}`}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            {post.commentsCount} تعليق
          </Button>
        </div>

        {isExpanded && <CommentsSection postId={post.id} />}
      </CardContent>
    </Card>
  );
}

function CommentsSection({ postId }: { postId: string }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: comments = [], isLoading } = useQuery<(ForumComment & { user: { fullName: string; department: string } })[]>({
    queryKey: ["/api/forum/posts", postId, "comments"],
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/forum/posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
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
      return await apiRequest("DELETE", `/api/forum/comments/${commentId}`, {});
    },
    onSuccess: () => {
      toast({ title: "تم حذف التعليق" });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
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
    <div className="mt-4 pt-4 border-t space-y-4">
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
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium">{comment.user.fullName}</p>
                    <span className="text-base text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  {user?.id === comment.userId && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                      disabled={deleteCommentMutation.isPending}
                      data-testid={`delete-comment-${comment.id}`}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-base">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقاً..."
            className="flex-1"
            data-testid="input-new-comment"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={commentMutation.isPending || !newComment.trim()}
            data-testid="button-submit-comment"
          >
            {commentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      ) : (
        <p className="text-center text-base text-muted-foreground">
          سجل دخولك لإضافة تعليق
        </p>
      )}
    </div>
  );
}

function CreatePostDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");

  const mutation = useMutation({
    mutationFn: async (data: { content: string; category: string }) => {
      return await apiRequest("POST", "/api/forum/posts", data);
    },
    onSuccess: () => {
      toast({ title: "تم نشر المنشور بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setOpen(false);
      setContent("");
      setCategory("general");
    },
    onError: () => {
      toast({ title: "فشل نشر المنشور", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutation.mutate({ content, category });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-post">
          <Plus className="h-4 w-4 mr-2" />
          منشور جديد
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إنشاء منشور جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-post-category">
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="شارك أفكارك..."
              className="min-h-[120px]"
              data-testid="textarea-post-content"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={mutation.isPending || !content.trim()}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "نشر"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
