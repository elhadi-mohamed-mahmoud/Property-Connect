import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Property } from "@shared/schema";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [authLoading, isAuthenticated]);

  const { data: favorites = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const response = await fetch("/api/favorites", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch favorites");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const { data: favoriteIds = [] } = useQuery<string[]>({
    queryKey: ["/api/favorites/ids"],
    enabled: isAuthenticated,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      await apiRequest("DELETE", `/api/favorites/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/ids"] });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold" data-testid="favorites-title">
            {t("favorites.title")}
          </h1>
        </div>

        <PropertyGrid
          properties={favorites}
          favorites={favoriteIds}
          onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
          isTogglingFavorite={toggleFavoriteMutation.isPending}
          isLoading={isLoading}
          emptyMessage={t("favorites.empty")}
          emptyAction={() => navigate("/")}
          emptyActionLabel={t("favorites.browse")}
        />
      </main>
    </div>
  );
}
