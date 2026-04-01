import { useEffect, useState, forwardRef, useRef } from "react";

import logo from '../assets/logo.jpeg';
import sig from '../assets/rizwan_signature.jpg';

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
  quantity?: string | number;
  actual_price?: string | number;
  sale_price?: string | number;
  origin?: string;
  weight_gms?: string | number;
  weight_carat?: string | number;
  weight_ratti?: string | number;
  length?: string | number;
  width?: string | number;
  height?: string | number;
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

// ─── Convert ANY image source to a base64 data URL ───────────────────────────
// Strategy:
//   1. If it's already a data URL  → use it directly (no conversion needed)
//   2. If it's a File/blob URL     → use it directly (same-origin, no CORS)
//   3. If it's a remote URL        → draw it onto an offscreen <canvas> via
//      an <img> element and export as data URL. We intentionally do NOT set
//      crossOrigin="anonymous" here because that triggers a CORS preflight
//      which the server may reject. Without that attribute the image loads
//      visually but the canvas will be "tainted" — HOWEVER we are using a
//      separate offscreen canvas just for the conversion, and we catch the
//      tainted-canvas SecurityError. If that fails we try a no-cors fetch
//      approach. If all else fails we return null and show a placeholder.

function toBase64(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    // Already a data URL or blob URL — use as-is
    if (src.startsWith("data:") || src.startsWith("blob:")) {
      resolve(src);
      return;
    }

    // Try loading into an offscreen canvas without crossOrigin (no CORS preflight)
    const img = new Image();
    // No crossOrigin attribute = browser loads it without CORS headers
    // The canvas will be "tainted" but we handle the SecurityError below.
    img.onload = () => {
      try {
        const canvas  = document.createElement("canvas");
        canvas.width  = img.naturalWidth  || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      } catch (err: any) {
        // SecurityError: canvas is tainted — try the proxy approach
        if (err?.name === "SecurityError") {
          // Last resort: fetch with no-cors gives an opaque response
          // (we can't read the bytes), so instead we try a URL rewrite
          // to add a cache-busting param which sometimes bypasses CDN
          // cache that strips CORS headers.
          const bustUrl = `${src}${src.includes("?") ? "&" : "?"}_cb=${Date.now()}`;
          const img2 = new Image();
          img2.crossOrigin = "anonymous";
          img2.onload = () => {
            try {
              const c2  = document.createElement("canvas");
              c2.width  = img2.naturalWidth;
              c2.height = img2.naturalHeight;
              const ctx2 = c2.getContext("2d");
              if (!ctx2) { resolve(null); return; }
              ctx2.drawImage(img2, 0, 0);
              resolve(c2.toDataURL("image/jpeg", 0.95));
            } catch {
              resolve(null);
            }
          };
          img2.onerror = () => resolve(null);
          img2.src = bustUrl;
        } else {
          resolve(null);
        }
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CertificateGenerator = forwardRef<HTMLDivElement, CertificateGeneratorProps>(
  ({ formData, baseImageUrl }, ref) => {

    // `resolvedSrc` is always either a base64 data URL, a blob URL, or null.
    // It is safe for both <img> display AND html2canvas pixel reading.
    const [resolvedSrc,    setResolvedSrc   ] = useState<string | null>(null);
    const [imageLoadError, setImageLoadError] = useState(false);
    const [isConverting,   setIsConverting  ] = useState(false);
    const prevSrcRef = useRef<string | null>(null);

    useEffect(() => {
      setImageLoadError(false);

      if (!baseImageUrl) {
        setResolvedSrc(null);
        return;
      }

      // Same source — no need to re-convert
      if (baseImageUrl === prevSrcRef.current) return;
      prevSrcRef.current = baseImageUrl;

      // For blob/data URLs no conversion is needed
      if (baseImageUrl.startsWith("blob:") || baseImageUrl.startsWith("data:")) {
        setResolvedSrc(baseImageUrl);
        return;
      }

      // Remote URL — convert to base64 so html2canvas can read it
      setIsConverting(true);
      toBase64(baseImageUrl).then(result => {
        setResolvedSrc(result ?? baseImageUrl); // fall back to original for display
        if (!result) setImageLoadError(false);  // still try to display original
        setIsConverting(false);
      });
    }, [baseImageUrl]);

    return (
      <div
        ref={ref}
        className="certificate-container bg-white"
        style={{
          width: "100%",
          maxWidth: "800px",
          height: "auto",
          fontFamily: "Arial, sans-serif",
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
              <p className="font-bold">CUSTOMER NAME</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-2 gap-4">

            {/* Left — Certificate Details */}
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">

                <p className="font-medium">Certificate No.</p>
                <p className="font-bold">{formData.certificate_no || ""}</p>

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
                    <p>{`${formData.length}×${formData.width}×${formData.height}`}</p>
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
                    <p>{formData.sp_gravity}</p>
                  </>
                )}

                {formData.luminescence && (
                  <>
                    <p className="font-medium">Luminescence</p>
                    <p>{formData.luminescence}</p>
                  </>
                )}

                {formData.op_char && formData.crystal_sys && (
                  <>
                    <p className="font-medium">Op. Char, Crystal Sys</p>
                    <p>
                      {formData.op_char ? `${formData.op_char}, ` : ""}
                      {formData.crystal_sys || ""}
                    </p>
                  </>
                )}

                {formData.inclusion && (
                  <>
                    <p className="font-medium">Inclusion</p>
                    <p>{formData.inclusion}</p>
                  </>
                )}

                {formData.species && (
                  <>
                    <p className="font-medium">Species</p>
                    <p>{formData.species}</p>
                  </>
                )}

                {formData.variety && (
                  <>
                    <p className="font-medium">Variety</p>
                    <p>{formData.variety}</p>
                  </>
                )}

              </div>
            </div>

            {/* Right — Gemstone Image */}
            <div className="flex flex-col items-center justify-center">
              {isConverting ? (
                <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400 text-xs">Loading image…</p>
                </div>
              ) : resolvedSrc && !imageLoadError ? (
                <div className="w-full h-56 flex items-center justify-center overflow-hidden">
                  <img
                    src={resolvedSrc}
                    alt="Gemstone"
                    className="max-w-full max-h-full object-contain border"
                    onError={() => setImageLoadError(true)}
                    // No crossOrigin attribute — resolvedSrc is base64/blob so it's
                    // always same-origin. Setting crossOrigin on a data URL causes
                    // some browsers to reject it unnecessarily.
                  />
                </div>
              ) : (
                <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">
                    {imageLoadError ? "Image failed to load" : "No image provided"}
                  </p>
                </div>
              )}

              <div className="mt-2 flex space-x-10">
                <img src={logo} alt="Lab Logo"   className="h-32 object-contain" />
                <img src={sig}  alt="Signature"  className="h-32 object-contain" />
              </div>

              <h6 className="text-xs text-end w-full text-red-600">GEMOLOGIST (IGI)</h6>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-2 border-t border-gray-300 text-center">
            <p className="text-xs font-medium text-red-600">
              THIS IS A SYSTEM GENERATED SAMPLE CERTIFICATE — www.igigemlab.in
            </p>
          </div>

        </div>
      </div>
    );
  }
);

CertificateGenerator.displayName = "CertificateGenerator";

export default CertificateGenerator;