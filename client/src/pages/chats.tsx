import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Plus, Users, MessageSquare, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ChatRoom {
  id: string;
  type: string;
  name?: string;
  createdBy: string;
  createdAt: Date;
  members: { userId: string; fullName: string }[];
  lastMessage?: { content: string; createdAt: Date };
}

interface ChatMessage {
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

export default function Chats() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: rooms = [], isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chats"],
    enabled: isAuthenticated,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chats", selectedRoomId, "messages"],
    enabled: !!selectedRoomId && isAuthenticated,
    refetchInterval: 3000, // Poll every 3 seconds when room is open
  });

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const messageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/chats/${selectedRoomId}/messages`, { content });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chats", selectedRoomId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      // Mark as read
      if (selectedRoomId) {
        apiRequest("PUT", `/api/chats/${selectedRoomId}/read`, {});
      }
    },
    onError: () => {
      toast({
        title: "فشل إرسال الرسالة",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoomId) return;
    messageMutation.mutate(newMessage);
  };

  const filteredRooms = rooms.filter(room => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      room.name?.toLowerCase().includes(query) ||
      room.members.some(m => m.fullName.toLowerCase().includes(query))
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">سجل دخولك للوصول إلى المحادثات</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar - Chat Rooms List */}
        <Card className="w-80 flex-shrink-0">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">المحادثات</h2>
              <CreateChatDialog />
            </div>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {roomsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : filteredRooms.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد محادثات</p>
              ) : (
                filteredRooms.map((room) => {
                  const otherMembers = room.members.filter(m => m.userId !== user?.id);
                  const displayName = room.name || otherMembers.map(m => m.fullName).join(", ") || "محادثة";
                  
                  return (
                    <div
                      key={room.id}
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        apiRequest("PUT", `/api/chats/${room.id}/read`, {});
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRoomId === room.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {room.type === "group" ? (
                              <Users className="h-5 w-5" />
                            ) : (
                              otherMembers[0]?.fullName.charAt(0) || "U"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{displayName}</p>
                            {room.type === "group" && (
                              <Badge variant="outline" className="text-xs">مجموعة</Badge>
                            )}
                          </div>
                          {room.lastMessage && (
                            <p className={`text-xs truncate ${
                              selectedRoomId === room.id ? "text-primary-foreground/80" : "text-muted-foreground"
                            }`}>
                              {room.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              <CardContent className="p-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {selectedRoom.type === "group" ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          selectedRoom.members.find(m => m.userId !== user?.id)?.fullName.charAt(0) || "U"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedRoom.name || 
                         selectedRoom.members.filter(m => m.userId !== user?.id).map(m => m.fullName).join(", ") ||
                         "محادثة"}
                      </h3>
                      {selectedRoom.type === "group" && (
                        <p className="text-sm text-muted-foreground">
                          {selectedRoom.members.length} عضو
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : messages.length === 0 ? (
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

              <CardContent className="p-4 border-t flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
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
                </form>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>اختر محادثة للبدء</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

function CreateChatDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [chatType, setChatType] = useState<"direct" | "group">("direct");
  const [chatName, setChatName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allUsers = [] } = useQuery<Array<{ id: string; fullName: string; email: string }>>({
    queryKey: ["/api/users/linkable"],
    enabled: open,
  });

  const createChatMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/chats", {
        type: chatType,
        name: chatType === "group" ? chatName : undefined,
        memberIds: selectedUserIds,
      });
    },
    onSuccess: () => {
      toast({ title: "تم إنشاء المحادثة" });
      setOpen(false);
      setChatName("");
      setSelectedUserIds([]);
      setChatType("direct");
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    },
    onError: () => {
      toast({ title: "فشل إنشاء المحادثة", variant: "destructive" });
    },
  });

  const filteredUsers = allUsers.filter(u => 
    u.id !== user?.id && 
    (u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء محادثة جديدة</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">نوع المحادثة</label>
            <Select value={chatType} onValueChange={(value: "direct" | "group") => setChatType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">محادثة مباشرة</SelectItem>
                <SelectItem value="group">محادثة جماعية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {chatType === "group" && (
            <div>
              <label className="text-sm font-medium mb-2 block">اسم المجموعة</label>
              <Input
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder="اسم المجموعة"
                dir="rtl"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              {chatType === "direct" ? "اختر المستخدم" : "اختر الأعضاء"}
            </label>
            <Input
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
              dir="rtl"
            />
            <div className="border rounded-lg p-2 max-h-48 overflow-y-auto space-y-2">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                  onClick={() => {
                    if (chatType === "direct") {
                      setSelectedUserIds([u.id]);
                    } else {
                      setSelectedUserIds(prev =>
                        prev.includes(u.id)
                          ? prev.filter(id => id !== u.id)
                          : [...prev, u.id]
                      );
                    }
                  }}
                >
                  <input
                    type={chatType === "direct" ? "radio" : "checkbox"}
                    checked={selectedUserIds.includes(u.id)}
                    onChange={() => {}}
                    className="cursor-pointer"
                    aria-label={`اختر ${u.fullName}`}
                  />
                  <span className="flex-1">{u.fullName}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => createChatMutation.mutate()}
            disabled={createChatMutation.isPending || 
                     (chatType === "group" && !chatName.trim()) ||
                     selectedUserIds.length === 0}
            className="w-full"
          >
            {createChatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            إنشاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
