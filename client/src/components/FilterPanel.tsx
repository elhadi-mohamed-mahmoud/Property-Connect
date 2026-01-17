import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import type { PropertyFilters } from "@shared/schema";

interface FilterPanelProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  isMobile?: boolean;
}

export function FilterPanel({ filters, onFiltersChange, isMobile = false }: FilterPanelProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["category", "type", "price"]);
  
  // Local state for numeric inputs (for smooth typing experience)
  const [localMinPrice, setLocalMinPrice] = useState<string>(filters.minPrice?.toString() || "");
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(filters.maxPrice?.toString() || "");
  const [localMinSize, setLocalMinSize] = useState<string>(filters.minSize?.toString() || "");
  const [localMaxSize, setLocalMaxSize] = useState<string>(filters.maxSize?.toString() || "");
  
  // Debounced values
  const debouncedMinPrice = useDebounce(localMinPrice, 500);
  const debouncedMaxPrice = useDebounce(localMaxPrice, 500);
  const debouncedMinSize = useDebounce(localMinSize, 500);
  const debouncedMaxSize = useDebounce(localMaxSize, 500);
  
  // Sync local state when filters change externally (e.g., clear filters)
  useEffect(() => {
    setLocalMinPrice(filters.minPrice?.toString() || "");
    setLocalMaxPrice(filters.maxPrice?.toString() || "");
    setLocalMinSize(filters.minSize?.toString() || "");
    setLocalMaxSize(filters.maxSize?.toString() || "");
  }, [filters.minPrice, filters.maxPrice, filters.minSize, filters.maxSize]);
  
  // Apply debounced values to filters using refs to avoid stale closures
  const filtersRef = React.useRef(filters);
  const onFiltersChangeRef = React.useRef(onFiltersChange);
  
  useEffect(() => {
    filtersRef.current = filters;
    onFiltersChangeRef.current = onFiltersChange;
  });
  
  useEffect(() => {
    const newMinPrice = debouncedMinPrice ? Number(debouncedMinPrice) : undefined;
    if (newMinPrice !== filtersRef.current.minPrice) {
      onFiltersChangeRef.current({ ...filtersRef.current, minPrice: newMinPrice, page: 1 });
    }
  }, [debouncedMinPrice]);
  
  useEffect(() => {
    const newMaxPrice = debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined;
    if (newMaxPrice !== filtersRef.current.maxPrice) {
      onFiltersChangeRef.current({ ...filtersRef.current, maxPrice: newMaxPrice, page: 1 });
    }
  }, [debouncedMaxPrice]);
  
  useEffect(() => {
    const newMinSize = debouncedMinSize ? Number(debouncedMinSize) : undefined;
    if (newMinSize !== filtersRef.current.minSize) {
      onFiltersChangeRef.current({ ...filtersRef.current, minSize: newMinSize, page: 1 });
    }
  }, [debouncedMinSize]);
  
  useEffect(() => {
    const newMaxSize = debouncedMaxSize ? Number(debouncedMaxSize) : undefined;
    if (newMaxSize !== filtersRef.current.maxSize) {
      onFiltersChangeRef.current({ ...filtersRef.current, maxSize: newMaxSize, page: 1 });
    }
  }, [debouncedMaxSize]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const updateFilter = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({ page: 1, limit: 12 });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== "page" && key !== "limit" && key !== "sortBy" && value !== undefined
  ).length;

  const FilterSection = ({
    title,
    id,
    children,
  }: {
    title: string;
    id: string;
    children: React.ReactNode;
  }) => (
    <Collapsible
      open={expandedSections.includes(id)}
      onOpenChange={() => toggleSection(id)}
      className="border-b last:border-0"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between py-3 font-medium hover:underline">
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            expandedSections.includes(id) ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">{children}</CollapsibleContent>
    </Collapsible>
  );

  const FilterContent = () => (
    <div className="space-y-2">
      <FilterSection title={t("filters.category")} id="category">
        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            updateFilter("category", value === "all" ? undefined : (value as any))
          }
        >
          <SelectTrigger data-testid="filter-category">
            <SelectValue placeholder={t("filters.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.all")}</SelectItem>
            <SelectItem value="house">{t("property.house")}</SelectItem>
            <SelectItem value="apartment">{t("property.apartment")}</SelectItem>
            <SelectItem value="land">{t("property.land")}</SelectItem>
            <SelectItem value="commercial">{t("property.commercial")}</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title={t("filters.type")} id="type">
        <Select
          value={filters.type || "all"}
          onValueChange={(value) =>
            updateFilter("type", value === "all" ? undefined : (value as any))
          }
        >
          <SelectTrigger data-testid="filter-type">
            <SelectValue placeholder={t("filters.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.all")}</SelectItem>
            <SelectItem value="sale">{t("property.forSale")}</SelectItem>
            <SelectItem value="rent">{t("property.forRent")}</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title={t("filters.priceRange")} id="price">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">{t("filters.minPrice")}</Label>
            <Input
              type="number"
              placeholder="0"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              data-testid="filter-min-price"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t("filters.maxPrice")}</Label>
            <Input
              type="number"
              placeholder="∞"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              data-testid="filter-max-price"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title={t("filters.bedroomsCount")} id="bedrooms">
        <Select
          value={filters.bedrooms?.toString() || "any"}
          onValueChange={(value) =>
            updateFilter("bedrooms", value === "any" ? undefined : Number(value))
          }
        >
          <SelectTrigger data-testid="filter-bedrooms">
            <SelectValue placeholder={t("filters.any")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t("filters.any")}</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title={t("filters.bathroomsCount")} id="bathrooms">
        <Select
          value={filters.bathrooms?.toString() || "any"}
          onValueChange={(value) =>
            updateFilter("bathrooms", value === "any" ? undefined : Number(value))
          }
        >
          <SelectTrigger data-testid="filter-bathrooms">
            <SelectValue placeholder={t("filters.any")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t("filters.any")}</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title={t("filters.sizeRange")} id="size">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">{t("filters.minSize")}</Label>
            <Input
              type="number"
              placeholder="0"
              value={localMinSize}
              onChange={(e) => setLocalMinSize(e.target.value)}
              data-testid="filter-min-size"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t("filters.maxSize")}</Label>
            <Input
              type="number"
              placeholder="∞"
              value={localMaxSize}
              onChange={(e) => setLocalMaxSize(e.target.value)}
              data-testid="filter-max-size"
            />
          </div>
        </div>
      </FilterSection>

      {activeFilterCount > 0 && (
        <Button variant="ghost" className="w-full" onClick={clearFilters} data-testid="clear-filters">
          <X className="h-4 w-4 mr-2" />
          {t("filters.clearAll")}
        </Button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2" data-testid="mobile-filter-trigger">
            <SlidersHorizontal className="h-4 w-4" />
            {t("filters.title")}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side={isRTL ? "left" : "right"} className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("filters.title")}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
          <SheetFooter className="mt-6">
            <Button className="w-full" onClick={() => setIsOpen(false)} data-testid="apply-filters">
              {t("filters.apply")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-72 shrink-0 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("filters.title")}</h3>
        {activeFilterCount > 0 && (
          <Badge variant="secondary">{activeFilterCount}</Badge>
        )}
      </div>
      <FilterContent />
    </div>
  );
}

