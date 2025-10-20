import { Calendar, MapPin, Users, Clock, Trophy, Heart, Footprints, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
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

export default function Events() {
  const events = [
    {
      id: 1,
      title: "بطولة كرة القدم السنوية",
      category: "كرة قدم",
      date: new Date(2025, 2, 15, 16, 0),
      location: "ملعب الشركة الرئيسي",
      maxParticipants: 160,
      currentParticipants: 128,
      image: footballImage,
      icon: Trophy,
      description: "بطولة كرة القدم السنوية للشركة - 16 فريق يتنافسون على كأس البطولة",
      requirements: "جميع الموظفين مرحب بهم - يجب التسجيل ضمن فريق",
      categoryColor: "bg-primary",
    },
    {
      id: 2,
      title: "اليوم الرياضي العائلي",
      category: "عائلي",
      date: new Date(2025, 2, 22, 10, 0),
      location: "حديقة الواحة الترفيهية",
      maxParticipants: 500,
      currentParticipants: 342,
      image: familyImage,
      icon: Heart,
      description: "يوم مليء بالأنشطة الترفيهية للموظفين وعائلاتهم مع مسابقات وجوائز",
      requirements: "مفتوح لجميع الموظفين وعائلاتهم - التسجيل المسبق مطلوب",
      categoryColor: "bg-victory",
    },
    {
      id: 3,
      title: "ماراثون أبراج الخيري",
      category: "جري",
      date: new Date(2025, 3, 5, 6, 0),
      location: "كورنيش المدينة",
      maxParticipants: 300,
      currentParticipants: 245,
      image: marathonImage,
      icon: Footprints,
      description: "ماراثون 10 كم للموظفين بهدف خيري - كل المشاركة تذهب للجمعيات الخيرية",
      requirements: "مستوى لياقة متوسط - فحص طبي مطلوب",
      categoryColor: "bg-success",
    },
    {
      id: 4,
      title: "دوري كرة السلة الداخلي",
      category: "كرة سلة",
      date: new Date(2025, 3, 20, 18, 0),
      location: "الصالة الرياضية المغطاة",
      maxParticipants: 80,
      currentParticipants: 64,
      image: basketballImage,
      icon: Dumbbell,
      description: "دوري كرة السلة بنظام المجموعات - 8 فرق يتنافسون",
      requirements: "التسجيل مفتوح حتى نفاد الأماكن",
      categoryColor: "bg-gold",
    },
  ];

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      "كرة قدم": "bg-primary text-primary-foreground",
      "عائلي": "bg-victory text-victory-foreground",
      "جري": "bg-success text-success-foreground",
      "كرة سلة": "bg-gold text-gold-foreground",
    };
    return colors[category] || "bg-secondary text-secondary-foreground";
  };

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
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover-elevate active-elevate-2 transition-all group" data-testid={`card-event-${event.id}`}>
              <div className="relative h-64 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={getCategoryBadgeColor(event.category)}>
                    <event.icon className="h-4 w-4 ml-1" />
                    {event.category}
                  </Badge>
                </div>
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
                        {event.date.toLocaleDateString('ar-SA', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {event.date.toLocaleTimeString('ar-SA', { 
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
                          {event.currentParticipants} / {event.maxParticipants}
                        </p>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">شروط المشاركة</p>
                      <p className="text-sm text-muted-foreground">{event.requirements}</p>
                    </div>
                  </div>
                </div>

                {/* Countdown */}
                <div className="border-t pt-6">
                  <p className="text-center text-sm text-muted-foreground mb-4">يبدأ خلال</p>
                  <Countdown targetDate={event.date} />
                </div>

                {/* CTA Button */}
                <Button className="w-full" size="lg" data-testid={`button-register-${event.id}`}>
                  <Trophy className="ml-2 h-5 w-5" />
                  سجل الآن
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

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
