import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CertificateGenerator } from "../../components/CertificateGenerator";
import { gemstoneProperties } from "@/utils/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";
import { userRequest } from "@/utils/requestMethods";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import { ClipLoader } from "react-spinners";
import html2canvas from 'html2canvas';

type ImageFieldName = 'base_img' | 'sec_img1' | 'sec_img2' | 'sec_img3' | 'product_vid' | 'product_vid2' | 'product_gif';

interface ProductFormData {
  [key: string]: any;
  base_img: File | null;
  sec_img1: File | null;
  sec_img2: File | null;
  sec_img3: File | null;
  product_vid: File | null;
  product_vid2: File | null;
  product_gif: File | null;
  base_img_url: string | null;
  sec_img1_url: string | null;
  sec_img2_url: string | null;
  sec_img3_url: string | null;
  product_vid_url: string | null;
  product_vid2_url: string | null;
  product_gif_url: string | null;
  cert_img_url: string;
  name: string;
  description: string;
  sku_code: string;
  category: string;
  subcategory: string;
  quantity: string; // Changed to string
  unit_price: string; // Changed to string
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
  existingUrl: string | null;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, existingUrl, onRemove }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (existingUrl) {
      setPreview(existingUrl);
    } else {
      setPreview(null);
    }
  }, [file, existingUrl]);

  if (!preview) return null;

  const isVideo = file?.type?.startsWith('video/') || preview.match(/\.(mp4|webm|ogg|mov)$/i);

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

