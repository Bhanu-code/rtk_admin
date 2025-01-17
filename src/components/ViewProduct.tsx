import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { userRequest } from '@/utils/requestMethods';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Button } from "./ui/button";
import { useState } from 'react';
import { X } from 'lucide-react';

const ViewProduct = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(null);

  // Function to handle empty or null values
  const formatValue = (value) => {
    if (value === null || value === undefined || value === '' || value === 'null') {
      return '--│--';
    }
    return value;
  };

  // Image modal component
  const ImageModal = ({ imageUrl, onClose }) => (
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
          onError={(e) => {
            e.target.src = '/placeholder-image.png';  // Add a placeholder image to your assets
            e.target.alt = 'Image not available';
          }}
        />
      </div>
    </div>
  );

  // Product data fetch
  const { data: product } = useQuery(["get-product", id], () => 
    userRequest({
      url: `/product/get-product/${id}`,
      method: "get",
    })
  );

  // Image component with error handling
  const ProductImage = ({ src, alt, className }) => (
    <div 
      className={`relative cursor-pointer hover:opacity-90 transition-opacity ${className}`}
      onClick={() => src && setSelectedImage(src)}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="size-56 object-contain rounded"
          onError={(e) => {
            e.target.src = '/placeholder-image.png';
            e.target.alt = 'Image not available';
          }}
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          Image not available
        </div>
      )}
    </div>
  );

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
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="space-y-2">
                <Label>Product Name:</Label>
                <p>{formatValue(product?.data?.product?.name)}</p>
              </div>
              <div className="space-y-2">
                <Label>Category:</Label>
                <p>{formatValue(product?.data?.product?.category)}</p>
              </div>
              <div className="space-y-2">
                <Label>Description:</Label>
                <p>{formatValue(product?.data?.product?.description)}</p>
              </div>
            </div>

            {/* Images and Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Images and Media</h3>
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={product?.data?.product?.base_img_url} 
                  className="size-80"
                  alt="Base Image" 
                />
                {/* <ProductImage 
                  src={product?.data?.product?.cert_img_url} 
                  alt="Certificate Image" 
                /> */}
              </div>
              <div className="grid grid-cols-3  gap-4 mt-4">
                <ProductImage 
                  src={product?.data?.product?.sec_img1_url} 
                  alt="Secondary Image 1" 
                />
                <ProductImage 
                  src={product?.data?.product?.sec_img2_url} 
                  alt="Secondary Image 2" 
                />
                <ProductImage 
                  src={product?.data?.product?.sec_img3_url} 
                  alt="Secondary Image 3" 
                />
              </div>
              
              {/* Video Section */}
              <div className="mt-4">
                <Label>Product Video:</Label>
                {product?.data?.product?.product_vid_url ? (
                  <div className="mt-2 rounded overflow-hidden">
                    <video 
                      controls 
                      className="m-auto w-full "
                      poster="/video-thumbnail.png"  // Add a thumbnail image to your assets
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
            </div>

            {/* Physical Properties */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Physical Properties</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Weight (gms):</Label>
                  <p>{formatValue(product?.data?.attribute?.weight_gms)}</p>
                </div>
                <div>
                  <Label>Weight (carat):</Label>
                  <p>{formatValue(product?.data?.attribute?.weight_carat)}</p>
                </div>
                <div>
                  <Label>Weight (ratti):</Label>
                  <p>{formatValue(product?.data?.attribute?.weight_ratti)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Length:</Label>
                  <p>{formatValue(product?.data?.attribute?.length)} {product?.data?.attribute?.length ? 'cm' : ''}</p>
                </div>
                <div>
                  <Label>Width:</Label>
                  <p>{formatValue(product?.data?.attribute?.width)} {product?.data?.attribute?.width ? 'cm' : ''}</p>
                </div>
              </div>
            </div>

            {/* Characteristics */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Characteristics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Shape:</Label>
                  <p>{formatValue(product?.data?.attribute?.shape)}</p>
                </div>
                <div>
                  <Label>Cut:</Label>
                  <p>{formatValue(product?.data?.attribute?.cut)}</p>
                </div>
                <div>
                  <Label>Color:</Label>
                  <p>{formatValue(product?.data?.attribute?.color)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Treatment:</Label>
                  <p>{formatValue(product?.data?.attribute?.treatment)}</p>
                </div>
                <div>
                  <Label>Composition:</Label>
                  <p>{formatValue(product?.data?.attribute?.composition)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Certification:</Label>
                <p>{formatValue(product?.data?.attribute?.certification)}</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Actual Price:</Label>
                  <p>${formatValue(product?.data?.product?.actual_price)}</p>
                </div>
                <div>
                  <Label>Sale Price:</Label>
                  <p>${formatValue(product?.data?.product?.sale_price)}</p>
                </div>
                <div>
                  <Label>Quantity:</Label>
                  <p>{formatValue(product?.data?.product?.quantity)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewProduct;