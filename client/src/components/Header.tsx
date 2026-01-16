import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Plus, Heart, User, LogOut, Menu, Globe, ChevronDown, Headphones, Settings } from "lucide-react";
import { useState } from "react";
import type { AppSettings } from "@shared/schema";

const languages = [
  { code: "en", name: "English", shortCode: "EN" },
  { code: "ar", name: "العربية", shortCode: "AR" },
  { code: "fr", name: "Français", shortCode: "FR" },
] as const;

export function Header() {
  const { t } = useTranslation();
  const { language, setLanguage, isRTL } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: appSettings } = useQuery<AppSettings>({
    queryKey: ["/api/app-settings"],
  });

  const { data: adminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
    enabled: isAuthenticated,
  });

  const currentLanguage = languages.find((l) => l.code === language);
  const isAdmin = adminCheck?.isAdmin ?? false;

  const navItems = [
    { href: "/", label: t("nav.home"), icon: Home },
    ...(isAuthenticated
      ? [
          { href: "/create", label: t("nav.createListing"), icon: Plus },
          { href: "/favorites", label: t("nav.favorites"), icon: Heart },
        ]
      : []),
    { href: "/support", label: t("support.title"), icon: Headphones },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={location === item.href ? "secondary" : "ghost"}
            className={`gap-2 ${mobile ? "w-full justify-start" : ""}`}
            onClick={() => mobile && setMobileOpen(false)}
            data-testid={`nav-${item.href.replace("/", "") || "home"}`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="logo">
            {appSettings?.logoUrl ? (
              <img
                src={appSettings.logoUrl}
                alt="PropFind"
                className="h-8 w-auto object-contain"
                data-testid="img-app-logo"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <span className="font-bold text-xl hidden sm:inline">PropFind</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLinks />
        </nav>

        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2" data-testid="language-switcher">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{currentLanguage?.name}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={language === lang.code ? "bg-accent" : ""}
                  data-testid={`lang-${lang.code}`}
                >
                  <span className="mr-2 font-medium text-xs bg-muted px-1.5 py-0.5 rounded">{lang.shortCode}</span>
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 p-1" data-testid="user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl || ""} />
                    <AvatarFallback>
                      {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">
                    {user.firstName || user.email?.split("@")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-48">
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer" data-testid="nav-profile">
                    <User className="h-4 w-4 mr-2" />
                    {t("nav.profile")}
                  </DropdownMenuItem>
                </Link>
                {isAdmin && (
                  <Link href="/admin/settings">
                    <DropdownMenuItem className="cursor-pointer" data-testid="nav-admin">
                      <Settings className="h-4 w-4 mr-2" />
                      {t("admin.settings")}
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onClick={() => (window.location.href = "/api/logout")}
                  data-testid="logout-button"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild data-testid="login-button">
              <a href="/api/login">{t("nav.login")}</a>
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "left" : "right"} className="w-64">
              <nav className="flex flex-col gap-2 mt-8">
                <NavLinks mobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
