import { useState } from "react";
import { 
  Calendar, Users, Trophy, ImageIcon, Newspaper, 
  Plus, Pencil, Trash2, Loader2, Shield, BarChart3, Target 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { Event, News, Result, Stats, User, Gallery, Tournament } from "@shared/schema";
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

export default function Admin() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");

  const isAdmin = user?.role === "admin" || user?.role === "committee_member";

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    enabled: isAdmin,
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: isAdmin,
  });

  const { data: news = [] } = useQuery<News[]>({
    queryKey: ["/api/news"],
    enabled: isAdmin,
  });

  const { data: results = [] } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    enabled: isAdmin,
  });

  const { data: allUsers = [] } = useQuery<Omit<User, 'password'>[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin,
  });

  const { data: gallery = [] } = useQuery<Gallery[]>({
    queryKey: ["/api/gallery"],
    enabled: isAdmin,
  });

  const { data: tournamentsList = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
    enabled: isAdmin,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({ title: "تم تحديث الصلاحية" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({ title: "فشل تحديث الصلاحية", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/users/${userId}/status`, { isActive });
    },
    onSuccess: () => {
      toast({ title: "تم تحديث حالة المستخدم" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({ title: "فشل تحديث الحالة", variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">يجب تسجيل الدخول</h2>
          <p className="text-muted-foreground mb-6">
            يرجى تسجيل الدخول للوصول إلى لوحة التحكم
          </p>
          <Button onClick={() => navigate("/login")} data-testid="button-login">
            تسجيل الدخول
          </Button>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Shield className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-4">غير مصرح</h2>
          <p className="text-muted-foreground mb-6">
            ليس لديك صلاحية للوصول إلى لوحة التحكم الإدارية
          </p>
          <Button onClick={() => navigate("/")} data-testid="button-home">
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground">إدارة الفعاليات والمحتوى</p>
          </div>
          <Badge className="bg-primary">{user.role === "admin" ? "مدير" : "عضو لجنة"}</Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <BarChart3 className="h-4 w-4 ml-2" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-events">
              <Calendar className="h-4 w-4 ml-2" />
              الفعاليات
            </TabsTrigger>
            <TabsTrigger value="tournaments" data-testid="tab-tournaments">
              <Target className="h-4 w-4 ml-2" />
              البطولات
            </TabsTrigger>
            <TabsTrigger value="news" data-testid="tab-news">
              <Newspaper className="h-4 w-4 ml-2" />
              الأخبار
            </TabsTrigger>
            <TabsTrigger value="results" data-testid="tab-results">
              <Trophy className="h-4 w-4 ml-2" />
              النتائج
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="h-4 w-4 ml-2" />
              المستخدمين
            </TabsTrigger>
            <TabsTrigger value="gallery" data-testid="tab-gallery">
              <ImageIcon className="h-4 w-4 ml-2" />
              المعرض
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الفعاليات</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">المشاركون</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalParticipants || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">الإنجازات</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalAchievements || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">الأنشطة</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeSports || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>آخر الفعاليات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {event.currentParticipants || 0} مشارك
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">إدارة الفعاليات</h2>
              <AddEventDialog />
            </div>
            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id} data-testid={`admin-event-${event.id}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('ar-SA')} - {event.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {event.currentParticipants || 0} / {event.maxParticipants || "∞"}
                      </Badge>
                      <Badge>{event.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  إدارة البطولات
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-tournament">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة بطولة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>إضافة بطولة جديدة</DialogTitle>
                    </DialogHeader>
                    <AddTournamentForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] })} />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournamentsList.map((t) => (
                    <Card key={t.id} className="hover-elevate" data-testid={`card-admin-tournament-${t.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Target className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold">{t.name}</h4>
                            <Badge 
                              className={
                                t.status === "registration" ? "bg-emerald-500" :
                                t.status === "ongoing" ? "bg-orange-500" : "bg-gray-500"
                              }
                            >
                              {t.status === "registration" ? "التسجيل مفتوح" :
                               t.status === "ongoing" ? "جارية" : "منتهية"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{t.description}</p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => window.open(`/leagues/${t.id}`, '_blank')}
                            data-testid={`button-view-${t.id}`}
                          >
                            عرض
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tournamentsList.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد بطولات بعد</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">إدارة الأخبار</h2>
              <AddNewsDialog />
            </div>
            <div className="grid gap-4">
              {news.map((item) => (
                <Card key={item.id} data-testid={`admin-news-${item.id}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString('ar-SA')}
                      </p>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">إدارة النتائج</h2>
              <AddResultDialog />
            </div>
            <div className="grid gap-4">
              {results.map((result) => (
                <Card key={result.id} data-testid={`admin-result-${result.id}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{result.tournamentName}</h3>
                      <p className="text-sm text-muted-foreground">
                        الفائز: {result.winner}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.date).toLocaleDateString('ar-SA')}
                      </p>
                      <Badge variant="outline">{result.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">إدارة المعرض</h2>
              <AddGalleryDialog />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <Card key={item.id} data-testid={`admin-gallery-${item.id}`}>
                  <div className="h-40 overflow-hidden">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.eventDate ? new Date(item.eventDate).toLocaleDateString('ar-SA') : ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">إدارة المستخدمين</h2>
              <Badge variant="outline">{allUsers.length} مستخدم</Badge>
            </div>
            <div className="grid gap-4">
              {allUsers.map((userItem) => (
                <Card key={userItem.id} data-testid={`admin-user-${userItem.id}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{userItem.fullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {userItem.department} - {userItem.position}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {userItem.email} | رقم الموظف: {userItem.employeeId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={userItem.role}
                        onValueChange={(role) => updateRoleMutation.mutate({ userId: userItem.id, role })}
                        disabled={updateRoleMutation.isPending || userItem.id === user?.id}
                      >
                        <SelectTrigger className="w-[140px]" data-testid={`select-role-${userItem.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">موظف</SelectItem>
                          <SelectItem value="committee_member">عضو لجنة</SelectItem>
                          <SelectItem value="admin">مدير</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant={userItem.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ userId: userItem.id, isActive: !userItem.isActive })}
                        disabled={updateStatusMutation.isPending || userItem.id === user?.id}
                        data-testid={`toggle-status-${userItem.id}`}
                      >
                        {userItem.isActive ? "تعطيل" : "تفعيل"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AddEventDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "football",
    date: "",
    location: "",
    maxParticipants: "",
    requirements: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/events", data);
    },
    onSuccess: () => {
      toast({ title: "تمت الإضافة", description: "تم إضافة الفعالية بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "football",
        date: "",
        location: "",
        maxParticipants: "",
        requirements: "",
      });
    },
    onError: () => {
      toast({ title: "فشلت الإضافة", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      date: new Date(formData.date),
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      imageUrl: "/assets/football.png",
      status: "upcoming",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-event">
          <Plus className="h-4 w-4 ml-2" />
          إضافة فعالية
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة فعالية جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>عنوان الفعالية</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>الوصف</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>النوع</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="football">كرة قدم</SelectItem>
                <SelectItem value="basketball">كرة سلة</SelectItem>
                <SelectItem value="marathon">ماراثون</SelectItem>
                <SelectItem value="family">عائلي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>التاريخ والوقت</Label>
            <Input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>المكان</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>الحد الأقصى للمشاركين</Label>
            <Input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
            />
          </div>
          <div>
            <Label>الشروط</Label>
            <Textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddNewsDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "announcement",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/news", data);
    },
    onSuccess: () => {
      toast({ title: "تمت الإضافة", description: "تم إضافة الخبر بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setOpen(false);
      setFormData({ title: "", content: "", category: "announcement" });
    },
    onError: () => {
      toast({ title: "فشلت الإضافة", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...formData, date: new Date() });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-news">
          <Plus className="h-4 w-4 ml-2" />
          إضافة خبر
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة خبر جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>العنوان</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>المحتوى</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>النوع</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">إعلان</SelectItem>
                <SelectItem value="result">نتيجة</SelectItem>
                <SelectItem value="achievement">إنجاز</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddResultDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    tournamentName: "",
    winner: "",
    runnerUp: "",
    thirdPlace: "",
    category: "football",
    date: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/results", data);
    },
    onSuccess: () => {
      toast({ title: "تمت الإضافة", description: "تم إضافة النتيجة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setOpen(false);
      setFormData({
        tournamentName: "",
        winner: "",
        runnerUp: "",
        thirdPlace: "",
        category: "football",
        date: "",
      });
    },
    onError: () => {
      toast({ title: "فشلت الإضافة", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      date: new Date(formData.date),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-result">
          <Plus className="h-4 w-4 ml-2" />
          إضافة نتيجة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة نتيجة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>اسم البطولة</Label>
            <Input
              value={formData.tournamentName}
              onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>الفائز (المركز الأول)</Label>
            <Input
              value={formData.winner}
              onChange={(e) => setFormData({ ...formData, winner: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>المركز الثاني</Label>
            <Input
              value={formData.runnerUp}
              onChange={(e) => setFormData({ ...formData, runnerUp: e.target.value })}
            />
          </div>
          <div>
            <Label>المركز الثالث</Label>
            <Input
              value={formData.thirdPlace}
              onChange={(e) => setFormData({ ...formData, thirdPlace: e.target.value })}
            />
          </div>
          <div>
            <Label>النوع</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="football">كرة قدم</SelectItem>
                <SelectItem value="basketball">كرة سلة</SelectItem>
                <SelectItem value="marathon">ماراثون</SelectItem>
                <SelectItem value="family">عائلي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>التاريخ</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddGalleryDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "football",
    imageUrl: "",
    eventDate: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/gallery", data);
    },
    onSuccess: () => {
      toast({ title: "تمت الإضافة", description: "تم إضافة الصورة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setOpen(false);
      setFormData({ title: "", description: "", category: "football", imageUrl: "", eventDate: "" });
    },
    onError: () => {
      toast({ title: "فشلت الإضافة", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      eventDate: formData.eventDate ? new Date(formData.eventDate) : new Date(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-gallery">
          <Plus className="h-4 w-4 ml-2" />
          إضافة صورة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة صورة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>العنوان</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>الوصف</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label>رابط الصورة</Label>
            <Input
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <Label>النوع</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="football">كرة قدم</SelectItem>
                <SelectItem value="basketball">كرة سلة</SelectItem>
                <SelectItem value="marathon">ماراثون</SelectItem>
                <SelectItem value="family">عائلي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>التاريخ</Label>
            <Input
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddTournamentForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sport: "football",
    type: "round_robin",
    startDate: "",
    endDate: "",
    maxTeams: "8",
    venues: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/tournaments", data);
    },
    onSuccess: () => {
      toast({ title: "تمت الإضافة", description: "تم إضافة البطولة بنجاح" });
      onSuccess();
      setFormData({
        name: "",
        description: "",
        sport: "football",
        type: "round_robin",
        startDate: "",
        endDate: "",
        maxTeams: "8",
        venues: "",
      });
    },
    onError: () => {
      toast({ title: "فشلت الإضافة", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      maxTeams: parseInt(formData.maxTeams) || 8,
      venues: formData.venues ? formData.venues.split("،").map(v => v.trim()) : [],
      status: "registration",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>اسم البطولة</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="دوري كرة القدم 2025"
          required
          data-testid="input-tournament-name"
        />
      </div>
      <div>
        <Label>الوصف</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="وصف البطولة وشروط المشاركة"
          data-testid="input-tournament-description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>الرياضة</Label>
          <Select
            value={formData.sport}
            onValueChange={(value) => setFormData({ ...formData, sport: value })}
          >
            <SelectTrigger data-testid="select-sport">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="football">كرة القدم</SelectItem>
              <SelectItem value="basketball">كرة السلة</SelectItem>
              <SelectItem value="volleyball">الكرة الطائرة</SelectItem>
              <SelectItem value="tennis">التنس</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>نوع البطولة</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger data-testid="select-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round_robin">دوري كامل</SelectItem>
              <SelectItem value="knockout">خروج مغلوب</SelectItem>
              <SelectItem value="groups">مجموعات</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>تاريخ البداية</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            data-testid="input-start-date"
          />
        </div>
        <div>
          <Label>تاريخ النهاية</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            data-testid="input-end-date"
          />
        </div>
      </div>
      <div>
        <Label>عدد الفرق</Label>
        <Input
          type="number"
          value={formData.maxTeams}
          onChange={(e) => setFormData({ ...formData, maxTeams: e.target.value })}
          min="2"
          max="64"
          data-testid="input-max-teams"
        />
      </div>
      <div>
        <Label>الملاعب (مفصولة بفواصل)</Label>
        <Input
          value={formData.venues}
          onChange={(e) => setFormData({ ...formData, venues: e.target.value })}
          placeholder="ملعب الشركة، صالة الألعاب"
          data-testid="input-venues"
        />
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-tournament">
        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة البطولة"}
      </Button>
    </form>
  );
}
