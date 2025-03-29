import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "react-router-dom";
import { userRequest } from "@/utils/requestMethods";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import { useQueryClient } from 'react-query';
import { ClipLoader } from "react-spinners";

// type ImageFieldName = 'base_img_url' | 'sec_img1_url' | 'sec_img2_url' | 'sec_img3_url' | 'product_vid_url';

type RemovedImages = {
  base_img_url: boolean;
  sec_img1_url: boolean;
  sec_img2_url: boolean;
  sec_img3_url: boolean;
  product_vid_url: boolean;
  [key: string]: boolean; // Add index signature
};

interface ProductFormData {
  // Product fields
  [key: string]: any;

  // File objects for new uploads
  base_img_file: File | null;
  sec_img1_file: File | null;
  sec_img2_file: File | null;
  sec_img3_file: File | null;
  product_vid_file: File | null;

  // URLs for existing files
  base_img_url: string | null;
  sec_img1_url: string | null;
  sec_img2_url: string | null;
  sec_img3_url: string | null;
  product_vid_url: string | null;

  // Other product fields
  name: string;
  description: string;
  category: string;
  subcategory: string;
  quantity: number;
  actual_price: number;
  sale_price: number;
  cert_img_url: string;

  // Attribute fields
  origin: string;
  weight_gms: number;
  weight_carat: number;
  weight_ratti: number;
  length: number;
  width: number;
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
  height: number;

  removedImages: RemovedImages;
}

interface FilePreviewProps {
  file: File | null;
  existingUrl: string | null;
  onRemove: () => void;
}

interface ApiError {
  message: string;
  response?: {
    data: any;
    status: number;
  };
}

