import { useTranslation } from "react-i18next";
import { PropertyCard } from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyGridProps {
  properties: Property[];
  favorites?: string[];
  onToggleFavorite?: (propertyId: string) => void;
  isTogglingFavorite?: boolean;
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  emptyAction?: () => void;
  emptyActionLabel?: string;
}

function PropertyCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

export function PropertyGrid({
  properties,
  favorites = [],
  onToggleFavorite,
  isTogglingFavorite = false,
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage,
  emptyAction,
  emptyActionLabel,
}: PropertyGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="empty-state">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Home className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t("common.noResults")}</h3>
        <p className="text-muted-foreground mb-6">
          {emptyMessage || t("common.adjustFilters")}
        </p>
        {emptyAction && emptyActionLabel && (
          <Button onClick={emptyAction} data-testid="empty-action-button">
            {emptyActionLabel}
          </Button>
        )}
      </div>
    );
  }

  const startItem = (currentPage - 1) * 12 + 1;
  const endItem = Math.min(currentPage * 12, totalCount);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="property-grid">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isFavorite={favorites.includes(property.id)}
            onToggleFavorite={onToggleFavorite}
            isTogglingFavorite={isTogglingFavorite}
          />
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <p className="text-sm text-muted-foreground" data-testid="pagination-info">
            {t("common.showing")} {startItem}-{endItem} {t("common.of")} {totalCount} {t("common.listings")}
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              data-testid="pagination-prev"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("common.previous")}
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    onClick={() => onPageChange(pageNum)}
                    data-testid={`pagination-page-${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="pagination-next"
            >
              {t("common.next")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
