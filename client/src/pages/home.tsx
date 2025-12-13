import { Trophy, Users, Calendar, Award, TrendingUp, Heart, Target, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import defaultHeroImage from "@assets/WhatsApp_Image_2025-12-14_at_1.09.59_AM_1765663609189.jpg";

export default function Home() {
  const [stats, setStats] = useState({
    events: 0,
    participants: 0,
    achievements: 0,
    sports: 0,
  });

  const { data: heroSetting } = useQuery<{ key: string; value: string | null }>({
    queryKey: ['/api/settings/hero_image'],
  });

  const heroImage = heroSetting?.value || defaultHeroImage;

  useEffect(() => {
    // Animate counters
    const targetStats = {
      events: 150,
      participants: 2500,
      achievements: 85,
      sports: 12,
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        events: Math.floor(targetStats.events * progress),
        participants: Math.floor(targetStats.participants * progress),
        achievements: Math.floor(targetStats.achievements * progress),
        sports: Math.floor(targetStats.sports * progress),
      });

      if (currentStep >= steps) {
        setStats(targetStats);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const services = [
    {
      icon: Trophy,
      title: "البطولات الداخلية",
      description: "تنظيم بطولات دورية في مختلف الألعاب الرياضية للموظفين",
    },
    {
      icon: Users,
      title: "الأيام العائلية",
      description: "فعاليات ترفيهية شاملة للموظفين وأسرهم",
    },
    {
      icon: Heart,
      title: "برامج اللياقة",
      description: "تحديات وبرامج لتعزيز الصحة واللياقة البدنية",
    },
    {
      icon: Target,
      title: "المرافق الرياضية",
      description: "توفير وصيانة المنشآت والمعدات الرياضية",
    },
  ];

  const newsItems = [
    "🏆 فريق الهندسة يتوج بطلاً لدوري كرة القدم الداخلي",
    "🎉 التسجيل مفتوح الآن لبطولة كرة السلة السنوية",
    "🏃 ماراثون الشركة القادم - 15 مارس 2025",
    "⚽ نتائج مباريات الأسبوع متاحة الآن في قسم النتائج",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="اللجنة الرياضية"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center space-y-6">
          <Badge className="text-base px-4 py-2 bg-primary/90 backdrop-blur-sm" data-testid="badge-hero">
            اللجنة الرياضية - شركة أبراج لخدمات الطاقة
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground drop-shadow-lg">
            معاً نبني مجتمعاً رياضياً متميزاً
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 max-w-3xl mx-auto leading-relaxed drop-shadow">
            تعزيز الصحة وروح الفريق من خلال الأنشطة الرياضية والترفيهية
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link href="/events">
              <Button size="lg" className="text-lg px-8" data-testid="button-view-events">
                <Calendar className="ml-2 h-5 w-5" />
                استعرض الفعاليات
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 backdrop-blur-sm bg-background/80" data-testid="button-about">
                <TrendingUp className="ml-2 h-5 w-5" />
                تعرف علينا
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-8 space-y-3">
                <Calendar className="h-12 w-12 mx-auto text-primary" />
                <div className="text-4xl md:text-5xl font-display font-bold text-primary" data-testid="stat-events">
                  {stats.events}+
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-medium">فعالية منظمة</p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-8 space-y-3">
                <Users className="h-12 w-12 mx-auto text-victory" />
                <div className="text-4xl md:text-5xl font-display font-bold text-victory" data-testid="stat-participants">
                  {stats.participants}+
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-medium">مشارك نشط</p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-8 space-y-3">
                <Award className="h-12 w-12 mx-auto text-gold" />
                <div className="text-4xl md:text-5xl font-display font-bold text-gold" data-testid="stat-achievements">
                  {stats.achievements}+
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-medium">إنجاز محقق</p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-8 space-y-3">
                <Trophy className="h-12 w-12 mx-auto text-success" />
                <div className="text-4xl md:text-5xl font-display font-bold text-success" data-testid="stat-sports">
                  {stats.sports}+
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-medium">رياضة متنوعة</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="text-base px-4 py-2" data-testid="badge-services">
              خدماتنا
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              ماذا نقدم لموظفينا
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              مجموعة متنوعة من الأنشطة والخدمات الرياضية لتعزيز الصحة والتفاعل
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover-elevate active-elevate-2 transition-all cursor-pointer group" data-testid={`card-service-${index}`}>
                <CardContent className="p-8 space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-bold">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News Ticker */}
      <section className="py-8 bg-primary text-primary-foreground overflow-hidden">
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0 px-6 flex items-center gap-2 font-bold text-lg">
            <Zap className="h-5 w-5" />
            آخر الأخبار
          </div>
          <div className="flex gap-12 animate-marquee">
            {[...newsItems, ...newsItems].map((news, index) => (
              <div key={index} className="flex-shrink-0 text-lg font-medium">
                {news}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8 md:p-12 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                    <Target className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-display font-bold">رؤيتنا</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  أن نكون المنصة الرياضية الأولى التي تجمع موظفي الشركة وأسرهم في بيئة رياضية محفزة وممتعة، نساهم من خلالها في بناء مجتمع صحي ومتماسك يعزز روح الانتماء والولاء للشركة.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-victory/20">
              <CardContent className="p-8 md:p-12 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-md bg-victory text-victory-foreground flex items-center justify-center">
                    <Heart className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-display font-bold">رسالتنا</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  تنظيم فعاليات رياضية وترفيهية متنوعة على مدار العام، توفير المرافق الرياضية المناسبة، وتشجيع المشاركة الفعالة من جميع الموظفين بما يعزز الصحة البدنية والنفسية ويقوي روح الفريق.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="bg-gradient-to-l from-primary via-primary to-victory text-primary-foreground border-0">
            <CardContent className="p-12 md:p-16 text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-display font-bold">
                انضم لمجتمعنا الرياضي
              </h2>
              <p className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed opacity-95">
                ابدأ رحلتك الرياضية معنا واستمتع بفعاليات متنوعة طوال العام
              </p>
              <div className="pt-4">
                <Link href="/events">
                  <Button size="lg" variant="outline" className="text-lg px-8 bg-background text-foreground hover:bg-background/90 border-2" data-testid="button-cta-events">
                    <Calendar className="ml-2 h-5 w-5" />
                    اكتشف الفعاليات القادمة
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
