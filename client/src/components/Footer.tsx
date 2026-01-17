import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Home } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover-elevate rounded-lg p-2 -m-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-lg">Dari.com</p>
                <p className="text-xs text-muted-foreground">{t("footer.tagline")}</p>
              </div>
            </div>
          </Link>
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Dari.com. {t("footer.copyright")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              dari.com | {t("footer.marketplace")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
