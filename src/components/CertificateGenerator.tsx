import { useEffect, useRef, useState, forwardRef } from "react";
import logo from '../assets/logo.jpeg';
import sig  from '../assets/rizwan_signature.jpg';

interface ProductFormData {
  [key: string]: any;
  name?: string;
  certificate_no?: string;
  weight_ratti?: string | number;
  shape_cut?: string;
  color?: string;
  transparency?: string;
  length?: string | number;
  width?: string | number;
  height?: string | number;
  ref_index?: string;
  hardness?: string;
  sp_gravity?: string;
  luminescence?: string;
  op_char?: string;
  crystal_sys?: string;
  inclusion?: string;
  species?: string;
  variety?: string;
}

interface CertificateGeneratorProps {
  formData: ProductFormData;
  baseImageUrl: string | null;
}

// ─── Convert remote/blob URL → base64 so html2canvas can read pixels ─────────
function toBase64(src: string): Promise<string | null> {
  return new Promise(resolve => {
    if (!src) { resolve(null); return; }
    if (src.startsWith("data:") || src.startsWith("blob:")) { resolve(src); return; }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext("2d")!.drawImage(img, 0, 0);
        resolve(c.toDataURL("image/jpeg", 0.95));
      } catch { resolve(src); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ─── Single certificate row ───────────────────────────────────────────────────
const Row = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", padding: "3px 0", fontSize: "11px", lineHeight: "1.4" }}>
      <span style={{ minWidth: "140px", color: "#333", fontWeight: 500 }}>{label}</span>
      <span style={{ marginRight: "4px", color: "#333" }}>:</span>
      <span style={{ color: "#c00", fontWeight: 600, flex: 1 }}>{value}</span>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export const CertificateGenerator = forwardRef<HTMLDivElement, CertificateGeneratorProps>(
  ({ formData, baseImageUrl }, ref) => {
    const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
    const prevSrcRef = useRef<string | null>(null);

    useEffect(() => {
      if (!baseImageUrl) { setResolvedSrc(null); return; }
      if (baseImageUrl === prevSrcRef.current) return;
      prevSrcRef.current = baseImageUrl;
      if (baseImageUrl.startsWith("blob:") || baseImageUrl.startsWith("data:")) {
        setResolvedSrc(baseImageUrl); return;
      }
      toBase64(baseImageUrl).then(r => setResolvedSrc(r ?? baseImageUrl));
    }, [baseImageUrl]);

    const fd = formData;

    const dimensionStr =
      fd.length && fd.width && fd.height
        ? `${fd.length}x${fd.width}x${fd.height}`
        : null;

    const opCharStr =
      fd.op_char || fd.crystal_sys
        ? [fd.op_char, fd.crystal_sys].filter(Boolean).join(", ")
        : null;

    return (
      <div
        ref={ref}
        style={{
          width: "100%",
          maxWidth: "720px",
          fontFamily: "Arial, Helvetica, sans-serif",
          background: "#fff",
          border: "2.5px solid #c00",
          boxSizing: "border-box",
          padding: "0",
          overflow: "hidden",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          borderBottom: "2px solid #c00", padding: "8px 12px",
          background: "#fff",
        }}>
          {/* Left: logo area + lab name */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src={logo} alt="Logo" style={{ height: "48px", width: "48px", objectFit: "contain", borderRadius: "4px" }} />
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#c00", letterSpacing: "0.5px", lineHeight: 1.2 }}>
                IGI-GEM TESTING LABORATORY
              </div>
              <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>
                A venture by alumni of IGI
              </div>
            </div>
          </div>
          {/* Right: customer name placeholder */}
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#333", textAlign: "right", alignSelf: "center" }}>
            {fd.name || "CUSTOMER NAME"}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "0", minHeight: "280px" }}>

          {/* Left column — field table */}
          <div style={{
            flex: "1 1 55%", padding: "10px 12px",
            borderRight: "1.5px solid #e0e0e0",
          }}>
            <Row label="Certificate No."          value={fd.certificate_no} />
            <Row label="Weight"                   value={fd.weight_ratti ? `${fd.weight_ratti} RATTI` : null} />
            <Row label="Shape and Cut"             value={fd.shape_cut} />
            <Row label="Colour"                   value={fd.color} />
            <Row label="Transparency"              value={fd.transparency} />
            <Row label="Dimension (L.B.H in mm)"  value={dimensionStr} />
            <Row label="Ref. Index"               value={fd.ref_index} />
            <Row label="Hardness"                 value={fd.hardness} />
            <Row label="SP. Gravity"              value={fd.sp_gravity} />
            <Row label="Luminescence"             value={fd.luminescence} />
            <Row label="Op. Char, Crystal Sys"    value={opCharStr} />
            <Row label="Inclusion"                value={fd.inclusion} />
            <Row label="Species"                  value={fd.species} />
            <Row label="Variety"                  value={fd.variety} />
          </div>

          {/* Right column — gemstone image + logos */}
          <div style={{
            flex: "1 1 45%", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px", gap: "8px",
          }}>
            {/* Ratna Kuthi logo top-right */}
            <div style={{ alignSelf: "flex-end" }}>
              <img src={logo} alt="Ratna Kuthi" style={{ height: "36px", objectFit: "contain" }} />
            </div>

            {/* Gemstone image */}
            <div style={{
              width: "100%", flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", minHeight: "160px",
            }}>
              {resolvedSrc ? (
                <img
                  src={resolvedSrc}
                  alt="Gemstone"
                  style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                />
              ) : (
                <div style={{
                  width: "160px", height: "160px", background: "#f0f0f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#aaa", fontSize: "12px", borderRadius: "4px",
                }}>No image</div>
              )}
            </div>

            {/* Signature bottom-right */}
            <div style={{ alignSelf: "flex-end", textAlign: "right" }}>
              <img src={sig} alt="Signature" style={{ height: "52px", objectFit: "contain" }} />
              <div style={{ fontSize: "9px", color: "#c00", marginTop: "2px", fontWeight: 600 }}>
                GEMOLOGIST (IGI)
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div style={{
          background: "#c00", padding: "5px 12px",
          textAlign: "center",
        }}>
          <span style={{ color: "#fff", fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px" }}>
            VERIFY YOUR REPORT ONLINE — www.igigemlab.in
          </span>
        </div>
      </div>
    );
  }
);

CertificateGenerator.displayName = "CertificateGenerator";
export default CertificateGenerator;