export function ActiveFilters({
  filters,
  onFiltersChange,
}: {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
}) {
  const { t } = useTranslation();

  const removeFilter = (key: keyof PropertyFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange({ ...newFilters, page: 1 });
  };

  const activeFilters: { key: keyof PropertyFilters; label: string }[] = [];

  if (filters.category) {
    const labels: Record<string, string> = {
      house: t("property.house"),
      apartment: t("property.apartment"),
      land: t("property.land"),
      commercial: t("property.commercial"),
    };
    activeFilters.push({ key: "category", label: labels[filters.category] });
  }

  if (filters.type) {
    activeFilters.push({
      key: "type",
      label: filters.type === "sale" ? t("property.forSale") : t("property.forRent"),
    });
  }

  if (filters.minPrice !== undefined) {
    activeFilters.push({ key: "minPrice", label: `${t("filters.minPrice")}: ${filters.minPrice}` });
  }

  if (filters.maxPrice !== undefined) {
    activeFilters.push({ key: "maxPrice", label: `${t("filters.maxPrice")}: ${filters.maxPrice}` });
  }

  if (filters.bedrooms !== undefined) {
    activeFilters.push({ key: "bedrooms", label: `${filters.bedrooms}+ ${t("property.bedrooms")}` });
  }

  if (filters.bathrooms !== undefined) {
    activeFilters.push({ key: "bathrooms", label: `${filters.bathrooms}+ ${t("property.bathrooms")}` });
  }

  if (filters.search) {
    activeFilters.push({ key: "search", label: `"${filters.search}"` });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" data-testid="active-filters">
      {activeFilters.map(({ key, label }) => (
        <Badge key={key} variant="secondary" className="gap-1 pr-1">
          {label}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => removeFilter(key)}
            data-testid={`remove-filter-${key}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
}
