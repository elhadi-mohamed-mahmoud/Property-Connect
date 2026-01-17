import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Search, Home, Heart, Building2, MapPin, Users } from "lucide-react";

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80')"
          }}
        />
        
        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl leading-tight" data-testid="hero-headline">
            {t("landing.headline")}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl" data-testid="hero-subheadline">
            {t("landing.subheadline")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 gap-2 text-lg px-8"
              asChild
            >
              <a href="/api/login" data-testid="hero-cta">
                <Search className="h-5 w-5" />
                {t("landing.cta")}
              </a>
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="flex items-center gap-2 text-white/80">
              <Building2 className="h-5 w-5" />
              <span>{t("landing.stats.properties")}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Users className="h-5 w-5" />
              <span>{t("landing.stats.users")}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="h-5 w-5" />
              <span>{t("landing.stats.locations")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t("landing.whyChoose")}</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center hover-elevate">
              <CardContent className="pt-8 pb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("landing.features.search.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.features.search.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate">
              <CardContent className="pt-8 pb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("landing.features.listings.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.features.listings.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate">
              <CardContent className="pt-8 pb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("landing.features.favorites.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.features.favorites.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("landing.readyToFind")}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("landing.joinThousands")}
          </p>
          <Button size="lg" asChild data-testid="footer-cta">
            <a href="/api/login">
              {t("landing.cta")}
            </a>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Dari.com. {t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
