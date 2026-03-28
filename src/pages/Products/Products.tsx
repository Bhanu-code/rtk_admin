import { useState } from 'react';
import { Input } from "@/components/ui/input";
import {
  Search, Filter, Plus, MoreVertical,
  Tag, Package, AlertCircle, ArrowUpDown,
  Eye, TrendingDown, ShoppingBag, ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { userRequest } from '@/utils/requestMethods';
import { useQuery } from 'react-query';
import AddProductModal from '@/components/AddProductModal';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = ['All', 'Gemstones', 'Jewelry']; // Updated to match your actual categories
  const statuses = ['All', 'Draft', 'Feature', 'Public'];

  const { data: AllProducts, isLoading } = useQuery(
    "get-all-products",
    () => userRequest({ url: `/product`, method: "get" }),
    { 
      onError: (e: any) => console.error("Failed to fetch products:", e),
      staleTime: 1000 * 60 * 5, // 5 minutes cache (signed URLs are valid for 7 days)
    }
  );

  const products = AllProducts?.data ?? [];

  const totalProducts = products.length;
  const lowStock = products.filter((p: any) => p.quantity > 0 && p.quantity <= 10).length;
  const outOfStock = products.filter((p: any) => p.quantity === 0).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Public':  return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Feature': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Draft':   return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getStockBadge = (qty: number) => {
    if (qty === 0)  return 'bg-red-500/10 text-red-400 border border-red-500/20';
    if (qty <= 10)  return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  };

  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen">

      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} />}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="text-sm text-slate-500 mt-1">{totalProducts} total products</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            label: 'Total Products', 
            value: totalProducts, 
            icon: ShoppingBag, 
            iconBg: 'bg-indigo-500/10', 
            iconColor: 'text-indigo-400' 
          },
          { 
            label: 'Low Stock',      
            value: lowStock,      
            icon: TrendingDown, 
            iconBg: 'bg-amber-500/10',  
            iconColor: 'text-amber-400'  
          },
          { 
            label: 'Out of Stock',   
            value: outOfStock,    
            icon: AlertCircle,  
            iconBg: 'bg-red-500/10',    
            iconColor: 'text-red-400'    
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex items-center justify-between hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-3xl font-semibold text-white mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by product name or SKU..."
              className="pl-11 bg-slate-950 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            {[
              { value: categoryFilter, setter: setCategoryFilter, options: categories, label: "Category" },
              { value: statusFilter,   setter: setStatusFilter,   options: statuses,   label: "Status" }
            ].map((filter, index) => (
              <div key={index} className="relative min-w-[140px]">
                <select
                  className="w-full appearance-none bg-slate-950 border border-white/10 text-slate-300 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  value={filter.value}
                  onChange={(e) => filter.setter(e.target.value)}
                >
                  {filter.options.map((option) => (
                    <option key={option} value={option} className="bg-slate-900">
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-16 w-16 text-slate-600 mb-4" />
          <p className="text-xl text-slate-400 font-medium">No products found</p>
          <p className="text-slate-500 mt-2">Try changing your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <div
              key={product.id || product.sku}
              className="group bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40"
            >
              <div className="relative aspect-[16/13] bg-slate-950 overflow-hidden">
                <img
                  src={product.base_img_url || '/placeholder-image.png'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />

                <div className="absolute top-3 left-3">
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(product.status)}`}>
                    {product.status || 'Draft'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-medium text-white line-clamp-2 leading-tight">{product.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">SKU: {product.sku}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Tag className="h-3.5 w-3.5" />
                  {product.category} {product.subcategory && `• ${product.subcategory}`}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold text-white">
                    ₹{product.sale_price || product.actual_price}
                  </span>
                  {product.sale_price && product.actual_price && product.sale_price < product.actual_price && (
                    <span className="text-sm text-slate-500 line-through">
                      ₹{product.actual_price}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStockBadge(product.quantity)}`}>
                    {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} in stock`}
                  </span>

                  <Link to={`/home/products/view/${product.id}`}>
                    <button className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;