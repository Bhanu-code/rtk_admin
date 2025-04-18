import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { userRequest } from '@/utils/requestMethods';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { Button } from "./ui/button";
import { useState } from 'react';
import { X } from 'lucide-react';
import ConfirmDelete from "./ConfirmDelete";
import { toast } from "sonner";

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

const ViewProduct = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Function to handle empty or null values
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '' || value === 'null') {
      return '--│--';
    }
    return String(value);
  };

  // Format price with currency
  const formatPrice = (value: unknown): string => {
    if (value === null || value === undefined || value === '' || value === 'null') {
      return '--│--';
    }
    return `$${Number(value).toFixed(2)}`;
  };

  // Format dimensions
  const formatDimensions = (length: number, width: number, height: number): string => {
    if (!length && !width && !height) return '--│--';
    return `${length || 0} x ${width || 0} x ${height || 0} mm`;
  };

  // Image modal component
  const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative max-w-4xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <img
          src={imageUrl}
          alt="Full size"
          className="w-full h-auto rounded-lg"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const img = e.currentTarget;
            img.src = '/placeholder-image.png';
            img.alt = 'Image not available';
          }}
        />
      </div>
    </div>
  );

  // Product data fetch
  const { data: product, isLoading } = useQuery(["get-product", id], () =>
    userRequest({
      url: `/product/get-product/${id}`,
      method: "get",
    })
  );

  const navigateTo = useNavigate();

  const deleteProductMethod = () => {
    return userRequest({
      url: `/product/delete-product/${id}`,
      method: "delete",
    });
  };

  const { mutate: deleteProduct, isLoading: isDeleting } = useMutation(
    "delete-product",
    deleteProductMethod,
    {
      onSuccess: (response: any) => {
        if (response?.status !== 200) {
          toast.error("Error Deleting!", {
            position: "bottom-right",
            duration: 2000,
          });
          return;
        }
        toast.success("Deleted!", { position: "bottom-right", duration: 2000 });
        navigateTo("/home/products");
      },
      onError: (error: any) => {
        console.log(error);
      },
    }
  );

  // Image component with error handling
  const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className }) => (
    <div
      className={`relative cursor-pointer hover:opacity-90 transition-opacity ${className}`}
      onClick={() => src && setSelectedImage(src)}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="size-56 object-contain rounded"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const img = e.currentTarget;
            img.src = '/placeholder-image.png';
            img.alt = 'Image not available';
          }}
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          Image not available
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mb-10 p-6">
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <div className="w-full flex flex-end">
        <Link to={`/home/products/edit/${id}`} className="ml-auto">
          <Button className="bg-blue-600 px-3 py-1 text-white rounded-lg hover:bg-blue-500">
            Edit Product
          </Button>
        </Link>
      </div>

      <br />

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <Label htmlFor="status" className="font-medium">
                  Product Status
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${product?.data?.product?.status === 'Public'
                  ? 'bg-green-100 text-green-800'
                  : product?.data?.product?.status === 'Feature'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  {product?.data?.product?.status}
                </span>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.product?.name)}</p>
                </div>
                <div className="space-y-2">
                  <Label>SKU Code:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.product?.sku)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Category:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.product?.category)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Sub-Category:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.product?.subcategory)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description:</Label>
                <p className="text-gray-700 whitespace-pre-line">{formatValue(product?.data?.product?.description)}</p>
              </div>
            </div>

            {/* Images and Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Images and Media</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Base Image:</Label>
                  <ProductImage
                    src={product?.data?.product?.base_img_url}
                    alt="Base Image"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Secondary Image 1:</Label>
                  <ProductImage
                    src={product?.data?.product?.sec_img1_url}
                    alt="Secondary Image 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Image 2:</Label>
                  <ProductImage
                    src={product?.data?.product?.sec_img2_url}
                    alt="Secondary Image 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Image 3:</Label>
                  <ProductImage
                    src={product?.data?.product?.sec_img3_url}
                    alt="Secondary Image 3"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label>Product GIF:</Label>
                {product?.data?.product?.product_gif_url ? (
                  <div className="mt-2">
                    <img
                      src={product.data.product.product_gif_url}
                      alt="Product GIF"
                      className="max-w-lg w-72 h-auto rounded"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        const img = e.currentTarget;
                        img.src = '/placeholder-image.png';
                        img.alt = 'GIF not available';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                    GIF not available
                  </div>
                )}
              </div>

              {/* Video Section */}
              <div className="mt-4 space-y-4">
                <Label>Product Videos:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mt-4 space-y-2">
                    <Label>Product Video:</Label>
                    {product?.data?.product?.product_vid_url ? (
                      <div className="mt-2 rounded overflow-hidden">
                        <video
                          controls
                          className="m-auto w-full max-w-lg"
                          poster="/video-thumbnail.png"
                        >
                          <source
                            src={product.data.product.product_vid_url}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <div className="mt-2 w-full h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Video not available
                      </div>
                    )}
                  </div>

                  
                  <div className="space-y-2">
                    <Label>Video 2:</Label>
                    {product?.data?.product?.product_video2_url ? (
                      <div className="mt-2 rounded overflow-hidden">
                        <video
                          controls
                          className="m-auto w-full max-w-lg"
                          poster="/video-thumbnail.png"
                        >
                          <source
                            src={product.data.product.product_video2_url}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Video not available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Certificate Fields</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Certificate No:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.certificate_no)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Weight (ratti):</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.weight_ratti)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Shape & Cut:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.shape_cut)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Color:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.color)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Transparency:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.transparency)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Dimensions:</Label>
                  <p className="text-gray-700">
                    {formatDimensions(
                      product?.data?.attribute?.length,
                      product?.data?.attribute?.width,
                      product?.data?.attribute?.height
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Refractive Index:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.ref_index)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Hardness:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.hardness)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Specific Gravity:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.sp_gravity)}</p>
                </div>
                {/* <div className="space-y-2">
                  <Label>Luminescence:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.luminescence)}</p>
                </div> */}
                {/* <div className="space-y-2">
                  <Label>Optical Characteristics:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.op_char)}</p>
                </div> */}
                {/* <div className="space-y-2">
                  <Label>Crystal System:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.crystal_sys)}</p>
                </div> */}
                <div className="space-y-2">
                  <Label>Inclusion:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.inclusion)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Species:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.species)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Variety:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.variety)}</p>
                </div>
              </div>
            </div>

            {/* Physical Properties */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Physical Properties</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Weight (gms):</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.weight_gms)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Weight (carat):</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.weight_carat)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Weight (ratti):</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.weight_ratti)}</p>
                </div>
              </div>
            </div>

            {/* Characteristics */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Characteristics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Origin:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.origin)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Treatment:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.treatment)}</p>
                </div>
                {/* <div className="space-y-2">
                  <Label>Composition:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.composition)}</p>
                </div> */}
                <div className="space-y-2">
                  <Label>Certification:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.certification)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Other Characteristics:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.other_chars)}</p>
                </div>
                {/* <div className="space-y-2">
                  <Label>Visual Characteristics:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.attribute?.visual_chars)}</p>
                </div> */}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Actual Price:</Label>
                  <p className="text-gray-700">{formatPrice(product?.data?.product?.actual_price)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Sale Price:</Label>
                  <p className="text-gray-700">{formatPrice(product?.data?.product?.sale_price)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Quantity:</Label>
                  <p className="text-gray-700">{formatValue(product?.data?.product?.quantity)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="danger-zone my-5">
        {isDeleting ? (
          <span className="text-red-500">Deleting...</span>
        ) : (
          <ConfirmDelete onConfirm={deleteProduct} />
        )}
      </div>
    </div>
  );
};

export default ViewProduct;