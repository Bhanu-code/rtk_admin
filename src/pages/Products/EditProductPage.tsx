
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

type ImageFieldName = 'base_img_url' | 'sec_img1_url' | 'sec_img2_url' | 'sec_img3_url' | 'product_vid_url';

type RemovedImages = {
  [key in ImageFieldName]: boolean;
};


// Reuse the same interface from AddProductForm
interface ProductFormData {
  // Product fields
  [key: string]: any;
  base_img_url: File | null;
  sec_img1_url: File | null;
  sec_img2_url: File | null;
  sec_img3_url: File | null;
  product_vid_url: File | null;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  quantity: number;
  actual_price: number;
  sale_price: number;
  cert_img_url:string
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

  // Additional fields
  existingImages: {
    base_img_url: string | null;
    sec_img1_url: string | null;
    sec_img2_url: string | null;
    sec_img3_url: string | null;
    product_vid_url: string | null;
  };

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
    let objectUrl: string | null = null;
    
    if (file) {
      objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  if (!preview && !existingUrl) return null;

  const isImage = file ? file.type.startsWith('image/') : existingUrl?.match(/\.(jpg|jpeg|png|gif)$/i);
  const displayUrl = preview || existingUrl;

  return (
    <div className="relative">
      {isImage ? (
        <img 
          src={displayUrl || ''} 
          alt="Preview" 
          className="w-full h-32 object-contain rounded-md"
        />
      ) : displayUrl && (
        <video 
          src={displayUrl} 
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
// Reuse the validation function from AddProductForm
// const validateProduct = (formData: ProductFormData) => {
//   const errors: string[] = [];

//   if (!formData.category) {
//     errors.push("Category cannot be null");
//   }
//   if (formData.actual_price < 0 || formData.sale_price < 0) {
//     errors.push("Negative Price not allowed!");
//   }
//   if (!formData.actual_price && formData.sale_price) {
//     errors.push("Actual Price cannot be null!");
//   }
//   if (formData.sale_price <= formData.actual_price) {
//     errors.push("Sale Price cannot be less than Actual Price!");
//   }

//   return errors;
// };

const EditProductForm = () => {
  const { id } = useParams();
  const token = useSelector((state: any) => state.user.accessToken);
  const [formData, setFormData] = useState<ProductFormData>({
    base_img_url: null,
    sec_img1_url: null,
    sec_img2_url: null,
    sec_img3_url: null,
    product_vid_url: null,
    cert_img_url: "",
    name: "",
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
    existingImages: {
      base_img_url: '',
      sec_img1_url: '',
      sec_img2_url: '',
      sec_img3_url: '',
      product_vid_url: '',
    },
    removedImages: {
      base_img_url: false,
      sec_img1_url: false,
      sec_img2_url: false,
      sec_img3_url: false,
      product_vid_url: false,
    }
  });

  const queryClient = useQueryClient();

  // Fetch product data
  const {  isLoading:loadingProduct } = useQuery(
    ["get-product", id],
    () => userRequest({
      url: `/product/get-product/${id}`,
      method: "get",
    }),
    {
      onSuccess: (response) => {
        const { product, attribute } = response.data;
        
        // Combine product and attribute data
        setFormData(prev => ({
          ...prev,
          // Product fields
          name: product.name,
          description: formData.description || undefined ? "" : product.description,
          category: product.category,
          subcategory: product.subcategory,
          quantity: product.quantity,
          actual_price: product.actual_price,
          sale_price: product.sale_price,
          
          // Attribute fields
          origin: attribute.origin,
          weight_gms: attribute.weight_gms,
          weight_carat: attribute.weight_carat,
          weight_ratti: attribute.weight_ratti,
          length: attribute.length,
          width: attribute.width,
          shape: attribute.shape,
          cut: attribute.cut,
          treatment: attribute.treatment,
          composition: attribute.composition,
          certification: attribute.certification,
          color: attribute.color,

          // Store existing image URLs
          existingImages: {
            base_img_url: product.base_img_url,
            sec_img1_url: product.sec_img1_url,
            sec_img2_url: product.sec_img2_url,
            sec_img3_url: product.sec_img3_url,
            product_vid_url: product.product_vid_url,
          },

          // Reset file fields
          base_img_url: null,
          sec_img1_url: null,
          sec_img2_url: null,
          sec_img3_url: null,

          product_vid_url: null,
        }));
      },
      onError: () => {
        toast.error("Failed to fetch product details", {
          position: "bottom-right",
          duration: 2000
        });
      },
    }
  );
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

      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },
  onSuccess: (data) => {
    // Show success message
    console.log("DATA : ",data)
    toast.success("Product updated successfully!", {
      position: "bottom-right",
      duration: 2000,
      // You can add a custom icon if desired
      // icon: "✨"
    });

    // Invalidate and refetch relevant queries to update the UI
    queryClient.invalidateQueries(["get-product", id]);
    
    // You can also add another toast to confirm specific updates
    if (Object.values(formData.removedImages).some(removed => removed)) {
      toast.success("Images updated successfully", {
        position: "bottom-right",
        duration: 2000,
        // Add slight delay to prevent toast overlap
        // delay: 500
      });
    }
  },
  onError: (error: ApiError) => {
    console.error("Mutation error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    const errorMessage = error.response?.data?.message || error.message || "Failed to update product";
    toast.error(errorMessage, {
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
    fieldName: keyof ProductFormData
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type for sec_img3_url
      if (fieldName === 'sec_img3_url' && !file.type.startsWith('image/')) {
        toast.error('Please select an image file for Secondary Image 3', {
          position: "bottom-right",
          duration: 2000
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: file,
        removedImages: {
          ...prev.removedImages,
          [fieldName]: false // Reset removed status when new file is added
        }
      }));
    }
  };


  const handleFileRemove = (fieldName: ImageFieldName) => {
    console.log(`Removing file for field: ${fieldName}`);
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: null,
      existingImages: {
        ...prev.existingImages,
        [fieldName]: null
      },
      removedImages: {
        ...prev.removedImages,
        [fieldName]: true
      }
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   const numValue = Number(value);
  //   setFormData(prev => ({ ...prev, [name]: numValue }));
  // };

  const createFormDataWithFiles = () => {
    const formDataToSend = new FormData();
    
    // Prepare product data
    const productData: Partial<ProductFormData> = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      subcategory: formData.subcategory,
      quantity: Number(formData.quantity),
      actual_price: Number(formData.actual_price),
      sale_price: Number(formData.sale_price)
    };
  
    // Prepare attribute data
    const attributeData = {
      origin: formData.origin,
      weight_gms: Number(formData.weight_gms),
      weight_carat: Number(formData.weight_carat),
      weight_ratti: Number(formData.weight_ratti),
      length: Number(formData.length),
      width: Number(formData.width),
      shape: formData.shape,
      cut: formData.cut,
      treatment: formData.treatment,
      composition: formData.composition,
      certification: formData.certification,
      color: formData.color
    };
  
    // Append stringified data
    formDataToSend.append('productData', JSON.stringify(productData));
    formDataToSend.append('attributeData', JSON.stringify(attributeData));
  
    // Handle file uploads
    const fileFieldMappings = {
      'base_img_url': 'base_img',
      'sec_img1_url': 'sec_img1',
      'sec_img2_url': 'sec_img2',
      'sec_img3_url': 'sec_img3',
      'product_vid_url': 'product_video'
    };
  
    Object.entries(fileFieldMappings).forEach(([fieldName, serverFieldName]) => {
      if (formData[fieldName]) {
        formDataToSend.append(serverFieldName, formData[fieldName]);
      } else if (formData.removedImages[fieldName as ImageFieldName]) {
        formDataToSend.append(`${serverFieldName}_remove`, 'true');
      }
    });
  
    return formDataToSend;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show loading toast while validating
    // const loadingToast = toast.loading("Validating form...", {
    //   // position: "bottom-right"
    // });
    
    // const validationErrors = validateProduct(formData);
    // if (validationErrors.length > 0) {
    //   // Dismiss loading toast
    //   toast.dismiss(loadingToast);
      
    //   // Show validation errors
    //   toast.error(validationErrors.join("\n"), {
    //     position: "bottom-right",
    //     duration: 2000
    //   });
    //   return;
    // }
  
    // Dismiss loading toast
    // toast.dismiss(loadingToast);
  
    // Show processing toast
    // toast.loading("Updating product...", {
    //   position: "bottom-right"
    // });
  
    const formDataToSend = createFormDataWithFiles();
    updateProductMutation.mutate(formDataToSend);
  };

  const renderFileInput = (
    fieldName: keyof Pick<ProductFormData, 'base_img_url' | 'sec_img1_url' | 'sec_img2_url' | 'sec_img3_url' | 'product_vid_url'>,
    label: string
  ) => {
    const accept = fieldName === 'product_vid_url' ? 'video/*' : 'image/*';
    
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
            file={formData[fieldName]}
            existingUrl={formData.existingImages[fieldName]}
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
              {renderFileInput("base_img_url", "Base Image")}
                {renderFileInput("sec_img1_url", "Secondary Image 1")}
                {renderFileInput("sec_img2_url", "Secondary Image 2")}
                {renderFileInput("sec_img3_url", "Secondary Image 3")}
                {renderFileInput("product_vid_url", "Product Video")}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <Input
                    id="length"
                    name="length"
                    type="number"
                    value={formData.length}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    name="width"
                    type="number"
                    value={formData.width}
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
                  <Label htmlFor="shape">Shape</Label>
                  <Select
                    value={formData.shape}
                    onValueChange={(value) =>
                      handleSelectChange("shape", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oval">Oval</SelectItem>
                      <SelectItem value="Round">Round</SelectItem>
                      <SelectItem value="Cushion">Cushion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cut">Cut</Label>
                  <Select
                    value={formData.cut}
                    onValueChange={(value) => handleSelectChange("cut", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Brilliant">Brilliant</SelectItem>
                      <SelectItem value="Step">Step</SelectItem>
                    </SelectContent>
                  </Select>
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
