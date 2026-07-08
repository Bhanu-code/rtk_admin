import { userRequest } from '@/utils/requestMethods';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { useState } from 'react';
import {
  X, Edit, DollarSign, Award, Image as ImageIcon,
  Package,  ArrowLeft, AlertCircle,
} from 'lucide-react';
import ConfirmDelete from "./ConfirmDelete";
import { toast } from "sonner";

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

/* ─── Design Tokens ─────────────────────────────────────────────── */
const bg = {
  page: "#020617",
  card: "#0f172a",
  surface: "#1e293b",
};

const border = {
  subtle: "1px solid rgba(255,255,255,0.06)",
  default: "1px solid rgba(255,255,255,0.1)",
};

const text = {
  primary: "#f1f5f9",
  secondary: "#94a3b8",
  muted: "#64748b",
};

/* ─── Reusable Components ───────────────────────────────────────── */
const SectionCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon?: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl overflow-hidden" style={{ background: bg.card, border: border.subtle }}>
    <div className="flex items-center gap-3 px-4 sm:px-6 py-4" style={{ borderBottom: border.subtle }}>
      {Icon && (
        <div className="p-2 rounded-lg flex-shrink-0" style={{ background: "rgba(99,102,241,0.12)" }}>
          <Icon className="h-4 w-4" style={{ color: "#818cf8" }} />
        </div>
      )}
      <h3 className="text-sm font-semibold" style={{ color: text.primary }}>{title}</h3>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

const FieldRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium mb-1" style={{ color: text.muted }}>{label}</p>
    <p className="text-sm break-words" style={{ color: text.primary }}>{value || '—'}</p>
  </div>
);

