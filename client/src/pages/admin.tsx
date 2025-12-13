import { useState, useRef } from "react";
import { 
  Calendar, Users, Trophy, ImageIcon, Newspaper, 
  Plus, Pencil, Trash2, Loader2, Shield, BarChart3, Target, Upload, Phone, MapPin 
} from "lucide-react";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
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
import type { Event, News, Result, Stats, User, Gallery, Tournament, MatchWithTeams } from "@shared/schema";
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
import { Switch } from "@/components/ui/switch";

export default function Admin() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

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

  const { data: matchesList = [], isLoading: matchesLoading } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/tournaments", selectedTournamentId, "matches"],
    queryFn: async () => {
      if (!selectedTournamentId) return [];
      const response = await fetch(`/api/tournaments/${selectedTournamentId}/matches`);
      if (!response.ok) throw new Error("Failed to fetch matches");
      return response.json();
    },
    enabled: isAdmin && !!selectedTournamentId,
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ matchId, data }: { matchId: string; data: any }) => {
      return await apiRequest("PATCH", `/api/matches/${matchId}`, data);
    },
    onSuccess: () => {
      toast({ title: "تم تحديث نتيجة المباراة" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", selectedTournamentId, "matches"] });
    },
    onError: () => {
      toast({ title: "فشل تحديث النتيجة", variant: "destructive" });
    },
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
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 lg:w-auto lg:inline-grid gap-1">
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
            <TabsTrigger value="matches" data-testid="tab-matches">
              <Trophy className="h-4 w-4 ml-2" />
              المباريات
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card data-testid="stat-events">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الفعاليات</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
                  <p className="text-xs text-muted-foreground">فعالية نشطة</p>
                </CardContent>
              </Card>
              <Card data-testid="stat-participants">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">المشاركون</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalParticipants || 0}</div>
                  <p className="text-xs text-muted-foreground">مشارك مسجل</p>
                </CardContent>
              </Card>
              <Card data-testid="stat-achievements">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">الإنجازات</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalAchievements || 0}</div>
                  <p className="text-xs text-muted-foreground">إنجاز محقق</p>
                </CardContent>
              </Card>
              <Card data-testid="stat-sports">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">الأنشطة</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeSports || 0}</div>
                  <p className="text-xs text-muted-foreground">نشاط رياضي</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Events by Category Pie Chart */}
              <Card data-testid="chart-events-category">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    توزيع الفعاليات حسب النوع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'كرة قدم', value: events.filter(e => e.category === 'football').length, color: '#3B82F6' },
                            { name: 'كرة سلة', value: events.filter(e => e.category === 'basketball').length, color: '#F97316' },
                            { name: 'ماراثون', value: events.filter(e => e.category === 'marathon').length, color: '#22C55E' },
                            { name: 'عائلي', value: events.filter(e => e.category === 'family').length, color: '#A855F7' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'كرة قدم', value: events.filter(e => e.category === 'football').length, color: '#3B82F6' },
                            { name: 'كرة سلة', value: events.filter(e => e.category === 'basketball').length, color: '#F97316' },
                            { name: 'ماراثون', value: events.filter(e => e.category === 'marathon').length, color: '#22C55E' },
                            { name: 'عائلي', value: events.filter(e => e.category === 'family').length, color: '#A855F7' },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Overview Bar Chart */}
              <Card data-testid="chart-overview">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    نظرة عامة على النظام
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'الفعاليات', value: events.length, fill: '#3B82F6' },
                          { name: 'البطولات', value: tournamentsList.length, fill: '#F97316' },
                          { name: 'المستخدمين', value: allUsers.length, fill: '#22C55E' },
                          { name: 'الأخبار', value: news.length, fill: '#A855F7' },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {[
                            { name: 'الفعاليات', value: events.length, fill: '#3B82F6' },
                            { name: 'البطولات', value: tournamentsList.length, fill: '#F97316' },
                            { name: 'المستخدمين', value: allUsers.length, fill: '#22C55E' },
                            { name: 'الأخبار', value: news.length, fill: '#A855F7' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card data-testid="stat-tournaments">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">البطولات النشطة</p>
                      <p className="text-2xl font-bold">{tournamentsList.filter(t => t.status === 'ongoing' || t.status === 'registration').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card data-testid="stat-users">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                      <p className="text-2xl font-bold">{allUsers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card data-testid="stat-news">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Newspaper className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الأخبار المنشورة</p>
                      <p className="text-2xl font-bold">{news.length}</p>
                    </div>
                  </div>
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
                  {events.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">لا توجد فعاليات بعد</p>
                  )}
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
                  <DialogContent className="max-w-2xl" dir="rtl">
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

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  إدارة نتائج المباريات
                </CardTitle>
                <Select
                  value={selectedTournamentId}
                  onValueChange={setSelectedTournamentId}
                >
                  <SelectTrigger className="w-[250px]" data-testid="select-tournament-matches">
                    <SelectValue placeholder="اختر البطولة" />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentsList.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {!selectedTournamentId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>اختر بطولة لعرض مبارياتها</p>
                  </div>
                ) : matchesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : matchesList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد مباريات في هذه البطولة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchesList.map((match) => (
                      <Card key={match.id} className="hover-elevate" data-testid={`card-match-${match.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="text-center min-w-[100px]">
                                <p className="font-bold">{match.homeTeam?.name || "فريق 1"}</p>
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                                <span className="text-2xl font-bold">{match.homeScore ?? "-"}</span>
                                <span className="text-muted-foreground">:</span>
                                <span className="text-2xl font-bold">{match.awayScore ?? "-"}</span>
                              </div>
                              <div className="text-center min-w-[100px]">
                                <p className="font-bold">{match.awayTeam?.name || "فريق 2"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-left">
                                <Badge
                                  className={
                                    match.status === "completed" ? "bg-green-500" :
                                    match.status === "live" ? "bg-red-500" :
                                    match.status === "postponed" ? "bg-yellow-500" : "bg-gray-500"
                                  }
                                >
                                  {match.status === "completed" ? "انتهت" :
                                   match.status === "live" ? "مباشر" :
                                   match.status === "postponed" ? "مؤجلة" : "مقررة"}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  الجولة {match.round}
                                </p>
                              </div>
                              <EditMatchDialog
                                match={match}
                                onSave={(data) => updateMatchMutation.mutate({ matchId: match.id, data })}
                                isPending={updateMatchMutation.isPending}
                              />
                            </div>
                          </div>
                          {match.matchDate && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(match.matchDate).toLocaleDateString('ar-SA')} - {match.venue || "غير محدد"}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sport: "football",
    type: "groups",
    startDate: "",
    endDate: "",
    maxTeams: "8",
    numberOfGroups: "2",
    venues: "",
    imageUrl: "",
    phoneNumber: "",
    address: "",
    policy: "public",
    pointsForWin: "3",
    pointsForDraw: "1",
    pointsForLoss: "0",
    numberOfRounds: "1",
    isOpenForRegistration: true,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await response.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        toast({ title: "تم رفع الصورة بنجاح" });
      }
    } catch {
      toast({ title: "فشل رفع الصورة", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

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
        type: "groups",
        startDate: "",
        endDate: "",
        maxTeams: "8",
        numberOfGroups: "2",
        venues: "",
        imageUrl: "",
        phoneNumber: "",
        address: "",
        policy: "public",
        pointsForWin: "3",
        pointsForDraw: "1",
        pointsForLoss: "0",
        numberOfRounds: "1",
        isOpenForRegistration: true,
      });
      setImagePreview(null);
    },
    onError: () => {
      toast({ title: "فشلت الإضافة", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = {
      name: formData.name,
      description: formData.description || undefined,
      sport: formData.sport,
      type: formData.type,
      maxTeams: parseInt(formData.maxTeams) || 8,
      numberOfGroups: parseInt(formData.numberOfGroups) || 2,
      status: "registration",
      imageUrl: formData.imageUrl || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      address: formData.address || undefined,
      policy: formData.policy,
      pointsForWin: parseInt(formData.pointsForWin) || 3,
      pointsForDraw: parseInt(formData.pointsForDraw) || 1,
      pointsForLoss: parseInt(formData.pointsForLoss) || 0,
      numberOfRounds: parseInt(formData.numberOfRounds) || 1,
      isOpenForRegistration: formData.isOpenForRegistration,
      hasGroupStage: formData.type === "groups",
    };
    
    if (formData.startDate) {
      submitData.startDate = new Date(formData.startDate).toISOString();
    }
    if (formData.endDate) {
      submitData.endDate = new Date(formData.endDate).toISOString();
    }
    if (formData.venues) {
      submitData.venues = formData.venues.split("،").map((v: string) => v.trim()).filter((v: string) => v);
    }
    
    mutation.mutate(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      {/* صورة الدوري */}
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <ImageIcon className="h-4 w-4" />
          صورة الدوري
        </Label>
        <div 
          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="معاينة" className="w-full h-32 object-cover rounded-md" />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">اضغط لرفع صورة</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            data-testid="input-tournament-image"
          />
        </div>
      </div>

      {/* اسم البطولة */}
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

      {/* معلومات الاتصال */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            رقم الهاتف
          </Label>
          <Input
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="05xxxxxxxx"
            data-testid="input-phone-number"
          />
        </div>
        <div>
          <Label>السياسة</Label>
          <Select
            value={formData.policy}
            onValueChange={(value) => setFormData({ ...formData, policy: value })}
          >
            <SelectTrigger data-testid="select-policy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">عام</SelectItem>
              <SelectItem value="private">خاص</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* العنوان */}
      <div>
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          العنوان
        </Label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="مدينة/حي/شارع"
          data-testid="input-address"
        />
      </div>

      {/* الوصف */}
      <div>
        <Label>الوصف</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="وصف البطولة وشروط المشاركة"
          data-testid="input-tournament-description"
        />
      </div>

      {/* الرياضة ونوع البطولة */}
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

      {/* عدد الفرق والمجموعات */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>عدد المتنافسين</Label>
          <Input
            type="number"
            value={formData.maxTeams}
            onChange={(e) => setFormData({ ...formData, maxTeams: e.target.value })}
            min="4"
            max="128"
            data-testid="input-max-teams"
          />
        </div>
        {formData.type === "groups" && (
          <div>
            <Label>عدد المجموعات</Label>
            <Input
              type="number"
              value={formData.numberOfGroups}
              onChange={(e) => setFormData({ ...formData, numberOfGroups: e.target.value })}
              min="2"
              max="16"
              data-testid="input-number-of-groups"
            />
          </div>
        )}
      </div>

      {/* نظام النقاط */}
      <div className="bg-muted/50 rounded-lg p-4">
        <Label className="text-base font-semibold mb-3 block">نظام النقاط</Label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-sm">نقاط الفوز</Label>
            <Input
              type="number"
              value={formData.pointsForWin}
              onChange={(e) => setFormData({ ...formData, pointsForWin: e.target.value })}
              min="0"
              max="10"
              data-testid="input-points-win"
            />
          </div>
          <div>
            <Label className="text-sm">نقاط التعادل</Label>
            <Input
              type="number"
              value={formData.pointsForDraw}
              onChange={(e) => setFormData({ ...formData, pointsForDraw: e.target.value })}
              min="0"
              max="10"
              data-testid="input-points-draw"
            />
          </div>
          <div>
            <Label className="text-sm">نقاط الخسارة</Label>
            <Input
              type="number"
              value={formData.pointsForLoss}
              onChange={(e) => setFormData({ ...formData, pointsForLoss: e.target.value })}
              min="0"
              max="10"
              data-testid="input-points-loss"
            />
          </div>
        </div>
      </div>

      {/* عدد الجولات */}
      <div>
        <Label>عدد الجولات</Label>
        <Input
          type="number"
          value={formData.numberOfRounds}
          onChange={(e) => setFormData({ ...formData, numberOfRounds: e.target.value })}
          min="1"
          max="10"
          data-testid="input-number-of-rounds"
        />
      </div>

      {/* التواريخ */}
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

      {/* الملاعب */}
      <div>
        <Label>الملاعب (مفصولة بفواصل)</Label>
        <Input
          value={formData.venues}
          onChange={(e) => setFormData({ ...formData, venues: e.target.value })}
          placeholder="ملعب الشركة، صالة الألعاب"
          data-testid="input-venues"
        />
      </div>

      {/* مفتوح للتسجيل */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
        <div>
          <Label className="text-base font-semibold">مفتوح للتسجيل</Label>
          <p className="text-sm text-muted-foreground">السماح للفرق بالتسجيل في البطولة</p>
        </div>
        <Switch
          checked={formData.isOpenForRegistration}
          onCheckedChange={(checked) => setFormData({ ...formData, isOpenForRegistration: checked })}
          data-testid="switch-open-registration"
        />
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending || isUploading} data-testid="button-submit-tournament">
        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة البطولة"}
      </Button>
    </form>
  );
}

function EditMatchDialog({ 
  match, 
  onSave, 
  isPending 
}: { 
  match: MatchWithTeams; 
  onSave: (data: any) => void; 
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    homeScore: match.homeScore?.toString() || "",
    awayScore: match.awayScore?.toString() || "",
    status: match.status || "scheduled",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      homeScore: formData.homeScore ? parseInt(formData.homeScore) : null,
      awayScore: formData.awayScore ? parseInt(formData.awayScore) : null,
      status: formData.status,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" data-testid={`button-edit-match-${match.id}`}>
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تحديث نتيجة المباراة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="font-bold mb-2">{match.homeTeam?.name || "فريق 1"}</p>
              <Input
                type="number"
                min="0"
                className="w-20 text-center text-2xl font-bold"
                value={formData.homeScore}
                onChange={(e) => setFormData({ ...formData, homeScore: e.target.value })}
                data-testid="input-home-score"
              />
            </div>
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <div className="text-center">
              <p className="font-bold mb-2">{match.awayTeam?.name || "فريق 2"}</p>
              <Input
                type="number"
                min="0"
                className="w-20 text-center text-2xl font-bold"
                value={formData.awayScore}
                onChange={(e) => setFormData({ ...formData, awayScore: e.target.value })}
                data-testid="input-away-score"
              />
            </div>
          </div>

          <div>
            <Label>حالة المباراة</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger data-testid="select-match-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">مقررة</SelectItem>
                <SelectItem value="live">مباشر</SelectItem>
                <SelectItem value="completed">انتهت</SelectItem>
                <SelectItem value="postponed">مؤجلة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isPending} data-testid="button-save-match">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ النتيجة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
