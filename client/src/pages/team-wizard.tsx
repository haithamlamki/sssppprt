import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, UserPlus, Shield, Trophy, Settings, ChevronLeft, ChevronRight,
  Save, Plus, Trash2, GripVertical, User, Phone, Mail, Calendar, Move, Upload, Loader2, ImageIcon
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Team, Player, Tournament } from "@shared/schema";

// ========== PLAYER CREATION FORM ==========
function CreatePlayerForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    phone: "",
    averageAge: "",
    email: "",
    representativeName: "",
    activationZone: "",
    activationPeriod: "",
    primaryJersey: "jersey_1",
    secondaryJersey: "jersey_2",
    thirdJersey: "jersey_3",
    position: "midfielder",
    number: "",
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Query for linkable users (users not already linked to a player)
  const { data: linkableUsers } = useQuery<{ id: string; fullName: string; employeeId: string }[]>({
    queryKey: ["/api/users/linkable"],
  });

  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setImageUrl(data.url);
        toast({ title: "تم رفع الصورة بنجاح" });
      } else {
        toast({ title: "فشل رفع الصورة", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "فشل رفع الصورة", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/players", data);
    },
    onSuccess: () => {
      toast({ title: "تم إنشاء اللاعب بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/linkable"] });
      setFormData({
        name: "", level: "", phone: "", averageAge: "", email: "",
        representativeName: "", activationZone: "", activationPeriod: "",
        primaryJersey: "jersey_1", secondaryJersey: "jersey_2", thirdJersey: "jersey_3",
        position: "midfielder", number: "",
      });
      setImageUrl("");
      setSelectedUserId("");
    },
    onError: () => {
      toast({ title: "فشل في إنشاء اللاعب", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      teamId: selectedTeamId || undefined,
      userId: selectedUserId || undefined,
      number: formData.number ? parseInt(formData.number) : undefined,
      imageUrl: imageUrl || undefined,
    });
  };

  const jerseyOptions = [
    { id: "jersey_1", label: "قميص 1" },
    { id: "jersey_2", label: "قميص 2" },
    { id: "jersey_3", label: "قميص 3" },
    { id: "jersey_4", label: "قميص 4" },
    { id: "jersey_5", label: "قميص 5" },
    { id: "jersey_6", label: "قميص 6" },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">إنشاء لاعب</CardTitle>
            <CardDescription>* يرجى ملء جميع الحقول المطلوبة بالبيانات الصحيحة</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Image and Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Image upload */}
            <div 
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="upload-player-image"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {isUploading ? (
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="صورة اللاعب" 
                  className="w-32 h-32 rounded-lg object-cover mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mb-4">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="w-4 h-4" />
                <span>{imageUrl ? "تغيير الصورة" : "رفع صورة اللاعب"}</span>
              </div>
            </div>

            {/* Right: Form fields */}
            <div className="space-y-4">
              <div>
                <Label>* اسم اللاعب (اسم المسابقة)</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم اللاعب"
                  required
                  data-testid="input-player-name"
                />
              </div>

              <div>
                <Label>* المستوى</Label>
                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                  <SelectTrigger data-testid="select-player-level">
                    <SelectValue placeholder="-- ي ح. التحديد --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">مبتدئ</SelectItem>
                    <SelectItem value="intermediate">متوسط</SelectItem>
                    <SelectItem value="advanced">متقدم</SelectItem>
                    <SelectItem value="professional">محترف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>* رقم الهاتف</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                    data-testid="input-player-phone"
                  />
                </div>
                <div>
                  <Label>سياسة (رقم الهاتف)</Label>
                  <Select defaultValue="public">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">عام</SelectItem>
                      <SelectItem value="private">خاص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>العمر المتوسط</Label>
                <Select value={formData.averageAge} onValueChange={(v) => setFormData({ ...formData, averageAge: v })}>
                  <SelectTrigger data-testid="select-player-age">
                    <SelectValue placeholder="-- ي ح. التحديد --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="25-30">25-30</SelectItem>
                    <SelectItem value="30-35">30-35</SelectItem>
                    <SelectItem value="35+">35+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Second row - Contact info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>الإيميل</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                data-testid="input-player-email"
              />
            </div>
            <div>
              <Label>الممثل</Label>
              <Input
                value={formData.representativeName}
                onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                placeholder="اسم الممثل"
                data-testid="input-player-representative"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>الفترة الزمنية للتفعيل</Label>
              <Input
                value={formData.activationPeriod}
                onChange={(e) => setFormData({ ...formData, activationPeriod: e.target.value })}
                placeholder="مثال: T2-07:23 أو CN-18:23"
                data-testid="input-activation-period"
              />
            </div>
            <div>
              <Label>منطقة التفعيل</Label>
              <Input
                value={formData.activationZone}
                onChange={(e) => setFormData({ ...formData, activationZone: e.target.value })}
                placeholder="أدخل موقع"
                data-testid="input-activation-zone"
              />
            </div>
          </div>

          {/* Jerseys */}
          <div>
            <Label className="mb-3 block">القمصان</Label>
            <div className="grid grid-cols-3 gap-4">
              {["primaryJersey", "secondaryJersey", "thirdJersey"].map((key, index) => (
                <div key={key} className="text-center">
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center mb-2 relative group cursor-pointer hover:bg-muted/70 transition-colors">
                    <div className="w-16 h-20 bg-gradient-to-b from-gray-400 to-gray-500 rounded-t-full relative">
                      <div className="absolute inset-2 bg-white/20 rounded-t-full" />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">قميص {index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Position and Number */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>المركز</Label>
              <Select value={formData.position} onValueChange={(v) => setFormData({ ...formData, position: v })}>
                <SelectTrigger data-testid="select-player-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goalkeeper">حارس مرمى</SelectItem>
                  <SelectItem value="defender">مدافع</SelectItem>
                  <SelectItem value="midfielder">وسط</SelectItem>
                  <SelectItem value="forward">مهاجم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>رقم القميص</Label>
              <Input
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="الرقم"
                data-testid="input-player-number"
              />
            </div>
          </div>

          {/* Select Team */}
          <div>
            <Label>الفريق (اختياري)</Label>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger data-testid="select-player-team">
                <SelectValue placeholder="اختر الفريق" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Link to User Account */}
          <div>
            <Label>ربط بحساب موظف (اختياري)</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger data-testid="select-player-user">
                <SelectValue placeholder={
                  !linkableUsers ? "جاري التحميل..." : 
                  linkableUsers.length === 0 ? "لا يوجد مستخدمين متاحين" : 
                  "اختر حساب الموظف"
                } />
              </SelectTrigger>
              <SelectContent>
                {linkableUsers && linkableUsers.length > 0 ? (
                  linkableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName} - {user.employeeId}
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-2 px-3 text-sm text-muted-foreground text-center">
                    {!linkableUsers ? "جاري التحميل..." : "لا يوجد مستخدمين متاحين للربط"}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={mutation.isPending}
            data-testid="button-create-player"
          >
            {mutation.isPending ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ========== TEAM CREATION FORM ==========
function CreateTeamForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    contactPhone: "",
    averageAge: "",
    contactEmail: "",
    representativeName: "",
    activationZone: "",
    activationPeriod: "",
    description: "",
    primaryJersey: "",
    secondaryJersey: "",
    thirdJersey: "",
  });

  const { data: tournaments } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setLogoUrl(data.url);
        toast({ title: "تم رفع الشعار بنجاح" });
      } else {
        toast({ title: "فشل رفع الشعار", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "فشل رفع الشعار", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/teams", data);
    },
    onSuccess: () => {
      toast({ title: "تم إنشاء الفريق بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setFormData({
        name: "", level: "", contactPhone: "", averageAge: "", contactEmail: "",
        representativeName: "", activationZone: "", activationPeriod: "", description: "",
        primaryJersey: "", secondaryJersey: "", thirdJersey: "",
      });
      setLogoUrl("");
    },
    onError: () => {
      toast({ title: "فشل في إنشاء الفريق", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      tournamentId: selectedTournamentId || undefined,
      logoUrl: logoUrl || undefined,
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xl">
              FC
            </div>
            <div>
              <CardTitle className="text-xl">إنشاء فريق</CardTitle>
              <CardDescription>* يرجى ملء جميع الحقول المطلوبة بالبيانات الصحيحة</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <UserPlus className="w-4 h-4" />
              إنشاء لاعب +
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Shield className="w-4 h-4" />
              إنشاء فريق +
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Logo upload */}
            <div 
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="upload-team-logo"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              {isUploading ? (
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="شعار الفريق" 
                  className="w-32 h-32 rounded-lg object-cover mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mb-4 text-white text-3xl font-bold">
                  FC
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="w-4 h-4" />
                <span>{logoUrl ? "تغيير الشعار" : "رفع شعار الفريق"}</span>
              </div>
            </div>

            {/* Right: Fields */}
            <div className="space-y-4">
              <div>
                <Label>* اسم الفريق</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم الفريق"
                  required
                  data-testid="input-team-name"
                />
              </div>

              <div>
                <Label>* المستوى</Label>
                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                  <SelectTrigger data-testid="select-team-level">
                    <SelectValue placeholder="-- ي ح. التحديد --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">مبتدئ</SelectItem>
                    <SelectItem value="intermediate">متوسط</SelectItem>
                    <SelectItem value="advanced">متقدم</SelectItem>
                    <SelectItem value="professional">محترف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>* رقم الهاتف</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="رقم الهاتف"
                    data-testid="input-team-phone"
                  />
                </div>
                <div>
                  <Label>سياسة (رقم الهاتف)</Label>
                  <Select defaultValue="public">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">عام</SelectItem>
                      <SelectItem value="private">خاص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>العمر المتوسط</Label>
                <Select value={formData.averageAge} onValueChange={(v) => setFormData({ ...formData, averageAge: v })}>
                  <SelectTrigger data-testid="select-team-age">
                    <SelectValue placeholder="-- ي ح. التحديد --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="25-30">25-30</SelectItem>
                    <SelectItem value="30-35">30-35</SelectItem>
                    <SelectItem value="35+">35+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>الإيميل</Label>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="example@email.com"
                data-testid="input-team-email"
              />
            </div>
            <div>
              <Label>الممثل</Label>
              <Input
                value={formData.representativeName}
                onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                placeholder="اسم الممثل"
                data-testid="input-team-representative"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>الفترة الزمنية للتفعيل</Label>
              <Input
                value={formData.activationPeriod}
                onChange={(e) => setFormData({ ...formData, activationPeriod: e.target.value })}
                placeholder="مثال: T2-07:23 أو CN-18:23"
              />
            </div>
            <div>
              <Label>منطقة التفعيل</Label>
              <Input
                value={formData.activationZone}
                onChange={(e) => setFormData({ ...formData, activationZone: e.target.value })}
                placeholder="أدخل موقع"
              />
            </div>
          </div>

          {/* Jerseys */}
          <div>
            <Label className="mb-3 block">القمصان</Label>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((num) => (
                <div key={num} className="text-center">
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center mb-2 relative group cursor-pointer hover:bg-muted/70 transition-colors">
                    <div className="w-16 h-20 bg-gradient-to-b from-gray-400 to-gray-500 rounded-t-full relative">
                      <div className="absolute inset-2 bg-white/20 rounded-t-full" />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">قميص {num}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>مقدمة</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف الفريق..."
              rows={4}
              data-testid="input-team-description"
            />
          </div>

          {/* Tournament Selection */}
          <div>
            <Label>البطولة (اختياري)</Label>
            <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
              <SelectTrigger data-testid="select-team-tournament">
                <SelectValue placeholder="اختر البطولة" />
              </SelectTrigger>
              <SelectContent>
                {tournaments?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={mutation.isPending}
            data-testid="button-create-team"
          >
            {mutation.isPending ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ========== DRAGGABLE PLAYER COMPONENT ==========
interface DraggablePlayerProps {
  id: string;
  name: string;
  number: number;
  position: { x: number; y: number };
  isDragging?: boolean;
}

function DraggablePlayer({ id, name, number, position, isDragging }: DraggablePlayerProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style: React.CSSProperties = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: transform 
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) translate(-50%, -50%)`
      : 'translate(-50%, -50%)',
    cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 10,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="absolute group"
      style={style}
      data-testid={`draggable-player-${id}`}
    >
      <div className="relative">
        <div className="w-10 h-12 bg-gradient-to-b from-red-500 to-red-600 rounded-t-full flex items-center justify-center text-white font-bold text-xs shadow-lg transition-transform group-hover:scale-110 group-active:scale-95">
          {number}
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-white bg-black/50 px-1 rounded">
          {name}
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Move className="w-2.5 h-2.5 text-gray-700" />
        </div>
      </div>
    </div>
  );
}

// ========== LINEUP/FORMATION BUILDER ==========
const formations = [
  { id: "4-3-3", name: "4-3-3", positions: ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "ST", "RW"] },
  { id: "4-4-2", name: "4-4-2", positions: ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"] },
  { id: "3-5-2", name: "3-5-2", positions: ["GK", "CB", "CB", "CB", "LWB", "CM", "CM", "CM", "RWB", "ST", "ST"] },
  { id: "4-2-3-1", name: "4-2-3-1", positions: ["GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "LW", "CAM", "RW", "ST"] },
  { id: "3-4-3", name: "3-4-3", positions: ["GK", "CB", "CB", "CB", "LM", "CM", "CM", "RM", "LW", "ST", "RW"] },
];

const positionCoordinates: { [key: string]: { [key: string]: { x: number; y: number } } } = {
  "4-3-3": {
    GK: { x: 50, y: 90 },
    LB: { x: 15, y: 70 },
    CB: { x: 35, y: 75 },
    "CB-2": { x: 65, y: 75 },
    RB: { x: 85, y: 70 },
    "CM-1": { x: 25, y: 50 },
    "CM-2": { x: 50, y: 45 },
    "CM-3": { x: 75, y: 50 },
    LW: { x: 15, y: 20 },
    ST: { x: 50, y: 15 },
    RW: { x: 85, y: 20 },
  },
  "4-4-2": {
    GK: { x: 50, y: 90 },
    LB: { x: 15, y: 70 },
    CB: { x: 35, y: 75 },
    "CB-2": { x: 65, y: 75 },
    RB: { x: 85, y: 70 },
    LM: { x: 15, y: 45 },
    "CM-1": { x: 35, y: 50 },
    "CM-2": { x: 65, y: 50 },
    RM: { x: 85, y: 45 },
    "ST-1": { x: 35, y: 20 },
    "ST-2": { x: 65, y: 20 },
  },
};

function LineupBuilder() {
  const { toast } = useToast();
  const [teamName, setTeamName] = useState("");
  const [lineupName, setLineupName] = useState("");
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const [playerCount, setPlayerCount] = useState("11");
  const [policy, setPolicy] = useState("public");
  const [fieldBackground, setFieldBackground] = useState("field_6");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [fieldRef, setFieldRef] = useState<HTMLDivElement | null>(null);

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const { data: allPlayers } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  
  // Default positions for 7 players on field
  const defaultPositions = [
    { x: 50, y: 85 }, // GK
    { x: 20, y: 65 }, // LB
    { x: 40, y: 70 }, // CB
    { x: 60, y: 70 }, // CB
    { x: 80, y: 65 }, // RB
    { x: 30, y: 40 }, // CM
    { x: 70, y: 40 }, // CM
    { x: 15, y: 20 }, // LW
    { x: 50, y: 15 }, // ST
    { x: 85, y: 20 }, // RW
    { x: 50, y: 50 }, // Extra
  ];
  
  const [lineupPlayers, setLineupPlayers] = useState<Array<{
    id: string;
    name: string;
    number: number;
    position: string;
    selected: boolean;
    fieldPosition: { x: number; y: number };
  }>>([
    { id: "1", name: "اللاعب A", number: 1, position: "goalkeeper", selected: true, fieldPosition: defaultPositions[0] },
    { id: "2", name: "اللاعب B", number: 2, position: "defender", selected: true, fieldPosition: defaultPositions[1] },
    { id: "3", name: "اللاعب C", number: 3, position: "defender", selected: true, fieldPosition: defaultPositions[2] },
    { id: "4", name: "اللاعب D", number: 4, position: "defender", selected: true, fieldPosition: defaultPositions[3] },
    { id: "5", name: "اللاعب E", number: 5, position: "defender", selected: true, fieldPosition: defaultPositions[4] },
    { id: "6", name: "اللاعب F", number: 6, position: "midfielder", selected: true, fieldPosition: defaultPositions[5] },
    { id: "7", name: "اللاعب G", number: 7, position: "midfielder", selected: true, fieldPosition: defaultPositions[6] },
    { id: "8", name: "اللاعب H", number: 8, position: "midfielder", selected: false, fieldPosition: defaultPositions[7] },
    { id: "9", name: "اللاعب I", number: 9, position: "midfielder", selected: false, fieldPosition: defaultPositions[8] },
    { id: "10", name: "اللاعب J", number: 10, position: "forward", selected: false, fieldPosition: defaultPositions[9] },
    { id: "11", name: "اللاعب K", number: 11, position: "forward", selected: false, fieldPosition: defaultPositions[10] },
  ]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    const playerId = active.id as string;
    
    if (fieldRef) {
      const fieldRect = fieldRef.getBoundingClientRect();
      
      setLineupPlayers((prev) =>
        prev.map((player) => {
          if (player.id === playerId) {
            // Calculate new position based on drag delta
            const deltaXPercent = (delta.x / fieldRect.width) * 100;
            const deltaYPercent = (delta.y / fieldRect.height) * 100;
            
            const newX = Math.max(5, Math.min(95, player.fieldPosition.x + deltaXPercent));
            const newY = Math.max(5, Math.min(95, player.fieldPosition.y + deltaYPercent));
            
            return {
              ...player,
              fieldPosition: { x: newX, y: newY },
            };
          }
          return player;
        })
      );
    }
    
    setActiveId(null);
  }, [fieldRef]);

  const positionLabels: { [key: string]: string } = {
    goalkeeper: "حارس مرمى",
    defender: "مدافع",
    midfielder: "وسط",
    forward: "مهاجم",
  };

  const handleSave = () => {
    toast({ title: "تم حفظ التشكيلة بنجاح" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Panel - Player List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            حدد اللاعبين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-right"></th>
                  <th className="py-2 text-right">* الرقم</th>
                  <th className="py-2 text-right">* الاسم على القميص</th>
                  <th className="py-2 text-right">المركز</th>
                </tr>
              </thead>
              <tbody>
                {lineupPlayers.map((player, index) => (
                  <tr key={player.id} className="border-b hover:bg-muted/50">
                    <td className="py-2">
                      <Checkbox
                        checked={player.selected}
                        onCheckedChange={(checked) => {
                          const updated = [...lineupPlayers];
                          updated[index].selected = checked as boolean;
                          setLineupPlayers(updated);
                        }}
                        className="border-primary data-[state=checked]:bg-primary"
                      />
                    </td>
                    <td className="py-2">
                      <Input
                        type="number"
                        value={player.number}
                        onChange={(e) => {
                          const updated = [...lineupPlayers];
                          updated[index].number = parseInt(e.target.value) || 0;
                          setLineupPlayers(updated);
                        }}
                        className="w-16 h-8"
                      />
                    </td>
                    <td className="py-2">
                      <Input
                        value={player.name}
                        onChange={(e) => {
                          const updated = [...lineupPlayers];
                          updated[index].name = e.target.value;
                          setLineupPlayers(updated);
                        }}
                        className="h-8"
                      />
                    </td>
                    <td className="py-2">
                      <Select
                        value={player.position}
                        onValueChange={(v) => {
                          const updated = [...lineupPlayers];
                          updated[index].position = v;
                          setLineupPlayers(updated);
                        }}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="goalkeeper">حارس مرمى</SelectItem>
                          <SelectItem value="defender">مدافع</SelectItem>
                          <SelectItem value="midfielder">وسط</SelectItem>
                          <SelectItem value="forward">مهاجم</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Formation & Settings */}
      <div className="space-y-4">
        {/* Visual Field with Drag & Drop */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <DndContext 
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div 
              ref={setFieldRef}
              className="relative aspect-[4/3] bg-gradient-to-b from-green-600 to-green-700"
              data-testid="lineup-field"
            >
              {/* Field markings */}
              <div className="absolute inset-4 border-2 border-white/50 rounded-sm">
                {/* Center line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/50" />
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/50 rounded-full" />
                {/* Penalty areas */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-16 border-2 border-t-0 border-white/50" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-16 border-2 border-b-0 border-white/50" />
              </div>

              {/* Draggable Players on field */}
              {lineupPlayers.filter(p => p.selected).slice(0, 11).map((player) => (
                <DraggablePlayer
                  key={player.id}
                  id={player.id}
                  name={player.name}
                  number={player.number}
                  position={player.fieldPosition}
                  isDragging={activeId === player.id}
                />
              ))}

              {/* Hint text */}
              <div className="absolute top-2 right-2 text-xs text-white/70 flex items-center gap-1">
                <Move className="w-3 h-3" />
                اسحب اللاعبين لتغيير مواقعهم
              </div>
            </div>

            {/* Drag Overlay for smooth dragging */}
            <DragOverlay>
              {activeId ? (
                <div className="relative">
                  <div className="w-10 h-12 bg-gradient-to-b from-red-500 to-red-600 rounded-t-full flex items-center justify-center text-white font-bold text-xs shadow-xl scale-110">
                    {lineupPlayers.find(p => p.id === activeId)?.number}
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-white bg-black/70 px-1 rounded">
                    {lineupPlayers.find(p => p.id === activeId)?.name}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </Card>

        {/* Formation Settings */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 space-y-4">
            <div>
              <Label>* اسم الفريق</Label>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="اسم الفريق"
                data-testid="input-lineup-team"
              />
            </div>

            <div>
              <Label>* اسم التشكيلة</Label>
              <Input
                value={lineupName}
                onChange={(e) => setLineupName(e.target.value)}
                placeholder="اسم التشكيلة"
                data-testid="input-lineup-name"
              />
            </div>

            <div>
              <Label>* عدد اللاعبين</Label>
              <Select value={playerCount} onValueChange={setPlayerCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="11">11</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>* التكوين</Label>
              <Select value={selectedFormation} onValueChange={setSelectedFormation}>
                <SelectTrigger data-testid="select-formation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formations.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>* سياسة</Label>
              <Select value={policy} onValueChange={setPolicy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">عام</SelectItem>
                  <SelectItem value="private">خاص</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>خلفية الملعب</Label>
              <Select value={fieldBackground} onValueChange={setFieldBackground}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="field_1">الملعب 1</SelectItem>
                  <SelectItem value="field_2">الملعب 2</SelectItem>
                  <SelectItem value="field_3">الملعب 3</SelectItem>
                  <SelectItem value="field_4">الملعب 4</SelectItem>
                  <SelectItem value="field_5">الملعب 5</SelectItem>
                  <SelectItem value="field_6">الملعب 6</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>صورة اللاعب</Label>
              <Select defaultValue="jersey_19">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => (
                    <SelectItem key={i} value={`jersey_${i + 1}`}>قميص {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                تحميل
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSave}
                data-testid="button-save-lineup"
              >
                إنشاء
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== LEAGUE/GROUPS CREATION WIZARD ==========
function CreateLeagueWizard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    policy: "private",
    location: "",
    imageUrl: "",
    leagueType: "teams", // teams or individual
    playersPerTeam: "128",
    numberOfGroups: "2",
    teamsPerGroup: "4",
    winPoints: "3",
    drawPoints: "1",
    lossPoints: "0",
    teamsAdvancing: "2",
    matchesPerTeam: "2",
    allowPlayerRegistration: false,
    enableKnockoutAfterGroups: true,
    isOpen: false,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/tournaments", data);
    },
    onSuccess: () => {
      toast({ title: "تم إنشاء الدوري بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      navigate("/leagues");
    },
    onError: () => {
      toast({ title: "فشل في إنشاء الدوري", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name: formData.name,
      sport: "football",
      type: "groups",
      status: "registration",
      maxTeams: parseInt(formData.playersPerTeam),
      hasGroupStage: true,
      numberOfGroups: parseInt(formData.numberOfGroups),
      teamsAdvancingPerGroup: parseInt(formData.teamsAdvancing),
      venues: formData.location ? [formData.location] : [],
    });
  };

  const groupOptions = [
    { icon: Users, count: "2", label: "مجموعتين" },
    { icon: Users, count: "3", label: "3 مجموعات" },
    { icon: Users, count: "4", label: "4 مجموعات" },
    { icon: Users, count: "6", label: "6 مجموعات" },
    { icon: Users, count: "8", label: "8 مجموعات" },
    { icon: Users, count: "10", label: "10 مجموعات" },
    { icon: Users, count: "12", label: "12 مجموعات" },
    { icon: Users, count: "16", label: "16 مجموعة" },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              إنشاء الدوري
            </CardTitle>
            <CardDescription>* يرجى ملء جميع الحقول المطلوبة بالبيانات الصحيحة</CardDescription>
          </div>
          <Button variant="default" size="sm">تقليص</Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/30">
              <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4">
                <Trophy className="w-16 h-16 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">صورة الدوري</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>* اسم الدوري</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم الدوري"
                  required
                  data-testid="input-league-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>* رقم الهاتف</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                    data-testid="input-league-phone"
                  />
                </div>
                <div>
                  <Label>سياسة</Label>
                  <Select value={formData.policy} onValueChange={(v) => setFormData({ ...formData, policy: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">عام</SelectItem>
                      <SelectItem value="private">خاص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>* المكان</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="أدخل موقع"
                  data-testid="input-league-location"
                />
              </div>
            </div>
          </div>

          {/* League Type Selection */}
          <div>
            <Label className="mb-3 block">نوع الدوري</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.leagueType === "teams" ? "default" : "outline"}
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => setFormData({ ...formData, leagueType: "teams" })}
                data-testid="button-league-type-teams"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <span>فرق</span>
              </Button>
              <Button
                type="button"
                variant={formData.leagueType === "individual" ? "default" : "outline"}
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => setFormData({ ...formData, leagueType: "individual" })}
                data-testid="button-league-type-individual"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <span>فردي</span>
              </Button>
            </div>
          </div>

          {/* Group Settings */}
          <div>
            <Label className="mb-3 block">* عدد المجموعات</Label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {groupOptions.map((opt) => (
                <Button
                  key={opt.count}
                  type="button"
                  variant={formData.numberOfGroups === opt.count ? "default" : "outline"}
                  className="h-auto py-3 flex flex-col gap-1"
                  onClick={() => setFormData({ ...formData, numberOfGroups: opt.count })}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs">{opt.count}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Players/Teams per group */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>* عدد المتنافسين [ 4 - 128 ]</Label>
              <Input
                type="number"
                min="4"
                max="128"
                value={formData.playersPerTeam}
                onChange={(e) => setFormData({ ...formData, playersPerTeam: e.target.value })}
                data-testid="input-players-count"
              />
            </div>
            <div>
              <Label>* عدد الفرق في كل مجموعة</Label>
              <Select value={formData.teamsPerGroup} onValueChange={(v) => setFormData({ ...formData, teamsPerGroup: v })}>
                <SelectTrigger data-testid="select-teams-per-group">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8].map((n) => (
                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Points System */}
          <div>
            <Label className="mb-3 block">* عدد المرحلة الثانية</Label>
            <p className="text-sm text-muted-foreground mb-2">عدد جميع الفرق المسموح لها بالتقدم إلى المرحلة المريح لجميع المجموعات</p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">نقاط الفوز</Label>
                <Input
                  type="number"
                  value={formData.winPoints}
                  onChange={(e) => setFormData({ ...formData, winPoints: e.target.value })}
                  className="text-center"
                />
              </div>
              <div>
                <Label className="text-xs">نقاط التعادل</Label>
                <Input
                  type="number"
                  value={formData.drawPoints}
                  onChange={(e) => setFormData({ ...formData, drawPoints: e.target.value })}
                  className="text-center"
                />
              </div>
              <div>
                <Label className="text-xs">نقاط الخسارة</Label>
                <Input
                  type="number"
                  value={formData.lossPoints}
                  onChange={(e) => setFormData({ ...formData, lossPoints: e.target.value })}
                  className="text-center"
                />
              </div>
              <div>
                <Label className="text-xs">عدد التأهل</Label>
                <Input
                  type="number"
                  value={formData.teamsAdvancing}
                  onChange={(e) => setFormData({ ...formData, teamsAdvancing: e.target.value })}
                  data-testid="input-teams-advancing"
                />
              </div>
            </div>
          </div>

          {/* Matches per team */}
          <div>
            <Label>* عدد المباريات في الدورة المجموعة</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={formData.matchesPerTeam === n.toString() ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, matchesPerTeam: n.toString() })}
                >
                  ذهاب{n === 2 ? " وإياب" : ""}
                </Button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="knockoutAfterGroups"
                checked={formData.enableKnockoutAfterGroups}
                onCheckedChange={(c) => setFormData({ ...formData, enableKnockoutAfterGroups: c as boolean })}
              />
              <Label htmlFor="knockoutAfterGroups">تفعيل وضع الطازجين - الفاشلين بعد مرحلة مرحلة المجموعات</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="allowPlayerReg"
                checked={formData.allowPlayerRegistration}
                onCheckedChange={(c) => setFormData({ ...formData, allowPlayerRegistration: c as boolean })}
              />
              <Label htmlFor="allowPlayerReg">السماح بإنشاء مجموعة في كل مباراة</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isOpen"
                checked={formData.isOpen}
                onCheckedChange={(c) => setFormData({ ...formData, isOpen: c as boolean })}
              />
              <Label htmlFor="isOpen">
                هذا الدوري مفتوح للتسجيل
                <span className="text-xs text-muted-foreground mr-2">
                  (بالاشتراك مع MyLeague، يتم تشغيل هذا الدوري دائما من قبل الإدارة ولا يسمح للفرق الأخرى)
                </span>
              </Label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={mutation.isPending}
            data-testid="button-create-league"
          >
            {mutation.isPending ? "جاري الإنشاء..." : "إنشاء الدوري"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ========== MAIN WIZARD PAGE ==========
export default function TeamWizard() {
  const [activeTab, setActiveTab] = useState("player");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary/20 to-primary/5 py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">معالج إنشاء الفرق والبطولات</h1>
          <p className="text-muted-foreground">إنشاء لاعبين وفرق وتشكيلات ودوريات بطريقة سهلة ومرئية</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="player" className="flex items-center gap-2 py-3" data-testid="tab-player">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">إنشاء لاعب</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2 py-3" data-testid="tab-team">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">إنشاء فريق</span>
            </TabsTrigger>
            <TabsTrigger value="lineup" className="flex items-center gap-2 py-3" data-testid="tab-lineup">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">إنشاء تشكيلة</span>
            </TabsTrigger>
            <TabsTrigger value="league" className="flex items-center gap-2 py-3" data-testid="tab-league">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">إنشاء دوري</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="player">
            <CreatePlayerForm />
          </TabsContent>

          <TabsContent value="team">
            <CreateTeamForm />
          </TabsContent>

          <TabsContent value="lineup">
            <LineupBuilder />
          </TabsContent>

          <TabsContent value="league">
            <CreateLeagueWizard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
