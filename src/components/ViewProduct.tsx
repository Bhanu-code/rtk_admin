
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { userRequest } from '@/utils/requestMethods';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Button } from "./ui/button";

// interface ProductDetailsProps {
//   product: {
//     base_img_url: string;
//     sec_img1_url: string;
//     sec_img2_url: string;
//     sec_img3_url: string;
//     product_vid_url: string;
//     cert_img_url: string;
//     name: string;
//     description: string | null;
//     category: string;
//     subcategory: string;
//     quantity: number;
//     actual_price: number;
//     sale_price: number;
//     origin: string;
//     weight_gms: number;
//     weight_carat: number;
//     weight_ratti: number;
//     length: number;
//     width: number;
//     shape: string;
//     cut: string;
//     treatment: string;
//     composition: string;
//     certification: string;
//     color: string;
//   };
// }

const ViewProduct = () => {
    const { id } = useParams()

    const getProductMethod = () => {
          return userRequest({
            url: `/product/get-product/${id}`,
            method: "get",
          });
        };
      
        const { data: product } = useQuery("get-product", getProductMethod, {
          onSuccess: () => {
            console.log(product);
          },
          onError: (error: any) => {
            console.log(error);
          },
        });

  return (
    <div className="container mx-auto mb-10 p-6">
        <div className="w-full flex flex-end">
            <Link to={`/home/products/edit/${id}`} className="ml-auto">
            <Button className="bg-blue-600 px-3 py-1 text-white rounded-lg hover:bg-blue-500">Edit Product</Button>
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
                <p>{product?.data?.product.name}</p>
              </div>
              <div className="space-y-2">
                <Label>Category:</Label>
                <p>{product?.data?.product.category}</p>
              </div>
              <div className="space-y-2">
                <Label>Description:</Label>
                <p>{product?.data?.product.description || "N/A"}</p>
              </div>
            </div>

            {/* Images and Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Images and Media</h3>
              <div className="grid grid-cols-2 gap-4">
                <img src={product?.data?.product.base_img_url} alt="Base Image" className="rounded" />
                <img src={product?.data?.product.cert_img_url} alt="Certificate Image" className="rounded" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <img src={product?.data?.product.sec_img1_url} alt="Secondary Image 1" className="rounded" />
                <img src={product?.data?.product.sec_img2_url} alt="Secondary Image 2" className="rounded" />
                <img src={product?.data?.product.sec_img3_url} alt="Secondary Image 3" className="rounded" />
              </div>
              {product?.data?.product.product_vid_url && (
                <div className="mt-4">
                  <Label>Product Video:</Label>
                  <video controls className="w-full mt-2">
                    <source src={product?.data?.product.product_vid_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            {/* Physical Properties */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Physical Properties</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Weight (gms):</Label>
                  <p>{product?.data?.attribute?.weight_gms}</p>
                </div>
                <div>
                  <Label>Weight (carat):</Label>
                  <p>{product?.data?.attribute?.weight_carat}</p>
                </div>
                <div>
                  <Label>Weight (ratti):</Label>
                  <p>{product?.data?.attribute?.weight_ratti}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Length:</Label>
                  <p>{product?.data?.attribute?.length} cm</p>
                </div>
                <div>
                  <Label>Width:</Label>
                  <p>{product?.data?.attribute?.width} cm</p>
                </div>
              </div>
            </div>

            {/* Characteristics */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Characteristics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Shape:</Label>
                  <p>{product?.data?.attribute?.shape}</p>
                </div>
                <div>
                  <Label>Cut:</Label>
                  <p>{product?.data?.attribute?.cut}</p>
                </div>
                <div>
                  <Label>Color:</Label>
                  <p>{product?.data?.attribute?.color}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Treatment:</Label>
                  <p>{product?.data?.attribute?.treatment}</p>
                </div>
                <div>
                  <Label>Composition:</Label>
                  <p>{product?.data?.attribute?.composition}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Certification:</Label>
                <p>{product?.data?.attribute?.certification}</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Actual Price:</Label>
                  <p>${product?.data?.product?.actual_price}</p>
                </div>
                <div>
                  <Label>Sale Price:</Label>
                  <p>${product?.data?.product?.sale_price}</p>
                </div>
                <div>
                  <Label>Quantity:</Label>
                  <p>{product?.data?.product?.quantity}</p>
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
