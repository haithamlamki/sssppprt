import { Calendar, MapPin, Trophy, Trash2, Loader2, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { Event, EventRegistration } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const categoryLabels: Record<string, string> = {
  football: "كرة قدم",
  family: "عائلي",
  marathon: "جري",
  basketball: "كرة سلة",
};

const statusLabels: Record<string, string> = {
  confirmed: "مؤكد",
  waitlist: "قائمة الانتظار",
  cancelled: "ملغي",
  attended: "حضر",
};

const statusColors: Record<string, string> = {
  confirmed: "bg-success text-success-foreground",
  waitlist: "bg-gold text-gold-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
  attended: "bg-primary text-primary-foreground",
};

export default function MyEvents() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: registrations = [], isLoading } = useQuery<EventRegistration[]>({
    queryKey: ["/api/my-registrations"],
    enabled: isAuthenticated,
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const cancelMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      return await apiRequest("DELETE", `/api/registrations/${registrationId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "تم إلغاء التسجيل",
        description: "تم إلغاء تسجيلك في الفعالية بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: any) => {
      toast({
        title: "فشل إلغاء التسجيل",
        description: error.message || "حدث خطأ أثناء إلغاء التسجيل",
        variant: "destructive",
      });
    },
  });

  const getEventById = (eventId: string) => {
    return events.find((e) => e.id === eventId);
  };

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
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">يجب تسجيل الدخول</h2>
          <p className="text-muted-foreground mb-6">
            يرجى تسجيل الدخول لعرض فعالياتك المسجلة
          </p>
          <Button onClick={() => navigate("/login")} data-testid="button-login">
            تسجيل الدخول
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="text-base px-4 py-2" data-testid="badge-my-events">
            فعالياتي
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold">
            الفعاليات المسجل فيها
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            تابع جميع الفعاليات التي سجلت فيها وإدارة مشاركاتك
          </p>
        </div>

        {registrations.length === 0 ? (
          <Card className="max-w-xl mx-auto text-center p-12">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">لم تسجل في أي فعالية بعد</h3>
            <p className="text-muted-foreground mb-6">
              تصفح الفعاليات القادمة وسجل مشاركتك الآن
            </p>
            <Button onClick={() => navigate("/events")} data-testid="button-browse-events">
              تصفح الفعاليات
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((registration) => {
              const event = getEventById(registration.eventId);
              if (!event) return null;

              const eventDate = new Date(event.date);
              const isPast = eventDate < new Date();

              return (
                <Card key={registration.id} className="hover-elevate transition-all" data-testid={`card-registration-${registration.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg font-display leading-tight">
                        {event.title}
                      </CardTitle>
                      <Badge className={statusColors[registration.status]}>
                        {statusLabels[registration.status] || registration.status}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {categoryLabels[event.category] || event.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {eventDate.toLocaleDateString('ar-SA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          تاريخ التسجيل: {new Date(registration.registrationDate).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>

                    {registration.teamName && (
                      <div className="bg-muted/50 rounded-md p-3">
                        <p className="text-sm">
                          <span className="font-medium">الفريق:</span> {registration.teamName}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {isPast ? (
                        <Badge variant="outline" className="w-full justify-center py-2">
                          <CheckCircle className="h-4 w-4 ml-1" />
                          فعالية منتهية
                        </Badge>
                      ) : registration.status !== "cancelled" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full"
                              data-testid={`button-cancel-${registration.id}`}
                            >
                              <Trash2 className="h-4 w-4 ml-1" />
                              إلغاء التسجيل
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>إلغاء التسجيل</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من إلغاء تسجيلك في فعالية "{event.title}"؟
                                لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel>تراجع</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => cancelMutation.mutate(registration.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {cancelMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "تأكيد الإلغاء"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Badge variant="secondary" className="w-full justify-center py-2">
                          ملغي
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {registrations.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 text-center">
              <p className="text-3xl font-bold text-primary">{registrations.length}</p>
              <p className="text-sm text-muted-foreground">إجمالي التسجيلات</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-3xl font-bold text-success">
                {registrations.filter((r) => r.status === "confirmed").length}
              </p>
              <p className="text-sm text-muted-foreground">تسجيلات مؤكدة</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-3xl font-bold text-gold">
                {registrations.filter((r) => r.status === "waitlist").length}
              </p>
              <p className="text-sm text-muted-foreground">قائمة انتظار</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-3xl font-bold text-muted-foreground">
                {registrations.filter((r) => r.status === "attended").length}
              </p>
              <p className="text-sm text-muted-foreground">تم الحضور</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
