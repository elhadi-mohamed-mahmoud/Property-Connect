import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { PropertyGrid } from "@/components/PropertyGrid";
import { PropertyMap } from "@/components/PropertyMap";
import { FilterPanel, ActiveFilters } from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Grid3X3, Map, X, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Property, PropertyFilters } from "@shared/schema";

interface PropertiesResponse {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 12,
    sortBy: "date",
  });
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch || undefined,
      page: 1,
    }));
  }, [debouncedSearch]);

  const buildQueryString = (f: PropertyFilters) => {
    const params = new URLSearchParams();
    Object.entries(f).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
    return params.toString();
  };

  const { data, isLoading } = useQuery<PropertiesResponse>({
    queryKey: ["/api/properties", filters],
    queryFn: async () => {
      const response = await fetch(`/api/properties?${buildQueryString(filters)}`);
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
  });

  const { data: favorites = [] } = useQuery<string[]>({
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
      const isFavorite = favorites.includes(propertyId);
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

  const properties = data?.properties || [];
  const totalCount = data?.total || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 1;

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="hero-title">
            {t("hero.title")}
          </h1>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("hero.searchPlaceholder")}
              className="pl-12 pr-12 h-14 text-lg rounded-full border-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
                data-testid="clear-search"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel filters={filters} onFiltersChange={setFilters} />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-muted-foreground" data-testid="results-count">
                  {totalCount} {t("common.listings")}
                </p>
                <FilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  isMobile
                />
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={filters.sortBy || "date"}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, sortBy: value as any, page: 1 }))
                  }
                >
                  <SelectTrigger className="w-44" data-testid="sort-select">
                    <SelectValue placeholder={t("filters.sortBy")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">{t("filters.newest")}</SelectItem>
                    <SelectItem value="price_asc">{t("filters.priceLowHigh")}</SelectItem>
                    <SelectItem value="price_desc">{t("filters.priceHighLow")}</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("grid")}
                    data-testid="view-grid"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("map")}
                    data-testid="view-map"
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ActiveFilters filters={filters} onFiltersChange={setFilters} />

            {viewMode === "grid" ? (
              <div className="mt-6">
                <PropertyGrid
                  properties={properties}
                  favorites={favorites}
                  onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                  isTogglingFavorite={toggleFavoriteMutation.isPending}
                  isLoading={isLoading}
                  totalCount={totalCount}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            ) : (
              <div className="h-[600px] mt-6 rounded-lg overflow-hidden border">
                <PropertyMap properties={properties} />
              </div>
            )}
          </div>
        </div>
      </main>

      {isAuthenticated && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg lg:hidden"
          onClick={() => navigate("/create")}
          data-testid="fab-create"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">D</span>
              </div>
              <div>
                <p className="font-bold text-lg">Dari.com</p>
                <p className="text-xs text-muted-foreground">داري - Your Home Awaits</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Dari.com. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                dari.com | Real Estate Marketplace
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
