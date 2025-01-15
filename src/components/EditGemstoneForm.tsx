import { useState, useEffect } from "react";
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormattedPasteArea } from "./blog/WhoShouldWear";
import { ClientOnly } from "remix-utils/client-only";
import { useMutation, useQuery } from "react-query";

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
}

interface EditGemstoneFormProps {
  gemstoneId: any;
  onSuccess?: () => void;
}

const EditGemstoneForm = ({ gemstoneId, onSuccess }: EditGemstoneFormProps) => {
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
  });

  // Fetch existing gemstone data
  const { data: gemstoneData, isLoading } = useQuery(
    ["gemstone", gemstoneId],
    async () => {
      const response = await fetch(
        `http://localhost:5000/gemstones/get-gemblog/${gemstoneId}/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch gemstone data");
      }
      return response.json();
    }
  );

  // Update form data when gemstone data is fetched
  useEffect(() => {
    if (gemstoneData) {
      setFormData({
        name: gemstoneData.name || "",
        alternateNames: gemstoneData.alternateNames || [""],
        shortBenefits: gemstoneData.shortBenefits || "",
        description: gemstoneData.description || "",
        whoShouldWear: gemstoneData.whoShouldWear || "",
        benefits: gemstoneData.benefits || "",
        prices: gemstoneData.prices || "",
        quality: gemstoneData.quality || "",
        specifications: gemstoneData.specifications || "",
        faqs: gemstoneData.faqs || "",
        curiousFacts: gemstoneData.curiousFacts || "",
      });
    }
  }, [gemstoneData]);

  const updateGemblogMutation = useMutation({
    mutationFn: async () => {
      const gemBlogData = {
        name: formData.name,
        description: formData.description,
        shortBenefits: formData.shortBenefits,
        whoShouldWear: formData.whoShouldWear,
        benefits: formData.benefits,
        prices: formData.prices,
        quality: formData.quality,
        specifications: formData.specifications,
        faqs: formData.faqs,
        curiousFacts: formData.curiousFacts,
      };

      const response = await fetch(
        `http://localhost:5000/gemstones/update-gemblog/${gemstoneId}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gemBlogData),
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
      onSuccess?.();
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

  // Rest of the component remains the same as GemstoneForm
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateGemblogMutation.mutate();
  };

  // Same renderFormattedSection function as before
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
              <FormattedPasteArea
                content={content}
                onChange={(newContent) =>
                  handleInputChange("content", field, newContent)
                }
              />
            )}
          </ClientOnly>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              Loading gemstone data...
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
                variant={
                  submitStatus.type === "error" ? "destructive" : "default"
                }
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
              Update Gemstone Information
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditGemstoneForm;