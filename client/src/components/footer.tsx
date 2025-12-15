import { Trophy, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-20">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl">اللجنة الرياضية</h3>
                <p className="text-base text-muted-foreground">شركة أبراج لخدمات الطاقة</p>
              </div>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              نسعى لتعزيز الصحة وروح الفريق من خلال تنظيم الأنشطة الرياضية والترفيهية للموظفين وأسرهم.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                className="flex items-center justify-center w-9 h-9 rounded-md hover-elevate active-elevate-2 bg-secondary text-secondary-foreground"
                data-testid="link-facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex items-center justify-center w-9 h-9 rounded-md hover-elevate active-elevate-2 bg-secondary text-secondary-foreground"
                data-testid="link-twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/abrajenergy.sports/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-md hover-elevate active-elevate-2 bg-secondary text-secondary-foreground"
                data-testid="link-instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" data-testid="footer-link-home">
                  <span className="text-base text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    الصفحة الرئيسية
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/events" data-testid="footer-link-events">
                  <span className="text-base text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    الفعاليات القادمة
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/gallery" data-testid="footer-link-gallery">
                  <span className="text-base text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    معرض الصور
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/results" data-testid="footer-link-results">
                  <span className="text-base text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    النتائج والإنجازات
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about" data-testid="footer-link-about">
                  <span className="text-base text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    من نحن
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-base font-medium">الهاتف</p>
                  <p className="text-base text-muted-foreground" dir="ltr">+968 99371775</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-base font-medium">البريد الإلكتروني</p>
                  <p className="text-base text-muted-foreground" dir="ltr">sports@abrajenergy.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-base font-medium">العنوان</p>
                  <p className="text-base text-muted-foreground">سلطنة عمان</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-base text-muted-foreground">
            © {new Date().getFullYear()} اللجنة الرياضية - شركة أبراج لخدمات الطاقة. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
