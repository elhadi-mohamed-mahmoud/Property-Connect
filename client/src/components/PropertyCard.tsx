import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
  isTogglingFavorite?: boolean;
}

export function PropertyCard({
  property,
  isFavorite = false,
  onToggleFavorite,
  isTogglingFavorite = false,
}: PropertyCardProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      house: t("property.house"),
      apartment: t("property.apartment"),
      land: t("property.land"),
      commercial: t("property.commercial"),
    };
    return labels[category] || category;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(property.id);
    }
  };

  return (
    <Link href={`/property/${property.id}`}>
      <Card
        className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        data-testid={`property-card-${property.id}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.images[0] || "/placeholder-property.jpg"}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <Badge
              variant={property.type === "sale" ? "default" : "secondary"}
              className="text-xs"
              data-testid={`badge-type-${property.id}`}
            >
              {property.type === "sale" ? t("property.forSale") : t("property.forRent")}
            </Badge>
            <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
              {getCategoryLabel(property.category)}
            </Badge>
          </div>

          {property.isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {t("property.sold")}
              </Badge>
            </div>
          )}

          {isAuthenticated && onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background ${
                isFavorite ? "text-red-500" : "text-muted-foreground"
              }`}
              onClick={handleFavoriteClick}
              disabled={isTogglingFavorite}
              data-testid={`favorite-button-${property.id}`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          )}
        </div>

        <CardContent className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-lg line-clamp-1" data-testid={`property-title-${property.id}`}>
              {property.title}
            </h3>
            <a
              href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
              data-testid={`property-location-${property.id}`}
            >
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </a>
          </div>

          <div className="text-xl font-bold text-primary mb-3" data-testid={`property-price-${property.id}`}>
            {formatPrice(property.price, property.currency)}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms !== null && property.bedrooms !== undefined && (
              <div className="flex items-center gap-1" data-testid={`property-bedrooms-${property.id}`}>
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms !== null && property.bathrooms !== undefined && (
              <div className="flex items-center gap-1" data-testid={`property-bathrooms-${property.id}`}>
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.size !== null && property.size !== undefined && (
              <div className="flex items-center gap-1" data-testid={`property-size-${property.id}`}>
                <Square className="h-4 w-4" />
                <span>{property.size} {t("property.sqm")}</span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Eye className="h-4 w-4" />
              <span>{property.views}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
