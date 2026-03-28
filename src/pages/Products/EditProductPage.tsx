import React, { useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { userRequest } from "@/utils/requestMethods";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { gemstoneProperties } from "@/utils/constants";
import html2canvas from "html2canvas";
import { ClipLoader } from "react-spinners";
import {
  X, Upload, ChevronDown, Save,
  Info, Image as ImageIcon, Award, DollarSign,
  CheckCircle, ArrowLeft, Loader2,
} from "lucide-react";
import CertificateGenerator from "@/components/CertificateGenerator";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImageFieldName =
  | "base_img" | "sec_img1" | "sec_img2" | "sec_img3"
  | "product_vid" | "product_vid2" | "product_gif";

interface GemstoneApiResponse {
  name: string;
  alternateNames?: string[] | string;
}

interface ProductFormData {
  [key: string]: any;
  base_img: File | null; sec_img1: File | null; sec_img2: File | null;
  sec_img3: File | null; product_vid: File | null; product_vid2: File | null;
  product_gif: File | null;

  base_img_url: string | null; sec_img1_url: string | null;
  sec_img2_url: string | null; sec_img3_url: string | null;
  product_vid_url: string | null; product_video2_url: string | null;
  product_gif_url: string | null;

  unit_price: string; name: string; description: string; sku_code: string;
  category: string; subcategory: string; quantity: string;
  actual_price: string; sale_price: string; status: string; origin: string;
  weight_gms: string; weight_carat: string; weight_ratti: string;
  length: string; width: string; height: string;
  treatment: string; certification: string; color: string;
  transparency: string; ref_index: string; hardness: string;
  sp_gravity: string; inclusion: string; species: string;
  variety: string; other_chars: string; certificate_no: string; shape_cut: string;
}

// ─── Shared styles — identical to AddProductModal ────────────────────────────

const inputCls = "w-full bg-white/5 border border-white/5 text-slate-200 placeholder:text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed read-only:bg-white/[0.02] read-only:text-slate-500";
const labelCls = "text-xs font-medium text-slate-400 mb-1.5 block";
const selectCls = "w-full appearance-none bg-white/5 border border-white/5 text-slate-300 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer";
const sectionTitle = "text-sm font-semibold text-slate-300 mb-4 pb-2 border-b border-white/5";

const TABS = [
  { id: "basic",       label: "Basic Info",  icon: Info       },
  { id: "media",       label: "Media",       icon: ImageIcon  },
  { id: "certificate", label: "Certificate", icon: Award      },
  { id: "pricing",     label: "Pricing",     icon: DollarSign },
];

const statusStyle: Record<string, string> = {
  Draft:   "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Feature: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Public:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const CATEGORIES = ["Electronics", "Accessories", "Clothing", "Books", "Gemstones", "Jewelry"];

// ─── FilePreview — defined outside to prevent remount ────────────────────────

const FilePreview = ({
  file, existingUrl, onRemove,
}: {
  file: File | null;
  existingUrl?: string | null;
  onRemove: () => void;
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!(file instanceof File)) { setObjectUrl(null); return; }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const src = objectUrl || existingUrl || null;
  if (!src) return null;

  const isVideo =
    file?.type?.startsWith("video/") ||
    !!(existingUrl?.match(/\.(mp4|webm|mov)$/i));

  return (
    <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 group">
      {isVideo ? (
        <video src={src} controls className="w-full h-32 object-contain bg-slate-950" />
      ) : (
        <img src={src} alt="Preview" className="w-full h-32 object-cover bg-slate-950" />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 h-6 w-6 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="h-3 w-3 text-white" />
      </button>
    </div>
  );
};

// ─── FileSlot — defined outside to prevent remount ───────────────────────────

const FileSlot = ({
  field, label, file, existingUrl, onChange, onRemove,
}: {
  field: ImageFieldName;
  label: string;
  file: File | null;
  existingUrl?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, field: ImageFieldName) => void;
  onRemove: (field: ImageFieldName) => void;
}) => {
  const accept   = field === "product_gif" ? "image/gif" : field.includes("vid") ? "video/*" : "image/*";
  const hasMedia = file || existingUrl;

  return (
    <div>
      <label className={labelCls}>
        {label}
        {field === "base_img" && <span className="text-red-400 ml-1">*</span>}
      </label>

      {hasMedia ? (
        <>
          <FilePreview file={file} existingUrl={existingUrl} onRemove={() => onRemove(field)} />
          <label className="cursor-pointer block mt-1.5">
            <input type="file" accept={accept} className="hidden" onChange={e => onChange(e, field)} />
            <p className="text-xs text-indigo-400 hover:text-indigo-300 text-center transition-colors">
              ↑ Click to change
            </p>
          </label>
        </>
      ) : (
        <label className="cursor-pointer block">
          <input type="file" accept={accept} className="hidden" onChange={e => onChange(e, field)} />
          <div className="w-full h-24 rounded-xl border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center gap-1.5">
            <Upload className="h-4 w-4 text-slate-600" />
            <p className="text-slate-600 text-xs">Click to upload</p>
          </div>
        </label>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const EditProductForm = () => {
  const { id }         = useParams<{ id: string }>();
  const navigate       = useNavigate();
  const queryClient    = useQueryClient();
  const certificateRef = useRef<HTMLDivElement>(null);
  const token          = useSelector((state: any) => state.user.accessToken);

  const [activeTab,              setActiveTab             ] = useState("basic");
  const [selectedSpecies,        setSelectedSpecies       ] = useState("");
  const [dimensionString,         setDimensionString       ] = useState("");
  const [isGemstone,              setIsGemstone            ] = useState(false);
  const [gemstoneOptions,         setGemstoneOptions       ] = useState<{ name: string; alternateNames: string[] }[]>([]);
  const [isLoadingGemstones,      setIsLoadingGemstones    ] = useState(true);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    base_img: null, sec_img1: null, sec_img2: null, sec_img3: null,
    product_vid: null, product_vid2: null, product_gif: null,
    base_img_url: null, sec_img1_url: null, sec_img2_url: null, sec_img3_url: null,
    product_vid_url: null, product_video2_url: null, product_gif_url: null,
    unit_price: "", name: "", description: "", sku_code: "", category: "",
    subcategory: "", quantity: "1", actual_price: "", sale_price: "",
    status: "Draft", origin: "",
    weight_gms: "", weight_carat: "", weight_ratti: "",
    length: "", width: "", height: "",
    treatment: "", certification: "", color: "", transparency: "",
    ref_index: "", hardness: "", sp_gravity: "", inclusion: "",
    species: "", variety: "", other_chars: "", shape_cut: "",
    certificate_no: `GEM-${Math.floor(10000 + Math.random() * 90000)}`,
  });

  // ── Fetch gemstone list ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchGemstones = async () => {
      try {
        const res = await userRequest({ url: "/gemstones/get-all-gemblog", method: "GET" });
        if (!res.data || !Array.isArray(res.data)) throw new Error();
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

  const gemstoneSubcategories = React.useMemo(() => {
    const all = new Set<string>();
    gemstoneOptions.forEach(gem => {
      if (gem.alternateNames?.length) {
        gem.alternateNames.forEach(n => n?.trim() && all.add(n.trim()));
      } else if (gem.name) {
        all.add(gem.name.trim());
      }
    });
    return Array.from(all).sort();
  }, [gemstoneOptions]);

  // ── Fetch existing product ───────────────────────────────────────────────────
  const { data: response, isLoading: loadingProduct } = useQuery(
    ["get-product", id],
    () => userRequest({ url: `/product/${id}`, method: "GET", headers: { Authorization: `Bearer ${token}` } })
  );

  useEffect(() => {
    if (!response?.data) return;
    const product = response.data.product || response.data;
    const attr    = response.data.attributes || response.data.attribute || {};

    const unitPrice =
      attr.weight_ratti && product.actual_price
        ? (product.actual_price / attr.weight_ratti).toFixed(2)
        : "";

    const isGem = (product.category || "").toLowerCase() === "gemstones";
    setIsGemstone(isGem);
    setSelectedSpecies(attr.species || "");

    if (attr.length && attr.width && attr.height) {
      setDimensionString(`${attr.length} x ${attr.width} x ${attr.height}`);
    }

    setFormData(prev => ({
      ...prev,
      ...product,
      ...attr,
      unit_price:         unitPrice,
      quantity:           product.quantity?.toString()     || "1",
      actual_price:       product.actual_price?.toString() || "",
      sale_price:         product.sale_price?.toString()   || "",
      status:             product.status                   || "Draft",
      origin:             product.origin || attr.origin    || "",
      weight_gms:         attr.weight_gms?.toString()      || "",
      weight_carat:       attr.weight_carat?.toString()    || "",
      weight_ratti:       attr.weight_ratti?.toString()    || "",
      length:             attr.length?.toString()          || "",
      width:              attr.width?.toString()           || "",
      height:             attr.height?.toString()          || "",
      ref_index:          attr.ref_index                   || "",
      sp_gravity:         attr.sp_gravity                  || "",
      hardness:           attr.hardness                    || "",
      shape_cut:          attr.shape_cut                   || "",
      inclusion:          attr.inclusion                   || "",
      transparency:       attr.transparency                || "",
      certification:      attr.certification               || "",
      other_chars:        attr.other_chars                 || "",
      base_img_url:       product.base_img_url             || null,
      sec_img1_url:       product.sec_img1_url             || null,
      sec_img2_url:       product.sec_img2_url             || null,
      sec_img3_url:       product.sec_img3_url             || null,
      product_vid_url:    product.product_vid_url          || null,
      product_video2_url: product.product_video2_url       || null,
      product_gif_url:    product.product_gif_url          || null,
    }));
  }, [response]);

  // ── Setters ─────────────────────────────────────────────────────────────────
  const set = (key: string, val: any) => setFormData(p => ({ ...p, [key]: val }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    set(e.target.name, e.target.value);

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.value === "" || /^[0-9]*\.?[0-9]*$/.test(e.target.value))
      set(field, e.target.value);
  };

  const handleCategoryChange = (val: string) => {
    const isGem = val.toLowerCase() === "gemstones";
    setIsGemstone(isGem);
    setFormData(p => ({
      ...p,
      category:    val,
      subcategory: "",
      quantity:    isGem ? "1" : p.quantity,
    }));
  };

  const handleWeightGramsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v  = e.target.value;
    if (v !== "" && !/^[0-9]*\.?[0-9]*$/.test(v)) return;
    const mg    = parseFloat(v) * 1000;
    const ratti = isNaN(mg) ? "" : (mg / 180).toFixed(2);
    const carat = isNaN(mg) ? "" : (mg / 200).toFixed(2);
    const ap    = formData.unit_price && ratti
      ? (parseFloat(formData.unit_price) * parseFloat(ratti)).toFixed(2)
      : "0";
    setFormData(p => ({ ...p, weight_gms: v, weight_ratti: ratti, weight_carat: carat, actual_price: ap }));
  };

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v !== "" && !/^[0-9]*\.?[0-9]*$/.test(v)) return;
    const ap = v && formData.weight_ratti
      ? (parseFloat(v) * parseFloat(formData.weight_ratti)).toFixed(2)
      : "0";
    setFormData(p => ({ ...p, unit_price: v, actual_price: ap }));
  };

  const handleSpeciesSelect = (val: string) => {
    const g = (gemstoneProperties as any)[val] || {};
    setSelectedSpecies(val);
    setFormData(p => ({
      ...p,
      species:    val,
      ref_index:  g.refIndex    || p.ref_index,
      sp_gravity: g.specGravity || p.sp_gravity,
      hardness:   g.hardness    || p.hardness,
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
    const isGif = field === "product_gif";
    const isVid = field.includes("vid");
    const isImg = field.includes("img");
    if (isGif && !file.type.includes("gif"))   { toast.error("Please select a GIF file");   return; }
    if (isVid && !file.type.includes("video")) { toast.error("Please select a video file"); return; }
    if (isImg && !file.type.includes("image")) { toast.error("Please select an image file"); return; }
    setFormData(p => ({ ...p, [field]: file, [`${field}_url`]: null }));
  };

  const handleFileRemove = (field: ImageFieldName) =>
    setFormData(p => ({ ...p, [field]: null, [`${field}_url`]: null }));

  // ── Certificate generation ───────────────────────────────────────────────────
  const generateCertificate = async (): Promise<File | null> => {
    if (!certificateRef.current) return null;
    setIsGeneratingCertificate(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff",
      });
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/jpeg", 0.95));
      if (!blob) return null;
      return new File([blob], "certificate.jpg", { type: "image/jpeg", lastModified: Date.now() });
    } catch {
      toast.error("Failed to generate certificate");
      return null;
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  // ── prepareData — mirrors AddProductModal ────────────────────────────────────
  const prepareData = () => {
    const d: any = { ...formData };
    ["unit_price","actual_price","sale_price","weight_gms","weight_carat","weight_ratti","length","width","height"]
      .forEach(k => { d[k] = d[k] ? parseFloat(d[k]) : 0; });
    ["ref_index","hardness","sp_gravity","certificate_no"]
      .forEach(k => { d[k] = String(d[k] || ""); });
    d.quantity = d.quantity ? parseInt(String(d.quantity), 10) : 1;
    return d;
  };

  // ── Update mutation ──────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async (fd: FormData) =>
      userRequest({
        url:     `/product/${id}`,
        method:  "PUT",
        data:    fd,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["get-product", id]);
      queryClient.invalidateQueries("get-all-products");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update product"),
  });

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["name", "category", "subcategory", "sale_price"];
    const missing  = required.filter(f => !formData[f]);
    if (missing.length) { toast.error(`Missing required: ${missing.join(", ")}`); return; }
    if (dimensionString && !formData.length) { toast.error("Invalid dimensions — use L x W x H"); return; }

    const toastId = toast.loading("Updating product...", { position: "bottom-right" });
    try {
      const certFile = await generateCertificate();
      if (!certFile) throw new Error("Certificate generation failed");

      const processed = prepareData();
      const fd        = new FormData();

      const FILE_KEYS = new Set([
        "base_img","sec_img1","sec_img2","sec_img3",
        "product_vid","product_vid2","product_gif",
        "base_img_url","sec_img1_url","sec_img2_url","sec_img3_url",
        "product_vid_url","product_video2_url","product_gif_url",
      ]);

      Object.entries(processed).forEach(([k, v]) => {
        if (!FILE_KEYS.has(k)) fd.append(k, String(v ?? ""));
      });

      const fileFields: { field: ImageFieldName; backend: string }[] = [
        { field: "base_img",     backend: "base_img"       },
        { field: "sec_img1",     backend: "sec_img1"       },
        { field: "sec_img2",     backend: "sec_img2"       },
        { field: "product_vid",  backend: "product_video"  },
        { field: "product_vid2", backend: "product_video2" },
        { field: "product_gif",  backend: "product_gif"    },
      ];

      for (const { field, backend } of fileFields) {
        const newFile     = formData[field as ImageFieldName];
        const existingUrl = formData[`${field}_url` as keyof ProductFormData];
        if (newFile) {
          fd.append(backend, newFile);
        } else if (!existingUrl) {
          fd.append(`${backend}_remove`, "true");
        }
      }

      fd.append("sec_img3", certFile);

      await updateMutation.mutateAsync(fd);
      toast.success("Product updated!", { id: toastId, position: "bottom-right" });
    } catch (err: any) {
      toast.error(err.message || "Update failed", { id: toastId, position: "bottom-right" });
    }
  };

  // ── Tab completion ───────────────────────────────────────────────────────────
  const tabComplete = {
    basic:       !!(formData.name && formData.category && formData.subcategory),
    media:       !!(formData.base_img || formData.base_img_url),
    certificate: !!(formData.species || formData.color),
    pricing:     !!(formData.sale_price),
  };

  const isBusy = updateMutation.isLoading || isGeneratingCertificate;

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loadingProduct || isLoadingGemstones) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ background: "#020617" }}>
        <div className="flex flex-col items-center gap-3">
          <ClipLoader size={40} color="#6366f1" />
          <p className="text-slate-500 text-sm">Loading product data...</p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-6 pb-20" style={{ background: "#020617" }}>
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl hover:bg-white/5 border border-white/5 transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">Edit Product</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {formData.name || "Update product details"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isBusy}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBusy
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              : <><Save className="h-4 w-4" /> Save Changes</>
            }
          </button>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60">

          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 pb-0 border-b border-white/5">
            {TABS.map(tab => {
              const done   = tabComplete[tab.id as keyof typeof tabComplete];
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
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

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 min-h-[480px]">

              {/* ══ BASIC INFO ══ */}
              {activeTab === "basic" && (
                <div className="space-y-5">
                  {/* Status pill buttons */}
                  <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <span className="text-xs text-slate-500 font-medium">Status</span>
                    <div className="flex gap-2">
                      {["Draft", "Feature", "Public"].map(s => (
                        <button
                          key={s} type="button" onClick={() => set("status", s)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${
                            formData.status === s
                              ? statusStyle[s]
                              : "bg-white/5 text-slate-500 border-white/5 hover:text-slate-300"
                          }`}
                        >{s}</button>
                      ))}
                    </div>
                  </div>

                  <p className={sectionTitle}>Product Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Product Name <span className="text-red-400">*</span></label>
                      <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Natural Ruby" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>SKU Code</label>
                      <input name="sku_code" value={formData.sku_code} onChange={handleChange} placeholder="e.g. RUB-001" className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select value={formData.category} onChange={e => handleCategoryChange(e.target.value)} className={selectCls}>
                          <option value="" className="bg-slate-900">Select category</option>
                          {CATEGORIES.map(c => (
                            <option key={c} value={c} className="bg-slate-900">{c}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Sub-Category <span className="text-red-400">*</span>
                        {isGemstone && isLoadingGemstones && (
                          <span className="ml-2 text-slate-600 font-normal">(loading...)</span>
                        )}
                        {isGemstone && !isLoadingGemstones && (
                          <span className="ml-2 text-slate-600 font-normal">({gemstoneSubcategories.length} options)</span>
                        )}
                      </label>
                      {isLoadingGemstones && isGemstone ? (
                        <div className={`${inputCls} flex items-center gap-2`}>
                          <ClipLoader size={12} color="#6366f1" />
                          <span className="text-slate-600 text-xs">Loading gemstones...</span>
                        </div>
                      ) : isGemstone ? (
                        <div className="relative">
                          <select value={formData.subcategory} onChange={e => set("subcategory", e.target.value)} className={selectCls}>
                            <option value="" className="bg-slate-900">Select gemstone type</option>
                            {gemstoneSubcategories.map(n => (
                              <option key={n} value={n} className="bg-slate-900">{n}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                        </div>
                      ) : (
                        <input
                          name="subcategory" value={formData.subcategory} onChange={handleChange}
                          placeholder="e.g. Rings, Earrings…" disabled={!formData.category}
                          className={inputCls}
                        />
                      )}
                      {!formData.category && (
                        <p className="text-xs text-amber-500 mt-1">Select a category first</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Origin</label>
                      <input name="origin" value={formData.origin} onChange={handleChange} placeholder="e.g. Sri Lanka, Burma…" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Quantity</label>
                      <input
                        type="number" min="0" value={formData.quantity}
                        onChange={e => handleNumericChange(e, "quantity")}
                        disabled={isGemstone}
                        className={inputCls}
                      />
                      {isGemstone && <p className="text-xs text-slate-600 mt-1">Fixed at 1 for gemstones</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                      name="description" value={formData.description} onChange={handleChange} rows={4}
                      placeholder="Describe the product…"
                      className="w-full bg-white/5 border border-white/5 text-slate-200 placeholder:text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ══ MEDIA ══ */}
              {activeTab === "media" && (
                <div className="space-y-5">
                  <p className={sectionTitle}>Product Images <span className="text-slate-600 font-normal">(Base image required)</span></p>
                  <div className="grid grid-cols-3 gap-4">
                    {([
                      { f: "base_img"  as ImageFieldName, l: "Base Image",        urlKey: "base_img_url"  },
                      { f: "sec_img1"  as ImageFieldName, l: "Secondary Image 1", urlKey: "sec_img1_url"  },
                      { f: "sec_img2"  as ImageFieldName, l: "Secondary Image 2", urlKey: "sec_img2_url"  },
                    ]).map(({ f, l, urlKey }) => (
                      <FileSlot
                        key={f} field={f} label={l}
                        file={formData[f]}
                        existingUrl={formData[urlKey] as string | null}
                        onChange={handleFileChange}
                        onRemove={handleFileRemove}
                      />
                    ))}
                  </div>

                  <p className={sectionTitle}>Videos & GIF</p>
                  <div className="grid grid-cols-3 gap-4">
                    {([
                      { f: "product_vid"  as ImageFieldName, l: "Product Video 1", urlKey: "product_vid_url"    },
                      { f: "product_vid2" as ImageFieldName, l: "Product Video 2", urlKey: "product_video2_url" },
                      { f: "product_gif"  as ImageFieldName, l: "Product GIF",     urlKey: "product_gif_url"    },
                    ]).map(({ f, l, urlKey }) => (
                      <FileSlot
                        key={f} field={f} label={l}
                        file={formData[f]}
                        existingUrl={formData[urlKey] as string | null}
                        onChange={handleFileChange}
                        onRemove={handleFileRemove}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600">
                    Certificate image (sec_img3) is auto-generated on save — no upload needed.
                  </p>
                </div>
              )}

              {/* ══ CERTIFICATE ══ */}
              {activeTab === "certificate" && (
                <div className="space-y-5">
                  <div>
                    <p className={sectionTitle}>Certificate Preview</p>
                    <div className="border border-white/5 rounded-xl p-3 bg-white/[0.02] overflow-auto">
                      <div className="mx-auto max-w-2xl bg-white rounded-lg">
                        <CertificateGenerator
                          ref={certificateRef}
                          formData={formData}
                          baseImageUrl={
                            formData.base_img
                              ? URL.createObjectURL(formData.base_img)
                              : formData.base_img_url || ""
                          }
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
                      <div className="relative">
                        <select value={formData.transparency} onChange={e => set("transparency", e.target.value)} className={selectCls}>
                          <option value="" className="bg-slate-900">Select</option>
                          {["Transparent","Translucent","Opaque"].map(t => (
                            <option key={t} value={t} className="bg-slate-900">{t}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Shape & Cut</label>
                      <input name="shape_cut" value={formData.shape_cut} onChange={handleChange} placeholder="e.g. Round Brilliant" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Dimensions (L x W x H mm)</label>
                      <input value={dimensionString} onChange={handleDimensionChange} placeholder="e.g. 10 x 5 x 3" className={inputCls} />
                      {formData.length && (
                        <p className="text-xs text-slate-600 mt-1">{formData.length} × {formData.width} × {formData.height} mm</p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Weight (Ratti) <span className="text-slate-600">(auto)</span></label>
                      <input value={formData.weight_ratti} readOnly className={inputCls} />
                    </div>
                  </div>

                  <p className={sectionTitle}>Gemstone Species & Properties</p>
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
                    {/* Editable species override — same pattern as AddProductModal */}
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
                          <option value="GIA" className="bg-slate-900">GIA</option>
                          <option value="AGL" className="bg-slate-900">AGL</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                    <div className="col-span-3">
                      <label className={labelCls}>Other Characteristics</label>
                      <input name="other_chars" value={formData.other_chars} onChange={handleChange} className={inputCls} />
                    </div>
                  </div>
                </div>
              )}

              {/* ══ PRICING ══ */}
              {activeTab === "pricing" && (
                <div className="space-y-5">
                  <p className={sectionTitle}>Weight</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Weight (grams)</label>
                      <input value={formData.weight_gms} onChange={handleWeightGramsChange} placeholder="0.000" className={inputCls} />
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

                  <p className={sectionTitle}>Pricing</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                      <div>
                        <label className={labelCls}>Unit Price (per ratti ₹)</label>
                        <input value={formData.unit_price} onChange={handleUnitPriceChange} placeholder="0.00" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Actual Price (₹) <span className="text-slate-600">(auto-calculated)</span></label>
                        <input value={formData.actual_price} readOnly className={inputCls} />
                        {parseFloat(formData.unit_price) > 0 && parseFloat(formData.weight_ratti) > 0 && (
                          <p className="text-xs text-slate-600 mt-1">
                            = ₹{formData.unit_price} × {formData.weight_ratti} ratti
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                      <div>
                        <label className={labelCls}>Sale Price (₹) <span className="text-red-400">*</span></label>
                        <input
                          value={formData.sale_price}
                          onChange={e => handleNumericChange(e, "sale_price")}
                          placeholder="0.00"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Quantity</label>
                        <input
                          value={formData.quantity}
                          onChange={e => handleNumericChange(e, "quantity")}
                          disabled={isGemstone}
                          className={inputCls}
                        />
                        {isGemstone && <p className="text-xs text-slate-600 mt-1">Fixed at 1 for gemstones</p>}
                      </div>
                    </div>
                  </div>

                  {/* Discount summary card */}
                  {(formData.actual_price || formData.sale_price) && (
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Discount</p>
                        <p className="text-white font-semibold text-sm mt-0.5">
                          {parseFloat(formData.actual_price) > 0 && parseFloat(formData.sale_price) > 0
                            ? `${Math.round((1 - parseFloat(formData.sale_price) / parseFloat(formData.actual_price)) * 100)}% off`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Actual Price</p>
                        <p className="text-slate-400 text-sm line-through mt-0.5">₹{formData.actual_price || "0"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Sale Price</p>
                        <p className="text-white font-semibold text-sm mt-0.5">₹{formData.sale_price || "0"}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer: dot nav + Back / Next / Save */}
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {TABS.map(tab => (
                  <button
                    key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      activeTab === tab.id ? "w-6 bg-indigo-500" : "w-2 bg-white/10 hover:bg-white/20"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {activeTab !== "basic" && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) - 1].id)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/8 border border-white/5 rounded-lg transition-all"
                  >← Back</button>
                )}
                {activeTab !== "pricing" ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) + 1].id)}
                    className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                  >Next →</button>
                ) : (
                  <button
                    type="submit" disabled={isBusy}
                    className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isBusy
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                      : <><Save className="h-4 w-4" /> Save Changes</>
                    }
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductForm;