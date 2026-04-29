import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Upload, Plus, Trash2, ArrowLeft, Save, ImageIcon, Package, X, Search, ShoppingBag } from "lucide-react";
import { FormattedPasteArea } from "./blog/WhoShouldWear";
import { ClientOnly } from "remix-utils/client-only";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GemstoneFormData {
  id?: string;
  name: string;
  alternateNames: string[];
  shortBenefits: string;
  description: string;
  whoShouldWear: string;
  benefits: string;
  prices: string;
  quality: string;
  specifications: string;
  faqs: string;
  curiousFacts: string;
  featured: boolean;
  imageUrl?: string;
  newImage?: File | null;
  attachedProducts: string[]; // array of product IDs
}

interface EditGemstoneFormProps {
  gemstoneId?: string;
  onSuccess?: () => void;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls  = "w-full bg-white/5 border border-white/8 text-white placeholder:text-slate-600 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all";
const labelCls  = "text-xs font-medium text-slate-400 mb-1.5 block";
const sectionTitleCls = "text-sm font-semibold text-white";

// ─── Component ────────────────────────────────────────────────────────────────

// ─── ProductSelector — OUTSIDE component (stable reference = no focus issues) ──
interface Product {
  id: string;
  name: string;
  sku: string;
  base_img_url: string | null;
  sale_price: number;
  category: string;
  subcategory: string;
}

const ProductSelector = ({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) => {
  const [search, setSearch] = useState("");

  const { data: productsData, isLoading } = useQuery(
    "get-all-products-for-gem",
    async () => {
      const res = await fetch(`${import.meta.env.VITE_PROXY_URL}/product`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return (json.data ?? json) as Product[];
    },
    { staleTime: 60_000 }
  );

  const products = productsData ?? [];
  const filtered = products.filter((p) =>
    p.name?.toLowerCase()?.includes(search.toLowerCase()) ||
    p.sku?.toLowerCase()?.includes(search.toLowerCase()) ||
    p.category?.toLowerCase()?.includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    onChange(selected?.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const selectedProducts = products.filter((p) => selected?.includes(p.id));

  return (
    <div className="space-y-4">
      {/* Selected chips */}
      {selectedProducts?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400">
            {selectedProducts?.length} product{selectedProducts?.length !== 1 ? "s" : ""} attached
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 pl-2 pr-1 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
              >
                {p.base_img_url ? (
                  <img src={p.base_img_url} alt={p.name} className="h-5 w-5 rounded object-cover flex-shrink-0" />
                ) : (
                  <ShoppingBag className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                )}
                <span className="text-xs text-indigo-300 max-w-[140px] truncate">{p.name}</span>
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  className="ml-0.5 p-0.5 rounded hover:bg-indigo-500/20 text-indigo-400 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + list */}
      <div className="border border-white/8 rounded-xl overflow-hidden">
        {/* Search bar */}
        <div className="relative border-b border-white/8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category..."
            className="w-full bg-slate-950 text-slate-200 text-sm pl-9 pr-4 py-2.5 placeholder:text-slate-600 focus:outline-none"
          />
        </div>

        {/* Product list */}
        <div className="max-h-64 overflow-y-auto bg-slate-950">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading products...
            </div>
          ) : filtered?.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-slate-600 text-sm">
              <Package className="h-8 w-8" />
              {search ? "No products match your search" : "No products found"}
            </div>
          ) : (
            filtered.map((product) => {
              const isSelected = selected?.includes(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggle(product.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 last:border-0 ${
                    isSelected
                      ? "bg-indigo-500/10 hover:bg-indigo-500/15"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`h-4 w-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-white/20 bg-transparent"
                  }`}>
                    {isSelected && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Image */}
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                    {product.base_img_url ? (
                      <img src={product.base_img_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-slate-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-indigo-200" : "text-slate-200"}`}>
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{product.sku}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-slate-500 capitalize">{product.category}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <span className="text-sm font-semibold text-white flex-shrink-0">
                    ₹{product.sale_price?.toLocaleString("en-IN")}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Section — OUTSIDE component to prevent remount on every keystroke ─────────
const Section = ({
  value, label, children,
}: {
  value: string; label: string; children: React.ReactNode;
}) => (
  <AccordionItem value={value} className="border-white/8">
    <AccordionTrigger className="text-white hover:text-white hover:no-underline py-4 px-6 text-sm font-medium">
      {label}
    </AccordionTrigger>
    <AccordionContent className="px-6 pb-6 pt-2">
      {children}
    </AccordionContent>
  </AccordionItem>
);

// ─── RichSection — OUTSIDE component for same reason ─────────────────────────
const RichSection = ({
  title, content, onChange,
}: {
  title: string;
  content: string;
  onChange: (val: string) => void;
}) => (
  <div className="space-y-2">
    <label className={labelCls}>{title}</label>
    <div className="bg-slate-950 border border-white/8 rounded-xl overflow-hidden">
      <ClientOnly fallback={<div className="h-52 bg-slate-950 animate-pulse" />}>
        {() => (
          <div className="min-h-[200px] p-1">
            <FormattedPasteArea
              content={content || ""}
              onChange={onChange}
            />
          </div>
        )}
      </ClientOnly>
    </div>
  </div>
);

const EditGemstoneForm = ({ gemstoneId: propId, onSuccess }: EditGemstoneFormProps) => {
  const params   = useParams<{ id: string }>();
  const id       = propId ?? params.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<GemstoneFormData>({
    name: "", alternateNames: [""], shortBenefits: "", description: "",
    whoShouldWear: "", benefits: "", prices: "", quality: "",
    specifications: "", faqs: "", curiousFacts: "",
    featured: false, imageUrl: "", newImage: null, attachedProducts: [],
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  // ── Fetch existing data ──────────────────────────────────────────────────────
  const { isLoading } = useQuery(
    ["gemstone-edit", id],
    async () => {
      const res = await fetch(`${import.meta.env.VITE_PROXY_URL}/gemstones/${id}`);
      if (!res.ok) throw new Error("Failed to fetch gemstone");
      return res.json();
    },
    {
      enabled: !!id,
      onSuccess: (data: any) => {
        setFormData({
          id:             data.id,
          name:           data.name            || "",
          alternateNames: Array.isArray(data.alternateNames)
            ? (data.alternateNames?.length > 0 ? data.alternateNames : [""])
            : data.alternateNames
              ? JSON.parse(data.alternateNames)
              : [""],
          shortBenefits:  data.shortBenefits   || "",
          description:    data.description     || "",
          whoShouldWear:  data.whoShouldWear    || "",
          benefits:       data.benefits        || "",
          prices:         data.prices          || "",
          quality:        data.quality         || "",
          specifications: data.specifications  || "",
          faqs:           data.faqs            || "",
          curiousFacts:   data.curiousFacts    || "",
          featured:       Boolean(data.featured),
          imageUrl:       data.imageUrl        || "",
          newImage:       null,
        });
        if (data.imageUrl) setImagePreview(data.imageUrl);
      },
    }
  );

  // ── Update mutation ──────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name",           formData.name.trim());
      fd.append("description",    formData.description.trim());
      fd.append("shortBenefits",  formData.shortBenefits.trim());
      fd.append("whoShouldWear",  formData.whoShouldWear.trim());
      fd.append("benefits",       formData.benefits.trim());
      fd.append("prices",         formData.prices.trim());
      fd.append("quality",        formData.quality.trim());
      fd.append("specifications", formData.specifications.trim());
      fd.append("faqs",           formData.faqs.trim());
      fd.append("curiousFacts",   formData.curiousFacts.trim());
      fd.append("featured",       formData.featured.toString());
      fd.append("alternateNames", JSON.stringify(
        formData.alternateNames.map(n => n.trim()).filter(Boolean)
      ));
      if (formData.newImage) fd.append("image", formData.newImage);
      fd.append("attachedProducts", JSON.stringify(formData.attachedProducts));

      const res = await fetch(
        `${import.meta.env.VITE_PROXY_URL}/gemstones/${id}`,
        { method: "PUT", body: fd }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update gemstone");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Gemstone updated successfully!", { position: "bottom-right" });
      queryClient.invalidateQueries(["gemstone-edit", id]);
      queryClient.invalidateQueries(["get-gem-details", id]);
      queryClient.invalidateQueries("get-all-gems");
      onSuccess?.();
      navigate("/home/gemblogs");
    },
    onError: (e: any) => toast.error(e.message || "Failed to update", { position: "bottom-right" }),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const set = (field: keyof GemstoneFormData, val: any) =>
    setFormData(p => ({ ...p, [field]: val }));

  const handleAlternateNameChange = (index: number, value: string) => {
    const updated = [...formData.alternateNames];
    updated[index] = value;
    set("alternateNames", updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("newImage", file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    updateMutation.mutate();
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-indigo-400" />
          <p className="text-slate-300 text-sm">Loading gemstone data...</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-20" style={{ background: "#020617" }}>

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#020617]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm hidden sm:block">
              {formData.name || "Edit Gemstone"}
            </span>
            <button
              type="submit"
              form="edit-gem-form"
              disabled={updateMutation.isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isLoading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                : <><Save className="h-3.5 w-3.5" /> Save Changes</>
              }
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Edit Gemstone</h1>
          <p className="text-slate-400 text-sm mt-1">Update the gemstone blog information</p>
        </div>

        <form id="edit-gem-form" onSubmit={handleSubmit} className="space-y-3">
          <div className="bg-slate-900 border border-white/8 rounded-2xl overflow-hidden">
            <Accordion type="single" collapsible defaultValue="basic" className="w-full">

              {/* ── Basic Info ──────────────────────────────────────────── */}
              <Section value="basic" label="Basic Information">
                <div className="space-y-5">

                  {/* Name + Featured */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>
                        Gemstone Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={formData.name}
                        onChange={e => set("name", e.target.value)}
                        placeholder="e.g. Natural Ruby"
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-5">
                      <Switch
                        checked={formData.featured}
                        onCheckedChange={v => set("featured", v)}
                      />
                      <div>
                        <p className="text-sm text-white font-medium">Featured</p>
                        <p className="text-xs text-slate-500">Show on homepage</p>
                      </div>
                    </div>
                  </div>

                  {/* Image upload */}
                  <div className="space-y-3">
                    <label className={labelCls}>Gemstone Image</label>

                    {/* Current / preview image */}
                    {imagePreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-white/8 bg-slate-950 group">
                        <img
                          src={imagePreview}
                          alt="Gemstone"
                          className="w-full max-h-64 object-contain p-4"
                        />
                        <label
                          htmlFor="editImage"
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center gap-2 text-white text-sm font-medium"
                        >
                          <Upload className="h-4 w-4" />
                          Change Image
                        </label>
                        <input type="file" accept="image/*" id="editImage" className="hidden" onChange={handleImageUpload} />
                      </div>
                    ) : (
                      <label
                        htmlFor="editImage"
                        className="flex flex-col items-center justify-center gap-3 w-full h-40 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-indigo-500/40 cursor-pointer transition-all"
                      >
                        <ImageIcon className="h-8 w-8 text-slate-600" />
                        <div className="text-center">
                          <p className="text-slate-400 text-sm">Click to upload image</p>
                          <p className="text-slate-600 text-xs mt-0.5">PNG, JPG, JPEG</p>
                        </div>
                        <input type="file" accept="image/*" id="editImage" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}

                    {formData.newImage && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                        ✓ New image selected: {formData.newImage.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className={labelCls}>
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={e => set("description", e.target.value)}
                      rows={4}
                      placeholder="Write a detailed description of the gemstone..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Alternate names */}
                  <div className="space-y-2">
                    <label className={labelCls}>Alternate Names / Sub-categories</label>
                    <div className="space-y-2">
                      {formData.alternateNames.map((name, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            value={name}
                            onChange={e => handleAlternateNameChange(index, e.target.value)}
                            placeholder="e.g. Red Ruby, Manik"
                            className={inputCls}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (formData.alternateNames?.length === 1) return;
                              set("alternateNames", formData.alternateNames.filter((_, i) => i !== index));
                            }}
                            disabled={formData.alternateNames?.length === 1}
                            className="flex-shrink-0 h-10 w-10 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/8 hover:border-red-500/30 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => set("alternateNames", [...formData.alternateNames, ""])}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Another Name
                    </button>
                  </div>
                </div>
              </Section>

              {/* Short Benefits */}
              <Section value="shortBenefits" label="Short Benefits">
                <RichSection title="Brief benefit summary (shown on listing page)" content={formData.shortBenefits} onChange={val => set("shortBenefits", val)} />
              </Section>

              {/* Rich sections */}
              <Section value="wearing" label="Who Should Wear">
                <RichSection title="Who Should Wear This Gemstone" content={formData.whoShouldWear} onChange={val => set("whoShouldWear", val)} />
              </Section>

              <Section value="benefits" label="Benefits">
                <RichSection title="Gemstone Benefits" content={formData.benefits} onChange={val => set("benefits", val)} />
              </Section>

              <Section value="prices" label="Pricing Information">
                <RichSection title="Pricing Details" content={formData.prices} onChange={val => set("prices", val)} />
              </Section>

              <Section value="quality" label="Quality">
                <RichSection title="Quality Information" content={formData.quality} onChange={val => set("quality", val)} />
              </Section>

              <Section value="specifications" label="Specifications">
                <RichSection title="Technical Specifications" content={formData.specifications} onChange={val => set("specifications", val)} />
              </Section>

              <Section value="faqs" label="FAQs">
                <RichSection title="Frequently Asked Questions" content={formData.faqs} onChange={val => set("faqs", val)} />
              </Section>

              <Section value="curiousFacts" label="Curious Facts">
                <RichSection title="Interesting & Curious Facts" content={formData.curiousFacts} onChange={val => set("curiousFacts", val)} />
              </Section>

              {/* ── Attached Products ──────────────────────────────────── */}
              {/* <Section value="products" label={`Attached Products${formData.attachedProducts?.length > 0 ? ` (${formData.attachedProducts?.length})` : ""}`}>
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Select products to display at the end of this gemstone blog. Visitors will see these as purchase recommendations.
                  </p>
                  <ProductSelector
                    selected={formData.attachedProducts}
                    onChange={(ids) => set("attachedProducts", ids)}
                  />
                </div>
              </Section> */}

            </Accordion>
          </div>

          {/* Submit button (bottom) */}
          <button
            type="submit"
            disabled={updateMutation.isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving Changes…</>
              : <><Save className="h-4 w-4" /> Save Changes</>
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditGemstoneForm;