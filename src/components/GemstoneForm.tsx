import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define TypeScript interfaces for our data structure
interface PhysicalProperties {
  color: string;
  hardness: string;
  crystalSystem: string;
  transparency: string;
  quality: string;
}

interface Benefits {
  physical: string[];
  emotional: string[];
  spiritual: string[];
  professional: string[];
}

interface CuriousFact {
  title: string;
  fact: string;
}

interface PricePerCarat {
  minimum: string;
  maximum: string;
  averageGoodQuality: string;
}

interface Specifications {
  weight: string;
  dimensions: string;
  origin: string;
  treatment: string;
  certification: string;
}

interface WearingGuidelines {
  suitableFor: string[];
  bestTimeToWear: string;
  fingerToWear: string;
  metal: string;
  precautions: string[];
}

interface FAQ {
  question: string;
  answer: string;
}

interface GemstoneFormData {
  name: string;
  alternateNames: string[];
  description: string;
  physicalProperties: PhysicalProperties;
  benefits: Benefits;
  curiousFacts: CuriousFact[];
  specifications: Specifications;
  wearingGuidelines: WearingGuidelines;
  faqs: FAQ[];
  pricing: {
    retail: {
      pricePerCarat: PricePerCarat;
    };
  };
}

interface SubmitStatus {
  type: 'success' | 'error' | '';
  message: string;
}

