import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Upload, Plus, Trash2, Package, X, Search, ShoppingBag } from "lucide-react";
import { FormattedPasteArea } from "./blog/WhoShouldWear";
import { ClientOnly } from "remix-utils/client-only";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface GemstoneFormData {
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
  image?: File | null;
  featured: boolean;
  attachedProducts: string[]; // product IDs
}

interface Product {
  id: string;
  name: string;
  sku: string;
  base_img_url: string | null;
  sale_price: number;
  category: string;
  subcategory: string;
}

// ─── ProductSelector — defined OUTSIDE to prevent re-mount on parent re-render ──
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
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const selectedProducts = products.filter((p) => selected.includes(p.id));

  return (
    <div className="space-y-4">
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} attached
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-2 pl-2 pr-1 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                {p.base_img_url
                  ? <img src={p.base_img_url} alt={p.name} className="h-5 w-5 rounded object-cover flex-shrink-0" />
                  : <ShoppingBag className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                }
                <span className="text-xs text-indigo-300 max-w-[140px] truncate">{p.name}</span>
                <button type="button" onClick={() => toggle(p.id)}
                  className="ml-0.5 p-0.5 rounded hover:bg-indigo-500/20 text-indigo-400 hover:text-white transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-white/10 rounded-xl overflow-hidden">
        <div className="relative border-b border-white/10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category..."
            className="w-full bg-slate-950 text-slate-200 text-sm pl-9 pr-4 py-2.5 placeholder:text-slate-600 focus:outline-none"
          />
        </div>
        <div className="max-h-64 overflow-y-auto bg-slate-950">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading products...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-slate-600 text-sm">
              <Package className="h-8 w-8" />
              {search ? "No products match your search" : "No products found"}
            </div>
          ) : (
            filtered.map((product) => {
              const isSelected = selected.includes(product.id);
              return (
                <button key={product.id} type="button" onClick={() => toggle(product.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 last:border-0 ${
                    isSelected ? "bg-indigo-500/10 hover:bg-indigo-500/15" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className={`h-4 w-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                    isSelected ? "bg-indigo-600 border-indigo-600" : "border-white/20 bg-transparent"
                  }`}>
                    {isSelected && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                    {product.base_img_url
                      ? <img src={product.base_img_url} alt={product.name} className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center"><ShoppingBag className="h-4 w-4 text-slate-600" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-indigo-200" : "text-slate-200"}`}>{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{product.sku}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-slate-500 capitalize">{product.category}</span>
                    </div>
                  </div>
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

const GemstoneForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<GemstoneFormData>({
    name: "",
    alternateNames: [""],
    shortBenefits: "",
    description: "",
    whoShouldWear: "",
    benefits: "",
    prices: "",
    quality: "",
    specifications: "",
    faqs: "",
    curiousFacts: "",
    image: null,
    featured: false,
    attachedProducts: [],
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  const createGemblogMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/gemstones`, {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create gemstone");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Gemstone created successfully!", { position: "bottom-right" });
      queryClient.invalidateQueries("get-all-gems");
      navigate("/home/gemblogs");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create gemstone", { position: "bottom-right" });
    },
  });

  const handleInputChange = (field: keyof GemstoneFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAlternateNameChange = (index: number, value: string) => {
    const newNames = [...formData.alternateNames];
    newNames[index] = value;
    setFormData((prev) => ({ ...prev, alternateNames: newNames }));
  };

  const addAlternateName = () => {
    setFormData((prev) => ({ ...prev, alternateNames: [...prev.alternateNames, ""] }));
  };

  const removeAlternateName = (index: number) => {
    if (formData.alternateNames.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      alternateNames: prev.alternateNames.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.image) {
      toast.error("Name, description and image are required");
      return;
    }

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
    fd.append("alternateNames", JSON.stringify(formData.alternateNames.filter(n => n.trim())));
    fd.append("attachedProducts", JSON.stringify(formData.attachedProducts));
    if (formData.image) fd.append("image", formData.image);

    createGemblogMutation.mutate(fd);
  };

  const renderFormattedSection = (title: string, content: string, field: keyof GemstoneFormData) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-slate-300">{title}</Label>
      <Card className="bg-slate-900 border-white/10">
        <CardContent className="pt-4">
          <ClientOnly fallback={<div className="h-52 bg-slate-950 rounded-lg animate-pulse" />}>
            {() => (
              <div className="min-h-[200px]">
                <FormattedPasteArea
                  content={content}
                  onChange={(newContent) => handleInputChange(field, newContent)}
                />
              </div>
            )}
          </ClientOnly>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] p-5">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Add New Gemstone</CardTitle>
            <p className="text-slate-400">Fill in the details for the new gemstone blog</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <Accordion type="single" collapsible defaultValue="basic" className="w-full">

                <AccordionItem value="basic">
                  <AccordionTrigger className="text-lg font-medium text-white">Basic Information</AccordionTrigger>
                  <AccordionContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Gemstone Name <span className="text-red-400">*</span></Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="e.g. Natural Ruby"
                          className="bg-slate-950 border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Featured</Label>
                        <div className="flex items-center gap-3 pt-2">
                          <Switch
                            checked={formData.featured}
                            onCheckedChange={(checked) => handleInputChange("featured", checked)}
                          />
                          <span className="text-sm text-slate-400">Mark as featured gemstone</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-300">Gemstone Image <span className="text-red-400">*</span></Label>
                      <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-indigo-500/50 transition-colors">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="gemImage" />
                        <label htmlFor="gemImage" className="cursor-pointer flex flex-col items-center">
                          <Upload className="h-10 w-10 text-slate-500 mb-3" />
                          <p className="text-sm text-slate-400">Click to upload gemstone image</p>
                          <p className="text-xs text-slate-600 mt-1">PNG, JPG, JPEG up to 5MB</p>
                        </label>
                      </div>
                      {imagePreview && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                          <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-contain bg-slate-950" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Description <span className="text-red-400">*</span></Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Write a detailed description of the gemstone..."
                        className="min-h-32 bg-slate-950 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-300">Alternate Names / Sub-Categories</Label>
                      {formData.alternateNames.map((name, index) => (
                        <div key={index} className="flex gap-2 text-white">
                          <Input
                            value={name}
                            onChange={(e) => handleAlternateNameChange(index, e.target.value)}
                            placeholder="e.g. Red Ruby, Manik"
                            className="bg-slate-950 border-white/10"
                          />
                          <Button type="button" variant="ghost" size="icon"
                            onClick={() => removeAlternateName(index)}
                            disabled={formData.alternateNames.length === 1}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addAlternateName}
                        className="border-white/10 text-slate-400 hover:text-white">
                        <Plus className="h-4 w-4 mr-2" /> Add Another Name
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="wearing">
                  <AccordionTrigger className="text-white">Who Should Wear</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Who Should Wear This Gemstone", formData.whoShouldWear, "whoShouldWear")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="benefits">
                  <AccordionTrigger className="text-white">Benefits</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Gemstone Benefits", formData.benefits, "benefits")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="prices">
                  <AccordionTrigger className="text-white">Pricing Information</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Pricing Details", formData.prices, "prices")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="quality">
                  <AccordionTrigger className="text-white">Quality</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Quality Information", formData.quality, "quality")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="specifications">
                  <AccordionTrigger className="text-white">Specifications</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Technical Specifications", formData.specifications, "specifications")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="faqs">
                  <AccordionTrigger className="text-white">FAQs</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Frequently Asked Questions", formData.faqs, "faqs")}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="curiousFacts">
                  <AccordionTrigger className="text-white">Curious Facts</AccordionTrigger>
                  <AccordionContent>{renderFormattedSection("Interesting & Curious Facts", formData.curiousFacts, "curiousFacts")}</AccordionContent>
                </AccordionItem>

                {/* ── Attached Products ──────────────────────────────────────── */}
                {/* <AccordionItem value="products">
                  <AccordionTrigger className="text-white">Attached Products</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-1">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Select products to display at the end of this gemstone blog page. Visitors will see these as purchase recommendations.
                      </p>
                      <ProductSelector
                        selected={formData.attachedProducts}
                        onChange={(ids) => handleInputChange("attachedProducts", ids)}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem> */}

              </Accordion>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 text-lg font-medium"
                disabled={createGemblogMutation.isLoading || !formData.name || !formData.description || !formData.image}
              >
                {createGemblogMutation.isLoading ? (
                  <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Creating Gemstone...</>
                ) : (
                  "Create Gemstone Blog"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GemstoneForm;