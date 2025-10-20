import { Link, useLocation } from "wouter";
import { Trophy, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "الرئيسية" },
    { href: "/events", label: "الفعاليات" },
    { href: "/gallery", label: "المعرض" },
    { href: "/results", label: "النتائج" },
    { href: "/about", label: "من نحن" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Title */}
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-3 cursor-pointer hover-elevate rounded-md px-3 py-2 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-display font-bold leading-tight">اللجنة الرياضية</h1>
              <p className="text-xs text-muted-foreground">شركة أبراج لخدمات الطاقة</p>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} data-testid={`link-${item.label}`}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className="text-base font-medium"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card">
          <nav className="container mx-auto flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-link-${item.label}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