const GemstoneForm = () => {
  const [formData, setFormData] = useState<GemstoneFormData>({
    name: '',
    alternateNames: [''],
    description: '',
    physicalProperties: {
      color: '',
      hardness: '',
      crystalSystem: '',
      transparency: '',
      quality: ''
    },
    benefits: {
      physical: [''],
      emotional: [''],
      spiritual: [''],
      professional: ['']
    },
    curiousFacts: [{
      title: '',
      fact: ''
    }],
    specifications: {
      weight: '',
      dimensions: '',
      origin: '',
      treatment: '',
      certification: ''
    },
    wearingGuidelines: {
      suitableFor: [''],
      bestTimeToWear: '',
      fingerToWear: '',
      metal: '',
      precautions: ['']
    },
    faqs: [{
      question: '',
      answer: ''
    }],
    pricing: {
      retail: {
        pricePerCarat: {
          minimum: '',
          maximum: '',
          averageGoodQuality: ''
        }
      }
    }
  });

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ type: '', message: '' });

  const handleInputChange = (
    section: keyof GemstoneFormData | 'pricing',
    field: string,
    value: string,
    index: number | null = null,
    subfield: string | null = null
  ) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (index !== null) {
        if (subfield) {
          (newData[section as keyof GemstoneFormData] as any)[field][index][subfield] = value;
        } else {
          (newData[section as keyof GemstoneFormData] as any)[field][index] = value;
        }
      } else if (section === 'physicalProperties' || section === 'specifications' || section === 'wearingGuidelines') {
        (newData[section] as any)[field] = value;
      } else if (section === 'pricing') {
        newData.pricing.retail.pricePerCarat[field as keyof PricePerCarat] = value;
      } else {
        (newData as any)[field] = value;
      }
      
      return newData;
    });
  };

  const addListItem = (section: string, field: string | null = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (section === 'benefits') {
        (newData.benefits[field as keyof Benefits] as string[]).push('');
      } else if (section === 'curiousFacts') {
        newData.curiousFacts.push({ title: '', fact: '' });
      } else if (section === 'wearingGuidelines') {
        (newData.wearingGuidelines[field as keyof WearingGuidelines] as string[]).push('');
      } else if (section === 'faqs') {
        newData.faqs.push({ question: '', answer: '' });
      } else {
        (newData[field as keyof GemstoneFormData] as string[]).push('');
      }
      return newData;
    });
  };

  const removeListItem = (section: string, field: string | null, index: number) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (section === 'benefits') {
        (newData.benefits[field as keyof Benefits] as string[]).splice(index, 1);
      } else if (section === 'curiousFacts') {
        newData.curiousFacts.splice(index, 1);
      } else if (section === 'wearingGuidelines') {
        (newData.wearingGuidelines[field as keyof WearingGuidelines] as string[]).splice(index, 1);
      } else if (section === 'faqs') {
        newData.faqs.splice(index, 1);
      } else {
        (newData[field as keyof GemstoneFormData] as string[]).splice(index, 1);
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/gemstones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to submit gemstone data');

      setSubmitStatus({
        type: 'success',
        message: 'Gemstone data submitted successfully!'
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gemstone Data Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              {/* Previous sections remain the same */}
              {/* Basic Information */}
              <AccordionItem value="basic">
                <AccordionTrigger>Basic Information</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('basic', 'name', e.target.value)}
                      placeholder="Enter gemstone name"
                    />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('basic', 'description', e.target.value)}
                      placeholder="Enter gemstone description"
                    />
                  </div>

                  <div>
                    <Label>Alternate Names</Label>
                    {formData.alternateNames.map((name, index:any) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={name}
                          onChange={(e) => handleInputChange('basic', 'alternateNames', e.target.value, index)}
                          placeholder="Enter alternate name"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeListItem('basic', 'alternateNames', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addListItem('basic', 'alternateNames')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Alternate Name
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Physical Properties */}
              <AccordionItem value="physical">
                <AccordionTrigger>Physical Properties</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Color</Label>
                      <Input
                        value={formData.physicalProperties.color}
                        onChange={(e) => handleInputChange('physicalProperties', 'color', e.target.value)}
                        placeholder="Enter color"
                      />
                    </div>
                    <div>
                      <Label>Hardness</Label>
                      <Input
                        type="number"
                        value={formData.physicalProperties.hardness}
                        onChange={(e) => handleInputChange('physicalProperties', 'hardness', e.target.value)}
                        placeholder="Enter hardness"
                      />
                    </div>
                    <div>
                      <Label>Crystal System</Label>
                      <Input
                        value={formData.physicalProperties.crystalSystem}
                        onChange={(e) => handleInputChange('physicalProperties', 'crystalSystem', e.target.value)}
                        placeholder="Enter crystal system"
                      />
                    </div>
                    <div>
                      <Label>Quality (1-10)</Label>
                      <Select
                        value={formData.physicalProperties.quality}
                        onValueChange={(value) => handleInputChange('physicalProperties', 'quality', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(10)].map((_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Benefits */}
              <AccordionItem value="benefits">
                <AccordionTrigger>Benefits</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {Object.keys(formData.benefits).map((benefitType) => (
                    <div key={benefitType}>
                      <Label className="capitalize">{benefitType} Benefits</Label>
                      {formData.benefits[benefitType].map((benefit:any, index:any) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <Input
                            value={benefit}
                            onChange={(e) => handleInputChange('benefits', benefitType, e.target.value, index)}
                            placeholder={`Enter ${benefitType} benefit`}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeListItem('benefits', benefitType, index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem('benefits', benefitType)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Benefit
                      </Button>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* Curious Facts */}
              <AccordionItem value="facts">
                <AccordionTrigger>Curious Facts</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {formData.curiousFacts.map((fact, index:any) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Fact {index + 1}</Label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeListItem('curiousFacts', null, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        value={fact.title}
                        onChange={(e) => handleInputChange('curiousFacts', null, e.target.value, index, 'title')}
                        placeholder="Enter fact title"
                        className="mb-2"
                      />
                      <Textarea
                        value={fact.fact}
                        onChange={(e) => handleInputChange('curiousFacts', null, e.target.value, index, 'fact')}
                        placeholder="Enter fact description"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addListItem('curiousFacts')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fact
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Pricing */}
              <AccordionItem value="pricing">
                <AccordionTrigger>Pricing</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Minimum Price (USD)</Label>
                      <Input
                        type="number"
                        value={formData.pricing.retail.pricePerCarat.minimum}
                        onChange={(e) => handleInputChange('pricing', 'minimum', e.target.value)}
                        placeholder="Enter minimum price"
                      />
                    </div>
                    <div>
                      <Label>Maximum Price (USD)</Label>
                      <Input
                        type="number"
                        value={formData.pricing.retail.pricePerCarat.maximum}
                        onChange={(e) => handleInputChange('pricing', 'maximum', e.target.value)}
                        placeholder="Enter maximum price"
                      />
                    </div>
                    <div>
                      <Label>Average Price (USD)</Label>
                      <Input
                        type="number"
                        value={formData.pricing.retail.pricePerCarat.averageGoodQuality}
                        onChange={(e) => handleInputChange('pricing', 'averageGoodQuality', e.target.value)}
                        placeholder="Enter average price"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

             {/* New Specifications Section */}
             <AccordionItem value="specifications">
                <AccordionTrigger>Specifications</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Weight (carats)</Label>
                      <Input
                        value={formData.specifications.weight}
                        onChange={(e) => handleInputChange('specifications', 'weight', e.target.value)}
                        placeholder="Enter weight"
                      />
                    </div>
                    <div>
                      <Label>Dimensions</Label>
                      <Input
                        value={formData.specifications.dimensions}
                        onChange={(e) => handleInputChange('specifications', 'dimensions', e.target.value)}
                        placeholder="Enter dimensions"
                      />
                    </div>
                    <div>
                      <Label>Origin</Label>
                      <Input
                        value={formData.specifications.origin}
                        onChange={(e) => handleInputChange('specifications', 'origin', e.target.value)}
                        placeholder="Enter origin"
                      />
                    </div>
                    <div>
                      <Label>Treatment</Label>
                      <Input
                        value={formData.specifications.treatment}
                        onChange={(e) => handleInputChange('specifications', 'treatment', e.target.value)}
                        placeholder="Enter treatment"
                      />
                    </div>
                    <div>
                      <Label>Certification</Label>
                      <Input
                        value={formData.specifications.certification}
                        onChange={(e) => handleInputChange('specifications', 'certification', e.target.value)}
                        placeholder="Enter certification"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Wearing Guidelines Section */}
              <AccordionItem value="wearing">
                <AccordionTrigger>Who Should Wear</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <Label>Suitable For</Label>
                    {formData.wearingGuidelines.suitableFor.map((person, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={person}
                          onChange={(e) => handleInputChange('wearingGuidelines', 'suitableFor', e.target.value, index)}
                          placeholder="Enter suitable person type"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeListItem('wearingGuidelines', 'suitableFor', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addListItem('wearingGuidelines', 'suitableFor')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Suitable Person
                    </Button>
                  </div>

                  <div>
                    <Label>Best Time to Wear</Label>
                    <Input
                      value={formData.wearingGuidelines.bestTimeToWear}
                      onChange={(e) => handleInputChange('wearingGuidelines', 'bestTimeToWear', e.target.value)}
                      placeholder="Enter best time to wear"
                    />
                  </div>

                  <div>
                    <Label>Finger to Wear</Label>
                    <Input
                      value={formData.wearingGuidelines.fingerToWear}
                      onChange={(e) => handleInputChange('wearingGuidelines', 'fingerToWear', e.target.value)}
                      placeholder="Enter recommended finger"
                    />
                  </div>

                  <div>
                    <Label>Compatible Metal</Label>
                    <Input
                      value={formData.wearingGuidelines.metal}
                      onChange={(e) => handleInputChange('wearingGuidelines', 'metal', e.target.value)}
                      placeholder="Enter compatible metal"
                    />
                  </div>

                  <div>
                    <Label>Precautions</Label>
                    {formData.wearingGuidelines.precautions.map((precaution, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={precaution}
                          onChange={(e) => handleInputChange('wearingGuidelines', 'precautions', e.target.value, index)}
                          placeholder="Enter precaution"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeListItem('wearingGuidelines', 'precautions', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addListItem('wearingGuidelines', 'precautions')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Precaution
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* FAQs Section */}
              <AccordionItem value="faqs">
                <AccordionTrigger>FAQs</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>FAQ {index + 1}</Label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeListItem('faqs', null, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        value={faq.question}
                        onChange={(e) => handleInputChange('faqs', null, e.target.value, index, 'question')}
                        placeholder="Enter question"
                        className="mb-2"
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => handleInputChange('faqs', null, e.target.value, index, 'answer')}
                        placeholder="Enter answer"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addListItem('faqs')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {submitStatus.message && (
              <Alert variant={submitStatus.type === 'error' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitStatus.message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Submit Gemstone Data
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GemstoneForm;