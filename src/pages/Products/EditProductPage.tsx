import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CertificateGenerator } from "../../components/CertificateGenerator";
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

type ImageFieldName = 'base_img' | 'sec_img1' | 'sec_img2' | 'sec_img3' | 'product_vid';

interface ProductFormData {
  [key: string]: any;
  base_img: File | null;
  sec_img1: File | null;
  sec_img2: File | null;
  sec_img3: File | null;
  product_vid: File | null;
  base_img_url: string | null;
  sec_img1_url: string | null;
  sec_img2_url: string | null;
  sec_img3_url: string | null;
  product_vid_url: string | null;
  cert_img_url: string;
  name: string;
  description: string;
  sku: string;
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
    base_img_url: null,
    sec_img1_url: null,
    sec_img2_url: null,
    sec_img3_url: null,
    product_vid_url: null,
    cert_img_url: "",
    name: "",
    description: "",
    sku: "",
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
    certificate_no: `GEM-${Math.floor(10000 + Math.random() * 90000)}`,
    luminescence: "",
    op_char: "",
    crystal_sys: "",
    shape_cut: "",
    transparency: "",
    ref_index: "",
    hardness: "",
    sp_gravity: "",
    inclusion: "",
    species: "",
    variety: "",
    other_chars: "",
    visual_chars: "",
  });

  const [dimensionString, setDimensionString] = useState("");
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [certImageUrl, setCertImageUrl] = useState<string | null>(null);
  const [certImageFile, setCertImageFile] = useState<File | null>(null);

  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Add this function to create a CORS-friendly version of remote images
