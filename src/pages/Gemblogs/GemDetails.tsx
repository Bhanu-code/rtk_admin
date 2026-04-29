import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoDiamondSharp } from "react-icons/io5";
import ConfirmDelete from "@/components/ConfirmDelete";
import { toast } from "sonner";
import { Loader2, Edit3, ArrowLeft, Star, Calendar, RefreshCw, ShoppingBag, Tag } from "lucide-react";
import { userRequest } from "@/utils/requestMethods";

interface GemstoneData {
  id: string;
  name: string;
  description: string;
  shortBenefits: string;
  whoShouldWear: string;
  benefits: string;
  prices: string;
  quality: string;
  specifications: string;
  faqs: string;
  curiousFacts: string;
  imageUrl: string | null;
  alternateNames: string[];
  featured: boolean;
  timestamp: string;
  updatedAt?: string;
}

const NAV_ITEMS = [
  { id: "who-should-wear", label: "Who Should Wear?" },
  { id: "benefits",        label: "Benefits"         },
  { id: "prices",          label: "Prices"           },
  { id: "quality",         label: "Quality"          },
  { id: "specifications",  label: "Specifications"   },
  { id: "faqs",            label: "FAQs"             },
  { id: "curious-facts",   label: "Curious Facts"    },
];

// Rich HTML rendered on dark bg — every element needs explicit light color
const richTextCls = `
  text-slate-200 text-sm leading-relaxed
  [&_h1]:text-white [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:first:mt-0
  [&_h2]:text-white [&_h2]:text-lg  [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:first:mt-0
  [&_h3]:text-white [&_h3]:text-base [&_h3]:font-medium  [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:first:mt-0
  [&_p]:text-slate-200 [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:last:mb-0
  [&_strong]:text-white [&_strong]:font-semibold
  [&_em]:text-slate-300 [&_em]:italic
  [&_a]:text-indigo-400 [&_a]:underline [&_a]:hover:text-indigo-300
  [&_ul]:my-3 [&_ul]:pl-0 [&_ul]:list-none [&_ul]:space-y-2
  [&_ol]:my-3 [&_ol]:pl-5 [&_ol]:space-y-2
  [&_li]:text-slate-200 [&_li]:leading-relaxed
  [&_ul>li]:flex [&_ul>li]:items-start [&_ul>li]:gap-2
  [&_ul>li]:before:content-['▸'] [&_ul>li]:before:text-indigo-400 [&_ul>li]:before:text-xs [&_ul>li]:before:mt-0.5 [&_ul>li]:before:flex-shrink-0
  [&_ol>li]:text-slate-200
  [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-500/60 [&_blockquote]:pl-4 [&_blockquote]:text-slate-300 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:bg-indigo-500/5 [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg
  [&_hr]:border-white/10 [&_hr]:my-5
  [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_table]:my-3
  [&_th]:text-white [&_th]:font-semibold [&_th]:text-left [&_th]:py-2.5 [&_th]:px-3 [&_th]:border-b [&_th]:border-white/10 [&_th]:bg-slate-800/80
  [&_td]:text-slate-200 [&_td]:py-2.5 [&_td]:px-3 [&_td]:border-b [&_td]:border-white/5
  [&_tr:hover>td]:bg-white/[0.03]
  [&_code]:bg-slate-800 [&_code]:text-indigo-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
`;

// ─── GemblogProducts — fetches products linked to this gemblog by gemblog_id ──
interface AttachedProduct {
  id: string;
  name: string;
  sku: string;
  base_img_url: string | null;
  actual_price: number;
  sale_price: number;
  category: string;
  subcategory: string;
  status: string;
  gemblog_id: string | null;
}

