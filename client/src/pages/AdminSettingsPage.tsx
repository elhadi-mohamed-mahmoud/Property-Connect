import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Settings, Upload, Phone, MessageCircle, Mail, ShieldAlert, Image } from "lucide-react";
import type { AppSettings } from "@shared/schema";

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();

  const { data: adminCheck, isLoading: checkingAdmin } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  const { data: settings, isLoading: loadingSettings } = useQuery<AppSettings>({
    queryKey: ["/api/app-settings"],
  });

  const [logoUrl, setLogoUrl] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [supportWhatsapp, setSupportWhatsapp] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setLogoUrl(settings.logoUrl || "");
      setSupportPhone(settings.supportPhone || "");
      setSupportWhatsapp(settings.supportWhatsapp || "");
      setSupportEmail(settings.supportEmail || "");
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<AppSettings>) => {
      const res = await apiRequest("PATCH", "/api/app-settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/app-settings"] });
      toast({
        title: t("common.success"),
        description: t("admin.settingsSaved"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        variant: "destructive",
      });
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("images", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { urls } = await res.json();
      if (urls?.[0]) {
        setLogoUrl(urls[0]);
        updateMutation.mutate({ logoUrl: urls[0] });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({
      logoUrl,
      supportPhone,
      supportWhatsapp,
      supportEmail,
    });
  };

  if (checkingAdmin || loadingSettings) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-xl" dir={isRTL ? "rtl" : "ltr"}>
          <Card>
            <CardContent className="py-12 text-center">
              <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-semibold mb-2">{t("admin.adminOnly")}</h2>
              <p className="text-muted-foreground">
                {t("admin.noPermission")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold" data-testid="text-admin-title">
          {t("admin.title")}
        </h1>
        </div>

        <div className="space-y-6">
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              {t("admin.appLogo")}
            </CardTitle>
            <CardDescription>
              {t("admin.logoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {logoUrl && (
              <div className="flex items-center gap-4">
                <img
                  src={logoUrl}
                  alt="App Logo"
                  className="h-16 w-auto object-contain rounded border"
                  data-testid="img-current-logo"
                />
                <span className="text-sm text-muted-foreground">{t("admin.currentLogo")}</span>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="max-w-xs"
                data-testid="input-logo-upload"
              />
              {uploading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              {t("admin.supportContacts")}
            </CardTitle>
            <CardDescription>
              {t("admin.contactsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supportPhone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t("admin.supportPhone")}
              </Label>
              <Input
                id="supportPhone"
                type="tel"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+222 12345678"
                data-testid="input-support-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportWhatsapp" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {t("admin.supportWhatsapp")}
              </Label>
              <Input
                id="supportWhatsapp"
                type="tel"
                value={supportWhatsapp}
                onChange={(e) => setSupportWhatsapp(e.target.value)}
                placeholder="+222 12345678"
                data-testid="input-support-whatsapp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t("admin.supportEmail")}
              </Label>
              <Input
                id="supportEmail"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@example.com"
                data-testid="input-support-email"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="w-full"
              data-testid="button-save-settings"
            >
              {updateMutation.isPending ? t("admin.saving") : t("admin.saveSettings")}
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
