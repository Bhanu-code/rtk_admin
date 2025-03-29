import React, { useRef, useEffect, useState, forwardRef } from "react";
import html2canvas from "html2canvas";

import logo from '../assets/logo.jpeg'

interface CertificateGeneratorProps {
  formData: ProductFormData;
  baseImageUrl: string | null;
}

export const CertificateGenerator = forwardRef<HTMLDivElement, CertificateGeneratorProps>(({
  formData,
  baseImageUrl
}, ref) => {
  const certificateRef = useRef<HTMLDivElement>(null);

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
            <p className="font-bold">{formData.name || 'Shree Lekha'}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column - Certificate Details */}
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <p className="font-medium">Certificate No.</p>
              <p className="font-bold">{formData.certificate_no || 'GEM-72805'}</p>

              <p className="font-medium">Weight</p>
              <p>{formData.weight_ratti ? `${formData.weight_ratti} RATTI` : '7 RATTI'}</p>

              <p className="font-medium">Shape and Cut</p>
              <p>{formData.shape_cut || 'Cabochon Cut'}</p>

              <p className="font-medium">Colour</p>
              <p>{formData.color || 'Whitish'}</p>

              <p className="font-medium">Transparency</p>
              <p>{formData.transparency || 'Opaque'}</p>

              <p className="font-medium">Dimension (L.B.H.in mm)</p>
              <p>
                {formData.length && formData.width && formData.height
                  ? `${formData.length.toFixed(2)}×${formData.width.toFixed(2)}×${formData.height.toFixed(2)}`
                  : '17.36×12.17×6.70'}
              </p>

              <p className="font-medium">Ref. Index</p>
              <p>{formData.ref_index || '1.45'}</p>

              <p className="font-medium">Hardness</p>
              <p>{formData.hardness || '5 to 6(1/2)'}</p>

              <p className="font-medium">SP. Gravity</p>
              <p>{formData.sp_gravity || '2.15; 0.08, -0.90'}</p>

              <p className="font-medium">Luminescence</p>
              <p>{formData.luminescence || 'LW&SW- Inert to strong'}</p>

              <p className="font-medium">Op. Char, Crystal Sys</p>
              <p>
                {formData.op_char ? `${formData.op_char}, ` : 'SR, '}
                {formData.crystal_sys || 'Amorphous'}
              </p>

              <p className="font-medium">Inclusion</p>
              <p>{formData.inclusion || 'NATURAL INCLUSION'}</p>

              <p className="font-medium">Species</p>
              <p>{formData.species || 'OPAL'}</p>

              <p className="font-medium">Variety</p>
              <p>{formData.variety || 'NATURAL OPAL'}</p>
            </div>
          </div>

          {/* Right Column - Gemstone Image */}
          <div className="flex flex-col items-center justify-center">
            {baseImageUrl ? (
              <img
                src={baseImageUrl}
                alt="Gemstone"
                className="w-full h-auto max-h-56 object-contain border"
              />
            ) : (
              <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Gemstone image</p>
              </div>
            )}
            <div className="mt-2">
              <img
                src={logo}
                alt="Ratna Kuthi Logo"
                className="h-32 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-gray-300 text-center">
          <p className="text-xs font-medium text-red-600">
            VERIFY YOUR REPORT ONLINE - www.igigemlab.in
          </p>
        </div>
      </div>
    </div>
  );
}
);

CertificateGenerator.displayName = 'CertificateGenerator';

export default CertificateGenerator;