import React, { useEffect, useRef, useState } from "react";
import { CertificateGenerator } from "../components/CertificateGenerator";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { userRequest } from "@/utils/requestMethods";
import { useSelector } from "react-redux";
import { gemstoneProperties } from "@/utils/constants";
import html2canvas from "html2canvas";
import { ClipLoader } from "react-spinners";
import {
  X, Upload, ChevronDown,
  Info, Image as ImageIcon, Award, DollarSign, CheckCircle,
  Gem, Percent, Hash,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImageFieldName = "base_img" | "sec_img1" | "sec_img2" | "product_vid" | "product_vid2" | "product_gif";

interface GemstoneApiResponse {
  name: string;
  alternateNames?: string[] | string;
}

interface ProductFormData {
  [key: string]: any;
  base_img: File | null;
  sec_img1: File | null;
  sec_img2: File | null;
  sec_img3: File | null;
  product_vid: File | null;
  product_vid2: File | null;
  product_gif: File | null;
  cert_img_url: string;
  unit_price: string;
  name: string;
  description: string;
  sku_code: string;
  category: string;
  subcategory?: string;
  gemstone_name: string;
  quantity: string;
  actual_price: string;
  sale_price: string;
  origin: string;
  weight_gms: string;
  weight_carat: string;
  weight_ratti: string;
  length: string;
  width: string;
  height: string;
  shape: string;
  cut: string;
  treatment: string;
  certification: string;
  color: string;
  status: string;
  certificate_no: string;
  shape_cut: string;
  transparency: string;
  ref_index: string;
  hardness: string;
  sp_gravity: string;
  inclusion: string;
  species: string;
  variety: string;
  other_chars: string;
  // UI-only — stripped before API call
  discount_type: "amount" | "percentage";
  discount_value: string;
}

// ─── Gemstone master list with SKU prefixes ───────────────────────────────────

const GEMSTONE_SKU_MAP: Record<string, string> = {
  Emerald:     "EMR", Ruby:        "RUB", Sapphire:    "SAP",
  Diamond:     "DMD", Zircon:      "ZIR", Pearl:       "PRL",
  Topaz:       "TPZ", Amethyst:    "AMT", Opal:        "OPL",
  Aquamarine:  "AQM", Garnet:      "GRN", Turquoise:   "TRQ",
  Peridot:     "PRD", Tanzanite:   "TNZ", Alexandrite: "ALX",
  Spinel:      "SPN", Citrine:     "CTR", Moonstone:   "MST",
  Labradorite: "LBR", Morganite:   "MRG",
};

const GEMSTONE_COLORS: Record<string, string> = {
  Emerald:     "#10b981", Ruby:        "#ef4444", Sapphire:    "#3b82f6",
  Diamond:     "#cbd5e1", Zircon:      "#8b5cf6", Pearl:       "#f1f5f9",
  Topaz:       "#f59e0b", Amethyst:    "#a855f7", Opal:        "#06b6d4",
  Aquamarine:  "#22d3ee", Garnet:      "#dc2626", Turquoise:   "#14b8a6",
  Peridot:     "#84cc16", Tanzanite:   "#7c3aed", Alexandrite: "#059669",
  Spinel:      "#f43f5e", Citrine:     "#eab308", Moonstone:   "#94a3b8",
  Labradorite: "#6366f1", Morganite:   "#fb7185",
};

// ─── Weight conversion helpers ────────────────────────────────────────────────
// 1 carat = 0.2 g  |  1 carat = 0.9114 ratti
const caratToGrams = (c: number) => +(c * 0.2).toFixed(4);
const caratToRatti = (c: number) => +(c * 0.9114).toFixed(4);

const buildSku = (prefix: string, existing: string): string => {
  const seq = existing.match(/(\d+)$/)?.[1] ?? "001";
  return `${prefix}-${seq}`;
};

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-white/5 border border-white/5 text-slate-200 placeholder:text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed read-only:bg-white/[0.02] read-only:text-slate-500";
const labelCls = "text-xs font-medium text-slate-400 mb-1.5 block";
const selectCls =
  "w-full appearance-none bg-white/5 border border-white/5 text-slate-300 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer";
const sectionTitle =
  "text-sm font-semibold text-slate-300 mb-4 pb-2 border-b border-white/5";

const TABS = [
  { id: "basic",       label: "Basic Info",  icon: Info       },
  { id: "media",       label: "Media",       icon: ImageIcon  },
  { id: "certificate", label: "Certificate", icon: Award      },
  { id: "pricing",     label: "Pricing",     icon: DollarSign },
];

const JEWELRY_SUBCATEGORIES = [
  "Rings", "Necklaces", "Bracelets", "Earrings", "Pendants",
  "Bangles", "Anklets", "Brooches", "Chains", "Charms",
];

const GEMSTONE_SUBCATEGORIES = [
  "2-5 carats", "5-6 carats", "7-9 carats", "10-12 carats", "12-15 carats",
];

// ─── FilePreview ──────────────────────────────────────────────────────────────

const FilePreview = ({ file, onRemove }: { file: File | null; onRemove: () => void }) => {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!(file instanceof File)) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  if (!preview) return null;
  const isVideo = file?.type?.startsWith("video/");
  return (
    <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 group">
      {isVideo
        ? <video src={preview} controls className="w-full h-32 object-contain bg-slate-950" />
        : <img src={preview} alt="Preview" className="w-full h-32 object-cover bg-slate-950" />
      }
      <button type="button" onClick={onRemove}
        className="absolute top-1.5 right-1.5 h-6 w-6 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
      ><X className="h-3 w-3 text-white" /></button>
    </div>
  );
};

