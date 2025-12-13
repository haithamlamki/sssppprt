import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { 
  Trophy, 
  Users, 
  ArrowRight,
  Target,
  Plus,
  Trash2,
  Pencil,
  Shield,
  Loader2,
  Save,
  Gavel,
  Calendar,
  Phone,
  Mail,
  User,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Tournament, Team, MatchWithTeams, Referee } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const sportLabels: Record<string, string> = {
  football: "كرة القدم",
  basketball: "كرة السلة",
  volleyball: "الكرة الطائرة",
  tennis: "التنس",
};

const typeLabels: Record<string, string> = {
  round_robin: "دوري كامل",
  knockout: "خروج مغلوب",
  groups: "مجموعات",
};

const statusLabels: Record<string, string> = {
  registration: "التسجيل مفتوح",
  ongoing: "جارية",
  completed: "منتهية",
};

const levelLabels: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
  fifa: "دولي (FIFA)",
};

const specializationLabels: Record<string, string> = {
  main: "حكم رئيسي",
  assistant: "حكم مساعد",
  var: "حكم الفيديو",
};

export default function TournamentEdit() {
  const [, params] = useRoute("/admin/tournaments/:id/edit");
  const tournamentId = params?.id;
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("info");

  const isAdmin = user?.role === "admin" || user?.role === "committee_member";

  const { data: tournament, isLoading: tournamentLoading } = useQuery<Tournament>({
    queryKey: ["/api/tournaments", tournamentId],
    enabled: !!tournamentId && isAdmin,
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/tournaments", tournamentId, "teams"],
    enabled: !!tournamentId && isAdmin,
  });

  const { data: referees = [] } = useQuery<Referee[]>({
    queryKey: ["/api/tournaments", tournamentId, "referees"],
    enabled: !!tournamentId && isAdmin,
  });

  const { data: matches = [] } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/tournaments", tournamentId, "matches"],
    enabled: !!tournamentId && isAdmin,
  });

  if (authLoading || tournamentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full text-center p-8">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">يجب تسجيل الدخول</h2>
          <p className="text-muted-foreground mb-6">
            يرجى تسجيل الدخول للوصول إلى هذه الصفحة
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
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full text-center p-8">
          <Shield className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-4">غير مصرح</h2>
          <p className="text-muted-foreground mb-6">
            ليس لديك صلاحية للوصول إلى هذه الصفحة
          </p>
          <Button onClick={() => navigate("/")} data-testid="button-home">
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" dir="rtl">
        <Trophy className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-medium">البطولة غير موجودة</h2>
        <Link href="/admin">
          <Button data-testid="button-return-admin">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للوحة التحكم
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8" dir="rtl">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                تعديل البطولة
              </h1>
              <p className="text-muted-foreground">{tournament.name}</p>
            </div>
          </div>
          <Badge className={
            tournament.status === "registration" ? "bg-emerald-500" :
            tournament.status === "ongoing" ? "bg-orange-500" : "bg-gray-500"
          }>
            {statusLabels[tournament.status]}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="info" data-testid="tab-info">
              <Target className="h-4 w-4 ml-2" />
              المعلومات
            </TabsTrigger>
            <TabsTrigger value="teams" data-testid="tab-teams">
              <Users className="h-4 w-4 ml-2" />
              الفرق
            </TabsTrigger>
            <TabsTrigger value="referees" data-testid="tab-referees">
              <Gavel className="h-4 w-4 ml-2" />
              الحكام
            </TabsTrigger>
            <TabsTrigger value="matches" data-testid="tab-matches">
              <Trophy className="h-4 w-4 ml-2" />
              المباريات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <TournamentInfoTab tournament={tournament} />
          </TabsContent>

          <TabsContent value="teams">
            <TeamsTab tournamentId={tournamentId!} teams={teams} />
          </TabsContent>

          <TabsContent value="referees">
            <RefereesTab tournamentId={tournamentId!} referees={referees} />
          </TabsContent>

          <TabsContent value="matches">
            <MatchesTab tournamentId={tournamentId!} matches={matches} teams={teams} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TournamentInfoTab({ tournament }: { tournament: Tournament }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: tournament.name,
    description: tournament.description || "",
    sport: tournament.sport,
    type: tournament.type,
    status: tournament.status,
    maxTeams: tournament.maxTeams,
    pointsForWin: tournament.pointsForWin,
    pointsForDraw: tournament.pointsForDraw,
    pointsForLoss: tournament.pointsForLoss,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PATCH", `/api/tournaments/${tournament.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "تم تحديث البطولة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournament.id] });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "فشل تحديث البطولة", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          معلومات البطولة
        </CardTitle>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)} data-testid="button-edit-info">
            <Pencil className="h-4 w-4 ml-2" />
            تعديل
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              data-testid="button-cancel-edit"
            >
              إلغاء
            </Button>
            <Button 
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
              data-testid="button-save-info"
            >
              <Save className="h-4 w-4 ml-2" />
              {updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>اسم البطولة</Label>
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-tournament-name"
              />
            ) : (
              <p className="font-medium">{tournament.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>الرياضة</Label>
            {isEditing ? (
              <Select
                value={formData.sport}
                onValueChange={(value) => setFormData({ ...formData, sport: value })}
              >
                <SelectTrigger data-testid="select-sport">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="football" data-testid="option-sport-football">كرة القدم</SelectItem>
                  <SelectItem value="basketball" data-testid="option-sport-basketball">كرة السلة</SelectItem>
                  <SelectItem value="volleyball" data-testid="option-sport-volleyball">الكرة الطائرة</SelectItem>
                  <SelectItem value="tennis" data-testid="option-sport-tennis">التنس</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="font-medium">{sportLabels[tournament.sport]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>نوع البطولة</Label>
            {isEditing ? (
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger data-testid="select-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin" data-testid="option-type-round-robin">دوري كامل</SelectItem>
                  <SelectItem value="knockout" data-testid="option-type-knockout">خروج مغلوب</SelectItem>
                  <SelectItem value="groups" data-testid="option-type-groups">مجموعات</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="font-medium">{typeLabels[tournament.type]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>الحالة</Label>
            {isEditing ? (
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration" data-testid="option-status-registration">التسجيل مفتوح</SelectItem>
                  <SelectItem value="ongoing" data-testid="option-status-ongoing">جارية</SelectItem>
                  <SelectItem value="completed" data-testid="option-status-completed">منتهية</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge className={
                tournament.status === "registration" ? "bg-emerald-500" :
                tournament.status === "ongoing" ? "bg-orange-500" : "bg-gray-500"
              }>
                {statusLabels[tournament.status]}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label>الحد الأقصى للفرق</Label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.maxTeams}
                onChange={(e) => setFormData({ ...formData, maxTeams: parseInt(e.target.value) })}
                data-testid="input-max-teams"
              />
            ) : (
              <p className="font-medium">{tournament.maxTeams} فريق</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>نقاط الفوز / التعادل / الخسارة</Label>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={formData.pointsForWin}
                  onChange={(e) => setFormData({ ...formData, pointsForWin: parseInt(e.target.value) })}
                  className="w-16"
                  data-testid="input-points-win"
                />
                <Input
                  type="number"
                  value={formData.pointsForDraw}
                  onChange={(e) => setFormData({ ...formData, pointsForDraw: parseInt(e.target.value) })}
                  className="w-16"
                  data-testid="input-points-draw"
                />
                <Input
                  type="number"
                  value={formData.pointsForLoss}
                  onChange={(e) => setFormData({ ...formData, pointsForLoss: parseInt(e.target.value) })}
                  className="w-16"
                  data-testid="input-points-loss"
                />
              </div>
            ) : (
              <p className="font-medium">
                {tournament.pointsForWin} / {tournament.pointsForDraw} / {tournament.pointsForLoss}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>الوصف</Label>
          {isEditing ? (
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              data-testid="input-description"
            />
          ) : (
            <p className="text-muted-foreground">{tournament.description || "لا يوجد وصف"}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamsTab({ tournamentId, teams }: { tournamentId: string; teams: Team[] }) {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: "",
    level: "intermediate",
    representativeName: "",
    contactPhone: "",
    contactEmail: "",
    description: "",
  });

  const addTeamMutation = useMutation({
    mutationFn: async (data: typeof newTeam) => {
      return await apiRequest("POST", `/api/tournaments/${tournamentId}/teams`, data);
    },
    onSuccess: () => {
      toast({ title: "تم إضافة الفريق بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "teams"] });
      setIsAddOpen(false);
      setNewTeam({ name: "", level: "intermediate", representativeName: "", contactPhone: "", contactEmail: "", description: "" });
    },
    onError: () => {
      toast({ title: "فشل إضافة الفريق", variant: "destructive" });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Team> }) => {
      return await apiRequest("PATCH", `/api/teams/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "تم تحديث الفريق بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "teams"] });
      setEditingTeam(null);
    },
    onError: () => {
      toast({ title: "فشل تحديث الفريق", variant: "destructive" });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/teams/${id}`);
    },
    onSuccess: () => {
      toast({ title: "تم حذف الفريق" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "teams"] });
    },
    onError: () => {
      toast({ title: "فشل حذف الفريق", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          الفرق المشاركة ({teams.length})
        </CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-team">
              <Plus className="h-4 w-4 ml-2" />
              إضافة فريق
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة فريق جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>اسم الفريق *</Label>
                <Input
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="أدخل اسم الفريق"
                  data-testid="input-new-team-name"
                />
              </div>
              <div className="space-y-2">
                <Label>المستوى</Label>
                <Select
                  value={newTeam.level}
                  onValueChange={(value) => setNewTeam({ ...newTeam, level: value })}
                >
                  <SelectTrigger data-testid="select-team-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner" data-testid="option-team-level-beginner">مبتدئ</SelectItem>
                    <SelectItem value="intermediate" data-testid="option-team-level-intermediate">متوسط</SelectItem>
                    <SelectItem value="advanced" data-testid="option-team-level-advanced">متقدم</SelectItem>
                    <SelectItem value="professional" data-testid="option-team-level-professional">محترف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الممثل</Label>
                <Input
                  value={newTeam.representativeName}
                  onChange={(e) => setNewTeam({ ...newTeam, representativeName: e.target.value })}
                  placeholder="اسم ممثل الفريق"
                  data-testid="input-team-representative"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={newTeam.contactPhone}
                    onChange={(e) => setNewTeam({ ...newTeam, contactPhone: e.target.value })}
                    placeholder="05xxxxxxxx"
                    data-testid="input-team-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={newTeam.contactEmail}
                    onChange={(e) => setNewTeam({ ...newTeam, contactEmail: e.target.value })}
                    placeholder="email@example.com"
                    data-testid="input-team-email"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" data-testid="button-cancel-add-team">إلغاء</Button>
              </DialogClose>
              <Button 
                onClick={() => addTeamMutation.mutate(newTeam)}
                disabled={!newTeam.name.trim() || addTeamMutation.isPending}
                data-testid="button-submit-team"
              >
                {addTeamMutation.isPending ? "جاري الإضافة..." : "إضافة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {teams.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">#</TableHead>
                <TableHead className="text-right">الفريق</TableHead>
                <TableHead className="text-right">المستوى</TableHead>
                <TableHead className="text-right">الممثل</TableHead>
                <TableHead className="text-center">لعب</TableHead>
                <TableHead className="text-center">فاز</TableHead>
                <TableHead className="text-center">نقاط</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow key={team.id} data-testid={`row-team-${team.id}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {levelLabels[team.level || "intermediate"] || team.level}
                    </Badge>
                  </TableCell>
                  <TableCell>{team.representativeName || "-"}</TableCell>
                  <TableCell className="text-center">{team.played}</TableCell>
                  <TableCell className="text-center text-emerald-500">{team.won}</TableCell>
                  <TableCell className="text-center font-bold">{team.points}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingTeam(team)}
                        data-testid={`button-edit-team-${team.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteTeamMutation.mutate(team.id)}
                        data-testid={`button-delete-team-${team.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لم يتم تسجيل أي فرق بعد</p>
          </div>
        )}
      </CardContent>

      {editingTeam && (
        <EditTeamDialog 
          team={editingTeam} 
          onClose={() => setEditingTeam(null)}
          onSave={(data) => updateTeamMutation.mutate({ id: editingTeam.id, data })}
          isPending={updateTeamMutation.isPending}
        />
      )}
    </Card>
  );
}

function EditTeamDialog({ 
  team, 
  onClose, 
  onSave, 
  isPending 
}: { 
  team: Team; 
  onClose: () => void; 
  onSave: (data: Partial<Team>) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    name: team.name,
    level: team.level || "intermediate",
    representativeName: team.representativeName || "",
    contactPhone: team.contactPhone || "",
    contactEmail: team.contactEmail || "",
    groupNumber: team.groupNumber || undefined,
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل الفريق</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>اسم الفريق</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="input-edit-team-name"
            />
          </div>
          <div className="space-y-2">
            <Label>المستوى</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData({ ...formData, level: value })}
            >
              <SelectTrigger data-testid="select-edit-team-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner" data-testid="option-edit-team-level-beginner">مبتدئ</SelectItem>
                <SelectItem value="intermediate" data-testid="option-edit-team-level-intermediate">متوسط</SelectItem>
                <SelectItem value="advanced" data-testid="option-edit-team-level-advanced">متقدم</SelectItem>
                <SelectItem value="professional" data-testid="option-edit-team-level-professional">محترف</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>رقم المجموعة</Label>
            <Input
              type="number"
              value={formData.groupNumber || ""}
              onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="رقم المجموعة (اختياري)"
              data-testid="input-edit-team-group"
            />
          </div>
          <div className="space-y-2">
            <Label>الممثل</Label>
            <Input
              value={formData.representativeName}
              onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
              data-testid="input-edit-team-rep"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>البريد</Label>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-edit-team">إلغاء</Button>
          <Button onClick={() => onSave(formData)} disabled={isPending} data-testid="button-save-team">
            {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RefereesTab({ tournamentId, referees }: { tournamentId: string; referees: Referee[] }) {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingReferee, setEditingReferee] = useState<Referee | null>(null);
  const [newReferee, setNewReferee] = useState({
    name: "",
    phone: "",
    email: "",
    level: "intermediate",
    specialization: "main",
    notes: "",
  });

  const addRefereeMutation = useMutation({
    mutationFn: async (data: typeof newReferee) => {
      return await apiRequest("POST", `/api/tournaments/${tournamentId}/referees`, data);
    },
    onSuccess: () => {
      toast({ title: "تم إضافة الحكم بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "referees"] });
      setIsAddOpen(false);
      setNewReferee({ name: "", phone: "", email: "", level: "intermediate", specialization: "main", notes: "" });
    },
    onError: () => {
      toast({ title: "فشل إضافة الحكم", variant: "destructive" });
    },
  });

  const updateRefereeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Referee> }) => {
      return await apiRequest("PATCH", `/api/referees/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "تم تحديث الحكم بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "referees"] });
      setEditingReferee(null);
    },
    onError: () => {
      toast({ title: "فشل تحديث الحكم", variant: "destructive" });
    },
  });

  const deleteRefereeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/referees/${id}`);
    },
    onSuccess: () => {
      toast({ title: "تم حذف الحكم" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "referees"] });
    },
    onError: () => {
      toast({ title: "فشل حذف الحكم", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          الحكام ({referees.length})
        </CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-referee">
              <Plus className="h-4 w-4 ml-2" />
              إضافة حكم
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة حكم جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>اسم الحكم *</Label>
                <Input
                  value={newReferee.name}
                  onChange={(e) => setNewReferee({ ...newReferee, name: e.target.value })}
                  placeholder="أدخل اسم الحكم"
                  data-testid="input-referee-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المستوى</Label>
                  <Select
                    value={newReferee.level}
                    onValueChange={(value) => setNewReferee({ ...newReferee, level: value })}
                  >
                    <SelectTrigger data-testid="select-referee-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner" data-testid="option-referee-level-beginner">مبتدئ</SelectItem>
                      <SelectItem value="intermediate" data-testid="option-referee-level-intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced" data-testid="option-referee-level-advanced">متقدم</SelectItem>
                      <SelectItem value="fifa" data-testid="option-referee-level-fifa">دولي (FIFA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>التخصص</Label>
                  <Select
                    value={newReferee.specialization}
                    onValueChange={(value) => setNewReferee({ ...newReferee, specialization: value })}
                  >
                    <SelectTrigger data-testid="select-referee-spec">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main" data-testid="option-referee-spec-main">حكم رئيسي</SelectItem>
                      <SelectItem value="assistant" data-testid="option-referee-spec-assistant">حكم مساعد</SelectItem>
                      <SelectItem value="var" data-testid="option-referee-spec-var">حكم الفيديو</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={newReferee.phone}
                    onChange={(e) => setNewReferee({ ...newReferee, phone: e.target.value })}
                    placeholder="05xxxxxxxx"
                    data-testid="input-referee-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={newReferee.email}
                    onChange={(e) => setNewReferee({ ...newReferee, email: e.target.value })}
                    placeholder="email@example.com"
                    data-testid="input-referee-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={newReferee.notes}
                  onChange={(e) => setNewReferee({ ...newReferee, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                  data-testid="input-referee-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" data-testid="button-cancel-add-referee">إلغاء</Button>
              </DialogClose>
              <Button 
                onClick={() => addRefereeMutation.mutate(newReferee)}
                disabled={!newReferee.name.trim() || addRefereeMutation.isPending}
                data-testid="button-submit-referee"
              >
                {addRefereeMutation.isPending ? "جاري الإضافة..." : "إضافة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {referees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {referees.map((referee) => (
              <Card key={referee.id} className="hover-elevate" data-testid={`card-referee-${referee.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Gavel className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">{referee.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {specializationLabels[referee.specialization || "main"]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingReferee(referee)}
                        data-testid={`button-edit-referee-${referee.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteRefereeMutation.mutate(referee.id)}
                        data-testid={`button-delete-referee-${referee.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <Badge className="ml-2">
                      {levelLabels[referee.level || "intermediate"]}
                    </Badge>
                    {referee.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{referee.phone}</span>
                      </div>
                    )}
                    {referee.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{referee.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Trophy className="h-3 w-3" />
                      <span>{referee.matchesRefereed} مباراة</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لم يتم إضافة أي حكام بعد</p>
          </div>
        )}
      </CardContent>

      {editingReferee && (
        <EditRefereeDialog 
          referee={editingReferee} 
          onClose={() => setEditingReferee(null)}
          onSave={(data) => updateRefereeMutation.mutate({ id: editingReferee.id, data })}
          isPending={updateRefereeMutation.isPending}
        />
      )}
    </Card>
  );
}

function EditRefereeDialog({ 
  referee, 
  onClose, 
  onSave, 
  isPending 
}: { 
  referee: Referee; 
  onClose: () => void; 
  onSave: (data: Partial<Referee>) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    name: referee.name,
    phone: referee.phone || "",
    email: referee.email || "",
    level: referee.level || "intermediate",
    specialization: referee.specialization || "main",
    notes: referee.notes || "",
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل الحكم</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>اسم الحكم</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="input-edit-referee-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المستوى</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger data-testid="select-edit-referee-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner" data-testid="option-edit-referee-level-beginner">مبتدئ</SelectItem>
                  <SelectItem value="intermediate" data-testid="option-edit-referee-level-intermediate">متوسط</SelectItem>
                  <SelectItem value="advanced" data-testid="option-edit-referee-level-advanced">متقدم</SelectItem>
                  <SelectItem value="fifa" data-testid="option-edit-referee-level-fifa">دولي (FIFA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>التخصص</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) => setFormData({ ...formData, specialization: value })}
              >
                <SelectTrigger data-testid="select-edit-referee-spec">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main" data-testid="option-edit-referee-spec-main">حكم رئيسي</SelectItem>
                  <SelectItem value="assistant" data-testid="option-edit-referee-spec-assistant">حكم مساعد</SelectItem>
                  <SelectItem value="var" data-testid="option-edit-referee-spec-var">حكم الفيديو</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                data-testid="input-edit-referee-phone"
              />
            </div>
            <div className="space-y-2">
              <Label>البريد</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="input-edit-referee-email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              data-testid="input-edit-referee-notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-edit-referee">إلغاء</Button>
          <Button onClick={() => onSave(formData)} disabled={isPending} data-testid="button-save-referee">
            {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MatchesTab({ 
  tournamentId, 
  matches, 
  teams 
}: { 
  tournamentId: string; 
  matches: MatchWithTeams[]; 
  teams: Team[];
}) {
  const { toast } = useToast();
  const [editingMatch, setEditingMatch] = useState<MatchWithTeams | null>(null);
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    matchesPerDay: 2,
    dailyStartTime: "16:00",
  });
  const [newMatch, setNewMatch] = useState({
    homeTeamId: "",
    awayTeamId: "",
    round: 1,
    matchDate: "",
    venue: "",
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ matchId, data }: { matchId: string; data: any }) => {
      return await apiRequest("PATCH", `/api/matches/${matchId}`, data);
    },
    onSuccess: () => {
      toast({ title: "تم تحديث نتيجة المباراة" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "teams"] });
      setEditingMatch(null);
    },
    onError: () => {
      toast({ title: "فشل تحديث النتيجة", variant: "destructive" });
    },
  });

  const generateMatchesMutation = useMutation({
    mutationFn: async (config: typeof scheduleConfig) => {
      return await apiRequest("POST", `/api/tournaments/${tournamentId}/generate-matches`, config);
    },
    onSuccess: () => {
      toast({ title: "تم توليد جدول المباريات بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "matches"] });
      setIsGenerateOpen(false);
    },
    onError: () => {
      toast({ title: "فشل توليد جدول المباريات", variant: "destructive" });
    },
  });

  const addMatchMutation = useMutation({
    mutationFn: async (data: typeof newMatch) => {
      return await apiRequest("POST", `/api/tournaments/${tournamentId}/matches`, {
        ...data,
        matchDate: data.matchDate ? new Date(data.matchDate).toISOString() : null,
      });
    },
    onSuccess: () => {
      toast({ title: "تم إضافة المباراة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "matches"] });
      setIsAddMatchOpen(false);
      setNewMatch({ homeTeamId: "", awayTeamId: "", round: 1, matchDate: "", venue: "" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "فشل إضافة المباراة", 
        description: error.message || "حدث خطأ أثناء إضافة المباراة",
        variant: "destructive" 
      });
    },
  });

  const scheduledMatches = matches.filter(m => m.status === "scheduled" || m.status === "live");
  const completedMatches = matches.filter(m => m.status === "completed");

  return (
    <div className="space-y-6">
      {/* Actions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            إدارة المباريات
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  disabled={teams.length < 2}
                  data-testid="button-generate-matches"
                >
                  <Calendar className="h-4 w-4 ml-2" />
                  توليد جدول المباريات
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>إعدادات توليد جدول المباريات</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    سيتم توليد المباريات بناءً على تاريخ بداية ونهاية البطولة المحددين في معلومات البطولة
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>عدد المباريات في اليوم</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={scheduleConfig.matchesPerDay}
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, matchesPerDay: parseInt(e.target.value) || 2 })}
                        data-testid="input-matches-per-day"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>وقت بداية المباريات</Label>
                      <Input
                        type="time"
                        value={scheduleConfig.dailyStartTime}
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, dailyStartTime: e.target.value })}
                        data-testid="input-daily-start-time"
                      />
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p><strong>عدد الفرق:</strong> {teams.length}</p>
                    <p><strong>عدد المباريات المتوقع:</strong> {teams.length * (teams.length - 1) / 2}</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsGenerateOpen(false)}
                    data-testid="button-cancel-generate"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    onClick={() => generateMatchesMutation.mutate(scheduleConfig)}
                    disabled={generateMatchesMutation.isPending}
                    data-testid="button-submit-generate"
                  >
                    {generateMatchesMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        جاري التوليد...
                      </>
                    ) : (
                      "توليد المباريات"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddMatchOpen} onOpenChange={setIsAddMatchOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-match" disabled={teams.length < 2}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة مباراة
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة مباراة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الفريق المضيف *</Label>
                      <Select
                        value={newMatch.homeTeamId}
                        onValueChange={(value) => setNewMatch({ ...newMatch, homeTeamId: value })}
                      >
                        <SelectTrigger data-testid="select-home-team">
                          <SelectValue placeholder="اختر الفريق" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.filter(t => t.id !== newMatch.awayTeamId).map((team) => (
                            <SelectItem key={team.id} value={team.id} data-testid={`option-home-team-${team.id}`}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>الفريق الضيف *</Label>
                      <Select
                        value={newMatch.awayTeamId}
                        onValueChange={(value) => setNewMatch({ ...newMatch, awayTeamId: value })}
                      >
                        <SelectTrigger data-testid="select-away-team">
                          <SelectValue placeholder="اختر الفريق" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.filter(t => t.id !== newMatch.homeTeamId).map((team) => (
                            <SelectItem key={team.id} value={team.id} data-testid={`option-away-team-${team.id}`}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>رقم الجولة</Label>
                      <Input
                        type="number"
                        min={1}
                        value={newMatch.round}
                        onChange={(e) => setNewMatch({ ...newMatch, round: parseInt(e.target.value) || 1 })}
                        data-testid="input-match-round"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ المباراة</Label>
                      <Input
                        type="datetime-local"
                        value={newMatch.matchDate}
                        onChange={(e) => setNewMatch({ ...newMatch, matchDate: e.target.value })}
                        data-testid="input-match-date"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>الملعب</Label>
                    <Input
                      value={newMatch.venue}
                      onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                      placeholder="أدخل اسم الملعب"
                      data-testid="input-new-match-venue"
                    />
                  </div>
                  {newMatch.homeTeamId && newMatch.awayTeamId && newMatch.homeTeamId === newMatch.awayTeamId && (
                    <p className="text-sm text-destructive" data-testid="error-same-team">
                      لا يمكن اختيار نفس الفريق كمضيف وضيف
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddMatchOpen(false);
                      setNewMatch({ homeTeamId: "", awayTeamId: "", round: 1, matchDate: "", venue: "" });
                    }}
                    data-testid="button-cancel-add-match"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    onClick={() => addMatchMutation.mutate(newMatch)}
                    disabled={
                      !newMatch.homeTeamId || 
                      !newMatch.awayTeamId || 
                      newMatch.homeTeamId === newMatch.awayTeamId ||
                      addMatchMutation.isPending
                    }
                    data-testid="button-submit-match"
                  >
                    {addMatchMutation.isPending ? "جاري الإضافة..." : "إضافة المباراة"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {teams.length < 2 
              ? "يجب إضافة فريقين على الأقل لتوليد المباريات أو إضافة مباراة يدوياً"
              : `يمكنك توليد جدول مباريات تلقائي لـ ${teams.length} فرق أو إضافة مباريات يدوياً`
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            المباريات القادمة ({scheduledMatches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledMatches.length > 0 ? (
            <div className="space-y-3">
              {scheduledMatches.map((match) => (
                <div 
                  key={match.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  data-testid={`match-row-${match.id}`}
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">الجولة {match.round}</Badge>
                    <span className="font-medium">{match.homeTeam?.name || "TBD"}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-medium">{match.awayTeam?.name || "TBD"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {match.matchDate && (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(match.matchDate), "d MMM yyyy", { locale: ar })}
                      </span>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingMatch(match)}
                      data-testid={`button-edit-match-${match.id}`}
                    >
                      <Pencil className="h-4 w-4 ml-2" />
                      تعديل النتيجة
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مباريات قادمة</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-500" />
            المباريات المنتهية ({completedMatches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedMatches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الجولة</TableHead>
                  <TableHead className="text-right">المضيف</TableHead>
                  <TableHead className="text-center">النتيجة</TableHead>
                  <TableHead className="text-right">الضيف</TableHead>
                  <TableHead className="text-center">التاريخ</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedMatches.map((match) => (
                  <TableRow key={match.id} data-testid={`completed-match-${match.id}`}>
                    <TableCell>
                      <Badge variant="outline">الجولة {match.round}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{match.homeTeam?.name}</TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-lg">
                        {match.homeScore} - {match.awayScore}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{match.awayTeam?.name}</TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {match.matchDate && format(new Date(match.matchDate), "d/M/yyyy", { locale: ar })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingMatch(match)}
                        data-testid={`button-edit-completed-${match.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مباريات منتهية</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editingMatch && (
        <EditMatchDialog
          match={editingMatch}
          onClose={() => setEditingMatch(null)}
          onSave={(data) => updateMatchMutation.mutate({ matchId: editingMatch.id, data })}
          isPending={updateMatchMutation.isPending}
        />
      )}
    </div>
  );
}

function EditMatchDialog({ 
  match, 
  onClose, 
  onSave, 
  isPending 
}: { 
  match: MatchWithTeams; 
  onClose: () => void; 
  onSave: (data: any) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    homeScore: match.homeScore ?? 0,
    awayScore: match.awayScore ?? 0,
    status: match.status,
    venue: match.venue || "",
    referee: match.referee || "",
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل نتيجة المباراة</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="font-bold text-lg">{match.homeTeam?.name}</p>
                <p className="text-sm text-muted-foreground">مضيف</p>
              </div>
              <span className="text-2xl font-bold text-muted-foreground">vs</span>
              <div className="text-center">
                <p className="font-bold text-lg">{match.awayTeam?.name}</p>
                <p className="text-sm text-muted-foreground">ضيف</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <Label className="text-sm">أهداف المضيف</Label>
              <Input
                type="number"
                min={0}
                value={formData.homeScore}
                onChange={(e) => setFormData({ ...formData, homeScore: parseInt(e.target.value) || 0 })}
                className="w-20 text-center text-xl font-bold"
                data-testid="input-home-score"
              />
            </div>
            <span className="text-2xl font-bold">-</span>
            <div className="text-center">
              <Label className="text-sm">أهداف الضيف</Label>
              <Input
                type="number"
                min={0}
                value={formData.awayScore}
                onChange={(e) => setFormData({ ...formData, awayScore: parseInt(e.target.value) || 0 })}
                className="w-20 text-center text-xl font-bold"
                data-testid="input-away-score"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>حالة المباراة</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger data-testid="select-match-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled" data-testid="option-match-status-scheduled">مجدولة</SelectItem>
                <SelectItem value="live" data-testid="option-match-status-live">مباشر</SelectItem>
                <SelectItem value="completed" data-testid="option-match-status-completed">منتهية</SelectItem>
                <SelectItem value="postponed" data-testid="option-match-status-postponed">مؤجلة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الملعب</Label>
              <Input
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="اسم الملعب"
                data-testid="input-venue"
              />
            </div>
            <div className="space-y-2">
              <Label>الحكم</Label>
              <Input
                value={formData.referee}
                onChange={(e) => setFormData({ ...formData, referee: e.target.value })}
                placeholder="اسم الحكم"
                data-testid="input-match-referee"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-edit-match">إلغاء</Button>
          <Button onClick={() => onSave(formData)} disabled={isPending} data-testid="button-save-match">
            {isPending ? "جاري الحفظ..." : "حفظ النتيجة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
