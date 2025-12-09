import { Calendar, MapPin, Users, Clock, Trophy, Heart, Footprints, Dumbbell, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { Event, EventRegistration } from "@shared/schema";
import footballImage from "@assets/generated_images/Football_tournament_event_d6ff718f.png";
import familyImage from "@assets/generated_images/Family_sports_day_fb7dc0d7.png";
import marathonImage from "@assets/generated_images/Marathon_running_event_b03a4441.png";
import basketballImage from "@assets/generated_images/Basketball_tournament_action_c6044c35.png";

interface CountdownProps {
  targetDate: Date;
}

function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3 justify-center" dir="ltr">
      <div className="text-center">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono text-xl md:text-2xl font-bold">
          {timeLeft.days}
        </div>
        <div className="text-xs mt-1 text-muted-foreground" dir="rtl">يوم</div>
      </div>
      <div className="text-center">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono text-xl md:text-2xl font-bold">
          {timeLeft.hours}
        </div>
        <div className="text-xs mt-1 text-muted-foreground" dir="rtl">ساعة</div>
      </div>
      <div className="text-center">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono text-xl md:text-2xl font-bold">
          {timeLeft.minutes}
        </div>
        <div className="text-xs mt-1 text-muted-foreground" dir="rtl">دقيقة</div>
      </div>
      <div className="text-center">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono text-xl md:text-2xl font-bold">
          {timeLeft.seconds}
        </div>
        <div className="text-xs mt-1 text-muted-foreground" dir="rtl">ثانية</div>
      </div>
    </div>
  );
}

const categoryImages: Record<string, string> = {
  football: footballImage,
  family: familyImage,
  marathon: marathonImage,
  basketball: basketballImage,
};

const categoryIcons: Record<string, typeof Trophy> = {
  football: Trophy,
  family: Heart,
  marathon: Footprints,
  basketball: Dumbbell,
};

const categoryLabels: Record<string, string> = {
  football: "كرة قدم",
  family: "عائلي",
  marathon: "جري",
  basketball: "كرة سلة",
};

export default function Events() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: myRegistrations = [] } = useQuery<EventRegistration[]>({
    queryKey: ["/api/my-registrations"],
    enabled: isAuthenticated,
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await apiRequest("POST", `/api/events/${eventId}/register`, {});
    },
    onSuccess: () => {
      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيلك في الفعالية بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: any) => {
      toast({
        title: "فشل التسجيل",
        description: error.message || "حدث خطأ أثناء التسجيل",
        variant: "destructive",
      });
    },
  });

  const isRegistered = (eventId: string) => {
    return myRegistrations.some((reg) => reg.eventId === eventId);
  };

  const handleRegister = (eventId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول أولاً للتسجيل في الفعالية",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    registerMutation.mutate(eventId);
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      football: "bg-primary text-primary-foreground",
      family: "bg-victory text-victory-foreground",
      marathon: "bg-success text-success-foreground",
      basketball: "bg-gold text-gold-foreground",
    };
    return colors[category] || "bg-secondary text-secondary-foreground";
  };

  if (eventsLoading) {
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
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-base px-4 py-2" data-testid="badge-events">
            الفعاليات القادمة
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-bold">
            انضم إلى فعالياتنا الرياضية
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            تصفح جميع الأنشطة والفعاليات المقبلة وسجل مشاركتك الآن
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event) => {
            const Icon = categoryIcons[event.category] || Trophy;
            const image = categoryImages[event.category] || footballImage;
            const registered = isRegistered(event.id);
            const eventDate = new Date(event.date);
            const isFull = event.maxParticipants && event.currentParticipants && 
                          event.currentParticipants >= event.maxParticipants;

            return (
              <Card key={event.id} className="overflow-hidden hover-elevate active-elevate-2 transition-all group" data-testid={`card-event-${event.id}`}>
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={getCategoryBadgeColor(event.category)}>
                      <Icon className="h-4 w-4 ml-1" />
                      {categoryLabels[event.category] || event.category}
                    </Badge>
                  </div>
                  {registered && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="h-4 w-4 ml-1" />
                        مسجل
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                </div>

                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl md:text-3xl font-display">{event.title}</CardTitle>
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">التاريخ والوقت</p>
                        <p className="text-sm text-muted-foreground">
                          {eventDate.toLocaleDateString('ar-SA', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          {eventDate.toLocaleTimeString('ar-SA', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">المكان</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">المشاركون</p>
                          <p className="text-sm text-muted-foreground" data-testid={`participants-${event.id}`}>
                            {event.currentParticipants || 0} / {event.maxParticipants || "∞"}
                          </p>
                        </div>
                        {event.maxParticipants && (
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${((event.currentParticipants || 0) / event.maxParticipants) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {event.requirements && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">شروط المشاركة</p>
                          <p className="text-sm text-muted-foreground">{event.requirements}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Countdown */}
                  <div className="border-t pt-6">
                    <p className="text-center text-sm text-muted-foreground mb-4">يبدأ خلال</p>
                    <Countdown targetDate={eventDate} />
                  </div>

                  {/* CTA Button */}
                  {registered ? (
                    <Button className="w-full" size="lg" variant="secondary" disabled data-testid={`button-registered-${event.id}`}>
                      <CheckCircle className="ml-2 h-5 w-5" />
                      أنت مسجل في هذه الفعالية
                    </Button>
                  ) : isFull ? (
                    <Button className="w-full" size="lg" variant="secondary" disabled data-testid={`button-full-${event.id}`}>
                      الفعالية ممتلئة
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={() => handleRegister(event.id)}
                      disabled={registerMutation.isPending}
                      data-testid={`button-register-${event.id}`}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Trophy className="ml-2 h-5 w-5" />
                      )}
                      سجل الآن
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {events.length === 0 && (
          <Card className="mt-8 p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد فعاليات حالياً</h3>
            <p className="text-muted-foreground">ترقبوا الفعاليات القادمة قريباً</p>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-12 bg-muted/50 border-2 border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <Trophy className="h-12 w-12 mx-auto text-primary" />
            <h3 className="text-2xl font-display font-bold">لم تجد الفعالية المناسبة؟</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              نرحب بجميع الاقتراحات والأفكار الجديدة للفعاليات الرياضية. تواصل معنا وشاركنا أفكارك!
            </p>
            <Button variant="outline" size="lg" data-testid="button-contact">
              تواصل معنا
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
