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



interface BenefitEntry {
  category: 'Physical' | 'Emotional' | 'Spiritual' | 'Professional';
  benefit: string;
  description: string;
  supportingDetails?: string[];
}

interface QualityAttribute {
  aspect: 'Origin' | 'Cut' | 'Color' | 'Clarity';
  description: string;
  characteristics: string[];
  grading?: string[];
}

interface SpecificationDetail {
  category: 'Chemical' | 'Physical' | 'Optical' | 'Formation';
  property: string;
  value: string;
  unit?: string;
  notes?: string;
}

// interface CuriousFact {
//   category: 'Historical' | 'Cultural' | 'Scientific' | 'Unique';
//   title: string;
//   description: string;
//   references?: string[];
// }

// Second definition (in use)
// interface CuriousFact {
//   title: string;
//   fact: string;
// }

// interface GemstoneFormData {
//   benefits: BenefitEntry[];
//   quality: QualityAttribute[];
//   specifications: SpecificationDetail[];
//   curiousFacts: CuriousFact[];
// }


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
  category: string;
  title: string;
  description: string;
  fact: string;  // This is required but missing in some places
  references: string[];
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

// But you're trying to use it as an array. Let's create a SpecificationEntry interface:
interface SpecificationEntry {
  category: string;
  weight: string;
  property: string;
  value: string;
  unit: string;
  notes: string;
}


