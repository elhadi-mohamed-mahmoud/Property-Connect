import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Loader2, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Property } from "@shared/schema";

export default function UserListingsPage() {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/users", userId, "properties"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/properties`);
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
    enabled: !!userId,
  });

  const { data: favoriteIds = [] } = useQuery<string[]>({
    queryKey: ["/api/favorites/ids"],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const response = await fetch("/api/favorites/ids", { credentials: "include" });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const isFavorite = favoriteIds.includes(propertyId);
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${propertyId}`);
      } else {
        await apiRequest("POST", "/api/favorites", { propertyId });
      }
      return { propertyId, isFavorite };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/ids"] });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  // Get the user's name from the first property (if available)
  const userName = properties.length > 0 ? properties[0].contactName : "";

  if (isLoading) {
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
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold" data-testid="user-listings-title">
              {userName 
                ? t("userListings.title", { name: userName })
                : t("userListings.titleDefault")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {properties.length} {t("userListings.listingsCount", { count: properties.length })}
            </p>
          </div>
        </div>

        <PropertyGrid
          properties={properties}
          favorites={favoriteIds}
          onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
          isTogglingFavorite={toggleFavoriteMutation.isPending}
          isLoading={isLoading}
          emptyMessage={t("userListings.empty")}
          emptyAction={() => navigate("/")}
          emptyActionLabel={t("userListings.browseAll")}
        />
      </main>
      <Footer />
    </div>
  );
}
