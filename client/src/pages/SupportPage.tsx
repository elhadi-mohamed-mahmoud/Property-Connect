import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Mail, Headphones } from "lucide-react";
import type { AppSettings } from "@shared/schema";

export default function SupportPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: ["/api/app-settings"],
  });

  const hasAnyContact = settings?.supportPhone || settings?.supportWhatsapp || settings?.supportEmail;

  const formatWhatsAppLink = (number: string) => {
    const cleaned = number.replace(/\D/g, "");
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Headphones className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-support-title">
          {t("support.title")}
        </h1>
        <p className="text-muted-foreground" data-testid="text-support-description">
          {t("support.description")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !hasAnyContact ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("support.noContacts")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {settings?.supportPhone && (
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <a
                  href={`tel:${settings.supportPhone}`}
                  className="flex items-center gap-4"
                  data-testid="link-support-phone"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
                    <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{t("support.phone")}</h3>
                    <p className="text-muted-foreground">{settings.supportPhone}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {t("property.call")}
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          {settings?.supportWhatsapp && (
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <a
                  href={formatWhatsAppLink(settings.supportWhatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4"
                  data-testid="link-support-whatsapp"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
                    <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{t("support.whatsapp")}</h3>
                    <p className="text-muted-foreground">{settings.supportWhatsapp}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {t("property.whatsapp")}
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          {settings?.supportEmail && (
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="flex items-center gap-4"
                  data-testid="link-support-email"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{t("support.email")}</h3>
                    <p className="text-muted-foreground">{settings.supportEmail}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {t("support.email")}
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
}