const AttachedProducts = ({ gemblogId }: { gemblogId: string }) => {
  const { data, isLoading } = useQuery(
    ["gemblog-products", gemblogId],
    async () => {
      const res = await userRequest({ url: "/product", method: "GET" });
      const all: AttachedProduct[] = res?.data ?? res ?? [];
      // Filter products that have this gemblog selected
      return all.filter((p) => p.gemblog_id === gemblogId);
    },
    { enabled: !!gemblogId, staleTime: 60_000 }
  );

  const products = data ?? [];

  return (
    <div className="mt-12 border-t border-white/8 pt-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <ShoppingBag className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Shop This Gemstone</h2>
          <p className="text-xs text-slate-500 mt-0.5">Handpicked products related to this gemstone</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-white/8 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-800" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-slate-600 text-sm">Products not found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const hasDiscount = product.actual_price > product.sale_price && product.sale_price > 0;
            const discountPct = hasDiscount
              ? Math.round(((product.actual_price - product.sale_price) / product.actual_price) * 100)
              : 0;

            return (
              <div key={product.id}
                className="group bg-slate-900 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 hover:shadow-xl hover:shadow-black/30 transition-all duration-200"
              >
                {/* Image */}
                <div className="relative aspect-square bg-slate-800 overflow-hidden">
                  {product.base_img_url ? (
                    <img
                      src={product.base_img_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-10 w-10 text-slate-700" />
                    </div>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      -{discountPct}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <p className="text-white text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-slate-500" />
                    <span className="text-xs text-slate-500 capitalize">{product.category}</span>
                  </div>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-white font-semibold text-sm">
                      ₹{product.sale_price?.toLocaleString("en-IN")}
                    </span>
                    {hasDiscount && (
                      <span className="text-slate-600 text-xs line-through">
                        ₹{product.actual_price?.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const GemDetails = () => {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSection, setSelectedSection] = useState("who-should-wear");

  const { data: gemData, isLoading } = useQuery<GemstoneData>(
    ["get-gem-details", id],
    async () => {
      const res = await userRequest({ url: `/gemstones/${id}`, method: "GET" });
      return res?.data ?? res;
    },
    { enabled: !!id, refetchOnWindowFocus: false }
  );

  const deleteMutation = useMutation(
    () => userRequest({ url: `/gemstones/${id}`, method: "DELETE" }),
    {
      onSuccess: () => {
        toast.success("Gemstone deleted successfully", { position: "bottom-right" });
        queryClient.invalidateQueries("get-all-gems");
        navigate("/home/gemblogs");
      },
      onError: (e: any) => toast.error(e.message || "Failed to delete", { position: "bottom-right" }),
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-indigo-400" />
          <p className="text-slate-300 text-sm">Loading gemstone details...</p>
        </div>
      </div>
    );
  }

  if (!gemData) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center space-y-4">
          <IoDiamondSharp className="h-16 w-16 text-slate-700 mx-auto" />
          <p className="text-2xl text-white font-semibold">Gemstone not found</p>
          <p className="text-slate-400 text-sm">This gemstone doesn't exist or was removed.</p>
          <button onClick={() => navigate("/home/gemblogs")}
            className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >Back to Gemstones</button>
        </div>
      </div>
    );
  }

  const alternateNames = Array.isArray(gemData.alternateNames) ? gemData.alternateNames.filter(Boolean) : [];

  const sectionContent: Record<string, string | undefined> = {
    "who-should-wear": gemData.whoShouldWear,
    "benefits":        gemData.benefits,
    "prices":          gemData.prices,
    "quality":         gemData.quality,
    "specifications":  gemData.specifications,
    "faqs":            gemData.faqs,
    "curious-facts":   gemData.curiousFacts,
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#020617" }}>

      {/* ── Sticky top bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#020617]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/home/gemblogs")}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Gemstones
          </button>

          <div className="flex items-center gap-2">
            <Link to={`/home/gemblogs/edit/${id}`}>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </button>
            </Link>
            <ConfirmDelete
              onConfirm={() => deleteMutation.mutate()}
              title="Delete Gemstone"
              description="This action cannot be undone. This will permanently delete the gemstone and its associated data."
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── LEFT COLUMN ───────────────────────────────────────────────── */}
          <div className="lg:w-5/12">
            <div className="sticky top-20 space-y-5">

              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/8 aspect-square">
                {gemData.imageUrl ? (
                  <img
                    src={gemData.imageUrl}
                    alt={gemData.name}
                    className="w-full h-full object-contain p-8 transition-transform duration-500 hover:scale-105"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <IoDiamondSharp className="h-20 w-20 text-slate-700" />
                  </div>
                )}
                {gemData.featured && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-amber-300" />
                    Featured
                  </div>
                )}
              </div>

              {/* Name + alt names */}
              <div className="space-y-2.5">
                <h1 className="text-2xl font-semibold text-white leading-snug">{gemData.name}</h1>
                {alternateNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {alternateNames.map((name, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-white/8 text-slate-300">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-slate-300 text-sm leading-relaxed">{gemData.description}</p>
              </div>

              {/* Short benefits */}
              {gemData.shortBenefits && (
                <div className="bg-slate-900 border border-white/8 rounded-xl p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    Key Benefits
                  </p>
                  <div className={richTextCls} dangerouslySetInnerHTML={{ __html: gemData.shortBenefits }} />
                </div>
              )}

              {/* Meta */}
              <div className="border-t border-white/5 pt-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-slate-400">Added {new Date(gemData.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                {gemData.updatedAt && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
                    <span className="text-slate-400">Updated {new Date(gemData.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ──────────────────────────────────────────────── */}
          <div className="lg:w-7/12 space-y-5">

            {/* Tab pills */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-white/8">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedSection(item.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                    selectedSection === item.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Content card */}
            <div className="bg-slate-900 border border-white/8 rounded-2xl p-6 min-h-64">
              {/* Section heading */}
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">
                {NAV_ITEMS.find(n => n.id === selectedSection)?.label}
              </p>

              {sectionContent[selectedSection] ? (
                <div
                  className={richTextCls}
                  dangerouslySetInnerHTML={{ __html: sectionContent[selectedSection]! }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <IoDiamondSharp className="h-10 w-10 text-slate-700" />
                  <p className="text-slate-500 text-sm">No content for this section yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Attached Products ───────────────────────────────────────────── */}
        {gemData.id && (
          <AttachedProducts gemblogId={gemData.id} />
        )}

      </div>
    </div>
  );
};

export default GemDetails;