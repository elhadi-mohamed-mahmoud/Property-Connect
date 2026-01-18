import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageGallery } from "@/components/ImageGallery";
import { PropertyMap } from "@/components/PropertyMap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Eye,
  Heart,
  Share2,
  Phone,
  Edit,
  Trash2,
  ExternalLink,
  Video,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { SiTiktok, SiFacebook, SiWhatsapp } from "react-icons/si";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Property } from "@shared/schema";

export default function PropertyDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showPhone, setShowPhone] = useState(false);

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
  };

  const handleCallClick = (phone: string) => {
    if (isMobileDevice()) {
      window.location.href = `tel:${phone}`;
    } else {
      setShowPhone(true);
    }
  };

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["/api/properties", id],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) throw new Error("Failed to fetch property");
      return response.json();
    },
  });

  const { data: favorites = [] } = useQuery<string[]>({
    queryKey: ["/api/favorites/ids"],
    enabled: isAuthenticated,
  });

  const isFavorite = favorites.includes(id || "");
  const isOwner = user?.id === property?.userId;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { propertyId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/ids"] });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        variant: "destructive",
      });
    },
  });

  const toggleSoldMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/properties/${id}`, {
        isSold: !property?.isSold,
      });
    },
    onSuccess: () => {
      // Invalidate both the single property query and all property list queries
      queryClient.invalidateQueries({ queryKey: ["/api/properties", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      // Also invalidate user's properties list and favorites
      queryClient.invalidateQueries({ queryKey: ["/api/my-properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: t("common.success"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      // Invalidate all property queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      // Also invalidate user's properties list and favorites
      queryClient.invalidateQueries({ queryKey: ["/api/my-properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: t("common.success"),
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: t("common.error"),
        variant: "destructive",
      });
    },
  });

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: t("common.linkCopied"),
      });
    } catch {
      toast({
        title: t("common.error"),
        variant: "destructive",
      });
    }
  };

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

  const openInMaps = () => {
    if (!property) return;
    const url = `https://www.google.com/maps?q=${property.latitude},${property.longitude}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="w-full h-[400px] rounded-lg mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("common.error")}</h1>
          <Button onClick={() => navigate("/")}>{t("nav.home")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <ImageGallery images={property.images} alt={property.title} />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={property.type === "sale" ? "default" : "secondary"}>
                  {property.type === "sale" ? t("property.forSale") : t("property.forRent")}
                </Badge>
                <Badge variant="outline">{getCategoryLabel(property.category)}</Badge>
                {property.isSold && (
                  <Badge variant="destructive">{t("property.sold")}</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2" data-testid="property-title">
                {property.title}
              </h1>

              <button
                onClick={openInMaps}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                data-testid="property-location"
              >
                <MapPin className="h-5 w-5" />
                <span>{property.location}</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            <div className="text-4xl font-bold text-primary" data-testid="property-price">
              {formatPrice(property.price, property.currency)}
            </div>

            {(property.bedrooms || property.bathrooms || property.size) && (
              <div className="flex flex-wrap gap-6">
                {property.bedrooms && (
                  <div className="flex items-center gap-2" data-testid="detail-bedrooms">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {property.bedrooms} {t("property.bedrooms")}
                    </span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2" data-testid="detail-bathrooms">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {property.bathrooms} {t("property.bathrooms")}
                    </span>
                  </div>
                )}
                {property.size && (
                  <div className="flex items-center gap-2" data-testid="detail-size">
                    <Square className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {property.size} {t("property.sqm")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-5 w-5" />
                  <span>
                    {property.views} {t("property.views")}
                  </span>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">{t("property.description")}</h2>
              <p className="text-muted-foreground whitespace-pre-wrap" data-testid="property-description">
                {property.description}
              </p>
            </div>

            {(property.videoUrl || property.tiktokUrl || property.facebookUrl) && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t("property.socialLinks")}</h2>
                  <div className="flex flex-wrap gap-3">
                    {property.videoUrl && (
                      <Button variant="outline" asChild>
                        <a
                          href={property.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="link-video"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          {t("property.videoTour")}
                        </a>
                      </Button>
                    )}
                    {property.tiktokUrl && (
                      <Button variant="outline" asChild>
                        <a
                          href={property.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="link-tiktok"
                        >
                          <SiTiktok className="h-4 w-4 mr-2" />
                          TikTok
                        </a>
                      </Button>
                    )}
                    {property.facebookUrl && (
                      <Button variant="outline" asChild>
                        <a
                          href={property.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="link-facebook"
                        >
                          <SiFacebook className="h-4 w-4 mr-2" />
                          Facebook
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">{t("property.location")}</h2>
              <div className="h-[300px] rounded-lg overflow-hidden border cursor-pointer" onClick={openInMaps}>
                <PropertyMap
                  properties={[property]}
                  center={[property.latitude, property.longitude]}
                  zoom={15}
                  singleProperty
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t("property.contactInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("property.listedBy")}</p>
                  <button
                    onClick={() => navigate(`/user/${property.userId}/listings`)}
                    className="font-medium hover:text-primary transition-colors text-left underline-offset-4 hover:underline cursor-pointer"
                    data-testid="contact-name"
                  >
                    {property.contactName}
                  </button>
                </div>

                <div className="space-y-2">
                  {showPhone ? (
                    <div className="space-y-2">
                      <Button
                        className="w-full gap-2"
                        size="lg"
                        asChild
                      >
                        <a href={`tel:${property.contactPhone}`} data-testid="btn-call-link">
                          <Phone className="h-5 w-5" />
                          {property.contactPhone}
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={() => handleCallClick(property.contactPhone)}
                      data-testid="btn-call"
                    >
                      <Phone className="h-5 w-5" />
                      {t("property.call")}
                    </Button>
                  )}

                  {property.contactWhatsapp && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                      size="lg"
                      asChild
                    >
                      <a
                        href={`https://wa.me/${property.contactWhatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="btn-whatsapp"
                      >
                        <SiWhatsapp className="h-5 w-5 text-green-600" />
                        {t("property.whatsapp")}
                      </a>
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="flex gap-2">
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      className={`flex-1 ${isFavorite ? "text-red-500" : ""}`}
                      onClick={() => toggleFavoriteMutation.mutate()}
                      disabled={toggleFavoriteMutation.isPending}
                      data-testid="btn-favorite"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                      {isFavorite
                        ? t("property.removeFromFavorites")
                        : t("property.addToFavorites")}
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleShare} data-testid="btn-share">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {isOwner && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/edit/${property.id}`)}
                        data-testid="btn-edit"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t("property.edit")}
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toggleSoldMutation.mutate()}
                        disabled={toggleSoldMutation.isPending}
                        data-testid="btn-toggle-sold"
                      >
                        {property.isSold ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            {t("property.markAsAvailable")}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t("property.markAsSold")}
                          </>
                        )}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="w-full"
                            data-testid="btn-delete"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("property.delete")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("common.deleteConfirm")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("common.deleteWarning")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate()}
                              className="bg-destructive text-destructive-foreground"
                            >
                              {t("common.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
