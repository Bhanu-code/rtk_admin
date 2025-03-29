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

type ImageFieldName = 'base_img' | 'sec_img1' | 'sec_img2' | 'product_vid';

interface ProductFormData {
  [key: string]: any;
  base_img: File | null;
  sec_img1: File | null;
  sec_img2: File | null;
  sec_img3: File | null;
  product_vid: File | null;
  cert_img_url: string;
  name: string;
  description: string;
  sku_code: string;
  category: string;
  subcategory: string;
  quantity: number;
  actual_price: number;
  sale_price: number;
  origin: string;
  weight_gms: number;
  weight_carat: number;
  weight_ratti: number;
  length: number;
  width: number;
  height: number;
  shape: string;
  cut: string;
  treatment: string;
  composition: string;
  certification: string;
  color: string;
  status: string;
  certificate_no: string;
  luminescence: string;
  op_char: string;
  crystal_sys: string;
  shape_cut: string;
  transparency: string;
  ref_index: string;
  hardness: string;
  sp_gravity: string;
  inclusion: string;
  species: string;
  variety: string;
  other_chars: string;
  visual_chars: string;
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
    cert_img_url: "",
    name: "",
    description: "",
    sku_code: "",
    category: "",
    subcategory: "",
    quantity: 1,
    actual_price: 0,
    sale_price: 0,
    status: "Draft",
    origin: "",
    weight_gms: 0,
    weight_carat: 0,
    weight_ratti: 0,
    length: 0,
    width: 0,
    height: 0,
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

  const [dimensionString, setDimensionString] = useState("");

  const [certImageUrl, setCertImageUrl] = useState<string | null>(null);
  const [certImageFile, setCertImageFile] = useState<File | null>(null);

