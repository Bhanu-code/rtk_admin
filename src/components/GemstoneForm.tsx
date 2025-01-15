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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormattedPasteArea } from "./blog/WhoShouldWear";
import { ClientOnly } from "remix-utils/client-only";
import { useMutation } from "react-query";

interface GemstoneFormData {
  name: string;
  alternateNames: string[];
  description: string;
  whoShouldWear: string;
  benefits: string;
  prices: string;
  quality: string;
  specifications: string;
  faqs: string;
  curiousFacts: string;
}

const GemstoneForm = () => {
  const [formData, setFormData] = useState<GemstoneFormData>({
    name: "",
    alternateNames: [""],
    description: "",
    whoShouldWear: "",
    benefits: "",
    prices: "",
    quality: "",
    specifications: "",
    faqs: "",
    curiousFacts: "",
  });

  const createGemblogMutation = useMutation({
    mutationFn: async () => {
      const gemBlogData = {
        name: formData.name,
        description: formData.description,
        whoShouldWear: formData.whoShouldWear,
        benefits: formData.benefits,
        prices: formData.prices,
        quality: formData.quality,
        specifications: formData.specifications,
        faqs: formData.faqs,
        curiousFacts: formData.curiousFacts,
      };

      const response = await fetch(
        "http://localhost:5000/gemstones/create-gemblog",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gemBlogData),
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

  const saveFormToJson = () => {
    try {
      const jsonData = JSON.stringify(formData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "gemstone-data.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSubmitStatus({
        type: "success",
        message: "Data saved successfully!",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to save data",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = JSON.parse(e.target?.result as string);
        setFormData((prevData) => ({
          ...prevData,
          ...jsonContent,
        }));
        setSubmitStatus({
          type: "success",
          message: "Data loaded successfully!",
        });
      } catch (error) {
        setSubmitStatus({
          type: "error",
          message: "Failed to load data",
        });
      }
    };
    reader.readAsText(file);
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
                </AccordionContent>
              </AccordionItem>

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

              {/* Benefits */}
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

              {/* Prices */}
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

              {/* Quality */}
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

              {/* Specifications */}
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

              {/* FAQs */}
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

              {/* Curious Facts */}
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

            <div className="flex gap-4 mt-6">
              <Button type="button" onClick={saveFormToJson}>
                Save to JSON
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  id="jsonFileInput"
                />
                <Button
                  type="button"
                  onClick={() =>
                    document.getElementById("jsonFileInput")?.click()
                  }
                >
                  Load from JSON
                </Button>
              </div>
            </div>

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
            >
              Save Gemstone Information
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GemstoneForm;