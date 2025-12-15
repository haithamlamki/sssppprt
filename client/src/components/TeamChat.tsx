import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface TeamChatMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    fullName: string;
  };
}

interface TeamChatProps {
  teamId: string;
}

export function TeamChat({ teamId }: TeamChatProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: room, isLoading: roomLoading, error: roomError } = useQuery<{ id: string; teamId: string; name: string }>({
    queryKey: ["/api/teams", teamId, "chat"],
    enabled: !!teamId && isAuthenticated,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<TeamChatMessage[]>({
    queryKey: ["/api/teams", teamId, "chat", "messages"],
    enabled: !!room?.id && isAuthenticated,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  const messageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/teams/${teamId}/chat/messages`, { content });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId, "chat", "messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "فشل إرسال الرسالة",
        description: error.message || "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    messageMutation.mutate(newMessage);
  };

  if (roomLoading || messagesLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <p className="text-muted-foreground">
          لا يمكنك الوصول إلى محادثة الفريق. يجب أن تكون عضواً في الفريق.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>لا توجد رسائل بعد - ابدأ المحادثة!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.userId === user?.id ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-base">
                  {message.user.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={`flex flex-col ${message.userId === user?.id ? "items-end" : "items-start"} max-w-[70%]`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{message.user.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.createdAt), "HH:mm", { locale: ar })}
                  </span>
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.userId === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب رسالة..."
              className="flex-1 min-h-[60px] resize-none"
              dir="rtl"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={messageMutation.isPending || !newMessage.trim()}
              className="self-end"
            >
              {messageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