/* ─── Main Component ────────────────────────────────────────────── */
const ViewProduct = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatPrice = (value: unknown): string => {
    if (!value || value === 'null') return '—';
    return `₹${Number(value).toFixed(2)}`;
  };

  const formatDimensions = (l?: number, w?: number, h?: number): string => {
    if (!l && !w && !h) return '—';
    return `${l || 0} × ${w || 0} × ${h || 0} mm`;
  };

  /* Image Modal */
  const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0,0,0,0.9)" }}
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 h-9 w-9 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.1)", color: "#f1f5f9" }}
        >
          <X size={20} />
        </button>
        <img
          src={imageUrl}
          alt="Full size"
          className="w-full rounded-2xl shadow-2xl max-h-[85vh] object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder-image.png';
          }}
        />
      </div>
    </div>
  );

  /* Fetch Product */
  const { data: response, isLoading } = useQuery(
    ["get-product", id],
    () => userRequest({ url: `/product/${id}`, method: "GET" }),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const product = response?.data?.product || response?.data;
  const attribute = response?.data?.attributes || response?.data?.attribute;

  /* Delete Mutation */
  const { mutate: deleteProduct, isLoading: isDeleting } = useMutation(
    () => userRequest({ url: `/product/${id}`, method: "DELETE" }),
    {
      onSuccess: () => {
        toast.success("Product deleted successfully");
        navigate("/home/products");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete product");
      },
    }
  );

  /* Product Image Component */
  const ProductImage = ({
    src,
    alt,
    className = "",
  }: {
    src: string | null;
    alt: string;
    className?: string;
  }) => (
    <div
      className={`relative group cursor-pointer overflow-hidden rounded-2xl transition-all ${className}`}
      style={{ border: border.default, background: bg.surface }}
      onClick={() => src && setSelectedImage(src)}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={alt}
            className="w-full h-40 sm:h-56 md:h-64 object-contain bg-slate-950 transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/placeholder-image.png';
            }}
          />
          <div
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <span className="text-xs font-medium px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white">
              Click to enlarge
            </span>
          </div>
        </>
      ) : (
        <div className="h-40 sm:h-56 md:h-64 flex flex-col items-center justify-center gap-3" style={{ background: bg.surface }}>
          <ImageIcon className="h-10 w-10" style={{ color: text.muted }} />
          <span className="text-xs" style={{ color: text.muted }}>No image available</span>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen px-4" style={{ background: bg.page }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
          <p style={{ color: text.muted }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-4 text-center" style={{ background: bg.page }}>
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-xl font-medium text-red-400">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: bg.page }}>
      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 sm:p-3 rounded-xl transition-all hover:bg-white/5 flex-shrink-0"
              style={{ border: border.subtle }}
            >
              <ArrowLeft className="h-5 w-5" style={{ color: text.secondary }} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold truncate" style={{ color: text.primary }}>{product.name}</h1>
              <p className="text-xs sm:text-sm mt-1" style={{ color: text.muted }}>
                SKU: <span style={{ color: text.secondary }}>{product.sku || '—'}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <Link to={`/home/products/edit/${id}`} className="flex-1 sm:flex-initial">
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-indigo-600"
                style={{ background: "#4f46e5", color: "#fff" }}
              >
                <Edit className="h-4 w-4" />
                <span className="whitespace-nowrap">Edit Product</span>
              </button>
            </Link>

            <ConfirmDelete
              onConfirm={deleteProduct}
              isLoading={isDeleting}
              title="Delete Product"
              description="This action cannot be undone. All associated images, videos and files will be permanently deleted from S3."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Media Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <SectionCard icon={ImageIcon} title="Media Gallery">
              <div className="space-y-6 sm:space-y-8">

                {/* Base Image */}
                <div>
                  <p className="text-xs font-medium mb-3" style={{ color: text.muted }}>Base Image</p>
                  <ProductImage src={product.base_img_url} alt="Base Image" className="w-full" />
                </div>

                {/* Secondary Images */}
                <div>
                  <p className="text-xs font-medium mb-3" style={{ color: text.muted }}>Secondary Images</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <ProductImage src={product.sec_img1_url} alt="Secondary 1" />
                    <ProductImage src={product.sec_img2_url} alt="Secondary 2" />
                    <ProductImage src={product.sec_img3_url} alt="Certificate / Secondary 3" className="col-span-2 sm:col-span-1" />
                  </div>
                </div>

                {/* Videos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "product_vid_url", label: "Product Video 1" },
                    { key: "product_video2_url", label: "Product Video 2" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <p className="text-xs font-medium mb-3" style={{ color: text.muted }}>{label}</p>
                      {product[key] ? (
                        <video controls className="w-full rounded-2xl" style={{ border: border.subtle }}>
                          <source src={product[key]} type="video/mp4" />
                        </video>
                      ) : (
                        <div className="h-40 sm:h-48 flex items-center justify-center rounded-2xl" style={{ background: bg.surface, border: border.subtle }}>
                          <span style={{ color: text.muted }}>No video available</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* GIF */}
                <div>
                  <p className="text-xs font-medium mb-3" style={{ color: text.muted }}>Product GIF</p>
                  {product.product_gif_url ? (
                    <img
                      src={product.product_gif_url}
                      alt="GIF"
                      className="w-full max-w-md rounded-2xl"
                      style={{ border: border.subtle }}
                    />
                  ) : (
                    <div className="h-40 sm:h-48 flex items-center justify-center rounded-2xl" style={{ background: bg.surface, border: border.subtle }}>
                      <span style={{ color: text.muted }}>No GIF available</span>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-5 space-y-6">

            {/* Pricing & Status */}
            <SectionCard icon={DollarSign} title="Pricing & Status">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                <span
                  className="px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    background: product.status === 'Public' ? 'rgba(16,185,129,0.1)' : 
                               product.status === 'Feature' ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)',
                    color: product.status === 'Public' ? '#34d399' : 
                           product.status === 'Feature' ? '#818cf8' : '#fbbf24',
                  }}
                >
                  {product.status || 'Draft'}
                </span>

                <span className="text-sm font-medium" style={{ color: text.secondary }}>
                  {product.quantity} units
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="min-w-0">
                  <p className="text-xs" style={{ color: text.muted }}>Actual Price</p>
                  <p className="text-2xl sm:text-3xl font-semibold mt-1 truncate" style={{ color: text.primary }}>
                    {formatPrice(product.actual_price)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs" style={{ color: text.muted }}>Sale Price</p>
                  <p className="text-2xl sm:text-3xl font-semibold mt-1 truncate" style={{ color: "#34d399" }}>
                    {formatPrice(product.sale_price)}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Basic Information */}
            <SectionCard icon={Package} title="Basic Information">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <FieldRow label="Category" value={product.category} />
                  <FieldRow label="Sub-Category" value={product.subcategory} />
                </div>
                <FieldRow label="Description" value={product.description} />
              </div>
            </SectionCard>

            {/* Certificate & Gemstone Details */}
            <SectionCard icon={Award} title="Certificate & Gemstone Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm">
                <FieldRow label="Certificate No" value={attribute?.certificate_no} />
                <FieldRow label="Species" value={attribute?.species} />
                <FieldRow label="Color" value={attribute?.color} />
                <FieldRow label="Shape & Cut" value={attribute?.shape_cut} />
                <FieldRow label="Weight (Ratti)" value={attribute?.weight_ratti} />
                <FieldRow label="Weight (Carat)" value={attribute?.weight_carat} />
                <FieldRow label="Refractive Index" value={attribute?.ref_index} />
                <FieldRow label="Hardness" value={attribute?.hardness} />
                <FieldRow label="Specific Gravity" value={attribute?.sp_gravity} />
                <FieldRow label="Transparency" value={attribute?.transparency} />
                <FieldRow label="Dimensions" value={formatDimensions(attribute?.length, attribute?.width, attribute?.height)} />
                <FieldRow label="Origin" value={attribute?.origin} />
                <FieldRow label="Treatment" value={attribute?.treatment} />
                <FieldRow label="Inclusion" value={attribute?.inclusion} />
              </div>

              {attribute?.other_chars && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <p className="text-xs font-medium mb-2" style={{ color: text.muted }}>Other Characteristics</p>
                  <p className="text-sm leading-relaxed break-words" style={{ color: text.secondary }}>
                    {attribute.other_chars}
                  </p>
                </div>
              )}
            </SectionCard>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;