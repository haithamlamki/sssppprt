import { User, Mail, Phone, Building, Briefcase, Calendar, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

const shiftLabels: Record<string, string> = {
  "2weeks_on_2weeks_off": "2 أسبوع عمل / 2 أسبوع إجازة",
  normal: "دوام عادي",
  flexible: "دوام مرن",
};

const roleLabels: Record<string, string> = {
  employee: "موظف",
  admin: "مدير",
  committee_member: "عضو لجنة",
};

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">يجب تسجيل الدخول</h2>
          <p className="text-muted-foreground mb-6">
            يرجى تسجيل الدخول لعرض ملفك الشخصي
          </p>
          <Button onClick={() => navigate("/login")} data-testid="button-login">
            تسجيل الدخول
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            {user.fullName}
          </h1>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="outline">{user.department}</Badge>
            <Badge>{roleLabels[user.role] || user.role}</Badge>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card data-testid="card-personal-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الاسم الكامل</p>
                  <p className="font-medium">{user.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الجوال</p>
                    <p className="font-medium" dir="ltr">{user.phoneNumber}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-work-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                معلومات العمل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">القسم</p>
                  <p className="font-medium">{user.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">المنصب</p>
                  <p className="font-medium">{user.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">رقم الموظف</p>
                  <p className="font-medium">{user.employeeId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2" data-testid="card-shift-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                جدول الدوام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">نظام الدوام</p>
                  <p className="font-medium">{shiftLabels[user.shiftPattern] || user.shiftPattern}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">الحالة الحالية</p>
                  <Badge className={user.currentShiftStatus === "available" ? "bg-success" : "bg-gold"}>
                    {user.currentShiftStatus === "available" ? "متاح" : 
                     user.currentShiftStatus === "on_shift" ? "في الدوام" : "في الإجازة"}
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">تاريخ التسجيل</p>
                  <p className="font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => navigate("/my-events")} data-testid="button-my-events">
            فعالياتي
          </Button>
          <Button variant="outline" onClick={() => navigate("/events")} data-testid="button-browse-events">
            تصفح الفعاليات
          </Button>
        </div>
      </div>
    </div>
  );
}
