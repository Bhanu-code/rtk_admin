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
// import { toast } from "sonner";
import { useMutation } from "react-query";
import { toast } from "sonner";
import { userRequest } from "@/utils/requestMethods";
import { useSelector } from "react-redux";
import { X } from "lucide-react";

interface ProductFormData {
  base_img: File | null; // Changed from base_img_url
  sec_img1: File | null; // Changed from sec_img1_url
  sec_img2: File | null; // Changed from sec_img2_url
  sec_img3: File | null; // Changed from sec_img3_url
  product_vid: File | null;
  cert_img_url: string;
  name: string;
  description: string | null;
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
  transparency: string;
  ref_index: string;
  sp_gravity: string;
  other_chars: string;
  visual_chars: string;
  inclusion: string;
  species: string;
  gravity: string;
  hardness: string;
  variety: string;
}

type FileFields =
  | "base_img"
  | "sec_img1"
  | "sec_img2"
  | "sec_img3"
  | "product_vid";

// const isFileField = (key: string): key is FileFields => {
//   return ['base_img', 'sec_img1', 'sec_img2', 'sec_img3', 'product_vid'].includes(key);
// };

// interface ApiError {
//   response?: {
//     data?: {
//       message?: string;
//     };
//   };
// }

interface FilePreviewProps {
  file: File | null;
  onRemove: () => void;
}

const FilePreview = ({ file, onRemove }: FilePreviewProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    // Create preview URL
    const objectUrl: any = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Cleanup
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!preview) return null;

  return (
    <div className="relative">
      {file?.type.startsWith("image/") ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-32 object-contain  rounded-md"
        />
      ) : (
        <video
          src={preview}
          className="w-full h-32 object-contain rounded-md"
          controls
        />
      )}
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

function extractDimensions(input: any) {
  if (typeof input !== "string") {
    return null;
  }

  // Regular expression to match the pattern
  // This matches digits, followed by 'x' or 'X', followed by digits, etc.
  const regex = /^(\d+)[xX](\d+)[xX](\d+)$/;

  // Test the input against the pattern
  const match = input.match(regex);

  // If no match found, return null
  if (!match) {
    return null;
  }

  // Extract and convert dimensions to numbers
  return {
    length: parseInt(match[1], 10),
    breadth: parseInt(match[2], 10),
    height: parseInt(match[3], 10),
  };
}

const validateProduct = (formData: ProductFormData) => {
  const errors: string[] = [];

  if (!formData.category) {
    errors.push("Category cannot be null");
  }
  if (formData.actual_price < 0 || formData.sale_price < 0) {
    errors.push("Negative Price not allowed!");
  }
  if (!formData.actual_price && formData.sale_price) {
    errors.push("Actual Price cannot be null!");
  }
  if (formData.sale_price > formData.actual_price) {
    errors.push("Actual Price cannot be less than Sale Price!");
  }

  return errors;
};

