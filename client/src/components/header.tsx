import { Link, useLocation } from "wouter";
import { Menu, X, User, LogOut, LogIn, Shield, MessageSquare, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import logoImage from "@assets/ABRJ.OM_-_Copy_1765276224339.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role === "committee_member";

  const navItems = [
    { href: "/", label: "الرئيسية" },
    { href: "/events", label: "الفعاليات" },
    { href: "/leagues", label: "البطولات" },
    { href: "/forum", label: "المنتدى" },
    { href: "/gallery", label: "المعرض" },
    { href: "/results", label: "النتائج" },
    { href: "/chats", label: "المحادثات", icon: MessageSquare, authRequired: true },
    { href: "/about", label: "من نحن" },
  ];

  const adminNavItems = [
    { href: "/admin", label: "لوحة التحكم", icon: Shield },
    { href: "/team-wizard", label: "معالج الفرق", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Title */}
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer hover-elevate rounded-md px-2 sm:px-3 py-1 sm:py-2 transition-colors">
            <img 
              src={logoImage} 
              alt="شعار أبراج" 
              className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 object-contain flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-display font-bold leading-tight truncate">اللجنة الرياضية</h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground truncate">شركة أبراج لخدمات الطاقة</p>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            if (item.authRequired && !isAuthenticated) return null;
            return (
              <Link key={item.href} href={item.href} data-testid={`link-${item.label}`}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="text-base font-medium gap-2"
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Button>
              </Link>
            );
          })}
          {isAuthenticated && isAdmin && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              {adminNavItems.map((item) => (
                <Link key={item.href} href={item.href} data-testid={`link-admin-${item.label}`}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    className="text-base font-medium gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationsDropdown />
          
          {/* Auth buttons */}
          {isAuthenticated ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                    <User className="h-4 w-4" />
                    <span>{user?.fullName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    الملف الشخصي
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-events")} data-testid="menu-my-events">
                    <Calendar className="mr-2 h-4 w-4" />
                    فعالياتي
                  </DropdownMenuItem>
                  {(user?.role === "admin" || user?.role === "committee_member") && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="menu-admin">
                        <Shield className="mr-2 h-4 w-4" />
                        لوحة التحكم
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/team-wizard")} data-testid="menu-team-wizard">
                        <Users className="mr-2 h-4 w-4" />
                        معالج الفرق
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" onClick={() => navigate("/login")} data-testid="button-login-header">
                <LogIn className="mr-2 h-4 w-4" />
                تسجيل الدخول
              </Button>
              <Button onClick={() => navigate("/register")} data-testid="button-register-header">
                إنشاء حساب
              </Button>
            </div>
          )}
          
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
            {navItems.map((item) => {
              if (item.authRequired && !isAuthenticated) return null;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start text-base font-medium gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-link-${item.label}`}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            {/* Mobile auth buttons */}
            <div className="border-t pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-base text-muted-foreground">
                    {user?.fullName}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/profile");
                      setMobileMenuOpen(false);
                    }}
                    data-testid="mobile-menu-profile"
                  >
                    <User className="mr-2 h-4 w-4" />
                    الملف الشخصي
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/my-events");
                      setMobileMenuOpen(false);
                    }}
                    data-testid="mobile-menu-my-events"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    فعالياتي
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/admin");
                          setMobileMenuOpen(false);
                        }}
                        data-testid="mobile-menu-admin"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        لوحة التحكم
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/team-wizard");
                          setMobileMenuOpen(false);
                        }}
                        data-testid="mobile-menu-team-wizard"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        معالج الفرق
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    data-testid="mobile-button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                    data-testid="mobile-button-login"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    تسجيل الدخول
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/register");
                      setMobileMenuOpen(false);
                    }}
                    data-testid="mobile-button-register"
                  >
                    إنشاء حساب
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
