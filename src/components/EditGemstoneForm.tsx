import React, { useState, useEffect, useCallback } from "react";
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
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormattedPasteArea } from "./blog/WhoShouldWear";
import { ClientOnly } from "remix-utils/client-only";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";

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
  newImage?: File;
  timestamp?: string;
}


interface EditGemstoneFormProps {
  gemstoneId: any;
  onSuccess?: () => void;
}


const EditGemstoneForm = ({ gemstoneId, onSuccess }: EditGemstoneFormProps) => {
  const [formData, setFormData] = useState<GemstoneFormData>({
    name: "",
    alternateNames: [],
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
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch existing gemstone data
  const { data: gemstoneData, isLoading: isLoadingData } = useQuery(
    ["gemstone", gemstoneId],
    async () => {
      const response = await fetch(
        `${import.meta.env.VITE_PROXY_URL}/gemstones/get-gemblog/${gemstoneId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch gemstone data");
      }
      const data = await response.json();

      // Parse alternateNames if it's a string
      if (typeof data.alternateNames === 'string') {
        try {
          data.alternateNames = JSON.parse(data.alternateNames);
        } catch (e) {
          console.error('Error parsing alternateNames:', e);
          data.alternateNames = [];
        }
      }

      // Ensure alternateNames is always an array
      if (!Array.isArray(data.alternateNames)) {
        data.alternateNames = [];
      }

      return data;
    }
  );

  console.log("DATA : ", gemstoneData)

  // Update form data when gemstone data is fetched
  useEffect(() => {
    if (gemstoneData) {
      setFormData(prev => ({
        ...prev,
        ...gemstoneData,
        // Ensure alternateNames is always an array
        alternateNames: Array.isArray(gemstoneData.alternateNames)
          ? gemstoneData.alternateNames
          : []
      }));

      if (gemstoneData.imageUrl) {
        setImagePreview(gemstoneData.imageUrl);
      }
    }
  }, [gemstoneData]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Update form data with the new image file
    setFormData(prev => ({
      ...prev,
      newImage: file
    }));

    // Create and set image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };


  const updateGemblogMutation = useMutation({
    mutationFn: async () => {
      const formDataToSend = new FormData();

      // Clean and prepare alternateNames
      const cleanedAlternateNames = formData.alternateNames
        .filter(name => name.trim() !== "")
        .map(name => name.trim());

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'alternateNames') {
          // Send alternateNames as a JSON string
          formDataToSend.append(key, JSON.stringify(cleanedAlternateNames));
        } else if (key !== 'newImage' && key !== 'imageUrl') {
          formDataToSend.append(key, String(value));
        }
      });

      // Handle image upload
      if (formData.newImage) {
        formDataToSend.append('image', formData.newImage);
      }

      const response = await fetch(
        `${import.meta.env.VITE_PROXY_URL}/gemstones/update-gemblog/${gemstoneId}/`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update gemstone data");
      }

      return response.json();
    },
    onSuccess: () => {
      setSubmitStatus({
        type: "success",
        message: "Gemstone data updated successfully!",
      });
      toast.success("Gemstone updated successfully!", {
        position: "bottom-right",
        duration: 2000
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      setSubmitStatus({
        type: "error",
        message: error.message,
      });
      toast.error("Failed to update gemstone", {
        position: "bottom-right",
        duration: 2000
      });
    },
  });


  const handleAddAlternateName = () => {
    setFormData(prev => ({
      ...prev,
      alternateNames: [...prev.alternateNames, ""]
    }));
  };

  // Remove alternate name field handler
  const handleRemoveAlternateName = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      alternateNames: prev.alternateNames.filter((_, index) => index !== indexToRemove)
    }));
  };


  const handleFeaturedToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      featured: checked
    }));
  };

  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({
    type: "",
    message: "",
  });

  // Rest of the component remains the same as GemstoneForm
  const handleInputChange = useCallback(
    (_section: string, field: keyof GemstoneFormData, value: string, index?: number) => {
      setFormData((prev) => {
        if (field === "alternateNames" && typeof index === "number") {
          const newAlternateNames = [...prev.alternateNames];
          newAlternateNames[index] = value;
          return {
            ...prev,
            alternateNames: newAlternateNames
          };
        }
        
        return {
          ...prev,
          [field]: value
        };
      });
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateGemblogMutation.mutate();
  };

  // Same renderFormattedSection function as before
  const MemoizedFormattedPasteArea = React.memo(FormattedPasteArea);

  const renderFormattedSection = useCallback(
    (title: string, content: string, field: keyof GemstoneFormData) => (
      <div className="space-y-4" key={`${field}-section`}>
        <Label className="text-base font-medium">{title}</Label>
        <Card>
          <CardContent className="pt-4">
            <ClientOnly
              fallback={
                <div className="h-[200px] flex items-center justify-center bg-gray-50">
                  Loading editor...
                </div>
              }
            >
              {() => (
                <MemoizedFormattedPasteArea
                  key={field}
                  content={content || ''}
                  onChange={(newContent) => handleInputChange(field, field, newContent)}
                />
              )}
            </ClientOnly>
          </CardContent>
        </Card>
      </div>
    ),
    [handleInputChange]
  );

  if (isLoadingData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">Loading gemstone data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Gemstone: {formData.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Same Accordion structure as before */}
            <Accordion type="multiple" className="w-full">
              {/* Basic Information */}
              <AccordionItem value="basic">
                <AccordionTrigger>Basic Information</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("basic", "name", e.target.value)
                      }
                      placeholder="Enter gemstone name"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label>Featured on Home Page</Label>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={handleFeaturedToggle}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.featured
                        ? "This gemstone will be shown on the home page"
                        : "This gemstone will not be featured on the home page"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label>Gemstone Image</Label>
                    <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-lg">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="imageUpload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('imageUpload')?.click()}
                        className="mb-2"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                      </Button>
                      {imagePreview && (
                        <div className="mt-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-xs rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange(
                          "basic",
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Enter gemstone description"
                    />
                  </div>

                  <div>
                    <Label>Alternate Names</Label>
                    {formData.alternateNames.map((name, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={name}
                          onChange={(e) =>
                            handleInputChange(
                              "basic",
                              "alternateNames",
                              e.target.value,
                              index
                            )
                          }
                          placeholder="Enter alternate name"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemoveAlternateName(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={handleAddAlternateName}
                    >
                      Add Another Name
                    </Button>
                  </div>
                  <div>
                    <Label>Short Benefits</Label>
                    <Input
                      value={formData.shortBenefits}
                      onChange={(e) =>
                        handleInputChange("basic", "shortBenefits", e.target.value)
                      }
                      placeholder="Enter short benefits (e.g., 'Enhances creativity, promotes healing')"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Rest of the accordion items remain the same */}
              <AccordionItem value="wearing">
                <AccordionTrigger>Who Should Wear</AccordionTrigger>
                <AccordionContent>
                  {renderFormattedSection(
                    "Who Should Wear This Gemstone",
                    formData.whoShouldWear,
                    "whoShouldWear"
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="benefits">
                <AccordionTrigger>Benefits</AccordionTrigger>
                <AccordionContent>
                  {renderFormattedSection(
                    "Gemstone Benefits",
                    formData.benefits,
                    "benefits"
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="prices">
                <AccordionTrigger>Prices</AccordionTrigger>
                <AccordionContent>
                  {renderFormattedSection(
                    "Pricing Information",
                    formData.prices,
                    "prices"
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="quality">
                <AccordionTrigger>Quality</AccordionTrigger>
                <AccordionContent>
                  {renderFormattedSection(
                    "Quality Information",
                    formData.quality,
                    "quality"
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="specifications">
                <AccordionTrigger>Specifications</AccordionTrigger>
                <AccordionContent>
                  {renderFormattedSection(
                    "Technical Specifications",
                    formData.specifications,
                    "specifications"
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faqs">
                <AccordionTrigger>FAQs</AccordionTrigger>
                <AccordionContent>
                  {renderFormattedSection(
                    "Frequently Asked Questions",
                    formData.faqs,
                    "faqs"
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="curiousFacts">
                <AccordionTrigger>Curious Facts</AccordionTrigger>
                <AccordionContent>
                  {renderFormattedSection(
                    "Interesting Facts",
                    formData.curiousFacts,
                    "curiousFacts"
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {submitStatus.message && (
              <Alert
                variant={submitStatus.type === "error" ? "destructive" : "default"}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitStatus.message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={updateGemblogMutation.isLoading}
            >
              {updateGemblogMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Gemstone Information...
                </>
              ) : (
                "Update Gemstone Information"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditGemstoneForm;