// Reuse the FilePreview component from AddProductForm
const FilePreview: React.FC<FilePreviewProps> = ({ file, existingUrl, onRemove }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    // Clear any existing object URLs
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    // Prioritize newly selected file
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    // Fallback to existing URL if no new file and not marked for removal
    else if (existingUrl) {
      setPreview(existingUrl);
    }
    else {
      setPreview(null);
    }
  }, [file, existingUrl]);

  if (!preview) return null;

  const isVideo = file 
    ? file.type.startsWith('video/') 
    : preview.match(/\.(mp4|webm|ogg|mov)$/i);

  return (
    <div className="relative mt-2">
      {!isVideo ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-32 object-contain rounded-md border"
          onError={() => setPreview(null)}
        />
      ) : (
        <video
          src={preview}
          className="w-full h-32 object-contain rounded-md border"
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
// Reuse the validation function from AddProductForm

const EditProductForm = () => {
  const { id } = useParams();
  const token = useSelector((state: any) => state.user.accessToken);
  const [formData, setFormData] = useState<ProductFormData>({
    base_img_file: null,
    sec_img1_file: null,
    sec_img2_file: null,
    sec_img3_file: null,
    product_vid_file: null,
    base_img_url: null,
    sec_img1_url: null,
    sec_img2_url: null,
    sec_img3_url: null,
    product_vid_url: null,
    cert_img_url: "",
    name: "",
    certificate_no: `GEM-${Math.floor(10000 + Math.random() * 90000)}`,
    luminescence: "",
    op_char: "",
    crystal_sys: "",
    shape_cut: "",
    description: "",
    category: "",
    subcategory: "",
    quantity: 1,
    actual_price: 0,
    sale_price: 0,
    origin: "",
    weight_gms: 0,
    weight_carat: 0,
    weight_ratti: 0,
    length: 0,
    width: 0,
    shape: "",
    cut: "",
    treatment: "",
    composition: "",
    certification: "",
    color: "",
    status: "Draft",
    transparency: "",
    ref_index: "",
    hardness: "",
    sp_gravity: "",
    inclusion: "",
    species: "",
    variety: "",
    other_chars: "",
    visual_chars: "",
    height: 0,
    removedImages: {
      base_img_url: false,
      sec_img1_url: false,
      sec_img2_url: false,
      sec_img3_url: false,
      product_vid_url: false,
    }
  });

  function extractDimensions(input: string) {
    if (!input) return null;

    // Remove all spaces and make lowercase for consistent parsing
    const cleanInput = input.replace(/\s/g, '').toLowerCase();

    // Split by 'x' or 'X'
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



  const [dimensionString, setDimensionString] = useState("");



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


  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Form Data Updated:", formData); // Log the form data
  }, [formData]);


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
    if (data && data.data.attribute) {
      const { length, width, height } = data.data.attribute;
      if (length && width && height) {
        setDimensionString(`${length} x ${width} x ${height}`);
      }
    }
  }, [data]);

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


  useEffect(() => {
    if (data) {
      const { product, attribute } = data.data;
      console.log("Fetched Product Data:", product, attribute);

      setFormData(prev => ({
        ...prev,
        name: product.name,
        description: product.description || "",
        category: product.category,
        subcategory: product.subcategory,
        quantity: product.quantity,
        actual_price: product.actual_price,
        sale_price: product.sale_price,
        status: product.status || "Draft",
        certificate_no: attribute?.certificate_no || `GEM-${Math.floor(10000 + Math.random() * 90000)}`,
        luminescence: attribute?.luminescence || "",
        op_char: attribute?.op_char || "",
        crystal_sys: attribute?.crystal_sys || "",
        shape_cut: attribute?.shape_cut || "",
        base_img_url: product.base_img_url || null,
        sec_img1_url: product.sec_img1_url || null,
        sec_img2_url: product.sec_img2_url || null,
        sec_img3_url: product.sec_img3_url || null,
        product_vid_url: product.product_vid_url || null,
        base_img_file: null,
        sec_img1_file: null,
        sec_img2_file: null,
        sec_img3_file: null,
        product_vid_file: null,
        removedImages: {
          base_img_url: false,
          sec_img1_url: false,
          sec_img2_url: false,
          sec_img3_url: false,
          product_vid_url: false,
        },

        // Initialize attribute fields if they exist
        ...(attribute && {
          origin: attribute.origin || "",
          weight_gms: attribute.weight_gms || 0,
          weight_carat: attribute.weight_carat || 0,
          weight_ratti: attribute.weight_ratti || 0,
          length: attribute.length || 0,
          width: attribute.width || 0,
          shape: attribute.shape || "",
          cut: attribute.cut || "",
          treatment: attribute.treatment || "",
          composition: attribute.composition || "",
          certification: attribute.certification || "",
          color: attribute.color || "",
          transparency: attribute?.transparency || "",
          ref_index: attribute?.ref_index || "",
          hardness: attribute?.hardness || "",
          sp_gravity: attribute?.sp_gravity || "",
          inclusion: attribute?.inclusion || "",
          species: attribute?.species || "",
          variety: attribute?.variety || "",
          other_chars: attribute?.other_chars || "",
          visual_chars: attribute?.visual_chars || "",
          height: attribute?.height || 0,
        }),
      }));
    }
  }, [data]);

  // Update mutation
  // Update mutation
  const updateProductMutation = useMutation({
    mutationFn: async (formDataToSend: FormData) => {
      if (!token) throw new Error('Authentication token is missing');

      try {
        const response = await userRequest({
          url: `/product/update-product/${id}`,
          method: "PUT",
          data: formDataToSend,
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        console.log("Update Response:", response.data);
        return response.data;
      } catch (error) {
        throw error as ApiError;
      }
    },
    onSuccess: (data) => {
      toast.success("Product updated successfully!", {
        position: "bottom-right",
        duration: 2000,
      });

      // Update form data with the response
      if (data.product) {
        setFormData(prev => ({
          ...prev,
          name: data.product.name,
          description: data.product.description || "",
          category: data.product.category,
          subcategory: data.product.subcategory,
          quantity: data.product.quantity,
          actual_price: data.product.actual_price,
          sale_price: data.product.sale_price,
          status: data.product.status || "Draft",
          base_img_file: null,
          sec_img1_file: null,
          sec_img2_file: null,
          sec_img3_file: null,
          product_vid_file: null,
          // Update existing images
          existingImages: {
            base_img_url: data.product.base_img_url || '',
            sec_img1_url: data.product.sec_img1_url || '',
            sec_img2_url: data.product.sec_img2_url || '',
            sec_img3_url: data.product.sec_img3_url || '',
            product_vid_url: data.product.product_vid_url || '',
          },
          // Reset file objects and use the returned URLs as strings
          base_img_url: data.product.base_img_url || null,
          sec_img1_url: data.product.sec_img1_url || null,
          sec_img2_url: data.product.sec_img2_url || null,
          sec_img3_url: data.product.sec_img3_url || null,
          product_vid_url: data.product.product_vid_url || null,
          // Reset removed flags
          removedImages: {
            base_img_url: false,
            sec_img1_url: false,
            sec_img2_url: false,
            sec_img3_url: false,
            product_vid_url: false,
          }
        }));
      }

      // Invalidate and refetch relevant queries to update the UI
      queryClient.invalidateQueries(["get-product", id]);
    },
    onError: (error: ApiError) => {
      console.error("Mutation Error:", error);
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

    setFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? Number(value) || 0 : value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'base_img' | 'sec_img1' | 'sec_img2' | 'sec_img3' | 'product_vid'
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileField = `${fieldName}_file` as const;
      const urlField = `${fieldName}_url` as const;
  
      setFormData(prev => ({
        ...prev,
        [fileField]: file,
        // Clear the URL when a new file is selected
        [urlField]: null,
        removedImages: {
          ...prev.removedImages,
          [urlField]: false // Reset removed flag if new file is selected
        }
      }));
    }
  };



  const handleFileRemove = (fieldName: 'base_img' | 'sec_img1' | 'sec_img2' | 'sec_img3' | 'product_vid') => {
    const urlField = `${fieldName}_url` as const;
    const fileField = `${fieldName}_file` as const;

    setFormData(prev => ({
      ...prev,
      [fileField]: null, // Clear the file
      [urlField]: null, // Clear the URL
      removedImages: {
        ...prev.removedImages,
        [urlField]: true // Mark as removed
      }
    }));
  };


  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createFormDataWithFiles = () => {
    const formDataToSend = new FormData();
  
    // Destructure only what you need
    const {
      name,
      description,
      category,
      subcategory,
      quantity,
      actual_price,
      sale_price,
      status,
      origin,
      weight_gms,
      weight_carat,
      weight_ratti,
      length,
      width,
      shape,
      cut,
      treatment,
      composition,
      certification,
      certificate_no,
      luminescence,
      op_char,
      crystal_sys,
      shape_cut,
      color,
      transparency,
      ref_index,
      hardness,
      sp_gravity,
      inclusion,
      species,
      variety,
      other_chars,
      visual_chars,
      height,
      base_img_file,
      sec_img1_file,
      sec_img2_file,
      sec_img3_file,
      product_vid_file,
      base_img_url,
      sec_img1_url,
      sec_img2_url,
      sec_img3_url,
      product_vid_url,
      removedImages
    } = formData;
  
    // Prepare product data
    const productData = {
      name,
      description: description || "",
      category,
      subcategory,
      quantity: Number(quantity),
      actual_price: Number(actual_price),
      sale_price: Number(sale_price),
      status,
    };
  
    // Prepare attribute data
    const attributeData = {
      origin,
      weight_gms: Number(weight_gms),
      weight_carat: Number(weight_carat),
      weight_ratti: Number(weight_ratti),
      length: Number(length),
      width: Number(width),
      shape,
      cut,
      treatment,
      composition,
      certification,
      certificate_no,
      luminescence,
      op_char,
      crystal_sys,
      shape_cut,
      color,
      transparency,
      ref_index,
      hardness,
      sp_gravity,
      inclusion,
      species,
      variety,
      other_chars,
      visual_chars,
      height: Number(height),
    };
  
    // Append stringified data
    formDataToSend.append('productData', JSON.stringify(productData));
    formDataToSend.append('attributeData', JSON.stringify(attributeData));
  
    // Handle file uploads and removals with correct field names
    const fileFields = [
      { field: base_img_file, serverField: 'base_img', url: base_img_url },
      { field: sec_img1_file, serverField: 'sec_img1', url: sec_img1_url },
      { field: sec_img2_file, serverField: 'sec_img2', url: sec_img2_url },
      { field: sec_img3_file, serverField: 'sec_img3', url: sec_img3_url },
      { field: product_vid_file, serverField: 'product_video', url: product_vid_url },
    ];
  
    fileFields.forEach(({ field, serverField, url }) => {
      if (field) {
        formDataToSend.append(serverField, field);
        // If we're uploading a new file, mark the old one for removal
        if (url) {
          formDataToSend.append(`${serverField}_remove`, 'true');
        }
      } else if (removedImages[`${serverField}_url`]) {
        formDataToSend.append(`${serverField}_remove`, 'true');
      }
    });
  
    return formDataToSend;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDimensions()) return;

    try {
      const formDataToSend = createFormDataWithFiles();

      console.log("Form Data to Send:", formDataToSend);

      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(key, value.name); // Log file name for better clarity
        } else {
          console.log(key, value);
        }
      }

      await updateProductMutation.mutateAsync(formDataToSend);

    } catch (error: any) {
      console.error("Update Error:", error);
      toast.error(error?.message || "Failed to update product");
    }
  };

  const renderFileInput = (
    fieldName: 'base_img' | 'sec_img1' | 'sec_img2' | 'sec_img3' | 'product_vid',
    label: string
  ) => {
    const accept = fieldName === 'product_vid' ? 'video/*' : 'image/*';
    const fileField = `${fieldName}_file`;
    const urlField = `${fieldName}_url`;
    const currentFile = formData[fileField];
    const existingUrl = formData.removedImages[urlField] ? null : formData[urlField];
  
    // Create a stable ID for the input
    const inputId = `${fieldName}-input`;
  
    return (
      <div className="space-y-2" key={fieldName}>
        <Label htmlFor={inputId}>{label}</Label>
        <div className="space-y-2">
          <Input
            id={inputId}
            type="file"
            accept={accept}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e, fieldName);
              }
            }}
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
  if (loadingProduct)
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="blue" size={50} />
      </div>
    );


  return (

    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}

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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
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
                {renderFileInput("sec_img3", "Secondary Image 3")}
                {renderFileInput("product_vid", "Product Video")}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Certificate Fields</h3>
              <div className="grid grid-cols-3 gap-4">
                {/* Certificate Number */}
                <div className="space-y-2">
                  <Label htmlFor="certificate_no">Certificate No</Label>
                  <Input
                    id="certificate_no"
                    name="certificate_no"
                    value={formData.certificate_no || `GEM-${Math.floor(10000 + Math.random() * 90000)}`}
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

                {/* Specific Gravity */}
                <div className="space-y-2">
                  <Label htmlFor="sp_gravity">Specific Gravity</Label>
                  <Input
                    id="sp_gravity"
                    name="sp_gravity"
                    value={formData.sp_gravity}
                    onChange={handleInputChange}
                  />
                </div>


                {/* Luminescence */}
                <div className="space-y-2">
                  <Label htmlFor="luminescence">Luminescence</Label>
                  <Input
                    id="luminescence"
                    name="luminescence"
                    value={formData.luminescence}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Optical Characteristics */}
                <div className="space-y-2">
                  <Label htmlFor="op_char">Optical Characteristics</Label>
                  <Input
                    id="op_char"
                    name="op_char"
                    value={formData.op_char}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Crystal System */}
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

                {/* Species */}
                <div className="space-y-2">
                  <Label htmlFor="species">Species</Label>
                  <Input
                    id="species"
                    name="species"
                    value={formData.species}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Variety */}
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
                    type="text"
                    value={formData.weight_gms}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_carat">Weight (carat)</Label>
                  <Input
                    id="weight_carat"
                    name="weight_carat"
                    type="text"
                    value={formData.weight_carat}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_ratti">Weight (ratti)</Label>
                  <Input
                    id="weight_ratti"
                    name="weight_ratti"
                    type="text"
                    value={formData.weight_ratti}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Length X Breadth X Height */}


              <div className="grid grid-cols-2 gap-4">
                {/* <div className="space-y-2">
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input
                    id="length"
                    name="length"
                    type="number"
                    value={formData.length}
                    onChange={handleInputChange}
                  />
                </div> */}
                {/* <div className="space-y-2">
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    id="width"
                    name="width"
                    type="number"
                    value={formData.width}
                    onChange={handleInputChange}
                  />
                </div> */}
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
                  {/* </div> */}


                  {/* ref_index */}

                  {/* hardness */}

                  {/* Other Characteristics */}
                  <div className="space-y-2">
                    <Label htmlFor="other_chars">Other Characteristics</Label>
                    <Input
                      id="other_chars"
                      name="other_chars"
                      type="string"
                      value={formData.other_chars}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* Visual Characteristics */}
                  <div className="space-y-2">
                    <Label htmlFor="visual_chars">Visual Characteristics</Label>
                    <Input
                      id="visual_chars"
                      name="visual_chars"
                      type="string"
                      value={formData.visual_chars}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* Inclusion */}

                  {/* Species */}

                  {/* Variety */}

                </div>
              </div>
            </div>

            {/* Characteristics */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Characteristics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment</Label>
                  <Input
                    id="treatment"
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleInputChange}
                    placeholder="Enter treatment"
                  />
                </div>

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
              disabled={updateProductMutation.isLoading}
            >
              {updateProductMutation.isLoading ? "Updating..." : "Update Product"}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
};

export default EditProductForm;