  function extractDimensions(input: string) {
    if (!input) return null;

    const cleanInput = input.replace(/\s/g, '').toLowerCase();
    const parts = cleanInput.split(/x/).filter(part => part !== '');

    if (parts.length === 3) {
      return {
        length: parseFloat(parts[0]) || 0,
        width: parseFloat(parts[1]) || 0,
        height: parseFloat(parts[2]) || 0
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

  const token = useSelector((state: any) => state.user.accessToken);

  const createFormDataWithFiles = async () => {
    const formDataToSend = new FormData();

    // Log all form data entries
    console.log("Full Form Data:", formData);

    // Append all text fields
    Object.keys(formData).forEach(key => {
      if (key !== 'base_img' && key !== 'sec_img1' && key !== 'sec_img2' && key !== 'sec_img3' && key !== 'product_vid') {
        console.log(`Appending text field: ${key} = ${formData[key]}`);
        formDataToSend.append(key, formData[key]);
      }
    });

    // Append files with logging
    if (formData.base_img) {
      console.log("Appending base_img:", formData.base_img);
      formDataToSend.append('base_img', formData.base_img);
    }
    if (formData.sec_img1) {
      console.log("Appending sec_img1:", formData.sec_img1);
      formDataToSend.append('sec_img1', formData.sec_img1);
    }
    if (formData.sec_img2) {
      console.log("Appending sec_img2:", formData.sec_img2);
      formDataToSend.append('sec_img2', formData.sec_img2);
    }
    if (formData.sec_img3) {
      console.log("Appending sec_img3:", formData.sec_img3);
      formDataToSend.append('sec_img3', formData.sec_img3);
    }
    if (formData.product_vid) {
      console.log("Appending product_video:", formData.product_vid);
      formDataToSend.append('product_video', formData.product_vid);
    }

    // Log the FormData entries
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`FormData Entry: ${key}`, value);
    }

    return formDataToSend;
  };
  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const generateCertificateImage = async (baseImageUrl: string): Promise<string | null> => {
    // This is a simplified version - in reality, you'd need to implement
    // a proper way to generate the certificate image using a canvas library
    // or a server-side solution for better reliability

    // For demo purposes, we'll just return the base image URL
    return baseImageUrl;

    // In a real implementation, you would:
    // 1. Create a canvas with the certificate template
    // 2. Draw all the text fields from formData
    // 3. Draw the base image in the appropriate place
    // 4. Convert canvas to data URL
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
        cert_img_url: "",
        name: "",
        description: "",
        sku_code: "",
        category: "",
        subcategory: "",
        quantity: 1,
        actual_price: 0,
        sale_price: 0,
        status: "Draft",
        origin: "",
        weight_gms: 0,
        weight_carat: 0,
        weight_ratti: 0,
        length: 0,
        width: 0,
        height: 0,
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
    const isNumberField = e.target.type === 'number';

    setFormData(prev => ({
      ...prev,
      [name]: isNumberField ? Number(value) || 0 : value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: ImageFieldName
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const isImageField = fieldName.includes('img');
      const isVideoField = fieldName === 'product_vid';

      // Corrected condition with proper parentheses
      if ((isImageField && !file.type.startsWith('image/')) ||
        (isVideoField && !file.type.startsWith('video/'))) {
        toast.error(
          isImageField
            ? 'Please select a valid image file'
            : 'Please select a valid video file',
          {
            position: "bottom-right",
            duration: 2000
          }
        );
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
  
      // Create form data
      const formDataToSend = new FormData();
  
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'base_img' && key !== 'sec_img1' && key !== 'sec_img2' && key !== 'sec_img3' && key !== 'product_vid') {
          formDataToSend.append(key, formData[key]);
        }
      });
  
      // Append files - IMPORTANT: Use the same field names as backend expects
      if (formData.base_img) formDataToSend.append('base_img', formData.base_img);
      if (formData.sec_img1) formDataToSend.append('sec_img1', formData.sec_img1);
      if (formData.sec_img2) formDataToSend.append('sec_img2', formData.sec_img2);
      if (certFile) formDataToSend.append('sec_img3', certFile); // Certificate as sec_img3
      if (formData.product_vid) formDataToSend.append('product_video', formData.product_vid);
  
      // Debug: Log all FormData entries
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`FormData Entry: ${key}`, value);
      }
  
      // Send the request
      const response = await userRequest({
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
      toast.error(error.message || "Failed to create product");
    }
  };

  const renderFileInput = (
    fieldName: ImageFieldName,
    label: string
  ) => {
    const accept = fieldName === 'product_vid' ? 'video/*' : 'image/*';
    const currentValue = formData[fieldName];

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>{label}</Label>
        <div className="space-y-2">
          <Input
            id={fieldName}
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(e, fieldName)}
            className="mb-2"
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
    <div className="container mx-auto p-6">
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
                    onValueChange={(value) => handleSelectChange("category", value)}
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
                {renderFileInput("product_vid", "Product Video")}
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
                    type="number"
                    value={formData.weight_ratti}
                    onChange={handleInputChange}
                  />
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hardness">Hardness</Label>
                  <Input
                    id="hardness"
                    name="hardness"
                    value={formData.hardness}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sp_gravity">Specific Gravity</Label>
                  <Input
                    id="sp_gravity"
                    name="sp_gravity"
                    value={formData.sp_gravity}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="luminescence">Luminescence</Label>
                  <Input
                    id="luminescence"
                    name="luminescence"
                    value={formData.luminescence}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="op_char">Optical Characteristics</Label>
                  <Input
                    id="op_char"
                    name="op_char"
                    value={formData.op_char}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crystal_sys">Crystal System</Label>
                  <Input
                    id="crystal_sys"
                    name="crystal_sys"
                    value={formData.crystal_sys}
                    onChange={handleInputChange}
                  />
                </div>

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
                    onChange={handleInputChange}
                  />
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
                  <Label htmlFor="weight_gms">Weight (gms)</Label>
                  <Input
                    id="weight_gms"
                    name="weight_gms"
                    type="number"
                    value={formData.weight_gms}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_carat">Weight (carat)</Label>
                  <Input
                    id="weight_carat"
                    name="weight_carat"
                    type="number"
                    value={formData.weight_carat}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_ratti">Weight (ratti)</Label>
                  <Input
                    id="weight_ratti"
                    name="weight_ratti"
                    type="number"
                    value={formData.weight_ratti}
                    onChange={handleInputChange}
                  />
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
                <div className="space-y-2">
                  <Label htmlFor="composition">Composition</Label>
                  <Input
                    id="composition"
                    name="composition"
                    value={formData.composition}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certification">Certification</Label>
                  <Input
                    id="certification"
                    name="certification"
                    value={formData.certification}
                    onChange={handleInputChange}
                  />
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
                <div className="space-y-2">
                  <Label htmlFor="visual_chars">Visual Characteristics</Label>
                  <Input
                    id="visual_chars"
                    name="visual_chars"
                    value={formData.visual_chars}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actual_price">Actual Price</Label>
                  <Input
                    id="actual_price"
                    name="actual_price"
                    type="number"
                    value={formData.actual_price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Sale Price</Label>
                  <Input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    value={formData.sale_price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
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
    </div>
  );
};

export default AddProductForm;