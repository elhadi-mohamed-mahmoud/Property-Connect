import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@shared/schema";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  singleProperty?: boolean;
}

function MapBoundsUpdater({ properties }: { properties: Property[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (properties.length > 0) {
      const bounds = L.latLngBounds(
        properties.map((p) => [p.latitude, p.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [properties, map]);

  return null;
}

function PropertyPopup({ property }: { property: Property }) {
  const { t } = useTranslation();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="w-64 overflow-hidden border-0 shadow-none">
      <div className="relative">
        <img
          src={property.images[0] || "/placeholder-property.jpg"}
          alt={property.title}
          className="w-full h-32 object-cover"
        />
        <Badge
          variant={property.type === "sale" ? "default" : "secondary"}
          className="absolute top-2 left-2 text-xs"
        >
          {property.type === "sale" ? t("property.forSale") : t("property.forRent")}
        </Badge>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm line-clamp-1 mb-1">{property.title}</h4>
        <p className="text-primary font-bold mb-2">
          {formatPrice(property.price, property.currency)}
        </p>
        <Link href={`/property/${property.id}`}>
          <Button size="sm" className="w-full" data-testid={`map-view-details-${property.id}`}>
            {t("property.viewDetails")}
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export function PropertyMap({
  properties,
  center = [18.0735, -15.9582],
  zoom = 12,
  className = "",
  singleProperty = false,
}: PropertyMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`w-full h-full min-h-[400px] rounded-lg ${className}`}
      scrollWheelZoom={true}
      data-testid="property-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {!singleProperty && properties.length > 1 && (
        <MapBoundsUpdater properties={properties} />
      )}
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
        >
          <Popup className="property-popup">
            <PropertyPopup property={property} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onChange: (coords: { lat: number; lng: number }) => void;
  className?: string;
}

function MapClickHandler({ onChange }: { onChange: (coords: { lat: number; lng: number }) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onChange]);

  return null;
}

export function MapPicker({ value, onChange, className = "" }: MapPickerProps) {
  const { t } = useTranslation();
  const defaultCenter: [number, number] = [18.0735, -15.9582];

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm text-muted-foreground">{t("form.clickMap")}</p>
      <MapContainer
        center={value ? [value.lat, value.lng] : defaultCenter}
        zoom={12}
        className="w-full h-96 rounded-lg border"
        scrollWheelZoom={true}
        data-testid="map-picker"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onChange={onChange} />
        {value && (
          <Marker position={[value.lat, value.lng]} />
        )}
      </MapContainer>
      {value && (
        <p className="text-xs text-muted-foreground" data-testid="coordinates-display">
          {t("property.location")}: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