interface WearingGuidelines {
  suitableFor: {
    zodiacSigns: string[];
    ascendants: string[];
    birthMonth: string[];
    other: string[];
  };
  wearingProcess: {
    dayAndTime: string;
    metal: string[];
    weightCalculation: string;
  };
  wearingMethod: {
    preparation: string[];
    mantras: string[];
  };
  additionalNotes: string;
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
  benefits: BenefitEntry[];
  quality: QualityAttribute[];
  specifications: SpecificationEntry[];
  curiousFacts: CuriousFact[];
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
    benefits: [
      {
        category: 'Physical',
        benefit: '',
        description: '',
        supportingDetails: []
      }
    ],
    curiousFacts: [{
      category: 'Historical',
      title: '',
      description: '',
      fact: '', // Added the required fact property
      references: []
    }],
    specifications: {
      weight: '',
      dimensions: '',
      origin: '',
      treatment: '',
      certification: ''
    },
    wearingGuidelines: {
      suitableFor: {
        zodiacSigns: [''],
        ascendants: [''],
        birthMonth: [''],
        other: ['']
      },
      wearingProcess: {
        dayAndTime: '',
        metal: [''],
        weightCalculation: ''
      },
      wearingMethod: {
        preparation: [''],
        mantras: ['']
      },
      additionalNotes: ''
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

  const benefitCategories = ['Physical', 'Emotional', 'Spiritual', 'Professional'];
  const qualityAspects = ['Origin', 'Cut', 'Color', 'Clarity'];
  const specificationCategories = ['Chemical', 'Physical', 'Optical', 'Formation'];
  const factCategories = ['Historical', 'Cultural', 'Scientific', 'Unique'];

  const handleBenefitAdd = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, {
        category: 'Physical',
        benefit: '',
        description: '',
        supportingDetails: []
      }]
    }));
  };

  const handleBenefitChange = (index: number, field: keyof BenefitEntry, value: string) => {
    setFormData(prev => {
      const newBenefits = [...prev.benefits];
      newBenefits[index] = { ...newBenefits[index], [field]: value };
      return { ...prev, benefits: newBenefits };
    });
  };

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ type: '', message: '' });

  const handleInputChange = (
    section: keyof GemstoneFormData | 'basic',
    field: string,
    value: string,
    index: number | null = null,
    subfield: string | null = null
  ) => {
    setFormData(prev => {
      const newData = { ...prev };

      if (section === 'basic') {
        if (field === 'alternateNames' && index !== null) {
          const newNames = [...newData.alternateNames];
          newNames[index] = value;
          newData.alternateNames = newNames;
        } else {
          (newData as any)[field] = value;
        }
      }

      if (section === 'specifications') {
        if (index !== null && subfield) {
          const newSpecs = [...newData.specifications];
          newSpecs[index] = { 
            ...newSpecs[index], 
            [subfield]: value 
          };
          newData.specifications = newSpecs;
        }
      }

      if (section === 'wearingGuidelines') {
        const [mainField, subField, nestedField] = field.split('.');
        if (index !== null && subField && nestedField) {
          // Handle nested arrays in wearing guidelines
          ((newData.wearingGuidelines as any)[mainField][subField] as string[])[index] = value;
        } else if (subField) {
          // Handle non-array nested fields
          (newData.wearingGuidelines as any)[mainField][subField] = value;
        }
      } else if (index !== null) {
        if (subfield) {
          // Handle array objects (like FAQs, curiousFacts)
          ((newData[section as keyof GemstoneFormData] as any)[index] as any)[subfield] = value;
        } else {
          // Handle simple arrays
          ((newData[section as keyof GemstoneFormData] as any) as string[])[index] = value;
        }
      } else if (section === 'physicalProperties' || section === 'specifications') {
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

      if (section === 'wearingGuidelines') {
        const [mainField, subField] = field!.split('.');
        ((newData.wearingGuidelines as any)[mainField][subField] as string[]).push('');
      } else if (section === 'benefits' && field) {
        (newData.benefits[field as keyof Benefits] as string[]).push('');
      } else if (section === 'curiousFacts') {
        newData.curiousFacts.push({ title: '', fact: '' });
      } else if (section === 'faqs') {
        newData.faqs.push({ question: '', answer: '' });
      } else if (field) {
        (newData[field as keyof GemstoneFormData] as string[]).push('');
      }

      return newData;
    });
  };

  const removeListItem = (section: string, field: string | null, index: number) => {
    setFormData(prev => {
      const newData = { ...prev };

      if (section === 'wearingGuidelines') {
        const [mainField, subField] = field!.split('.');
        ((newData.wearingGuidelines as any)[mainField][subField] as string[]).splice(index, 1);
      } else if (section === 'benefits' && field) {
        (newData.benefits[field as keyof Benefits] as string[]).splice(index, 1);
      } else if (section === 'curiousFacts') {
        newData.curiousFacts.splice(index, 1);
      } else if (section === 'faqs') {
        newData.faqs.splice(index, 1);
      } else if (field) {
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

   const handleQualityAdd = () => {
    setFormData(prev => ({
      ...prev,
      quality: [...prev.quality, {
        aspect: 'Origin',
        description: '',
        characteristics: [],
        grading: []
      }]
    }));
  };

  const handleQualityChange = (index: number, field: keyof QualityAttribute, value: any) => {
    setFormData(prev => {
      const newQuality = [...prev.quality];
      newQuality[index] = { ...newQuality[index], [field]: value };
      return { ...prev, quality: newQuality };
    });
  };

  const handleSpecificationAdd = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, {
        category: 'Chemical',
        'weight':'',
        property: '',
        value: '',
        unit: '',
        notes: ''
      }]
    }));
  };

  const handleSpecificationChange = (index: number, field: keyof SpecificationEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }));
  };
  const handleFactAdd = () => {
    setFormData(prev => ({
      ...prev,
      curiousFacts: [...prev.curiousFacts, {
        category: 'Historical',
        title: '',
        description: '',
        fact: '', // Added missing required field
        references: []
      }]
    }));
  };
  const handleFactChange = (index: number, field: keyof CuriousFact, value: any) => {
    setFormData(prev => {
      const newFacts = [...prev.curiousFacts];
      newFacts[index] = { ...newFacts[index], [field]: value };
      return { ...prev, curiousFacts: newFacts };
    });
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
                      onChange={(e) => handleInputChange('name' as keyof GemstoneFormData, 'name', e.target.value)}
                      placeholder="Enter gemstone name"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('name' as keyof GemstoneFormData, 'name', e.target.value)}
                      placeholder="Enter gemstone description"
                    />
                  </div>

                  <div>
                    <Label>Alternate Names</Label>
                    {formData.alternateNames.map((name, index: any) => (
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
                <AccordionTrigger>Benefits & Properties</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-lg font-semibold">Benefit {index + 1}</Label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              benefits: prev.benefits.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Category</Label>
                          <Select
                            value={benefit.category}
                            onValueChange={(value) => handleBenefitChange(index, 'category', value as any)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {benefitCategories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Benefit Title</Label>
                          <Input
                            value={benefit.benefit}
                            onChange={(e) => handleBenefitChange(index, 'benefit', e.target.value)}
                            placeholder="Enter the main benefit"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={benefit.description}
                          onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                          placeholder="Provide a detailed description of this benefit"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Supporting Details</Label>
                        {benefit.supportingDetails?.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex gap-2 mt-2">
                            <Input
                              value={detail}
                              onChange={(e) => {
                                const newDetails = [...(benefit.supportingDetails || [])];
                                newDetails[detailIndex] = e.target.value;
                                handleBenefitChange(index, 'supportingDetails', newDetails as any);
                              }}
                              placeholder="Add supporting detail"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newDetails = benefit.supportingDetails?.filter((_, i) => i !== detailIndex);
                                handleBenefitChange(index, 'supportingDetails', newDetails as any);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newDetails = [...(benefit.supportingDetails || []), ''];
                            handleBenefitChange(index, 'supportingDetails', newDetails as any);
                          }}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Supporting Detail
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBenefitAdd}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Benefit
                  </Button>
                </AccordionContent>
              </AccordionItem>
              {/* Curious Facts */}
              <AccordionItem value="facts">
                <AccordionTrigger>Curious Facts</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {formData.curiousFacts.map((fact, index: any) => (
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
                        onChange={(e) => handleInputChange('curiousFacts', 'curiousFacts', e.target.value, index, 'title')}
                        placeholder="Enter fact title"
                        className="mb-2"
                      />
                      <Textarea
                        value={fact.fact}
                        onChange={(e) => handleInputChange('curiousFacts', 'curiousFacts', e.target.value, index, 'fact')}
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
              {/* <AccordionItem value="specifications">
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
              </AccordionItem> */}

              {/* Wearing Guidelines Section */}
              <AccordionItem value="wearing">
                <AccordionTrigger>Who Should Wear</AccordionTrigger>
                <AccordionContent className="space-y-6">
                  {/* Suitable For Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Suitable For</h3>

                    {/* Zodiac Signs */}
                    <div>
                      <Label>Zodiac Signs</Label>
                      {formData.wearingGuidelines.suitableFor.zodiacSigns.map((sign, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <Input
                            value={sign}
                            onChange={(e) => handleInputChange('wearingGuidelines', 'suitableFor.zodiacSigns', e.target.value, index)}
                            placeholder="Enter zodiac sign"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeListItem('wearingGuidelines', 'suitableFor.zodiacSigns', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem('wearingGuidelines', 'suitableFor.zodiacSigns')}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Zodiac Sign
                      </Button>
                    </div>

                    {/* Ascendants */}
                    <div>
                      <Label>Ascendants</Label>
                      {formData.wearingGuidelines.suitableFor.ascendants.map((ascendant, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <Input
                            value={ascendant}
                            onChange={(e) => handleInputChange('wearingGuidelines', 'suitableFor.ascendants', e.target.value, index)}
                            placeholder="Enter ascendant sign"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeListItem('wearingGuidelines', 'suitableFor.ascendants', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem('wearingGuidelines', 'suitableFor.ascendants')}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Ascendant
                      </Button>
                    </div>
                  </div>

                  {/* Wearing Process Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Process of Wearing</h3>

                    <div>
                      <Label>Day and Time</Label>
                      <Input
                        value={formData.wearingGuidelines.wearingProcess.dayAndTime}
                        onChange={(e) => handleInputChange('wearingGuidelines', 'wearingProcess.dayAndTime', e.target.value)}
                        placeholder="Enter recommended day and time"
                      />
                    </div>

                    <div>
                      <Label>Compatible Metals</Label>
                      {formData.wearingGuidelines.wearingProcess.metal.map((metal, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <Input
                            value={metal}
                            onChange={(e) => handleInputChange('wearingGuidelines', 'wearingProcess.metal', e.target.value, index)}
                            placeholder="Enter compatible metal"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeListItem('wearingGuidelines', 'wearingProcess.metal', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem('wearingGuidelines', 'wearingProcess.metal')}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Metal
                      </Button>
                    </div>

                    <div>
                      <Label>Weight Calculation</Label>
                      <Textarea
                        value={formData.wearingGuidelines.wearingProcess.weightCalculation}
                        onChange={(e) => handleInputChange('wearingGuidelines', 'wearingProcess.weightCalculation', e.target.value)}
                        placeholder="Enter weight calculation guidelines"
                      />
                    </div>
                  </div>

                  {/* Wearing Method Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">How to Wear</h3>

                    <div>
                      <Label>Preparation Steps</Label>
                      {formData.wearingGuidelines.wearingMethod.preparation.map((step, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <Input
                            value={step}
                            onChange={(e) => handleInputChange('wearingGuidelines', 'wearingMethod.preparation', e.target.value, index)}
                            placeholder="Enter preparation step"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeListItem('wearingGuidelines', 'wearingMethod.preparation', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem('wearingGuidelines', 'wearingMethod.preparation')}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Preparation Step
                      </Button>
                    </div>

                    <div>
                      <Label>Mantras</Label>
                      {formData.wearingGuidelines.wearingMethod.mantras.map((mantra, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <Input
                            value={mantra}
                            onChange={(e) => handleInputChange('wearingGuidelines', 'wearingMethod.mantras', e.target.value, index)}
                            placeholder="Enter mantra"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeListItem('wearingGuidelines', 'wearingMethod.mantras', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem('wearingGuidelines', 'wearingMethod.mantras')}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Mantra
                      </Button>
                    </div>

                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={formData.wearingGuidelines.additionalNotes}
                        onChange={(e) => handleInputChange('wearingGuidelines', 'additionalNotes', e.target.value)}
                        placeholder="Enter any additional notes or guidelines"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* FAQs Section */}
              {/* <AccordionItem value="faqs">
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
                        onChange={(e) => handleInputChange('faqs', 'faqs', e.target.value, index, 'question')}
                        placeholder="Enter question"
                        className="mb-2"
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => handleInputChange('faqs', 'faqs', e.target.value, index, 'answer')}
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
               */}
              {/* <AccordionItem value="quality">
          <AccordionTrigger>Quality Assessment</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {formData.quality.map((quality, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Quality Factor {index + 1}</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        quality: prev.quality.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Aspect</Label>
                    <Select
                      value={quality.aspect}
                      onValueChange={(value) => handleQualityChange(index, 'aspect', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select aspect" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityAspects.map(aspect => (
                          <SelectItem key={aspect} value={aspect}>
                            {aspect}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={quality.description}
                      onChange={(e) => handleQualityChange(index, 'description', e.target.value)}
                      placeholder="Describe this quality aspect"
                    />
                  </div>
                </div>

                <div>
                  <Label>Characteristics</Label>
                  {quality.characteristics.map((char, charIndex) => (
                    <div key={charIndex} className="flex gap-2 mt-2">
                      <Input
                        value={char}
                        onChange={(e) => {
                          const newChars = [...quality.characteristics];
                          newChars[charIndex] = e.target.value;
                          handleQualityChange(index, 'characteristics', newChars);
                        }}
                        placeholder="Add characteristic"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newChars = quality.characteristics.filter((_, i) => i !== charIndex);
                          handleQualityChange(index, 'characteristics', newChars);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newChars = [...quality.characteristics, ''];
                      handleQualityChange(index, 'characteristics', newChars);
                    }}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Characteristic
                  </Button>
                </div>

                {quality.aspect === 'Color' || quality.aspect === 'Clarity' ? (
                  <div>
                    <Label>Grading Scale</Label>
                    {quality.grading?.map((grade, gradeIndex) => (
                      <div key={gradeIndex} className="flex gap-2 mt-2">
                        <Input
                          value={grade}
                          onChange={(e) => {
                            const newGrades = [...(quality.grading || [])];
                            newGrades[gradeIndex] = e.target.value;
                            handleQualityChange(index, 'grading', newGrades);
                          }}
                          placeholder="Add grade level"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            const newGrades = quality.grading?.filter((_, i) => i !== gradeIndex);
                            handleQualityChange(index, 'grading', newGrades);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newGrades = [...(quality.grading || []), ''];
                        handleQualityChange(index, 'grading', newGrades);
                      }}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Grade Level
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleQualityAdd}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Quality Factor
            </Button>
          </AccordionContent>
        </AccordionItem> */}

        {/* Specifications Section */}
        {/* <AccordionItem value="specifications">
          <AccordionTrigger>Technical Specifications</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Specification {index + 1}</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        specifications: prev.specifications.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={spec.category}
                      onValueChange={(value) => handleSpecificationChange(index, 'category', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {specificationCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Property</Label>
                    <Input
                      value={spec.property}
                      onChange={(e) => handleSpecificationChange(index, 'property', e.target.value)}
                      placeholder="Enter property name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Value</Label>
                    <Input
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      placeholder="Enter value"
                    />
                  </div>

                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={spec.unit}
                      onChange={(e) => handleSpecificationChange(index, 'unit', e.target.value)}
                      placeholder="Enter unit of measurement"
                    />
                  </div>
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={spec.notes}
                    onChange={(e) => handleSpecificationChange(index, 'notes', e.target.value)}
                    placeholder="Add any additional notes or clarifications"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleSpecificationAdd}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Specification
            </Button>
          </AccordionContent>
        </AccordionItem> */}

        {/* Curious Facts Section */}
        {/* <AccordionItem value="curious-facts">
          <AccordionTrigger>Curious Facts</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {formData.curiousFacts.map((fact, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Fact {index + 1}</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        curiousFacts: prev.curiousFacts.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={fact.category}
                      onValueChange={(value) => handleFactChange(index, 'category', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {factCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      value={fact.title}
                      onChange={(e) => handleFactChange(index, 'title', e.target.value)}
                      placeholder="Enter fact title"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={fact.description}
                    onChange={(e) => handleFactChange(index, 'description', e.target.value)}
                    placeholder="Describe this interesting fact"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>References</Label>
                  {fact.references?.map((ref, refIndex) => (
                    <div key={refIndex} className="flex gap-2 mt-2">
                      <Input
                        value={ref}
                        onChange={(e) => {
                          const newRefs = [...(fact.references || [])];
                          newRefs[refIndex] = e.target.value;
                          handleFactChange(index, 'references', newRefs);
                        }}
                        placeholder="Add reference"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newRefs = fact.references?.filter((_, i) => i !== refIndex);
                          handleFactChange(index, 'references', newRefs);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newRefs = [...(fact.references || []), ''];
                      handleFactChange(index, 'references', newRefs);
                    }}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reference
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleFactAdd}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Curious Fact
            </Button>
          </AccordionContent>
        </AccordionItem><AccordionItem value="quality">
          <AccordionTrigger>Quality Assessment</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {formData.quality.map((quality, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Quality Factor {index + 1}</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        quality: prev.quality.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Aspect</Label>
                    <Select
                      value={quality.aspect}
                      onValueChange={(value) => handleQualityChange(index, 'aspect', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select aspect" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityAspects.map(aspect => (
                          <SelectItem key={aspect} value={aspect}>
                            {aspect}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={quality.description}
                      onChange={(e) => handleQualityChange(index, 'description', e.target.value)}
                      placeholder="Describe this quality aspect"
                    />
                  </div>
                </div>

                <div>
                  <Label>Characteristics</Label>
                  {quality.characteristics.map((char, charIndex) => (
                    <div key={charIndex} className="flex gap-2 mt-2">
                      <Input
                        value={char}
                        onChange={(e) => {
                          const newChars = [...quality.characteristics];
                          newChars[charIndex] = e.target.value;
                          handleQualityChange(index, 'characteristics', newChars);
                        }}
                        placeholder="Add characteristic"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newChars = quality.characteristics.filter((_, i) => i !== charIndex);
                          handleQualityChange(index, 'characteristics', newChars);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newChars = [...quality.characteristics, ''];
                      handleQualityChange(index, 'characteristics', newChars);
                    }}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Characteristic
                  </Button>
                </div>

                {quality.aspect === 'Color' || quality.aspect === 'Clarity' ? (
                  <div>
                    <Label>Grading Scale</Label>
                    {quality.grading?.map((grade, gradeIndex) => (
                      <div key={gradeIndex} className="flex gap-2 mt-2">
                        <Input
                          value={grade}
                          onChange={(e) => {
                            const newGrades = [...(quality.grading || [])];
                            newGrades[gradeIndex] = e.target.value;
                            handleQualityChange(index, 'grading', newGrades);
                          }}
                          placeholder="Add grade level"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            const newGrades = quality.grading?.filter((_, i) => i !== gradeIndex);
                            handleQualityChange(index, 'grading', newGrades);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newGrades = [...(quality.grading || []), ''];
                        handleQualityChange(index, 'grading', newGrades);
                      }}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Grade Level
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleQualityAdd}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Quality Factor
            </Button>
          </AccordionContent>
        </AccordionItem> */}

        {/* Specifications Section */}
        {/* <AccordionItem value="specifications">
          <AccordionTrigger>Technical Specifications</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Specification {index + 1}</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        specifications: prev.specifications.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={spec.category}
                      onValueChange={(value) => handleSpecificationChange(index, 'category', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {specificationCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Property</Label>
                    <Input
                      value={spec.property}
                      onChange={(e) => handleSpecificationChange(index, 'property', e.target.value)}
                      placeholder="Enter property name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Value</Label>
                    <Input
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      placeholder="Enter value"
                    />
                  </div>

                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={spec.unit}
                      onChange={(e) => handleSpecificationChange(index, 'unit', e.target.value)}
                      placeholder="Enter unit of measurement"
                    />
                  </div>
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={spec.notes}
                    onChange={(e) => handleSpecificationChange(index, 'notes', e.target.value)}
                    placeholder="Add any additional notes or clarifications"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleSpecificationAdd}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Specification
            </Button>
          </AccordionContent>
        </AccordionItem> */}

        {/* Curious Facts Section */}
        {/* <AccordionItem value="curious-facts">
          <AccordionTrigger>Curious Facts</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {formData.curiousFacts.map((fact, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Fact {index + 1}</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        curiousFacts: prev.curiousFacts.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={fact.category}
                      onValueChange={(value) => handleFactChange(index, 'category', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {factCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      value={fact.title}
                      onChange={(e) => handleFactChange(index, 'title', e.target.value)}
                      placeholder="Enter fact title"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={fact.description}
                    onChange={(e) => handleFactChange(index, 'description', e.target.value)}
                    placeholder="Describe this interesting fact"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>References</Label>
                  {fact.references?.map((ref, refIndex) => (
                    <div key={refIndex} className="flex gap-2 mt-2">
                      <Input
                        value={ref}
                        onChange={(e) => {
                          const newRefs = [...(fact.references || [])];
                          newRefs[refIndex] = e.target.value;
                          handleFactChange(index, 'references', newRefs);
                        }}
                        placeholder="Add reference"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newRefs = fact.references?.filter((_, i) => i !== refIndex);
                          handleFactChange(index, 'references', newRefs);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newRefs = [...(fact.references || []), ''];
                      handleFactChange(index, 'references', newRefs);
                    }}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reference
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleFactAdd}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Curious Fact
            </Button>
          </AccordionContent>
        </AccordionItem> */}

            </Accordion>

            {submitStatus.message && (
              <Alert variant={submitStatus.type === 'error' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitStatus.message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Save Gemstone Information
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GemstoneForm;