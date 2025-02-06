import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useMutation } from "react-query";
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
  image?: File;
  featured: boolean;
}

const GemstoneForm = () => {
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
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const navigateTo = useNavigate();

  const createGemblogMutation = useMutation({
    mutationFn: async () => {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'alternateNames') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key !== 'image') {
          formDataToSend.append(key, value as string);
        }
      });

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Simulate a delay to show loading state (remove in production)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(
        `${import.meta.env.VITE_PROXY_URL}/gemstones/create-gemblog`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit gemstone data");
      }

      return response.json();
    },
    onSuccess: () => {
      setSubmitStatus({
        type: "success",
        message: "Gemstone data submitted successfully!",
      });

      toast.success("Gemstone data submitted successfully!", {
        position: "bottom-right",
        duration: 2000
      });
      navigateTo("/home/gemblogs");
    },
    onError: (error: Error) => {
      setSubmitStatus({
        type: "error",
        message: error.message,
      });
    },
  });


  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({
    type: "",
    message: "",
  });

  const handleInputChange = (
    section: string,
    field: string,
    value: string,
    index?: number
  ) => {
    setFormData((prev) => {
      const newData = { ...prev };

      if (section === "basic") {
        if (field === "alternateNames" && index !== undefined) {
          const newNames = [...newData.alternateNames];
          newNames[index] = value;
          newData.alternateNames = newNames;
        } else {
          (newData as any)[field] = value;
        }
      } else {
        (newData as any)[field] = value;
      }

      return newData;
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Update form data with the image file
    setFormData(prev => ({
      ...prev,
      image: file
    }));

    // Create and set image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFeaturedToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      featured: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createGemblogMutation.mutate();
  };

  const renderFormattedSection = (
    title: string,
    content: string,
    field: string
  ) => (
    <div className="space-y-4">
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
              <div 
                className="min-h-[200px] rounded-lg overflow-auto focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
              >
                <FormattedPasteArea
                  content={content}
                  onChange={(newContent) => {
                    handleInputChange("content", field, newContent);
                  }}
                />
              </div>
            )}
          </ClientOnly>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gemstone Data Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
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

                  {/* Image Upload Section */}
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
                        Upload Image
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
                      <Input
                        key={index}
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
                        className="mt-2"
                      />
                    ))}
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

              {/* Other Accordion Items */}
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
              disabled={createGemblogMutation.isLoading}
            >
              {createGemblogMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Gemstone Information...
                </>
              ) : (
                "Save Gemstone Information"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GemstoneForm;