const createProxiedImage = (url) => {
  return new Promise((resolve, reject) => {
    // Create a new image element
    const img = new Image();
    img.crossOrigin = "anonymous"; // This is crucial for CORS
    
    img.onload = () => {
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image on canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Get the data URL (this is now CORS-safe)
      try {
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (e) {
        console.error("Failed to convert image to data URL", e);
        reject(e);
      }
    };
    
    img.onerror = (e) => {
      console.error("Error loading image for CORS proxy:", url);
      reject(e);
    };
    
    // Add a cache-busting parameter to avoid cached responses
    img.src = `${url}?cb=${new Date().getTime()}`;
  });
};

const ensureImagesLoaded = async () => {
  if (!certificateRef.current) return;
  
  const imgElements = certificateRef.current.querySelectorAll('img');
  if (imgElements.length === 0) return;
  
  const promises = Array.from(imgElements).map(async (img) => {
    // Check if this is a remote URL from your storage
    if (img.src.includes('storage.googleapis.com')) {
      try {
        // Create a CORS-friendly version of the image
        const dataUrl = await createProxiedImage(img.src);
        // Replace the original src with the data URL
        img.src = dataUrl;
        return new Promise(resolve => {
          img.onload = resolve;
          // If it's already loaded, resolve immediately
          if (img.complete) resolve();
        });
      } catch (error) {
        console.error("Failed to proxy image:", error);
        // If proxying fails, we'll still wait for the image
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve; // Resolve on error too, to prevent hanging
          if (img.complete) resolve();
        });
      }
    } else {
      // For non-remote images, just wait for them to load
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve; // Resolve on error too, to prevent hanging
        if (img.complete) resolve();
      });
    }
  });
  
  // Set a timeout to prevent hanging forever
  const timeoutPromise = new Promise(resolve => {
    setTimeout(() => {
      console.warn("Image loading timed out, proceeding anyway");
      resolve();
    }, 5000);
  });
  
  // Wait for all images to load or timeout
  await Promise.race([
    Promise.all(promises),
    timeoutPromise
  ]);
  
  setImagesLoaded(true);
};

  // Fetch product data
  const { data, isLoading: loadingProduct } = useQuery(
    ["get-product", id],
    () =>
      userRequest({
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
    if (data) {
      const { product, attribute } = data.data;
      setFormData(prev => ({
        ...prev,
        ...product,
        ...attribute,
        base_img_url: product.base_img_url,
        sec_img1_url: product.sec_img1_url,
        sec_img2_url: product.sec_img2_url,
        sec_img3_url: product.sec_img3_url,
        product_vid_url: product.product_vid_url,
      }));

      if (attribute?.length && attribute?.width && attribute?.height) {
        setDimensionString(`${attribute.length} x ${attribute.width} x ${attribute.height}`);
      }
    }
  }, [data]);

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

  const generateAndUploadCertificate = async (): Promise<File | null> => {
    if (!certificateRef.current) {
      console.error("Certificate ref is not available");
      return null;
    }

    setIsGeneratingCertificate(true);

    try {
      // First, ensure all images are loaded
      await ensureImagesLoaded();

      // Add a small delay to make sure everything has rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      // Now capture the certificate
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        imageTimeout: 30000, // 30 seconds timeout for images
        onclone: (clonedDoc) => {
          // Optional: do something with the cloned document before rendering
          // This can be useful for debugging
          const clonedImages = clonedDoc.querySelectorAll('img');
          console.log(`Cloned ${clonedImages.length} images for certificate`);
        }
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

          // Optional: preview the certificate image for debugging
          // const previewUrl = URL.createObjectURL(blob);
          // console.log('Certificate preview URL:', previewUrl);

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

  const createFormDataWithFiles = async () => {
    const formDataToSend = new FormData();

    // Generate certificate image first
    const certFile = await generateAndUploadCertificate();
    if (certFile) {
      formDataToSend.append('sec_img3', certFile);
    }

    // Append all text fields
    Object.keys(formData).forEach(key => {
      if (!['base_img', 'sec_img1', 'sec_img2', 'sec_img3', 'product_vid',
        'base_img_url', 'sec_img1_url', 'sec_img2_url', 'sec_img3_url', 'product_vid_url'].includes(key)) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Append files
    if (formData.base_img) formDataToSend.append('base_img', formData.base_img);
    if (formData.sec_img1) formDataToSend.append('sec_img1', formData.sec_img1);
    if (formData.sec_img2) formDataToSend.append('sec_img2', formData.sec_img2);
    if (formData.product_vid) formDataToSend.append('product_video', formData.product_vid);

    // Handle removed images
    if (!formData.base_img && !formData.base_img_url) formDataToSend.append('base_img_remove', 'true');
    if (!formData.sec_img1 && !formData.sec_img1_url) formDataToSend.append('sec_img1_remove', 'true');
    if (!formData.sec_img2 && !formData.sec_img2_url) formDataToSend.append('sec_img2_remove', 'true');
    if (!formData.product_vid && !formData.product_vid_url) formDataToSend.append('product_video_remove', 'true');

    return formDataToSend;
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

      if ((isImageField && !file.type.startsWith('image/')) ||
        (isVideoField && !file.type.startsWith('video/'))) {
        toast.error(
          isImageField ? 'Please select a valid image file' : 'Please select a valid video file',
          { position: "bottom-right", duration: 2000 }
        );
        return;
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}_url`]: null, // Clear the URL when a new file is selected
      }));
    }
  };

  const handleFileRemove = (fieldName: ImageFieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null,
      [`${fieldName}_url`]: null, // Clear the URL when file is removed
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

      console.log("Current base image state:", {
        base_img_file: formData.base_img ? formData.base_img.name : null,
        base_img_url: formData.base_img_url
      });
      // Generate the certificate first
      const certFile = await generateAndUploadCertificate();
      if (!certFile) {
        toast.error("Failed to generate certificate image");
        return;
      }

      // Create form data with ALL fields
      const formDataToSend = new FormData();

      // Split data into product and attribute fields based on your schema
      const productFields = [
        'name', 'description', 'sku', 'category', 'subcategory',
        'quantity', 'actual_price', 'sale_price', 'status'
      ];

      const attributeFields = [
        'origin', 'weight_gms', 'weight_carat', 'weight_ratti',
        'length', 'width', 'height', 'shape', 'cut', 'treatment',
        'composition', 'certification', 'color', 'certificate_no',
        'luminescence', 'op_char', 'crystal_sys', 'shape_cut',
        'transparency', 'ref_index', 'hardness', 'sp_gravity',
        'inclusion', 'species', 'variety', 'other_chars', 'visual_chars'
      ];

      // Append product fields
      productFields.forEach(field => {
        formDataToSend.append(field, String(formData[field]));
      });

      // Append attribute fields
      attributeFields.forEach(field => {
        formDataToSend.append(field, String(formData[field]));
      });

      // Handle file uploads

      // 1. For base_img: Always include information about the base image
      if (formData.base_img) {
        // If a new file is selected, upload it
        console.log("Sending new base image file");
        formDataToSend.append('base_img', formData.base_img);
      } else if (formData.base_img_url) {
        // If using existing URL, explicitly tell the server to keep it
        console.log("Keeping existing base image URL:", formData.base_img_url);
        formDataToSend.append('keep_base_img', 'true');
        formDataToSend.append('base_img_url', formData.base_img_url);
      } else {
        // Only if both are null, mark for removal
        console.log("Removing base image");
        formDataToSend.append('base_img_remove', 'true');
      }

      // 2. Handle other images
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

      // 3. Always use the newly generated certificate for sec_img3
      formDataToSend.append('sec_img3', certFile);

      // 4. Handle video
      if (formData.product_vid) {
        formDataToSend.append('product_video', formData.product_vid);
      } else if (formData.product_vid_url) {
        formDataToSend.append('product_vid_url', formData.product_vid_url);
      } else {
        formDataToSend.append('product_video_remove', 'true');
      }

      // Send the request
      await updateProductMutation.mutateAsync(formDataToSend);

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to update product");
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
                <Label htmlFor="sku">SKU Code</Label>
                <Input
                  id="sku_code"
                  name="sku_code"
                  value={formData.sku}
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
                    baseImageUrl={formData.base_img
                      ? URL.createObjectURL(formData.base_img)
                      : formData.base_img_url}
                    key={`certificate-${formData.base_img_url || 'no-image'}`} // Key based on the actual image URL
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