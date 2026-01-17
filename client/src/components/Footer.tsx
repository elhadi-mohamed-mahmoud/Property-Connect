import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Dari.com. {t("footer.copyright")}</p>
        <p className="text-xs mt-1">{t("footer.marketplace")}</p>
      </div>
    </footer>
  );
}