const EditProductForm = () => {
  const { id } = useParams();
  const certificateRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const token = useSelector((state: any) => state.user.accessToken);

  const [formData, setFormData] = useState<ProductFormData>({
    base_img: null,
    sec_img1: null,
    sec_img2: null,
    sec_img3: null,
    product_vid: null,
    product_vid2: null,
    product_gif: null,
    base_img_url: null,
    sec_img1_url: null,
    sec_img2_url: null,
    sec_img3_url: null,
    product_vid_url: null,
    product_vid2_url: null,
    product_gif_url: null,
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
    height: "0",
    shape: "",
    cut: "",
    treatment: "",
    // composition: "",
    certification: "",
    color: "",
    certificate_no: `GEM-${Math.floor(10000 + Math.random() * 90000)}`,
    // luminescence: "",
    // op_char: "",
    // crystal_sys: "",
    shape_cut: "",
    transparency: "",
    ref_index: "",
    hardness: "",
    sp_gravity: "",
    inclusion: "",
    species: "",
    variety: "",
    other_chars: "",
    isRefIndexLocked: false,
    isSpecGravityLocked: false,
    isHardnessLocked: false,
    // visual_chars: "",
  });

  const [selectedSpecies, setSelectedSpecies] = useState(""); 
  const [dimensionString, setDimensionString] = useState("");
  const [isGemstone, setIsGemstone] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [_uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Updated numeric validation to allow decimal points and handle empty values
 const validateNumberInput = (value: string): boolean => {
    // Allow empty string or valid number format (including decimals)
    return value === "" || /^[0-9]*\.?[0-9]*$/.test(value);
  };

  const handleSpeciesSelectChange = (value: string) => {
    if (!value) return;

    const selectedGemstone = gemstoneProperties[value] || {};
    
    setSelectedSpecies(value);
    setFormData(prev => ({
      ...prev,
      species: value,
      ref_index: selectedGemstone.refIndex || prev.ref_index,
      sp_gravity: selectedGemstone.specGravity || prev.sp_gravity,
      hardness: selectedGemstone.hardness || prev.hardness,
      isRefIndexLocked: true,
      isSpecGravityLocked: true,
      isHardnessLocked: true
    }));
  };

    const handleSpeciesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      species: value
    }));
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

  const handleCategoryChange = (value: string) => {
    setIsGemstone(value === 'gemstones');
    setFormData(prev => ({
      ...prev,
      category: value,
      quantity: value === 'gemstones' ? "1" : prev.quantity
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

   const getGemstonePropertiesFromSpecies = (species:any) => {
    return gemstoneProperties[species] || null;
  };

  // Fetch product data
 const { data: response, isLoading: loadingProduct } = useQuery(
    ["get-product", id],
    () => userRequest({
      url: `/product/get-product/${id}`,
      method: "get",
    }),
    {
      onError: () => {
        toast.error("Failed to fetch product details", {
          position: "bottom-right",
          duration: 2000,
        });
      },
    }
  );

  useEffect(() => {
    if (response?.data) {
      const productData = response.data.product || response.data;
      const attributeData = response.data.attribute || {};

      let unitPrice = "0";
      if (productData.actual_price && (attributeData.weight_ratti || productData.weight_ratti)) {
        const ratti = attributeData.weight_ratti || productData.weight_ratti;
        if (ratti > 0) {
          unitPrice = (productData.actual_price / ratti).toFixed(2);
        }
      }

      // Check if we have species data to use the formatted gemstone properties
      const species = attributeData.species || productData.species;
      let gemstoneProps = null;
      
     if (species) {
        setSelectedSpecies(species);
      }

      setFormData(prev => ({
        ...prev,
        ...productData,
        ...attributeData,
        unit_price: unitPrice,
        quantity: productData.quantity?.toString() || "1",
        actual_price: productData.actual_price?.toString() || "0",
        sale_price: productData.sale_price?.toString() || "0",
        weight_gms: attributeData.weight_gms?.toString() || productData.weight_gms?.toString() || "0",
        weight_carat: attributeData.weight_carat?.toString() || productData.weight_carat?.toString() || "0",
        weight_ratti: attributeData.weight_ratti?.toString() || productData.weight_ratti?.toString() || "0",
        length: attributeData.length?.toString() || "0",
        width: attributeData.width?.toString() || "0",
        height: attributeData.height?.toString() || "0",
        // Use gemstone property formatting if available from constants
        ref_index: gemstoneProps?.refIndex || attributeData.ref_index?.toString() || productData.ref_index?.toString() || "",
        sp_gravity: gemstoneProps?.specGravity || attributeData.sp_gravity?.toString() || productData.sp_gravity?.toString() || "",
        hardness: gemstoneProps?.hardness || attributeData.hardness?.toString() || productData.hardness?.toString() || "",
        base_img_url: productData.base_img_url,
        sec_img1_url: productData.sec_img1_url,
        sec_img2_url: productData.sec_img2_url,
        sec_img3_url: productData.sec_img3_url,
        product_vid_url: productData.product_vid_url,
        product_vid2_url: productData.product_video2_url,
        product_gif_url: productData.product_gif_url,
      }));

      if (attributeData?.length && attributeData?.width && attributeData?.height) {
        setDimensionString(`${attributeData.length} x ${attributeData.width} x ${attributeData.height}`);
      }

      // Set isGemstone based on category
      setIsGemstone(productData.category === 'gemstones');
    }
  }, [response]);

  const ensureImagesLoaded = async (): Promise<void> => {
    if (!certificateRef.current) return;

    const imgElements = certificateRef.current.querySelectorAll('img');
    if (imgElements.length === 0) return;

    const promises = Array.from(imgElements).map(async (img) => {
      if (img.src.includes('storage.googleapis.com')) {
        try {
          return new Promise<void>(resolve => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            if (img.complete) resolve();
          });
        } catch (error) {
          console.error("Failed to proxy image:", error);
          return new Promise<void>(resolve => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            if (img.complete) resolve();
          });
        }
      } else {
        return new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          if (img.complete) resolve();
        });
      }
    });

    const timeoutPromise = new Promise<void>(resolve => {
      setTimeout(() => {
        console.warn("Image loading timed out, proceeding anyway");
        resolve();
      }, 5000);
    });

    await Promise.race([
      Promise.all(promises),
      timeoutPromise
    ]);
  };

  const generateAndUploadCertificate = async (): Promise<File | null> => {
    if (!certificateRef.current) {
      console.error("Certificate ref is not available");
      return null;
    }

    setIsGeneratingCertificate(true);

    try {
      await ensureImagesLoaded();
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        imageTimeout: 30000,
      });

      return new Promise<File>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error("Canvas to blob conversion failed"));
            return;
          }

          const certFile = new File([blob], 'certificate.png', {
            type: 'image/png',
            lastModified: Date.now()
          });

          resolve(certFile);
        }, 'image/png', 0.95);
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      throw error;
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  // Convert form data from strings to appropriate types for API submission
  const prepareFormDataForSubmission = () => {
    // Create a new object with the same structure as formData
    const processedData = { ...formData } as any;

    // For these specific gemstone property fields, we want to keep the formatted string values
    // exactly as they appear in the formData, NOT convert them to numbers
    const gemstoneFormattedFields = ['ref_index', 'hardness', 'sp_gravity'];
    
    // Fields to convert from string to float
    const floatFields = [
      'unit_price', 'actual_price', 'sale_price',
      'weight_gms', 'weight_carat', 'weight_ratti',
      'length', 'width', 'height'
    ];

    // Convert string fields to numbers for API submission
    floatFields.forEach(field => {
      processedData[field] = processedData[field] ? parseFloat(processedData[field]) : 0;
    });

    // Ensure gemstone formatted fields stay as strings
    gemstoneFormattedFields.forEach(field => {
      // Keep the formatted string values as they are - important!
      processedData[field] = formData[field];
    });

    // Convert quantity to integer
    processedData.quantity = processedData.quantity ? parseInt(processedData.quantity, 10) : 1;

    return processedData;
  };


   const updateProductMutation = useMutation({
    mutationFn: async (formDataToSend: FormData) => {
      if (!token) throw new Error('Authentication token is missing');

      const response = await userRequest({
        url: `/product/update-product/${id}`,
        method: "PUT",
        data: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      return response.data;
    },
    onSuccess: () => {
      toast.success("Product updated successfully!", {
        position: "bottom-right",
        duration: 2000,
      });
      queryClient.invalidateQueries(["get-product", id]);
    },
    onError: (error: any) => {
      console.error("Update Error:", error);
      toast.error(error.message || "Failed to update product", {
        position: "bottom-right",
        duration: 2000
      });
    }
  });

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
      setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev[fieldName] + 10;
          if (newProgress >= 100) clearInterval(interval);
          return { ...prev, [fieldName]: newProgress };
        });
      }, 200);

      const isImageField = fieldName.includes('img');
      const isVideoField = fieldName === 'product_vid';
      const isGifField = fieldName === 'product_gif';

      if (
        (isImageField && !file.type.startsWith('image/')) ||
        (isVideoField && !file.type.startsWith('video/')) ||
        (isGifField && !file.type.startsWith('image/gif'))
      ) {
        toast.error(
          isImageField
            ? 'Please select a valid image file'
            : isVideoField
              ? 'Please select a valid video file'
              : 'Please select a valid GIF file',
          { position: "bottom-right", duration: 2000 }
        );
        return;
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}_url`]: null,
      }));
    }
  };

  const handleFileRemove = (fieldName: ImageFieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null,
      [`${fieldName}_url`]: null,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };


 const validateForm = () => {
    if (!formData.name) {
      toast.error("Product name is required");
      return false;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return false;
    }
    return true;
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !validateDimensions()) return;

    try {
      const certFile = await generateAndUploadCertificate();
      if (!certFile) {
        toast.error("Failed to generate certificate image");
        return;
      }

      const formDataToSend = new FormData();
      const processedData = prepareFormDataForSubmission();
      
      // Log the important gemstone properties before submitting
      console.log("Sending gemstone properties:", {
        ref_index: processedData.ref_index,
        sp_gravity: processedData.sp_gravity,
        hardness: processedData.hardness
      });

      const sanitizedFormData = {
        ...processedData,
        sec_img1_url: formData.sec_img1_url || "",
        sec_img2_url: formData.sec_img2_url || "",
        sec_img3_url: formData.sec_img3_url || "",
        product_vid_url: formData.product_vid_url || "",
        product_vid2_url: formData.product_vid2_url || "",
        product_gif_url: formData.product_gif_url || "",
      };

      Object.keys(sanitizedFormData).forEach(key => {
        if (!['base_img', 'sec_img1', 'sec_img2', 'sec_img3', 'product_vid', 'product_vid2', 'product_gif'].includes(key)) {
          const value = sanitizedFormData[key as keyof typeof sanitizedFormData];
          formDataToSend.append(key, String(value));
        }
      });

      if (formData.base_img) {
        formDataToSend.append('base_img', formData.base_img);
      } else if (formData.base_img_url) {
        formDataToSend.append('keep_base_img', 'true');
        formDataToSend.append('base_img_url', formData.base_img_url);
      } else {
        formDataToSend.append('base_img_remove', 'true');
      }

      if (formData.sec_img1) {
        formDataToSend.append('sec_img1', formData.sec_img1);
      } else if (formData.sec_img1_url) {
        formDataToSend.append('sec_img1_url', formData.sec_img1_url);
      } else {
        formDataToSend.append('sec_img1_remove', 'true');
      }

      if (formData.sec_img2) {
        formDataToSend.append('sec_img2', formData.sec_img2);
      } else if (formData.sec_img2_url) {
        formDataToSend.append('sec_img2_url', formData.sec_img2_url);
      } else {
        formDataToSend.append('sec_img2_remove', 'true');
      }

      formDataToSend.append('sec_img3', certFile);

      if (formData.product_vid) {
        formDataToSend.append('product_video', formData.product_vid);
      } else if (formData.product_vid_url) {
        formDataToSend.append('product_vid_url', formData.product_vid_url);
      } else {
        formDataToSend.append('product_video_remove', 'true');
      }

      if (formData.product_vid2) {
        formDataToSend.append('product_video2', formData.product_vid2);
      } else if (formData.product_vid2_url) {
        formDataToSend.append('keep_product_video2', 'true');
      } else {
        formDataToSend.append('product_video2_remove', 'true');
      }

      if (formData.product_gif) {
        formDataToSend.append('product_gif', formData.product_gif);
      } else if (formData.product_gif_url) {
        formDataToSend.append('keep_product_gif', 'true');
      } else {
        formDataToSend.append('product_gif_remove', 'true');
      }

      await updateProductMutation.mutateAsync(formDataToSend);

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error((error as Error).message || "Failed to update product");
    }
  };

 const renderFileInput = (
    fieldName: ImageFieldName,
    label: string
  ) => {
    const accept = fieldName === 'product_vid' ? 'video/*' : 'image/*';
    const currentFile = formData[fieldName];
    const existingUrl = formData[`${fieldName}_url`];
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
            file={currentFile}
            existingUrl={existingUrl}
            onRemove={() => handleFileRemove(fieldName)}
          />
        </div>
      </div>
    );
  };

  if (loadingProduct || updateProductMutation.isLoading) {
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
          <CardTitle>Edit Product</CardTitle>
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
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${formData.status === 'Public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
                {renderFileInput("product_vid", "Product Video")}
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
                    baseImageUrl={formData.base_img
                      ? URL.createObjectURL(formData.base_img)
                      : formData.base_img_url}
                    key={`certificate-${formData.base_img_url || 'no-image'}`}
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
                  <Label htmlFor="speciesSelect">Gemstone Species</Label>
                  <Select
                    value={selectedSpecies}
                    onValueChange={handleSpeciesSelectChange}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="species">Species</Label>
                  <Input
                    id="species"
                    name="species"
                    value={formData.species}
                    onChange={handleSpeciesInputChange}
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

            <div className="text-xs text-gray-500">
              Base image: {formData.base_img ? 'New file selected' : (formData.base_img_url ? 'Using existing URL' : 'None')}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={updateProductMutation.isLoading || isGeneratingCertificate}
            >
              {isGeneratingCertificate ? "Generating Certificate..." :
                updateProductMutation.isLoading ? "Updating..." : "Update Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProductForm;