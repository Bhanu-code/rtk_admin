import { useState } from "react";
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
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface GemstoneFormData {
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
  image?: File | null;
  featured: boolean;
}

const GemstoneForm = () => {
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
    image: null,
    featured: false,
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const createGemblogMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/gemstones`, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create gemstone");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Gemstone created successfully!", {
        position: "bottom-right",
      });
      queryClient.invalidateQueries("get-all-gems");
      navigate("/home/gemblogs");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create gemstone", {
        position: "bottom-right",
      });
    },
  });

  const handleInputChange = (field: keyof GemstoneFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAlternateNameChange = (index: number, value: string) => {
    const newNames = [...formData.alternateNames];
    newNames[index] = value;
    setFormData((prev) => ({ ...prev, alternateNames: newNames }));
  };

  const addAlternateName = () => {
    setFormData((prev) => ({
      ...prev,
      alternateNames: [...prev.alternateNames, ""],
    }));
  };

  const removeAlternateName = (index: number) => {
    if (formData.alternateNames.length === 1) return;
    const newNames = formData.alternateNames.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, alternateNames: newNames }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.image) {
      toast.error("Name, description and image are required");
      return;
    }

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
    fd.append("alternateNames", JSON.stringify(formData.alternateNames.filter(n => n.trim())));

    if (formData.image) {
      fd.append("image", formData.image);
    }

    createGemblogMutation.mutate(fd);
  };

  const renderFormattedSection = (title: string, content: string, field: keyof GemstoneFormData) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-slate-300">{title}</Label>
      <Card className="bg-slate-900 border-white/10">
        <CardContent className="pt-4">
          <ClientOnly fallback={<div className="h-52 bg-slate-950 rounded-lg animate-pulse" />}>
            {() => (
              <div className="min-h-[200px]">
                <FormattedPasteArea
                  content={content}
                  onChange={(newContent) => handleInputChange(field, newContent)}
                />
              </div>
            )}
          </ClientOnly>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] p-5">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Add New Gemstone</CardTitle>
            <p className="text-slate-400">Fill in the details for the new gemstone blog</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <Accordion type="single" collapsible defaultValue="basic" className="w-full">
                {/* Basic Information */}
                <AccordionItem value="basic">
                  <AccordionTrigger className="text-lg font-medium text-white">Basic Information</AccordionTrigger>
                  <AccordionContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Gemstone Name <span className="text-red-400">*</span></Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="e.g. Natural Ruby"
                          className="bg-slate-950 border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300">Featured</Label>
                        <div className="flex items-center gap-3 pt-2">
                          <Switch
                            checked={formData.featured}
                            onCheckedChange={(checked) => handleInputChange("featured", checked)}
                          />
                          <span className="text-sm text-slate-400">Mark as featured gemstone</span>
                        </div>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-3">
                      <Label className="text-slate-300">Gemstone Image <span className="text-red-400">*</span></Label>
                      <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-indigo-500/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="gemImage"
                        />
                        <label htmlFor="gemImage" className="cursor-pointer flex flex-col items-center">
                          <Upload className="h-10 w-10 text-slate-500 mb-3" />
                          <p className="text-sm text-slate-400">Click to upload gemstone image</p>
                          <p className="text-xs text-slate-600 mt-1">PNG, JPG, JPEG up to 5MB</p>
                        </label>
                      </div>

                      {imagePreview && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full max-h-64 object-contain bg-slate-950"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Description <span className="text-red-400">*</span></Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Write a detailed description of the gemstone..."
                        className="min-h-32 bg-slate-950 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-300">Alternate Names / Sub-Categories</Label>
                      {formData.alternateNames.map((name, index) => (
                        <div key={index} className="flex gap-2">
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
                            disabled={formData.alternateNames.length === 1}
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
                        className="border-white/10 text-slate-400 hover:text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Name
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Rich Text Sections */}
                <AccordionItem value="wearing">
                  <AccordionTrigger className="text-white">Who Should Wear</AccordionTrigger>
                  <AccordionContent>
                    {renderFormattedSection("Who Should Wear This Gemstone", formData.whoShouldWear, "whoShouldWear")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="benefits">
                  <AccordionTrigger className="text-white">Benefits</AccordionTrigger>
                  <AccordionContent>
                    {renderFormattedSection("Gemstone Benefits", formData.benefits, "benefits")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="prices">
                  <AccordionTrigger className="text-white">Pricing Information</AccordionTrigger>
                  <AccordionContent>
                    {renderFormattedSection("Pricing Details", formData.prices, "prices")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="quality">
                  <AccordionTrigger className="text-white">Quality</AccordionTrigger>
                  <AccordionContent>
                    {renderFormattedSection("Quality Information", formData.quality, "quality")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="specifications">
                  <AccordionTrigger className="text-white">Specifications</AccordionTrigger>
                  <AccordionContent>
                    {renderFormattedSection("Technical Specifications", formData.specifications, "specifications")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faqs">
                  <AccordionTrigger className="text-white">FAQs</AccordionTrigger>
                  <AccordionContent>
                    {renderFormattedSection("Frequently Asked Questions", formData.faqs, "faqs")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="curiousFacts">
                  <AccordionTrigger className="text-white">Curious Facts</AccordionTrigger>
                  <AccordionContent>
                    {renderFormattedSection("Interesting & Curious Facts", formData.curiousFacts, "curiousFacts")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 text-lg font-medium"
                disabled={createGemblogMutation.isLoading || !formData.name || !formData.description || !formData.image}
              >
                {createGemblogMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Creating Gemstone...
                  </>
                ) : (
                  "Create Gemstone Blog"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GemstoneForm;