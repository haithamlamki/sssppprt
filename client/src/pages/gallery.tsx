import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Heart, Footprints, Dumbbell, Filter } from "lucide-react";
import footballImage from "@assets/generated_images/Football_tournament_event_d6ff718f.png";
import familyImage from "@assets/generated_images/Family_sports_day_fb7dc0d7.png";
import marathonImage from "@assets/generated_images/Marathon_running_event_b03a4441.png";
import basketballImage from "@assets/generated_images/Basketball_tournament_action_c6044c35.png";
import awardsImage from "@assets/generated_images/Championship_awards_display_421aecd4.png";
import heroImage from "@assets/generated_images/Sports_celebration_hero_image_857d51d1.png";

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const categories = [
    { id: "all", label: "الكل", icon: Filter },
    { id: "football", label: "كرة القدم", icon: Trophy },
    { id: "family", label: "عائلي", icon: Heart },
    { id: "marathon", label: "جري وماراثون", icon: Footprints },
    { id: "basketball", label: "كرة السلة", icon: Dumbbell },
  ];

  const galleryItems = [
    {
      id: 1,
      title: "نهائي بطولة كرة القدم 2024",
      category: "football",
      image: footballImage,
      date: "ديسمبر 2024",
      description: "لحظات التتويج من نهائي بطولة كرة القدم السنوية",
    },
    {
      id: 2,
      title: "اليوم العائلي الترفيهي",
      category: "family",
      image: familyImage,
      date: "نوفمبر 2024",
      description: "أجواء مليئة بالمرح والسعادة مع العائلات",
    },
    {
      id: 3,
      title: "ماراثون أبراج الخيري 2024",
      category: "marathon",
      image: marathonImage,
      date: "أكتوبر 2024",
      description: "مشاركة واسعة في ماراثون 10 كيلومتر",
    },
    {
      id: 4,
      title: "دوري كرة السلة الداخلي",
      category: "basketball",
      image: basketballImage,
      date: "سبتمبر 2024",
      description: "منافسات قوية في دوري كرة السلة",
    },
    {
      id: 5,
      title: "حفل توزيع الجوائز",
      category: "football",
      image: awardsImage,
      date: "ديسمبر 2024",
      description: "تكريم الفائزين والمتميزين في البطولات",
    },
    {
      id: 6,
      title: "احتفالات البطولة",
      category: "football",
      image: heroImage,
      date: "ديسمبر 2024",
      description: "فرحة الفوز واللحظات الذهبية",
    },
    {
      id: 7,
      title: "مباراة كرة القدم الودية",
      category: "football",
      image: footballImage,
      date: "نوفمبر 2024",
      description: "لقاء ودي بين فريقي الإدارة والهندسة",
    },
    {
      id: 8,
      title: "نشاطات الأطفال العائلية",
      category: "family",
      image: familyImage,
      date: "أكتوبر 2024",
      description: "ألعاب ومسابقات خاصة للأطفال",
    },
  ];

  const filteredGallery = activeFilter === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="text-base px-4 py-2" data-testid="badge-gallery">
            معرض الصور
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-bold">
            لحظات لا تُنسى
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            استعرض أجمل اللحظات والذكريات من فعالياتنا الرياضية
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeFilter === category.id ? "default" : "outline"}
              onClick={() => setActiveFilter(category.id)}
              className="gap-2"
              data-testid={`filter-${category.id}`}
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <Card 
              key={item.id} 
              className="overflow-hidden hover-elevate active-elevate-2 transition-all group cursor-pointer"
              data-testid={`gallery-item-${item.id}`}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-medium">
                    {item.date}
                  </Badge>
                  <Badge variant="outline">
                    {categories.find(c => c.id === item.category)?.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredGallery.length === 0 && (
          <Card className="p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-display font-bold mb-2">لا توجد صور</h3>
            <p className="text-muted-foreground">
              لم يتم العثور على صور في هذا التصنيف
            </p>
          </Card>
        )}

        {/* Stats Section */}
        <Card className="mt-16 bg-gradient-to-l from-primary/10 via-victory/10 to-success/10 border-0">
          <CardContent className="p-12 text-center space-y-6">
            <Trophy className="h-16 w-16 mx-auto text-primary" />
            <h3 className="text-3xl md:text-4xl font-display font-bold">
              شارك ذكرياتك معنا
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              هل شاركت في إحدى فعالياتنا؟ نود أن نرى صورك ولحظاتك المميزة!
            </p>
            <Button size="lg" data-testid="button-share">
              شارك صورك
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
