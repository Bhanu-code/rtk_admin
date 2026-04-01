import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {  Loader2, Upload, Plus, Trash2 } from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormattedPasteArea } from "./blog/WhoShouldWear";
import { ClientOnly } from "remix-utils/client-only";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface GemstoneFormData {
  id?: string;
  name: string;
  alternateNames: string[];
  shortBenefits: string;
  description: string;
  whoShouldWear: string;
  benefits: string;
  prices: string;
  quality: string;
  specifications: string;
  faqs: string;
  curiousFacts: string;
  featured: boolean;
  imageUrl?: string;
  newImage?: File | null;
}

interface EditGemstoneFormProps {
  gemstoneId: string;
  onSuccess?: () => void;
}

const EditGemstoneForm = ({ gemstoneId, onSuccess }: EditGemstoneFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<GemstoneFormData>({
    name: "",
    alternateNames: [""],
    shortBenefits: "",
    description: "",
    whoShouldWear: "",
    benefits: "",
    prices: "",
    quality: "",
    specifications: "",
    faqs: "",
    curiousFacts: "",
    featured: false,
    imageUrl: "",
    newImage: null,
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch gemstone data
  const { data: gemstoneData, isLoading: isLoadingData } = useQuery(
    ["gemstone", gemstoneId],
    async () => {
      const res = await fetch(`${import.meta.env.VITE_PROXY_URL}/gemstones/${gemstoneId}`);
      if (!res.ok) throw new Error("Failed to fetch gemstone");
      return res.json();
    },
    { enabled: !!gemstoneId }
  );

  // Populate form
  useEffect(() => {
    if (gemstoneData) {
      setFormData({
        id: gemstoneData.id,
        name: gemstoneData.name || "",
        alternateNames: Array.isArray(gemstoneData.alternateNames) 
          ? gemstoneData.alternateNames 
          : gemstoneData.alternateNames 
            ? JSON.parse(gemstoneData.alternateNames) 
            : [""],
        shortBenefits: gemstoneData.shortBenefits || "",
        description: gemstoneData.description || "",
        whoShouldWear: gemstoneData.whoShouldWear || "",
        benefits: gemstoneData.benefits || "",
        prices: gemstoneData.prices || "",
        quality: gemstoneData.quality || "",
        specifications: gemstoneData.specifications || "",
        faqs: gemstoneData.faqs || "",
        curiousFacts: gemstoneData.curiousFacts || "",
        featured: Boolean(gemstoneData.featured),
        imageUrl: gemstoneData.imageUrl || "",
        newImage: null,
      });

      if (gemstoneData.imageUrl) {
        setImagePreview(gemstoneData.imageUrl);
      }
    }
  }, [gemstoneData]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();

      fd.append("name", formData.name.trim());
      fd.append("description", formData.description.trim());
      fd.append("shortBenefits", formData.shortBenefits.trim());
      fd.append("whoShouldWear", formData.whoShouldWear.trim());
      fd.append("benefits", formData.benefits.trim());
      fd.append("prices", formData.prices.trim());
      fd.append("quality", formData.quality.trim());
      fd.append("specifications", formData.specifications.trim());
      fd.append("faqs", formData.faqs.trim());
      fd.append("curiousFacts", formData.curiousFacts.trim());
      fd.append("featured", formData.featured.toString());

      // Clean alternate names
      const cleanAlternateNames = formData.alternateNames
        .filter(name => name?.trim() !== "")
        .map(name => name.trim());

      fd.append("alternateNames", JSON.stringify(cleanAlternateNames));

      // New image (if uploaded)
      if (formData.newImage) {
        fd.append("image", formData.newImage);
      }

      const response = await fetch(
        `${import.meta.env.VITE_PROXY_URL}/gemstones/${gemstoneId}`,
        { method: "PUT", body: fd }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update gemstone");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Gemstone updated successfully!");
      queryClient.invalidateQueries(["gemstone", gemstoneId]);
      queryClient.invalidateQueries("get-all-gems");
      onSuccess?.();
      navigate("/home/gemblogs");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update gemstone");
    },
  });

  const handleInputChange = (field: keyof GemstoneFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAlternateNameChange = (index: number, value: string) => {
    const updated = [...formData.alternateNames];
    updated[index] = value;
    setFormData(prev => ({ ...prev, alternateNames: updated }));
  };

  const addAlternateName = () => {
    setFormData(prev => ({
      ...prev,
      alternateNames: [...prev.alternateNames, ""]
    }));
  };

  const removeAlternateName = (index: number) => {
    if (formData.alternateNames.length === 1) return;
    setFormData(prev => ({
      ...prev,
      alternateNames: prev.alternateNames.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, newImage: file }));

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Name and description are required");
      return;
    }

    updateMutation.mutate();
  };

  const renderFormattedSection = (title: string, content: string, field: keyof GemstoneFormData) => (
    <div className="space-y-3">
      <Label className="text-slate-300 font-medium">{title}</Label>
      <Card className="bg-slate-900 border-white/10">
        <CardContent className="pt-4">
          <ClientOnly fallback={<div className="h-52 bg-slate-950 rounded animate-pulse" />}>
            {() => (
              <FormattedPasteArea
                content={content || ""}
                onChange={(newContent) => handleInputChange(field, newContent)}
              />
            )}
          </ClientOnly>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-slate-400">Loading gemstone data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              Edit Gemstone — {formData.name || "Loading..."}
            </CardTitle>
            <p className="text-slate-400">Update the gemstone information</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <Accordion type="single" collapsible defaultValue="basic" className="w-full">
                <AccordionItem value="basic">
                  <AccordionTrigger className="text-lg text-white">Basic Information</AccordionTrigger>
                  <AccordionContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-300">Gemstone Name <span className="text-red-400">*</span></Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="bg-slate-950 border-white/10 text-white"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-8">
                        <Switch
                          checked={formData.featured}
                          onCheckedChange={(checked) => handleInputChange("featured", checked)}
                        />
                        <div>
                          <p className="text-sm text-white">Featured Gemstone</p>
                          <p className="text-xs text-slate-500">Show on homepage</p>
                        </div>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <Label className="text-slate-300">Gemstone Image</Label>
                      <div className="mt-2 border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-indigo-500/50 transition-all">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="editImage"
                        />
                        <label htmlFor="editImage" className="cursor-pointer block">
                          <Upload className="mx-auto h-12 w-12 text-slate-500 mb-3" />
                          <p className="text-slate-400">Click to change image</p>
                        </label>
                      </div>

                      {(imagePreview || formData.imageUrl) && (
                        <div className="mt-6 rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                          <img
                            src={imagePreview || formData.imageUrl}
                            alt="Current gemstone"
                            className="w-full max-h-80 object-contain p-6"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-slate-300">Description <span className="text-red-400">*</span></Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="min-h-32 bg-slate-950 border-white/10 text-white"
                      />
                    </div>

                    {/* Alternate Names */}
                    <div>
                      <Label className="text-slate-300">Alternate Names</Label>
                      {formData.alternateNames.map((name, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <Input
                            value={name}
                            onChange={(e) => handleAlternateNameChange(index, e.target.value)}
                            placeholder="e.g. Red Ruby, Manik"
                            className="bg-slate-950 border-white/10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAlternateName(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addAlternateName}
                        className="mt-3 border-white/10 text-slate-400"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Another Name
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Other sections remain the same */}
                <AccordionItem value="wearing">
                  <AccordionTrigger className="text-white">Who Should Wear</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Who Should Wear This Gemstone", formData.whoShouldWear, "whoShouldWear")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="benefits">
                  <AccordionTrigger className="text-white">Benefits</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Gemstone Benefits", formData.benefits, "benefits")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="prices">
                  <AccordionTrigger className="text-white">Prices</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Pricing Information", formData.prices, "prices")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="quality">
                  <AccordionTrigger className="text-white">Quality</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Quality Information", formData.quality, "quality")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="specifications">
                  <AccordionTrigger className="text-white">Specifications</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Technical Specifications", formData.specifications, "specifications")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="faqs">
                  <AccordionTrigger className="text-white">FAQs</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Frequently Asked Questions", formData.faqs, "faqs")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="curiousFacts">
                  <AccordionTrigger className="text-white">Curious Facts</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Interesting Facts", formData.curiousFacts, "curiousFacts")}</AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 text-lg font-medium"
                disabled={updateMutation.isLoading}
              >
                {updateMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Updating Gemstone...
                  </>
                ) : (
                  "Update Gemstone Information"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditGemstoneForm;