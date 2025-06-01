import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CertificateGenerator } from "../components/CertificateGenerator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "react-query";
import { toast } from "sonner";
import { userRequest } from "@/utils/requestMethods";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import { ClipLoader } from "react-spinners";
import html2canvas from 'html2canvas';
import { gemstoneProperties } from "@/utils/constants";

type ImageFieldName = 'base_img' | 'sec_img1' | 'sec_img2' | 'product_vid' | 'product_vid2' | 'product_gif';


interface ProductFormData {
  [key: string]: any;
  base_img: File | null;
  sec_img1: File | null;
  sec_img2: File | null;
  sec_img3: File | null;
  product_vid: File | null;
  product_vid2: File | null;
  product_gif: File | null;
  cert_img_url: string;
  unit_price: string; // Changed to string
  name: string;
  description: string;
  sku_code: string;
  category: string;
  subcategory: string;
  quantity: string; // Changed to string
  actual_price: string; // Changed to string
  sale_price: string; // Changed to string
  origin: string;
  weight_gms: string; // Changed to string
  weight_carat: string; // Changed to string
  weight_ratti: string; // Changed to string
  length: string; // Changed to string
  width: string; // Changed to string
  height: string; // Changed to string
  shape: string;
  cut: string;
  treatment: string;
  // composition: string;
  certification: string;
  color: string;
  status: string;
  certificate_no: string;
  // luminescence: string;
  // op_char: string;
  // crystal_sys: string;
  shape_cut: string;
  transparency: string;
  ref_index: string;
  hardness: string;
  sp_gravity: string;
  inclusion: string;
  species: string;
  variety: string;
  other_chars: string;
  // visual_chars: string;
}

interface FilePreviewProps {
  file: File | null;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    if (file instanceof File) {
      objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  if (!preview) return null;

  const isVideo = file?.type?.startsWith('video/');

  return (
    <div className="relative">
      {!isVideo ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-32 object-contain rounded-md"
        />
      ) : (
        <video
          src={preview}
          className="w-full h-32 object-contain rounded-md"
          controls
        />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const AddProductForm = () => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    base_img: null,
    sec_img1: null,
    sec_img2: null,
    sec_img3: null,
    product_vid: null,
    product_vid2: null,
    product_gif: null,
    cert_img_url: "",
    unit_price: "",
    name: "",
    description: "",
    sku_code: "",
    category: "",
    subcategory: "",
    quantity: "1",
    actual_price: "",
    sale_price: "",
    status: "Draft",
    origin: "",
    weight_gms: "",
    weight_carat: "",
    weight_ratti: "",
    length: "",
    width: "",
    height: "",
    shape: "",
    cut: "",
    treatment: "",
    // composition: "",
    certification: "",
    color: "",
    transparency: "",
    ref_index: "",
    hardness: "",
    sp_gravity: "",
    inclusion: "",
    species: "",
    variety: "",
    other_chars: "",
    // visual_chars: "",
    certificate_no: `GEM-${Math.floor(10000 + Math.random() * 90000)}`,
    // luminescence: "",
    // op_char: "",
    // crystal_sys: "",
    shape_cut: "",
  });

  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [dimensionString, setDimensionString] = useState("");
  const [isGemstone, setIsGemstone] = useState(false);

  const handleCategoryChange = (value: string) => {
    setIsGemstone(value === 'gemstones');
    setFormData(prev => ({
      ...prev,
      category: value,
      quantity: value === 'gemstones' ? "1" : prev.quantity
    }));
  };

  const handleSpeciesInputChange = (e: any) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      species: value
    }));
  };


const handleSpeciesSelectChange = (value: any) => {
  if (!value) return;

  const selectedGemstone = gemstoneProperties[value] || {};

  setSelectedSpecies(value); // Add this line to update the selectedSpecies state
  setFormData(prev => ({
    ...prev,
    species: value,
    ref_index: selectedGemstone.refIndex || "",
    sp_gravity: selectedGemstone.specGravity || "",
    hardness: selectedGemstone.hardness || "",
    // Lock these fields to prevent manual editing
    isRefIndexLocked: true,
    isSpecGravityLocked: true,
    isHardnessLocked: true
  }));
};


  function extractDimensions(input: string) {
    if (!input) return null;

    const cleanInput = input.replace(/\s/g, '').toLowerCase();
    const parts = cleanInput.split(/x/).filter(part => part !== '');

    if (parts.length === 3) {
      return {
        length: parts[0], // Store as string
        width: parts[1], // Store as string
        height: parts[2] // Store as string
      };
    }
    return null;
  }

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDimensionString(value);

    const dimensions = extractDimensions(value);
    if (dimensions) {
      setFormData(prev => ({
        ...prev,
        length: dimensions.length,
        width: dimensions.width,
        height: dimensions.height
      }));
    }
  };

  const validateDimensions = () => {
    if (dimensionString && !extractDimensions(dimensionString)) {
      toast.error("Please enter dimensions in the format 'L x W x H'", {
        position: "bottom-right",
        duration: 2000
      });
      return false;
    }
    return true;
  };

  // Updated numeric validation to allow decimal points and handle empty values
  const validateNumberInput = (value: string): boolean => {
    // Allow empty string or valid number format (including decimals)
    return value === "" || /^[0-9]*\.?[0-9]*$/.test(value);
  };

  // Handle numeric input changes
  const handleNumericInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const { value } = e.target;

    // Only update if valid number or empty
    if (validateNumberInput(value)) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value, // Store as string in form state
      }));
    }
  };

  const token = useSelector((state: any) => state.user.accessToken);

  // Convert form data from strings to appropriate types for API submission
  const prepareFormDataForSubmission = () => {
    // Create a new object with the same structure as formData
    const processedData = { ...formData } as any;

    // Fields that should remain as strings (gemstone properties)
    const stringFields = [
      'ref_index',
      'hardness',
      'sp_gravity',
      'certificate_no'
    ];

    // Fields to convert from string to float
    const floatFields = [
      'unit_price', 'actual_price', 'sale_price',
      'weight_gms', 'weight_carat', 'weight_ratti',
      'length', 'width', 'height'
    ];

    // Convert numeric fields
    floatFields.forEach(field => {
      if (processedData[field]) {
        processedData[field] = typeof processedData[field] === 'string'
          ? parseFloat(processedData[field])
          : processedData[field];
      } else {
        processedData[field] = 0;
      }
    });

    // Ensure string fields remain as strings
    stringFields.forEach(field => {
      processedData[field] = String(processedData[field] || '');
    });

    // Convert quantity to integer
    processedData.quantity = processedData.quantity
      ? parseInt(String(processedData.quantity), 10)
      : 1;

    return processedData;
  };

  const createFormDataWithFiles = async () => {
    const formDataToSend = new FormData();
    const processedData = prepareFormDataForSubmission();

    // Log all form data entries
    console.log("Full Processed Data:", processedData);

    // Append all text fields
    Object.keys(processedData).forEach(key => {
      if (key !== 'base_img' && key !== 'sec_img1' && key !== 'sec_img2' && key !== 'sec_img3' && key !== 'product_vid') {
        console.log(`Appending text field: ${key} = ${processedData[key]}`);
        formDataToSend.append(key, String(processedData[key])); // Convert any numbers back to strings for FormData
      }
    });

    // Append files with logging
    if (processedData.base_img) {
      console.log("Appending base_img:", processedData.base_img);
      formDataToSend.append('base_img', processedData.base_img);
    }
    if (processedData.sec_img1) {
      console.log("Appending sec_img1:", processedData.sec_img1);
      formDataToSend.append('sec_img1', processedData.sec_img1);
    }
    if (processedData.sec_img2) {
      console.log("Appending sec_img2:", processedData.sec_img2);
      formDataToSend.append('sec_img2', processedData.sec_img2);
    }
    if (processedData.sec_img3) {
      console.log("Appending sec_img3:", processedData.sec_img3);
      formDataToSend.append('sec_img3', processedData.sec_img3);
    }
    if (processedData.product_vid) {
      console.log("Appending product_video:", processedData.product_vid);
      formDataToSend.append('product_video', processedData.product_vid);
    }

    // Log the FormData entries
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`FormData Entry: ${key}`, value);
    }

    return formDataToSend;
  };

  const handleWeightGramsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gramsStr = e.target.value;

    // Validate input
    if (!validateNumberInput(gramsStr)) return;

    // Store string value
    setFormData(prev => ({ ...prev, weight_gms: gramsStr }));

    // Calculate derived values only if we have a valid number
    if (gramsStr && !isNaN(parseFloat(gramsStr))) {
      const grams = parseFloat(gramsStr);
      const milligrams = grams * 1000;
      const ratti = milligrams / 180;
      const carat = milligrams / 200;

      // If unit price exists and is valid, calculate actual price
      let actualPrice = "0";
      if (formData.unit_price && !isNaN(parseFloat(formData.unit_price))) {
        actualPrice = (parseFloat(formData.unit_price) * ratti).toFixed(2);
      }

      setFormData(prev => ({
        ...prev,
        weight_ratti: ratti.toFixed(2),
        weight_carat: carat.toFixed(2),
        actual_price: actualPrice
      }));
    }
  };

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unitPriceStr = e.target.value;

    // Validate input
    if (!validateNumberInput(unitPriceStr)) return;

    // Store string value
    setFormData(prev => ({ ...prev, unit_price: unitPriceStr }));

    // Calculate actual price only if both values are valid
    if (unitPriceStr && formData.weight_ratti &&
      !isNaN(parseFloat(unitPriceStr)) && !isNaN(parseFloat(formData.weight_ratti))) {

      const unitPrice = parseFloat(unitPriceStr);
      const weightRatti = parseFloat(formData.weight_ratti);
      const actualPrice = (unitPrice * weightRatti).toFixed(2);

      setFormData(prev => ({
        ...prev,
        actual_price: actualPrice
      }));
    }
  };

  const createProductMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Authentication token is missing');
      if (!validateDimensions()) throw new Error('Invalid dimensions');

      // More specific validation
      const requiredFields = ['name', 'category', 'subcategory', 'sale_price'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        throw new Error(`Please fill the following required fields: ${missingFields.join(', ')}`);
      }

      const formDataToSend = await createFormDataWithFiles();

      // Additional logging before sending request
      console.log("Sending product data:", Object.fromEntries(formDataToSend));

      const response = await userRequest({
        url: "/product/create-product",
        method: "POST",
        data: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      return response.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully!", {
        position: "bottom-right",
        duration: 2000,
      });
      // Reset form after successful creation
      setFormData({
        base_img: null,
        sec_img1: null,
        sec_img2: null,
        sec_img3: null,
        product_vid: null,
        product_vid2: null,
        product_gif: null,
        cert_img_url: "",
        name: "",
        description: "",
        sku_code: "",
        category: "",
        subcategory: "",
        quantity: "1",
        unit_price: "",
        actual_price: "",
        sale_price: "",
        status: "Draft",
        origin: "",
        weight_gms: "",
        weight_carat: "",
        weight_ratti: "",
        length: "",
        width: "",
        height: "",
        shape: "",
        cut: "",
        treatment: "",
        composition: "",
        certification: "",
        color: "",
        transparency: "",
        ref_index: "",
        hardness: "",
        sp_gravity: "",
        inclusion: "",
        species: "",
        variety: "",
        other_chars: "",
        visual_chars: "",
        certificate_no: `GEM-${Math.floor(10000 + Math.random() * 90000)}`,
        luminescence: "",
        op_char: "",
        crystal_sys: "",
        shape_cut: "",
      });
      setDimensionString("");
    },
    onError: (error: any) => {
      console.error("Create Error:", error);
      toast.error(error.message || "Failed to create product", {
        position: "bottom-right",
        duration: 2000
      });
    }
  });

  const generateAndUploadCertificate = async (): Promise<File | null> => {
    if (!certificateRef.current) {
      console.error("Certificate ref is not available");
      return null;
    }

    try {
      // Generate the certificate image with higher quality settings
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher scale for better quality
        logging: true, // Enable logging for debugging
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          // Ignore any elements that might interfere with rendering
          return element.classList.contains('ignore-rendering');
        } // Transparent background if needed
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.95); // Higher quality
      });

      if (!blob) {
        console.error("Failed to convert canvas to blob");
        return null;
      }

      // Create a File object from the blob
      const certFile = new File([blob], 'certificate.jpg', {
        type: 'image/png',
        lastModified: Date.now()
      });

      console.log("Certificate file generated:", certFile);
      return certFile;
    } catch (error) {
      console.error("Error generating certificate:", error);
      throw error;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: ImageFieldName
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const isImageField = fieldName.includes('img');
      const isVideoField = fieldName.includes('product_vid');
      const isGifField = fieldName === 'product_gif';

      // Validate file types more strictly
      if (isGifField && !file.type.includes('gif')) {
        toast.error('Please select a valid GIF file', {
          position: "bottom-right",
          duration: 2000
        });
        return;
      }

      if (isVideoField && !file.type.includes('video')) {
        toast.error('Please select a valid video file', {
          position: "bottom-right",
          duration: 2000
        });
        return;
      }

      if (isImageField && !file.type.includes('image')) {
        toast.error('Please select a valid image file', {
          position: "bottom-right",
          duration: 2000
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  const handleFileRemove = (fieldName: ImageFieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDimensions()) return;

    try {
      // Generate the certificate image first
      const certFile = await generateAndUploadCertificate();

      if (!certFile) {
        toast.error("Failed to generate certificate image");
        return;
      }

      // Create form data with converted values
      const formDataToSend = new FormData();
      const processedData = prepareFormDataForSubmission();

      // Append all text fields
      Object.keys(processedData).forEach(key => {
        if (key !== 'base_img' && key !== 'sec_img1' && key !== 'sec_img2' &&
          key !== 'sec_img3' && key !== 'product_vid' && key !== 'product_vid2' &&
          key !== 'product_gif') {
          formDataToSend.append(key, String(processedData[key])); // Convert any numbers back to strings for FormData
        }
      });

      // Append files - IMPORTANT: Use the same field names as backend expects
      if (processedData.base_img) formDataToSend.append('base_img', processedData.base_img);
      if (processedData.sec_img1) formDataToSend.append('sec_img1', processedData.sec_img1);
      if (processedData.sec_img2) formDataToSend.append('sec_img2', processedData.sec_img2);
      if (certFile) formDataToSend.append('sec_img3', certFile); // Certificate as sec_img3
      if (processedData.product_vid) formDataToSend.append('product_video', processedData.product_vid);
      if (processedData.product_vid2) formDataToSend.append('product_video2', processedData.product_vid2);
      if (processedData.product_gif) formDataToSend.append('product_gif', processedData.product_gif);

      // Debug: Log all FormData entries
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`FormData Entry: ${key}`, value);
      }

      // Make the API call without assigning to a variable since we're not using the response
      await userRequest({
        url: "/product/create-product",
        method: "POST",
        data: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      // Handle success
      toast.success("Product created successfully!");
      // Reset form...

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error((error as Error).message || "Failed to update product");
    }
  };

  const renderFileInput = (
    fieldName: ImageFieldName,
    label: string
  ) => {
    // Set specific accept attributes for each field type
    let accept = '';
    if (fieldName === 'product_gif') {
      accept = 'image/gif';
    } else if (fieldName.includes('product_vid')) {
      accept = 'video/*';
    } else {
      accept = 'image/*';
    }

    const currentValue = formData[fieldName];

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>{label} {fieldName === 'base_img' && <span className="text-red-500 ml-1">*</span>}</Label>
        <div className="space-y-2">
          <Input
            id={fieldName}
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(e, fieldName)}
            className="mb-2"
            required={fieldName === 'base_img'} // Only required for base image
          />
          <FilePreview
            file={currentValue}
            onRemove={() => handleFileRemove(fieldName)}
          />
        </div>
      </div>
    );
  };

  if (createProductMutation.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="blue" size={50} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <Label htmlFor="status" className="font-medium">
                Product Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Feature">Feature</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${formData.status === 'Public'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
                }`}>
                {formData.status}
              </span>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={handleCategoryChange}
                  value={formData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemstones">Gemstones</SelectItem>
                    <SelectItem value="jewelry">Jewelry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Sub-Category</Label>
              <Input
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                placeholder="Enter sub-category"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku_code">SKU Code</Label>
              <Input
                id="sku_code"
                name="sku_code"
                value={formData.sku_code}
                onChange={handleInputChange}
                placeholder="Enter SKU Code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </div>

          {/* Images and Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Images and Media</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderFileInput("base_img", "Base Image")}
              {renderFileInput("sec_img1", "Secondary Image 1")}
              {renderFileInput("sec_img2", "Secondary Image 2")}
              {renderFileInput("product_vid", "Product Video 1")}
              {renderFileInput("product_vid2", "Product Video 2")}
              {renderFileInput("product_gif", "Product GIF")}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Certificate Preview</h3>
            <div className="border rounded-lg p-4 overflow-auto">
              <div className="mx-auto" style={{ maxWidth: '800px' }}>
                <CertificateGenerator
                  ref={certificateRef}
                  formData={formData}
                  baseImageUrl={formData.base_img ? URL.createObjectURL(formData.base_img) : null}
                />
              </div>
            </div>
          </div>

          {/* Certificate Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Certificate Fields</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certificate_no">Certificate No</Label>
                <Input
                  id="certificate_no"
                  name="certificate_no"
                  value={formData.certificate_no}
                  onChange={handleInputChange}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight_ratti">Weight (ratti)</Label>
                <Input
                  id="weight_ratti"
                  name="weight_ratti"
                  type="text"
                  value={formData.weight_ratti}
                  readOnly
                />
                {parseFloat(formData.weight_gms) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Calculated: {parseFloat(formData.weight_gms) * 1000}mg ÷ 180
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shape_cut">Shape & Cut</Label>
                <Input
                  id="shape_cut"
                  name="shape_cut"
                  value={formData.shape_cut}
                  onChange={handleInputChange}
                  placeholder="e.g., Round Brilliant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transparency">Transparency</Label>
                <Input
                  id="transparency"
                  name="transparency"
                  value={formData.transparency}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="speciesSelect">Gemstone Species</Label>
                <Select
                  value={selectedSpecies}
                  onValueChange={handleSpeciesSelectChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gemstone species" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(gemstoneProperties).map(gemstone => (
                      <SelectItem key={gemstone} value={gemstone}>
                        {gemstone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>



              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions (L x W x H in mm)</Label>
                <Input
                  id="dimensions"
                  name="dimensions"
                  placeholder="e.g., 10 x 5 x 3"
                  value={dimensionString}
                  onChange={handleDimensionChange}
                />
                {formData.length && formData.width && formData.height && (
                  <div className="text-sm text-muted-foreground">
                    Stored as: Length: {formData.length}mm, Width: {formData.width}mm, Height: {formData.height}mm
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ref_index">Refractive Index</Label>
                <Input
                  id="ref_index"
                  name="ref_index"
                  value={formData.ref_index}
                  onChange={handleInputChange}
                  readOnly={formData.isRefIndexLocked}
                  className={formData.isRefIndexLocked ? "bg-gray-100" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sp_gravity">Specific Gravity</Label>
                <Input
                  id="sp_gravity"
                  name="sp_gravity"
                  value={formData.sp_gravity}
                  onChange={handleInputChange}
                  readOnly={formData.isSpecGravityLocked}
                  className={formData.isSpecGravityLocked ? "bg-gray-100" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hardness">Hardness</Label>
                <Input
                  id="hardness"
                  name="hardness"
                  value={formData.hardness}
                  onChange={handleInputChange}
                  readOnly={formData.isHardnessLocked}
                  className={formData.isHardnessLocked ? "bg-gray-100" : ""}
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="luminescence">Luminescence</Label>
                <Input
                  id="luminescence"
                  name="luminescence"
                  value={formData.luminescence}
                  onChange={handleInputChange}
                />
              </div> */}

              {/* <div className="space-y-2">
                <Label htmlFor="op_char">Optical Characteristics</Label>
                <Input
                  id="op_char"
                  name="op_char"
                  value={formData.op_char}
                  onChange={handleInputChange}
                />
              </div> */}

              {/* <div className="space-y-2">
                <Label htmlFor="crystal_sys">Crystal System</Label>
                <Input
                  id="crystal_sys"
                  name="crystal_sys"
                  value={formData.crystal_sys}
                  onChange={handleInputChange}
                />
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="inclusion">Inclusion</Label>
                <Input
                  id="inclusion"
                  name="inclusion"
                  value={formData.inclusion}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="species">Species</Label>
                <Input
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleSpeciesInputChange}
                  placeholder="Enter or edit species name"
                />
                {selectedSpecies && formData.species !== selectedSpecies && (
                  <p className="text-xs text-amber-600">
                    Modified from selection: {selectedSpecies}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="variety">Variety</Label>
                <Input
                  id="variety"
                  name="variety"
                  value={formData.variety}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Physical Properties */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Physical Properties</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight_gms">Weight (grams)</Label>
                <Input
                  id="weight_gms"
                  name="weight_gms"
                  type="text"
                  value={formData.weight_gms}
                  onChange={handleWeightGramsChange}
                />
                {parseFloat(formData.weight_gms) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {parseFloat(formData.weight_gms) * 1000} milligrams
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_carat">Weight (carat)</Label>
                <Input
                  id="weight_carat"
                  name="weight_carat"
                  type="text"
                  value={formData.weight_carat}
                  readOnly
                />
                {parseFloat(formData.weight_gms) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Calculated: {parseFloat(formData.weight_gms) * 1000}mg ÷ 200
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_ratti">Weight (ratti)</Label>
                <Input
                  id="weight_ratti"
                  name="weight_ratti"
                  type="text"
                  value={formData.weight_ratti}
                  readOnly
                />
                {parseFloat(formData.weight_gms) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Calculated: {parseFloat(formData.weight_gms) * 1000}mg ÷ 180
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Characteristics */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Characteristics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment</Label>
                <Input
                  id="treatment"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  placeholder="Enter treatment details"
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="composition">Composition</Label>
                <Input
                  id="composition"
                  name="composition"
                  value={formData.composition}
                  onChange={handleInputChange}
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="certification">Certification</Label>
                <select
                  id="certification"
                  name="certification"
                  value={formData.certification}
                  onChange={(e) => handleSelectChange("certification", e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select certification</option>
                  <option value="Local Lab Certification">Local Lab Certification (Free Certification)</option>
                  <option value="IGI">IGI</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="other_chars">Other Characteristics</Label>
                <Input
                  id="other_chars"
                  name="other_chars"
                  value={formData.other_chars}
                  onChange={handleInputChange}
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="visual_chars">Visual Characteristics</Label>
                <Input
                  id="visual_chars"
                  name="visual_chars"
                  value={formData.visual_chars}
                  onChange={handleInputChange}
                />
              </div> */}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price (per ratti)</Label>
                <Input
                  id="unit_price"
                  name="unit_price"
                  type="text"
                  value={formData.unit_price}
                  onChange={handleUnitPriceChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual_price">Actual Price</Label>
                <Input
                  id="actual_price"
                  name="actual_price"
                  type="text"
                  value={formData.actual_price}
                  readOnly
                />
                {parseFloat(formData.unit_price) > 0 && parseFloat(formData.weight_ratti) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Calculated: {formData.unit_price} × {formData.weight_ratti} ratti
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_price">Sale Price</Label>
                <Input
                  id="sale_price"
                  name="sale_price"
                  type="text"
                  value={formData.sale_price}
                  onChange={(e) => handleNumericInputChange(e, 'sale_price')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="text"
                  value={formData.quantity}
                  onChange={(e) => handleNumericInputChange(e, 'quantity')}
                  disabled={isGemstone}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createProductMutation.isLoading}
          >
            {createProductMutation.isLoading ? "Creating..." : "Create Product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddProductForm;