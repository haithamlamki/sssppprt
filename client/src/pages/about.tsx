import { Target, Heart, Users, Trophy, TrendingUp, Award, Zap, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "الصحة والعافية",
      description: "نؤمن بأهمية الصحة البدنية والنفسية لجميع موظفينا وأسرهم",
    },
    {
      icon: Users,
      title: "روح الفريق",
      description: "نعزز التعاون والترابط بين الموظفين من خلال الرياضة",
    },
    {
      icon: Trophy,
      title: "التميز الرياضي",
      description: "نشجع على المنافسة الشريفة والسعي للتميز في جميع الأنشطة",
    },
    {
      icon: Star,
      title: "الشمولية",
      description: "نوفر فرصاً متساوية للجميع بغض النظر عن المستوى أو الخبرة",
    },
  ];

  const objectives = [
    {
      icon: TrendingUp,
      title: "تعزيز اللياقة البدنية",
      description: "تشجيع الموظفين على ممارسة الرياضة بانتظام من خلال برامج وفعاليات متنوعة",
    },
    {
      icon: Users,
      title: "بناء العلاقات",
      description: "خلق فرص للتواصل والتفاعل بين الموظفين من مختلف الأقسام والمستويات",
    },
    {
      icon: Award,
      title: "اكتشاف المواهب",
      description: "توفير منصة لإبراز المواهب الرياضية ودعم الرياضيين الموهوبين",
    },
    {
      icon: Heart,
      title: "تحسين جودة الحياة",
      description: "المساهمة في تحسين الصحة النفسية والتوازن بين العمل والحياة",
    },
    {
      icon: Zap,
      title: "رفع الروح المعنوية",
      description: "زيادة الحماس والطاقة الإيجابية في بيئة العمل",
    },
    {
      icon: Trophy,
      title: "تعزيز الانتماء",
      description: "تقوية الولاء للشركة من خلال الأنشطة الممتعة والمجزية",
    },
  ];

  const achievements = [
    { number: "150+", label: "فعالية سنوياً" },
    { number: "2500+", label: "مشارك نشط" },
    { number: "12", label: "رياضة متنوعة" },
    { number: "85+", label: "بطولة منظمة" },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-base px-4 py-2" data-testid="badge-about">
            من نحن
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-bold">
            اللجنة الرياضية
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            شركة أبراج لخدمات الطاقة
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-20">
          <CardContent className="p-12 md:p-16 space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-8">
              نبذة عن اللجنة
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
              اللجنة الرياضية بشركة أبراج لخدمات الطاقة هي منظمة داخلية تهدف إلى تعزيز الصحة البدنية والنفسية للموظفين وأسرهم من خلال تنظيم وإدارة الأنشطة الرياضية والترفيهية المتنوعة. نؤمن بأن الموظف الصحي والسعيد هو أساس نجاح المؤسسة، ولذلك نسعى جاهدين لتوفير بيئة رياضية محفزة وداعمة تشجع على المشاركة الفعالة والتفاعل الإيجابي.
            </p>
          </CardContent>
        </Card>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
            <CardContent className="p-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                  <Target className="h-9 w-9" />
                </div>
                <h3 className="text-3xl font-display font-bold">رؤيتنا</h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                أن نكون المنصة الرياضية الأولى التي تجمع موظفي الشركة وأسرهم في بيئة رياضية محفزة وممتعة، نساهم من خلالها في بناء مجتمع صحي ومتماسك يعزز روح الانتماء والولاء للشركة.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-victory/10 to-victory/5 border-2 border-victory/20">
            <CardContent className="p-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-victory text-victory-foreground flex items-center justify-center">
                  <Heart className="h-9 w-9" />
                </div>
                <h3 className="text-3xl font-display font-bold">رسالتنا</h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                تنظيم فعاليات رياضية وترفيهية متنوعة على مدار العام، توفير المرافق الرياضية المناسبة، وتشجيع المشاركة الفعالة من جميع الموظفين بما يعزز الصحة البدنية والنفسية ويقوي روح الفريق.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <section className="mb-20">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold">قيمنا</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              المبادئ التي توجه عملنا وأنشطتنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover-elevate active-elevate-2 transition-all" data-testid={`value-${index}`}>
                <CardContent className="p-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-bold">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Objectives */}
        <section className="mb-20">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold">أهدافنا</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ما نسعى لتحقيقه من خلال أنشطتنا وبرامجنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((objective, index) => (
              <Card key={index} className="hover-elevate transition-all" data-testid={`objective-${index}`}>
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-md bg-success/10 flex items-center justify-center">
                      <objective.icon className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-bold mb-2">{objective.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {objective.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Achievements Stats */}
        <Card className="bg-gradient-to-l from-primary via-victory to-success text-primary-foreground border-0">
          <CardContent className="p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
              إنجازاتنا بالأرقام
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center space-y-2" data-testid={`achievement-${index}`}>
                  <div className="text-5xl md:text-6xl font-display font-bold">
                    {achievement.number}
                  </div>
                  <div className="text-lg md:text-xl opacity-95">
                    {achievement.label}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