const AddProductForm = () => {
  const [formData, setFormData] = React.useState<ProductFormData>({
    base_img: null,
    sec_img1: null,
    sec_img2: null,
    sec_img3: null,
    product_vid: null,
    cert_img_url: "",
    name: "",
    description: null,
    category: "",
    subcategory: "", // Now a free text input
    quantity: 1,
    actual_price: 0,
    sale_price: 0,
    origin: "",
    weight_gms: 0,
    weight_carat: 0,
    weight_ratti: 0,
    length: 0,
    width: 0,
    height: 0,
    shape: "", // Now a free text input
    cut: "", // Now a free text input
    treatment: "",
    composition: "",
    certification: "",
    color: "",
    transparency: "",
    ref_index: "",
    sp_gravity: "",
    other_chars: "",
    visual_chars: "",
    inclusion: "",
    species: "",
    gravity: "",
    hardness: "",
    variety: "",
  });

  const createFormDataWithFiles = () => {
    const formDataToSend = new FormData();

    // Append regular form fields
    Object.keys(formData).forEach((key) => {
      if (!key.includes("_url")) {
        formDataToSend.append(
          key,
          String(formData[key as keyof ProductFormData])
        );
      }
    });

    // Handle file uploads with correct field names
    if (formData.base_img) formDataToSend.append("base_img", formData.base_img);
    if (formData.sec_img1) formDataToSend.append("sec_img1", formData.sec_img1);
    if (formData.sec_img2) formDataToSend.append("sec_img2", formData.sec_img2);
    if (formData.sec_img3) formDataToSend.append("sec_img3", formData.sec_img3);
    if (formData.product_vid)
      formDataToSend.append("product_video", formData.product_vid);

    return formDataToSend;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    name === "weight_gms" || name === "weight_ratti" || name === "weight_carat"
      ? setFormData((prev) => ({
          ...prev,
          [name]: Number(value),
        }))
      : setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof ProductFormData
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: e?.target?.files?.[0],
      }));
    }
  };

  // Modified to handle only category selection
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const token = useSelector((state: any) => state.user.accessToken);

  const createProductMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Authentication token is missing");

      const formDataToSend = createFormDataWithFiles();

      const response = await userRequest({
        url: "/product/create-product",
        method: "POST",
        data: formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully!", {
        position: "bottom-right",
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        position: "bottom-right",
        duration: 2000,
      });
    },
  });

  const renderFileInput = (
    fieldName: FileFields,
    label: string,
    accept: string
  ) => (
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
          onRemove={() => handleFileRemove(fieldName)}
        />
      </div>
    </div>
  );

  const handleFileRemove = (fieldName: keyof ProductFormData) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("formData", formData);
    const validationErrors = validateProduct(formData);
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join("\n"), {
        position: "bottom-right",
        duration: 2000,
      });
      return;
    }
    createProductMutation.mutate();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const [lbh, setlbh] = useState("");

  const handlelbhChange = (lbh: any) => {
    setlbh(lbh);
    const dimensions: any = extractDimensions(lbh);

    formData.length = Number(dimensions.length);
    formData.width = Number(dimensions.breadth);
    formData.height = Number(dimensions.height);

    console.log(dimensions.length);
    console.log(dimensions.breadth);
    console.log(dimensions.height);
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
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
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
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
                {renderFileInput("base_img", "Base Image", "image/*")}
                {renderFileInput("sec_img1", "Secondary Image 1", "image/*")}
                {renderFileInput("sec_img2", "Secondary Image 2", "image/*")}
                {renderFileInput("sec_img3", "Secondary Image 3", "image/*")}
                {renderFileInput("product_vid", "Product Video", "video/*")}
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
                <div className="space-y-2">
                  <Label htmlFor="length">Length X Breadth X Height (cm)</Label>
                  <Input
                    id="lbh"
                    name="lbh"
                    type="text"
                    placeholder="Length x Breadth x Height"
                    value={lbh}
                    onChange={(e: any) => handlelbhChange(e.target.value)}
                  />
                </div>
              </div>

              {/* <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input
                    id="length"
                    name="length"
                    type="number"
                    value={formData.length}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    id="width"
                    name="width"
                    type="number"
                    value={formData.width}
                    onChange={handleInputChange}
                  />
                </div>
              </div> */}
            </div>

            {/* Characteristics */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Characteristics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shape">Shape</Label>
                  <Input
                    id="shape"
                    name="shape"
                    value={formData.shape}
                    onChange={handleInputChange}
                    placeholder="Enter shape"
                  />
                </div>
                {/* Changed cut to text input */}
                <div className="space-y-2">
                  <Label htmlFor="cut">Cut</Label>
                  <Input
                    id="cut"
                    name="cut"
                    value={formData.cut}
                    onChange={handleInputChange}
                    placeholder="Enter cut"
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
                    onChange={handlePriceChange}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Sale Price</Label>
                  <Input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    value={formData.sale_price}
                    onChange={handlePriceChange}
                    min="0"
                    step="0.01"
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
                <div className="space-y-2">
                  <Label htmlFor="transparency">Transparency</Label>
                  <Input
                    id="transparency"
                    name="transparency"
                    type="string"
                    value={formData.transparency}
                    onChange={handleInputChange}
                  />
                </div>
                {/* ref_index */}
                <div className="space-y-2">
                  <Label htmlFor="ref_index">Refrective Index</Label>
                  <Input
                    id="ref_index"
                    name="ref_index"
                    type="string"
                    value={formData.ref_index}
                    onChange={handleInputChange}
                  />
                </div>
                {/* hardness */}
                <div className="space-y-2">
                  <Label htmlFor="hardness">Hardness</Label>
                  <Input
                    id="hardness"
                    name="hardness"
                    type="string"
                    value={formData.hardness}
                    onChange={handleInputChange}
                  />
                </div>
                {/* spefic gravity */}
                <div className="space-y-2">
                  <Label htmlFor="sp_gravity">Specific Gravity</Label>
                  <Input
                    id="sp_gravity"
                    name="sp_gravity"
                    type="string"
                    value={formData.sp_gravity}
                    onChange={handleInputChange}
                  />
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="inclusion">Inclusion</Label>
                  <Input
                    id="inclusion"
                    name="inclusion"
                    type="string"
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
                    type="string"
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
                    type="string"
                    value={formData.variety}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Add Product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProductForm;
