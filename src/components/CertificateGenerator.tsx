import { useRef, useEffect, useState, forwardRef } from "react";
import html2canvas from "html2canvas";

import logo from '../assets/logo.jpeg'
import sig from '../assets/rizwan_signature.jpg'


interface ProductFormData {
  [key: string]: any;
  base_img?: File | null;
  sec_img1?: File | null;
  sec_img2?: File | null;
  sec_img3?: File | null;
  product_vid?: File | null;
  base_img_url?: string | null;
  sec_img1_url?: string | null;
  sec_img2_url?: string | null;
  sec_img3_url?: string | null;
  product_vid_url?: string | null;
  cert_img_url?: string;
  name?: string;
  description?: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  quantity?: string | number; // Accept both string and number
  actual_price?: string | number; // Accept both string and number
  sale_price?: string | number; // Accept both string and number
  origin?: string;
  weight_gms?: string | number; // Accept both string and number
  weight_carat?: string | number; // Accept both string and number
  weight_ratti?: string | number; // Accept both string and number
  length?: string | number; // Accept both string and number
  width?: string | number; // Accept both string and number
  height?: string | number; // Accept both string and number
  shape?: string;
  cut?: string;
  treatment?: string;
  composition?: string;
  certification?: string;
  color?: string;
  status?: string;
  certificate_no?: string;
  luminescence?: string;
  op_char?: string;
  crystal_sys?: string;
  shape_cut?: string;
  transparency?: string;
  ref_index?: string;
  hardness?: string;
  sp_gravity?: string;
  inclusion?: string;
  species?: string;
  variety?: string;
  other_chars?: string;
  visual_chars?: string;
}

interface CertificateGeneratorProps {
  formData: ProductFormData;
  baseImageUrl: string | null;
  key?: string;
}

export const CertificateGenerator = forwardRef<HTMLDivElement, CertificateGeneratorProps>(({
  formData,
  baseImageUrl
}, ref) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [imageLoadError, setImageLoadError] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState(baseImageUrl)
  const generateCertificateImage = async (): Promise<string | null> => {
    if (!certificateRef.current) return null;


    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      const dataUrl = canvas.toDataURL("image/png");
      return dataUrl;
    } catch (error) {
      console.error("Error generating certificate:", error);
      return null;
    }
  };

  useEffect(() => {
    setCurrentImageUrl(baseImageUrl)
    setImageLoadError(false)
  }, [baseImageUrl])

  const handleImageError = () => {
    setImageLoadError(true)
  }


  useEffect(() => {
    generateCertificateImage();
  }, [formData, baseImageUrl]);

  return (
    <div
      ref={ref}
      className="certificate-container bg-white"
      style={{
        width: '100%',
        maxWidth: '800px',
        height: 'auto',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div className="border-2 border-red-600 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-red-600">IGI-GEM TESTING LABORATORY</h1>
            <p className="text-xs">A venture by alumni of IGI</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{'CUSTOMER NAME'}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column - Certificate Details */}
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <p className="font-medium">Certificate No.</p>
              <p className="font-bold">{formData.certificate_no || ''}</p>

              {formData.weight_ratti && (
                <>
                  <p className="font-medium">Weight</p>
                  <p>{`${formData.weight_ratti} RATTI`}</p>
                </>
              )}

              {formData.shape_cut && (
                <>
                  <p className="font-medium">Shape and Cut</p>
                  <p>{formData.shape_cut}</p>
                </>
              )}
              {formData.color && (
                <>
                  <p className="font-medium">Colour</p>
                  <p>{formData.color}</p>
                </>
              )}

              {formData.transparency && (
                <>
                  <p className="font-medium">Transparency</p>
                  <p>{formData.transparency}</p>
                </>
              )}

              {formData.length && formData.width && formData.height && (
                <>
                  <p className="font-medium">Dimension (L.B.H.in mm)</p>
                  <p>
                    {`${formData.length.toString()}×${formData.width.toString()}×${formData.height.toString()}`}
                  </p>
                </>
              )}

              {formData.ref_index && (
                <>
                  <p className="font-medium">Ref. Index</p>
                  <p>{formData.ref_index}</p>
                </>
              )}

              {formData.hardness && (
                <>
                  <p className="font-medium">Hardness</p>
                  <p>{formData.hardness}</p>
                </>
              )}

              {formData.sp_gravity && (

                <>
                  <p className="font-medium">SP. Gravity</p>
                  <p>{formData.sp_gravity || ''}</p>
                </>

              )}

              {formData.luminescence && (

                <>

                  <p className="font-medium">Luminescence</p>
                  <p>{formData.luminescence || ''}</p>

                </>

              )}

              {formData.op_char && formData.crystal_sys && (

                <>
                  <p className="font-medium">Op. Char, Crystal Sys</p>
                  <p>
                    {formData.op_char ? `${formData.op_char}, ` : ''}
                    {formData.crystal_sys || ''}
                  </p>
                </>

              )}


              {formData.inclusion && (

                <>

                  <p className="font-medium">Inclusion</p>
                  <p>{formData.inclusion || ''}</p>
                </>

              )}

              {formData.species && (

                <>
                  <p className="font-medium">Species</p>
                  <p>{formData.species || ''}</p>
                </>

              )}
              {formData.variety && (

                <>
                  <p className="font-medium">Variety</p>
                  <p>{formData.variety || ''}</p>
                </>

              )}
            </div>
          </div>

          {/* Right Column - Gemstone Image */}

          <div className="flex flex-col items-center justify-center">
            {currentImageUrl && !imageLoadError ? (
              <div className="w-full h-56 flex items-center justify-center overflow-hidden">
                <img
                  src={currentImageUrl}
                  alt="Gemstone"
                  className="max-w-full max-h-full object-contain border"
                  onError={handleImageError}
                  crossOrigin="anonymous"
                />
              </div>
            ) : (
              <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">
                  {imageLoadError ? 'Image failed to load' : 'Gemstone image'}
                </p>
              </div>
            )}
            <div className="mt-2 flex space-x-10">
              <img
                src={logo}
                alt="Ratna Kuthi Logo"
                className="h-32 object-contain"
              />

              <img
                src={sig}
                alt="Ratna Kuthi Logo"
                className="h-32 object-contain"
              />


            </div>
            <h6 className=" text-xs text-end  w-full text-red-600">GEMOLOGIST(IGI)</h6> 

          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-gray-300 text-center">
          <p className="text-xs font-medium text-red-600">
            THIS IS A SYSTEM GENERATED SAMPLE CERTIFICATE - www.igigemlab.in
          </p>
        </div>
      </div>
    </div>
  );
}
);

CertificateGenerator.displayName = 'CertificateGenerator';

export default CertificateGenerator;