// ─── FileSlot ─────────────────────────────────────────────────────────────────

const FileSlot = ({
  field, label, file, onChange, onRemove,
}: {
  field: ImageFieldName; label: string; file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, field: ImageFieldName) => void;
  onRemove: (field: ImageFieldName) => void;
}) => {
  const accept = field === "product_gif" ? "image/gif" : field.includes("vid") ? "video/*" : "image/*";
  return (
    <div>
      <label className={labelCls}>
        {label}
        {field === "base_img" && <span className="text-red-400 ml-1">*</span>}
      </label>
      {file
        ? <FilePreview file={file} onRemove={() => onRemove(field)} />
        : (
          <label className="cursor-pointer block">
            <input type="file" accept={accept} className="hidden" onChange={e => onChange(e, field)} />
            <div className="w-full h-24 rounded-xl border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center gap-1.5">
              <Upload className="h-4 w-4 text-slate-600" />
              <p className="text-slate-600 text-xs">Click to upload</p>
            </div>
          </label>
        )
      }
      {file && (
        <label className="cursor-pointer block mt-1.5">
          <input type="file" accept={accept} className="hidden" onChange={e => onChange(e, field)} />
          <p className="text-xs text-indigo-400 hover:text-indigo-300 text-center transition-colors">↑ Click to change</p>
        </label>
      )}
    </div>
  );
};

// ─── Initial form state ───────────────────────────────────────────────────────

