import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { Header } from "@/components/Header";
import { MapPicker } from "@/components/PropertyMap";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Property } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  price: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().positive("Price must be positive")),
  currency: z.enum(["MRU", "USD", "EUR"]),
  location: z.string().min(1, "Location is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(["sale", "rent"]),
  category: z.enum(["house", "apartment", "land", "commercial"]),
  images: z.array(z.string()).min(1, "At least one image is required").max(10),
  videoUrl: z.string().url().optional().or(z.literal("")),
  tiktokUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  contactName: z.string().min(1, "Contact name is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  contactWhatsapp: z.string().optional(),
  bedrooms: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().int().positive().optional()),
  bathrooms: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().int().positive().optional()),
  size: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().int().positive().optional()),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateListing() {
  const { t } = useTranslation();
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const { data: existingProperty, isLoading: propertyLoading } = useQuery<Property>({
    queryKey: ["/api/properties", id],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) throw new Error("Failed to fetch property");
      return response.json();
    },
    enabled: isEditing,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      currency: "MRU",
      location: "",
      latitude: 18.0735,
      longitude: -15.9582,
      type: "sale",
      category: "house",
      images: [],
      videoUrl: "",
      tiktokUrl: "",
      facebookUrl: "",
      contactName: "",
      contactPhone: "",
      contactWhatsapp: "",
      bedrooms: undefined,
      bathrooms: undefined,
      size: undefined,
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (user && !isEditing) {
      form.setValue("contactName", user.firstName || user.email?.split("@")[0] || "");
    }
  }, [user, form, isEditing]);

  useEffect(() => {
    if (existingProperty) {
      form.reset({
        title: existingProperty.title,
        description: existingProperty.description,
        price: existingProperty.price,
        currency: existingProperty.currency,
        location: existingProperty.location,
        latitude: existingProperty.latitude,
        longitude: existingProperty.longitude,
        type: existingProperty.type,
        category: existingProperty.category,
        images: existingProperty.images,
        videoUrl: existingProperty.videoUrl || "",
        tiktokUrl: existingProperty.tiktokUrl || "",
        facebookUrl: existingProperty.facebookUrl || "",
        contactName: existingProperty.contactName,
        contactPhone: existingProperty.contactPhone,
        contactWhatsapp: existingProperty.contactWhatsapp || "",
        bedrooms: existingProperty.bedrooms || undefined,
        bathrooms: existingProperty.bathrooms || undefined,
        size: existingProperty.size || undefined,
      });
    }
  }, [existingProperty, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        videoUrl: data.videoUrl || null,
        tiktokUrl: data.tiktokUrl || null,
        facebookUrl: data.facebookUrl || null,
        contactWhatsapp: data.contactWhatsapp || null,
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        size: data.size || null,
      };

      if (isEditing) {
        return await apiRequest("PATCH", `/api/properties/${id}`, payload);
      } else {
        return await apiRequest("POST", "/api/properties", payload);
      }
    },
    onSuccess: (result) => {
      toast({
        title: t("common.success"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      navigate(isEditing ? `/property/${id}` : `/property/${result.id}`);
    },
    onError: () => {
      toast({
        title: t("common.error"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (authLoading || (isEditing && propertyLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isEditing && existingProperty && existingProperty.userId !== user?.id) {
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8" data-testid="form-title">
          {isEditing ? t("form.editListing") : t("form.createListing")}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{t("form.basicInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.title")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.titlePlaceholder")}
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("form.descriptionPlaceholder")}
                          className="min-h-32"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("form.pricing")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.price")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.currency")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-currency">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MRU">MRU</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("form.locationInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.locationDescription")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.locationPlaceholder")}
                          {...field}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label className="mb-2 block">{t("form.clickMap")}</Label>
                  <MapPicker
                    value={{
                      lat: form.watch("latitude"),
                      lng: form.watch("longitude"),
                    }}
                    onChange={(coords) => {
                      form.setValue("latitude", coords.lat);
                      form.setValue("longitude", coords.lng);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("form.propertyDetails")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.type")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sale">{t("property.forSale")}</SelectItem>
                            <SelectItem value="rent">{t("property.forRent")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.category")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="house">{t("property.house")}</SelectItem>
                            <SelectItem value="apartment">{t("property.apartment")}</SelectItem>
                            <SelectItem value="land">{t("property.land")}</SelectItem>
                            <SelectItem value="commercial">{t("property.commercial")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("form.bedrooms")} <span className="text-muted-foreground">({t("form.optional")})</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                            data-testid="input-bedrooms"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("form.bathrooms")} <span className="text-muted-foreground">({t("form.optional")})</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                            data-testid="input-bathrooms"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("form.size")} <span className="text-muted-foreground">({t("form.optional")})</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                            data-testid="input-size"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("form.images")}</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("form.links")} <span className="text-muted-foreground font-normal text-sm">({t("form.optional")})</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.videoUrl")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-video-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tiktokUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.tiktokUrl")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-tiktok-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.facebookUrl")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-facebook-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("form.contactInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.contactName")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-contact-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.contactPhone")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-contact-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactWhatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("form.contactWhatsapp")} <span className="text-muted-foreground">({t("form.optional")})</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-contact-whatsapp" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/")}
                data-testid="btn-cancel"
              >
                {t("form.cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={mutation.isPending}
                data-testid="btn-submit"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? t("form.saving") : t("form.publishing")}
                  </>
                ) : isEditing ? (
                  t("form.save")
                ) : (
                  t("form.submit")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