const INITIAL_FORM: ProductFormData = {
  base_img: null, sec_img1: null, sec_img2: null, sec_img3: null,
  product_vid: null, product_vid2: null, product_gif: null,
  cert_img_url: "", unit_price: "", name: "", description: "",
  sku_code: "", category: "", subcategory: "", gemstone_name: "", quantity: "1",
  actual_price: "", sale_price: "", status: "Draft", origin: "",
  weight_gms: "", weight_carat: "", weight_ratti: "",
  length: "", width: "", height: "", shape: "", cut: "",
  treatment: "", certification: "", color: "", transparency: "",
  ref_index: "", hardness: "", sp_gravity: "", inclusion: "",
  species: "", variety: "", other_chars: "", shape_cut: "",
  certificate_no: `GEM-${Math.floor(10000 + Math.random() * 90000)}`,
  discount_type: "percentage",
  discount_value: "",
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface AddProductModalProps { onClose: () => void; }

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose }) => {
  const queryClient   = useQueryClient();
  const token          = useSelector((state: any) => state.user.accessToken);
  const gemDropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab]             = useState("basic");
  const [formData, setFormData]               = useState<ProductFormData>(INITIAL_FORM);
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [dimensionString, setDimensionString] = useState("");
  const [isGemstone, setIsGemstone]           = useState(false);
  const [gemstoneOptions, setGemstoneOptions] = useState<{ name: string; alternateNames: string[] }[]>([]);
  const [isLoadingGemstones, setIsLoadingGemstones] = useState(true);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [gemDropdownOpen, setGemDropdownOpen] = useState(false);

  // Close gem dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (gemDropdownRef.current && !gemDropdownRef.current.contains(e.target as Node))
        setGemDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch gemstones ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchGemstones = async () => {
      setIsLoadingGemstones(true);
      try {
        const res = await userRequest({ url: "/gemstones/get-all-gemblog", method: "GET" });
        if (!res.data || !Array.isArray(res.data)) throw new Error("Invalid response");
        const gems = res.data
          .filter((g: GemstoneApiResponse) => g.name && !g.name.toLowerCase().includes("demo"))
          .map((g: GemstoneApiResponse) => {
            let alternateNames: string[] = [];
            try {
              if (g.alternateNames) {
                alternateNames = Array.isArray(g.alternateNames)
                  ? g.alternateNames
                  : JSON.parse(g.alternateNames as string);
              }
            } catch { /* ignore */ }
            return {
              name: g.name,
              alternateNames: alternateNames.filter(
                (n: string) => n?.trim() && !n.toLowerCase().includes("demo")
              ),
            };
          });
        setGemstoneOptions(gems);
      } catch {
        toast.error("Failed to load gemstone data");
      } finally {
        setIsLoadingGemstones(false);
      }
    };
    fetchGemstones();
  }, []);

  // All gem names: API first, then fallback from SKU map
  const allGemstoneNames: string[] = React.useMemo(() => {
    const fromApi = gemstoneOptions.map(g => g.name);
    const fromMap = Object.keys(GEMSTONE_SKU_MAP).filter(k => !fromApi.includes(k));
    return [...fromApi, ...fromMap];
  }, [gemstoneOptions]);

  const subcategoryOptions = isGemstone ? GEMSTONE_SUBCATEGORIES : JEWELRY_SUBCATEGORIES;

  useEffect(() => {
    if (subcategoryOptions.length > 0 && !formData.subcategory)
      setFormData(p => ({ ...p, subcategory: subcategoryOptions[0] }));
  }, [subcategoryOptions]);

  // ── Discount → sale_price auto-calc ────────────────────────────────────────
  useEffect(() => {
    const actual   = parseFloat(formData.actual_price);
    const discount = parseFloat(formData.discount_value);
    if (isNaN(actual) || actual <= 0 || isNaN(discount) || discount <= 0) return;
    const sale = formData.discount_type === "percentage"
      ? actual - (actual * Math.min(discount, 100)) / 100
      : actual - discount;
    setFormData(p => ({ ...p, sale_price: sale > 0 ? sale.toFixed(2) : "" }));
  }, [formData.actual_price, formData.discount_value, formData.discount_type]);

  // ── Setters ─────────────────────────────────────────────────────────────────
  const set = (key: string, val: any) => setFormData(p => ({ ...p, [key]: val }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    set(e.target.name, e.target.value);

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.value === "" || /^[0-9]*\.?[0-9]*$/.test(e.target.value))
      set(field, e.target.value);
  };

  const handleCategoryChange = (val: string) => {
    setIsGemstone(val === "gemstones");
    setFormData(p => ({
      ...p, category: val, subcategory: "", gemstone_name: "", sku_code: "",
      quantity: val === "gemstones" ? "1" : p.quantity,
    }));
  };

  // ── Gemstone select → auto-prefix SKU ──────────────────────────────────────
  const handleGemstoneSelect = (gemName: string) => {
    const prefix = GEMSTONE_SKU_MAP[gemName] ?? gemName.slice(0, 3).toUpperCase();
    setFormData(p => ({ ...p, gemstone_name: gemName, sku_code: buildSku(prefix, p.sku_code) }));
    setGemDropdownOpen(false);
  };

  // ── Carat entry → auto grams + ratti ───────────────────────────────────────
  const handleCaratChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v !== "" && !/^[0-9]*\.?[0-9]*$/.test(v)) return;
    const c   = parseFloat(v);
    const gms = isNaN(c) ? "" : String(caratToGrams(c));
    const rat = isNaN(c) ? "" : String(caratToRatti(c));
    const ap  = (formData.unit_price && rat)
      ? (parseFloat(formData.unit_price) * parseFloat(rat)).toFixed(2)
      : formData.actual_price;
    setFormData(p => ({ ...p, weight_carat: v, weight_gms: gms, weight_ratti: rat, actual_price: ap }));
  };

  // ── Grams entry (non-gemstone) → auto carat + ratti ────────────────────────
  const handleWeightGramsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v !== "" && !/^[0-9]*\.?[0-9]*$/.test(v)) return;
    const mg    = parseFloat(v) * 1000;
    const ratti = isNaN(mg) ? "" : (mg / 180).toFixed(2);
    const carat = isNaN(mg) ? "" : (mg / 200).toFixed(2);
    const ap    = (formData.unit_price && ratti)
      ? (parseFloat(formData.unit_price) * parseFloat(ratti)).toFixed(2) : "0";
    setFormData(p => ({ ...p, weight_gms: v, weight_ratti: ratti, weight_carat: carat, actual_price: ap }));
  };

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v !== "" && !/^[0-9]*\.?[0-9]*$/.test(v)) return;
    const ap = (v && formData.weight_ratti)
      ? (parseFloat(v) * parseFloat(formData.weight_ratti)).toFixed(2) : "0";
    setFormData(p => ({ ...p, unit_price: v, actual_price: ap }));
  };

  const handleSpeciesSelect = (val: string) => {
    const g = (gemstoneProperties as any)[val] || {};
    setSelectedSpecies(val);
    setFormData(p => ({
      ...p, species: val,
      ref_index: g.refIndex || "", sp_gravity: g.specGravity || "", hardness: g.hardness || "",
    }));
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setDimensionString(v);
    const parts = v.replace(/\s/g, "").toLowerCase().split("x").filter(Boolean);
    if (parts.length === 3)
      setFormData(p => ({ ...p, length: parts[0], width: parts[1], height: parts[2] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: ImageFieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImg = field.includes("img");
    const isVid = field.includes("product_vid");
    const isGif = field === "product_gif";
    if (isGif && !file.type.includes("gif"))   { toast.error("Please select a GIF file");   return; }
    if (isVid && !file.type.includes("video")) { toast.error("Please select a video file"); return; }
    if (isImg && !file.type.includes("image")) { toast.error("Please select an image file"); return; }
    set(field, file);
  };

  const handleFileRemove = (field: ImageFieldName) => set(field, null);

  // ── Discount display helpers ─────────────────────────────────────────────────
  const discountSummary = React.useMemo(() => {
    const actual   = parseFloat(formData.actual_price);
    const discount = parseFloat(formData.discount_value);
    if (isNaN(actual) || isNaN(discount) || actual <= 0 || discount <= 0) return null;
    if (formData.discount_type === "percentage") {
      const amt = (actual * Math.min(discount, 100)) / 100;
      return { pct: `${discount}%`, amt: `₹${amt.toFixed(2)}` };
    }
    const pct = ((discount / actual) * 100).toFixed(1);
    return { pct: `${pct}%`, amt: `₹${discount}` };
  }, [formData.actual_price, formData.discount_value, formData.discount_type]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const prepareData = () => {
    const d: any = { ...formData };
    delete d.discount_type;
    delete d.discount_value;
    ["unit_price","actual_price","sale_price","weight_gms","weight_carat","weight_ratti","length","width","height"]
      .forEach(k => { d[k] = d[k] ? parseFloat(d[k]) : 0; });
    ["ref_index","hardness","sp_gravity","certificate_no"]
      .forEach(k => { d[k] = String(d[k] || ""); });
    d.quantity = d.quantity ? parseInt(String(d.quantity), 10) : 1;
    return d;
  };

  // Convert any image src (blob URL, remote URL) to a base64 data URL
  const toBase64 = (src: string | undefined | null): Promise<string | null> =>
    new Promise(resolve => {
      if (!src) { resolve(null); return; }
      if (src.startsWith("data:")) { resolve(src); return; }
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext("2d")!.drawImage(img, 0, 0);
          resolve(c.toDataURL("image/jpeg", 0.95));
        } catch { resolve(src); } // tainted canvas — use src as-is for display
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const generateCertificate = async (): Promise<File | null> => {
    // Resolve the gemstone image to base64 so html2canvas can read pixel data
    const rawSrc = formData.base_img ? URL.createObjectURL(formData.base_img) : null;
    const gemImgSrc = rawSrc ? await toBase64(rawSrc) : null;

    // Build the same HTML that CertificateGenerator produces — but fully inline
    // so there are zero async dependencies when html2canvas runs.
    const logoUrl  = (await import("../assets/logo.jpeg")).default;
    const sigUrl   = (await import("../assets/rizwan_signature.jpg")).default;
    const logoB64  = await toBase64(logoUrl);
    const sigB64   = await toBase64(sigUrl);

    const fd = formData;
    const rows: string[] = [];
    const row = (label: string, val: string | number | undefined) =>
      val ? `<p style="font-weight:500">${label}</p><p>${val}</p>` : "";

    rows.push(row("Certificate No.", fd.certificate_no));
    if (fd.weight_ratti) rows.push(row("Weight", `${fd.weight_ratti} RATTI`));
    if (fd.shape_cut)    rows.push(row("Shape and Cut", fd.shape_cut));
    if (fd.color)        rows.push(row("Colour", fd.color));
    if (fd.transparency) rows.push(row("Transparency", fd.transparency));
    if (fd.length && fd.width && fd.height)
      rows.push(row("Dimension (L.B.H.in mm)", `${fd.length}×${fd.width}×${fd.height}`));
    if (fd.ref_index)    rows.push(row("Ref. Index", fd.ref_index));
    if (fd.hardness)     rows.push(row("Hardness", fd.hardness));
    if (fd.sp_gravity)   rows.push(row("SP. Gravity", fd.sp_gravity));
    if (fd.luminescence) rows.push(row("Luminescence", fd.luminescence));
    if (fd.op_char && fd.crystal_sys)
      rows.push(row("Op. Char, Crystal Sys", `${fd.op_char}, ${fd.crystal_sys}`));
    if (fd.inclusion)    rows.push(row("Inclusion", fd.inclusion));
    if (fd.species)      rows.push(row("Species", fd.species));
    if (fd.variety)      rows.push(row("Variety", fd.variety));

    const gemImgHtml = gemImgSrc
      ? `<img src="${gemImgSrc}" alt="Gemstone"
           style="max-width:100%;max-height:224px;object-fit:contain;border:1px solid #e5e7eb" />`
      : `<div style="width:100%;height:224px;background:#e5e7eb;display:flex;align-items:center;
           justify-content:center;color:#6b7280;font-size:14px">No image provided</div>`;

    const html = `
      <div style="width:800px;font-family:Arial,sans-serif;background:#fff;padding:16px;box-sizing:border-box">
        <div style="border:2px solid #dc2626;padding:16px">

          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div>
              <h1 style="font-size:20px;font-weight:700;color:#dc2626;margin:0">IGI-GEM TESTING LABORATORY</h1>
              <p style="font-size:12px;margin:2px 0 0">A venture by alumni of IGI</p>
            </div>
            <div style="text-align:right">
              <p style="font-weight:700;margin:0">CUSTOMER NAME</p>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;align-content:start">
              ${rows.join("")}
            </div>

            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center">
              ${gemImgHtml}
              <div style="display:flex;gap:40px;margin-top:8px">
                ${logoB64 ? `<img src="${logoB64}" alt="Logo" style="height:128px;object-fit:contain" />` : ""}
                ${sigB64  ? `<img src="${sigB64}"  alt="Sig"  style="height:128px;object-fit:contain" />` : ""}
              </div>
              <p style="font-size:12px;color:#dc2626;align-self:flex-end;margin:4px 0 0">GEMOLOGIST (IGI)</p>
            </div>
          </div>

          <div style="margin-top:16px;padding-top:8px;border-top:1px solid #d1d5db;text-align:center">
            <p style="font-size:12px;font-weight:500;color:#dc2626;margin:0">
              THIS IS A SYSTEM GENERATED SAMPLE CERTIFICATE — www.igigemlab.in
            </p>
          </div>

        </div>
      </div>`;

    // Inject into a hidden but in-flow container
    const container = document.createElement("div");
    Object.assign(container.style, {
      position: "fixed", top: "0", left: "0",
      width: "800px", zIndex: "-9999", opacity: "0", pointerEvents: "none",
    });
    container.innerHTML = html;
    document.body.appendChild(container);

    // One rAF to let the browser paint, then capture
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r)); // two frames to be safe

    try {
      const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
        scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff",
        width: 800, windowWidth: 800,
      });
      return await new Promise(resolve => {
        canvas.toBlob(blob => {
          document.body.removeChild(container);
          if (!blob) { resolve(null); return; }
          resolve(new File([blob], "certificate.jpg", { type: "image/jpeg", lastModified: Date.now() }));
        }, "image/jpeg", 0.95);
      });
    } catch {
      document.body.removeChild(container);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["name", "category", "sale_price"];
    if (!isGemstone) required.push("subcategory");
    const missing = required.filter(f => !formData[f]);
    if (missing.length) { toast.error(`Missing required: ${missing.join(", ")}`); return; }
    if (dimensionString && !formData.length) { toast.error("Invalid dimensions — use L x W x H"); return; }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating product...", { position: "bottom-right" });
    try {
      const certFile  = await generateCertificate();
      const processed = prepareData();
      const fd = new FormData();
      const fileKeys = ["base_img","sec_img1","sec_img2","sec_img3","product_vid","product_vid2","product_gif"];
      Object.keys(processed).forEach(k => { if (!fileKeys.includes(k)) fd.append(k, String(processed[k])); });
      if (processed.base_img)     fd.append("base_img",       processed.base_img);
      if (processed.sec_img1)     fd.append("sec_img1",       processed.sec_img1);
      if (processed.sec_img2)     fd.append("sec_img2",       processed.sec_img2);
      if (certFile) {
        fd.append("sec_img3",  certFile); // certificate as gallery image
        fd.append("cert_img",  certFile); // certificate saved to cert_img_url field
      }
      if (processed.product_vid)  fd.append("product_video",  processed.product_vid);
      if (processed.product_vid2) fd.append("product_video2", processed.product_vid2);
      if (processed.product_gif)  fd.append("product_gif",    processed.product_gif);

      await userRequest({
        url: "/product", method: "POST", data: fd,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      toast.success("Product created!", { id: toastId, position: "bottom-right" });
      queryClient.invalidateQueries("get-all-products");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create product", { id: toastId, position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Tab completion ──────────────────────────────────────────────────────────
  const tabComplete = {
    basic:       !!(formData.name && formData.category && (isGemstone ? formData.gemstone_name : formData.subcategory)),
    media:       !!(formData.base_img),
    certificate: !!(formData.species || formData.color),
    pricing:     !!(formData.sale_price),
  };

  const statusStyle: Record<string, string> = {
    Draft:   "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Feature: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    Public:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold">Add New Product</h2>
            <p className="text-slate-500 text-xs mt-0.5">Fill in all sections to create a product listing</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-0 border-b border-white/5 flex-shrink-0">
          {TABS.map(tab => {
            const done   = tabComplete[tab.id as keyof typeof tabComplete];
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg border-b-2 transition-all duration-200 ${
                  active
                    ? "text-white border-indigo-500 bg-white/5"
                    : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {done && !active
                  ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  : <tab.icon className="h-3.5 w-3.5" />
                }
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">

          <div className="px-6 py-5">

            {/* ══════════════════════ BASIC INFO ══════════════════════════════ */}
            {activeTab === "basic" && (
              <div className="space-y-5">

                {/* Status pill row */}
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                  <span className="text-xs text-slate-500 font-medium">Status</span>
                  <div className="flex gap-2">
                    {["Draft","Feature","Public"].map(s => (
                      <button key={s} type="button" onClick={() => set("status", s)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${
                          formData.status === s ? statusStyle[s] : "bg-white/5 text-slate-500 border-white/5 hover:text-slate-300"
                        }`}
                      >{s}</button>
                    ))}
                  </div>
                </div>

                <p className={sectionTitle}>Product Details</p>

                {/* Name + SKU */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Product Name <span className="text-red-400">*</span></label>
                    <input name="name" value={formData.name} onChange={handleChange}
                      placeholder="e.g. Natural Ruby" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>SKU Code</label>
                    <div className="relative">
                      <input name="sku_code" value={formData.sku_code} onChange={handleChange}
                        placeholder={
                          isGemstone && formData.gemstone_name
                            ? `${GEMSTONE_SKU_MAP[formData.gemstone_name] ?? "GEM"}-001`
                            : "e.g. PRD-001"
                        }
                        className={isGemstone && formData.gemstone_name ? `${inputCls} pr-16` : inputCls}
                      />
                      {/* Prefix badge inside SKU input */}
                      {isGemstone && formData.gemstone_name && (
                        <span
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded select-none"
                          style={{
                            color: GEMSTONE_COLORS[formData.gemstone_name] ?? "#a78bfa",
                            background: `${GEMSTONE_COLORS[formData.gemstone_name] ?? "#8b5cf6"}22`,
                          }}
                        >
                          {GEMSTONE_SKU_MAP[formData.gemstone_name] ?? formData.gemstone_name.slice(0,3).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category + Subcategory (non-gemstone) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <select value={formData.category} onChange={e => handleCategoryChange(e.target.value)} className={selectCls}>
                        <option value="" className="bg-slate-900">Select category</option>
                        <option value="gemstones" className="bg-slate-900">Gemstones</option>
                        <option value="jewelry"   className="bg-slate-900">Jewelry</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  {!isGemstone && (
                    <div>
                      <label className={labelCls}>Sub-Category <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select value={formData.subcategory} onChange={e => set("subcategory", e.target.value)}
                          className={selectCls} disabled={!formData.category}>
                          <option value="" className="bg-slate-900">
                            {!formData.category ? "Select a category first" : "Select type"}
                          </option>
                          {JEWELRY_SUBCATEGORIES.map(n => (
                            <option key={n} value={n} className="bg-slate-900">{n}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                      </div>
                      {!formData.category && <p className="text-xs text-amber-500 mt-1">Select a category first</p>}
                    </div>
                  )}
                </div>

                {/* ── Gemstone picker (category = gemstones only) ─────────── */}
                {isGemstone && (
                  <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gemstone Details</p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Custom searchable dropdown */}
                      <div ref={gemDropdownRef} className="relative">
                        <label className={labelCls}>Select Gemstone <span className="text-red-400">*</span></label>
                        <button
                          type="button"
                          onClick={() => setGemDropdownOpen(o => !o)}
                          className="w-full flex items-center justify-between bg-white/5 border border-white/5 hover:border-white/10 text-sm rounded-lg px-3 py-2 transition-colors focus:outline-none focus:border-indigo-500/50"
                        >
                          {formData.gemstone_name ? (
                            <span className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                style={{ background: GEMSTONE_COLORS[formData.gemstone_name] ?? "#a78bfa" }} />
                              <span className="text-slate-200">{formData.gemstone_name}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-1"
                                style={{
                                  color: GEMSTONE_COLORS[formData.gemstone_name] ?? "#a78bfa",
                                  background: `${GEMSTONE_COLORS[formData.gemstone_name] ?? "#8b5cf6"}22`,
                                }}
                              >
                                {GEMSTONE_SKU_MAP[formData.gemstone_name] ?? formData.gemstone_name.slice(0,3).toUpperCase()}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-600 flex items-center gap-2">
                              <Gem className="h-3.5 w-3.5" />
                              {isLoadingGemstones ? "Loading..." : "Choose a gemstone"}
                            </span>
                          )}
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${gemDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Dropdown list */}
                        {gemDropdownOpen && (
                          <div className="absolute z-20 mt-1.5 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
                            <div className="max-h-56 overflow-y-auto">
                              {isLoadingGemstones ? (
                                <div className="flex items-center gap-2 px-4 py-3 text-slate-600 text-sm">
                                  <ClipLoader size={12} color="#6366f1" /><span>Loading...</span>
                                </div>
                              ) : allGemstoneNames.length === 0 ? (
                                <p className="px-4 py-3 text-slate-600 text-sm">No gemstones found</p>
                              ) : (
                                allGemstoneNames.map(gemName => {
                                  const prefix = GEMSTONE_SKU_MAP[gemName] ?? gemName.slice(0,3).toUpperCase();
                                  const color  = GEMSTONE_COLORS[gemName] ?? "#a78bfa";
                                  const active = formData.gemstone_name === gemName;
                                  return (
                                    <button key={gemName} type="button"
                                      onClick={() => handleGemstoneSelect(gemName)}
                                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                                        active ? "bg-indigo-500/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                                      }`}
                                    >
                                      <span className="flex items-center gap-2.5">
                                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />
                                        {gemName}
                                      </span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                        style={{ color, background: `${color}22` }}
                                      >{prefix}</span>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Carat range sub-category */}
                      <div>
                        <label className={labelCls}>Carat Range</label>
                        <div className="relative">
                          <select value={formData.subcategory} onChange={e => set("subcategory", e.target.value)} className={selectCls}>
                            <option value="" className="bg-slate-900">Select carat range</option>
                            {GEMSTONE_SUBCATEGORIES.map(n => (
                              <option key={n} value={n} className="bg-slate-900">{n}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Selected gem info chip */}
                    {formData.gemstone_name && (
                      <div className="flex items-center gap-3 rounded-xl px-4 py-3 border"
                        style={{
                          background: `${GEMSTONE_COLORS[formData.gemstone_name] ?? "#8b5cf6"}0d`,
                          borderColor: `${GEMSTONE_COLORS[formData.gemstone_name] ?? "#8b5cf6"}33`,
                        }}
                      >
                        <Gem className="h-4 w-4 flex-shrink-0" style={{ color: GEMSTONE_COLORS[formData.gemstone_name] }} />
                        <div>
                          <p className="text-sm font-medium text-white">{formData.gemstone_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            SKU prefix <span className="font-mono font-bold"
                              style={{ color: GEMSTONE_COLORS[formData.gemstone_name] }}
                            >
                              {GEMSTONE_SKU_MAP[formData.gemstone_name] ?? formData.gemstone_name.slice(0,3).toUpperCase()}
                            </span>
                            {" "}· automatically prepended to SKU code
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                    placeholder="Describe the product..."
                    className="w-full bg-white/5 border border-white/5 text-slate-200 placeholder:text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* ══════════════════════ MEDIA ═══════════════════════════════════ */}
            {activeTab === "media" && (
              <div className="space-y-5">
                <p className={sectionTitle}>Product Images <span className="text-slate-600 font-normal">(Base image required)</span></p>
                <div className="grid grid-cols-3 gap-4">
                  {(["base_img","sec_img1","sec_img2"] as ImageFieldName[]).map((f, i) => (
                    <FileSlot key={f} field={f} label={i === 0 ? "Base Image" : `Secondary Image ${i}`}
                      file={formData[f]} onChange={handleFileChange} onRemove={handleFileRemove} />
                  ))}
                </div>
                <p className={sectionTitle}>Videos &amp; GIF</p>
                <div className="grid grid-cols-3 gap-4">
                  {([
                    { f: "product_vid"  as ImageFieldName, l: "Product Video 1" },
                    { f: "product_vid2" as ImageFieldName, l: "Product Video 2" },
                    { f: "product_gif"  as ImageFieldName, l: "Product GIF"     },
                  ]).map(({ f, l }) => (
                    <FileSlot key={f} field={f} label={l} file={formData[f]}
                      onChange={handleFileChange} onRemove={handleFileRemove} />
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════ CERTIFICATE ════════════════════════════ */}
            {activeTab === "certificate" && (
              <div className="space-y-5">
                <div>
                  <p className={sectionTitle}>Certificate Preview</p>
                  <div className="border border-white/5 rounded-xl p-3 bg-white/[0.02] overflow-auto">
                    <div className="mx-auto max-w-2xl">
                      {/* Display-only preview — ref lives in the hidden instance above */}
                      <CertificateGenerator
                        formData={formData}
                        baseImageUrl={formData.base_img ? URL.createObjectURL(formData.base_img) : null}
                      />
                    </div>
                  </div>
                </div>
                <p className={sectionTitle}>Certificate Fields</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Certificate No</label>
                    <input name="certificate_no" value={formData.certificate_no} readOnly className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Color</label>
                    <input name="color" value={formData.color} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Transparency</label>
                    <input name="transparency" value={formData.transparency} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Shape &amp; Cut</label>
                    <input name="shape_cut" value={formData.shape_cut} onChange={handleChange} placeholder="e.g. Round Brilliant" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Dimensions (L x W x H mm)</label>
                    <input value={dimensionString} onChange={handleDimensionChange} placeholder="e.g. 10 x 5 x 3" className={inputCls} />
                    {formData.length && <p className="text-xs text-slate-600 mt-1">{formData.length} × {formData.width} × {formData.height} mm</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Weight (Ratti) <span className="text-slate-600">(auto)</span></label>
                    <input value={formData.weight_ratti} readOnly className={inputCls} />
                  </div>
                </div>
                <p className={sectionTitle}>Gemstone Species &amp; Properties</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Species (from database)</label>
                    <div className="relative">
                      <select value={selectedSpecies} onChange={e => handleSpeciesSelect(e.target.value)} className={selectCls}>
                        <option value="" className="bg-slate-900">Select species</option>
                        {Object.keys(gemstoneProperties).map(g => (
                          <option key={g} value={g} className="bg-slate-900">{g}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Species (editable)</label>
                    <input name="species" value={formData.species} onChange={handleChange} placeholder="Edit species name" className={inputCls} />
                    {selectedSpecies && formData.species !== selectedSpecies && (
                      <p className="text-xs text-amber-500 mt-1">Modified from: {selectedSpecies}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Variety</label>
                    <input name="variety" value={formData.variety} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Refractive Index <span className="text-slate-600">(auto)</span></label>
                    <input name="ref_index" value={formData.ref_index} onChange={handleChange} readOnly={!!selectedSpecies} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Specific Gravity <span className="text-slate-600">(auto)</span></label>
                    <input name="sp_gravity" value={formData.sp_gravity} onChange={handleChange} readOnly={!!selectedSpecies} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Hardness <span className="text-slate-600">(auto)</span></label>
                    <input name="hardness" value={formData.hardness} onChange={handleChange} readOnly={!!selectedSpecies} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Inclusion</label>
                    <input name="inclusion" value={formData.inclusion} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Origin</label>
                    <input name="origin" value={formData.origin} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Treatment</label>
                    <input name="treatment" value={formData.treatment} onChange={handleChange} placeholder="e.g. Heat treated" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Certification</label>
                    <div className="relative">
                      <select value={formData.certification} onChange={e => set("certification", e.target.value)} className={selectCls}>
                        <option value="" className="bg-slate-900">Select certification</option>
                        <option value="Local Lab Certification" className="bg-slate-900">Local Lab (Free)</option>
                        <option value="IGI" className="bg-slate-900">IGI</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Other Characteristics</label>
                    <input name="other_chars" value={formData.other_chars} onChange={handleChange} className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════ PRICING ════════════════════════════════ */}
            {activeTab === "pricing" && (
              <div className="space-y-5">

                {/* Weight section */}
                <p className={sectionTitle}>Weight</p>
                {isGemstone ? (
                  /* ── Gemstone: carat is the primary input ─── */
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>
                        Weight (carat) <span className="text-red-400">*</span>
                        <span className="ml-1 text-slate-600 font-normal">— primary input</span>
                      </label>
                      <input value={formData.weight_carat} onChange={handleCaratChange}
                        placeholder="0.00" className={inputCls} />
                      <p className="text-xs text-slate-600 mt-1">1 ct = 0.2 g = 0.9114 ratti</p>
                    </div>
                    <div>
                      <label className={labelCls}>Weight (ratti) <span className="text-slate-600">(auto)</span></label>
                      <input value={formData.weight_ratti} readOnly className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Weight (grams) <span className="text-slate-600">(auto)</span></label>
                      <input value={formData.weight_gms} readOnly className={inputCls} />
                    </div>
                  </div>
                ) : (
                  /* ── Non-gemstone: grams is the primary input ─── */
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>
                        Weight (grams)
                        <span className="ml-1 text-slate-600 font-normal">— primary input</span>
                      </label>
                      <input value={formData.weight_gms} onChange={handleWeightGramsChange}
                        placeholder="0.00" className={inputCls} />
                      {parseFloat(formData.weight_gms) > 0 && (
                        <p className="text-xs text-slate-600 mt-1">{parseFloat(formData.weight_gms) * 1000} mg</p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Weight (carat) <span className="text-slate-600">(auto)</span></label>
                      <input value={formData.weight_carat} readOnly className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Weight (ratti) <span className="text-slate-600">(auto)</span></label>
                      <input value={formData.weight_ratti} readOnly className={inputCls} />
                    </div>
                  </div>
                )}

                {/* Pricing section */}
                <p className={sectionTitle}>Pricing</p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Left: unit price + MRP */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-slate-500 font-medium">Base Price</p>
                    <div>
                      <label className={labelCls}>Unit Price (per ratti ₹)</label>
                      <input value={formData.unit_price} onChange={handleUnitPriceChange}
                        placeholder="0.00" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>
                        MRP / Actual Price (₹)
                        <span className="ml-1 text-slate-600 font-normal">(auto)</span>
                      </label>
                      <input value={formData.actual_price} readOnly className={inputCls} />
                      {parseFloat(formData.unit_price) > 0 && parseFloat(formData.weight_ratti) > 0 && (
                        <p className="text-xs text-slate-600 mt-1">
                          ₹{formData.unit_price} × {formData.weight_ratti} ratti
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: discount + sale price */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-slate-500 font-medium">Discount &amp; Sale</p>

                    {/* Discount type toggle */}
                    <div>
                      <label className={labelCls}>Discount Type</label>
                      <div className="flex rounded-lg overflow-hidden border border-white/8">
                        <button type="button"
                          onClick={() => setFormData(p => ({ ...p, discount_type: "percentage", discount_value: "" }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all duration-200 ${
                            formData.discount_type === "percentage"
                              ? "bg-indigo-600 text-white"
                              : "bg-white/5 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <Percent className="h-3 w-3" /> Percentage
                        </button>
                        <button type="button"
                          onClick={() => setFormData(p => ({ ...p, discount_type: "amount", discount_value: "" }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all duration-200 ${
                            formData.discount_type === "amount"
                              ? "bg-indigo-600 text-white"
                              : "bg-white/5 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <Hash className="h-3 w-3" /> Fixed ₹
                        </button>
                      </div>
                    </div>

                    {/* Discount value */}
                    <div>
                      <label className={labelCls}>
                        {formData.discount_type === "percentage" ? "Discount (%)" : "Discount Amount (₹)"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none pointer-events-none">
                          {formData.discount_type === "percentage" ? "%" : "₹"}
                        </span>
                        <input
                          value={formData.discount_value}
                          onChange={e => handleNumericChange(e, "discount_value")}
                          placeholder={formData.discount_type === "percentage" ? "e.g. 10" : "e.g. 500"}
                          className={`${inputCls} pl-7`}
                        />
                      </div>
                      {discountSummary && (
                        <p className="text-xs text-emerald-500 mt-1">
                          {formData.discount_type === "percentage"
                            ? `= ${discountSummary.amt} off`
                            : `= ${discountSummary.pct} off`
                          }
                        </p>
                      )}
                    </div>

                    {/* Sale price */}
                    <div>
                      <label className={labelCls}>
                        Sale Price (₹) <span className="text-red-400">*</span>
                        <span className="ml-1 text-slate-600 font-normal">(auto · editable)</span>
                      </label>
                      <input
                        value={formData.sale_price}
                        onChange={e => handleNumericChange(e, "sale_price")}
                        placeholder="0.00"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div className="w-48">
                  <label className={labelCls}>Quantity</label>
                  <input
                    value={formData.quantity}
                    onChange={e => handleNumericChange(e, "quantity")}
                    disabled={isGemstone}
                    className={inputCls}
                  />
                  {isGemstone && <p className="text-xs text-slate-600 mt-1">Fixed at 1 for gemstones</p>}
                </div>

                {/* Pricing summary card */}
                {(formData.actual_price || formData.sale_price) && (
                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-400 mb-3">Pricing Summary</p>
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">MRP</p>
                        <p className="text-slate-400 font-semibold">₹{formData.actual_price || "—"}</p>
                      </div>
                      {discountSummary && (
                        <>
                          <div className="text-slate-700 text-lg">→</div>
                          <div className="text-center">
                            <p className="text-xs text-slate-500 mb-1">Discount</p>
                            <p className="text-emerald-400 font-semibold">−{discountSummary.pct}</p>
                            <p className="text-xs text-slate-600">({discountSummary.amt})</p>
                          </div>
                          <div className="text-slate-700 text-lg">→</div>
                        </>
                      )}
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">Sale Price</p>
                        <p className="text-white font-bold text-xl">₹{formData.sale_price || "—"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {TABS.map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  activeTab === tab.id ? "w-6 bg-indigo-500" : "w-2 bg-white/10 hover:bg-white/20"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {activeTab !== "basic" && (
              <button type="button"
                onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) - 1].id)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/8 border border-white/5 rounded-lg transition-all"
              >← Back</button>
            )}
            {activeTab !== "pricing" ? (
              <button type="button"
                onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) + 1].id)}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
              >Next →</button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting
                  ? <><ClipLoader size={13} color="#fff" /> Creating...</>
                  : <><CheckCircle className="h-3.5 w-3.5" /> Create Product</>
                }
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddProductModal;