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
import AddProductModal from './AddProductModal';


const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = ['All', 'Electronics', 'Accessories', 'Clothing', 'Books', 'Gemstones'];
  const statuses = ['All', 'Draft', 'Feature', 'Public'];

  const { data: AllProducts } = useQuery("get-all-products",
    () => userRequest({ url: `/product/get-all-products/`, method: "get" }),
    { onError: (e: any) => console.log(e) }
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
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen">

      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} />}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-white">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{totalProducts} total products</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Products', value: totalProducts, icon: ShoppingBag, iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-400' },
          { label: 'Low Stock',      value: lowStock,      icon: TrendingDown, iconBg: 'bg-amber-500/10',  iconColor: 'text-amber-400'  },
          { label: 'Out of Stock',   value: outOfStock,    icon: AlertCircle,  iconBg: 'bg-red-500/10',    iconColor: 'text-red-400'    },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-white/5 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
            <ArrowUpDown className="h-4 w-4 text-slate-700" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-white/5 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by name or SKU..."
              className="pl-10 bg-white/5 border-white/5 text-slate-300 placeholder:text-slate-600 focus:border-indigo-500/50 focus-visible:ring-0"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            {[{ val: categoryFilter, set: setCategoryFilter, opts: categories },
              { val: statusFilter,   set: setStatusFilter,   opts: statuses   }].map((s, i) => (
              <div key={i} className="relative">
                <select
                  className="appearance-none bg-white/5 border border-white/5 text-slate-400 text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                  value={s.val} onChange={e => s.set(e.target.value)}
                >
                  {s.opts.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
              </div>
            ))}
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/8 border border-white/5 text-slate-400 hover:text-white text-sm rounded-lg transition-all duration-200">
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 bg-slate-900 rounded-full mb-4">
            <Package className="h-8 w-8 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">No products found</p>
          <p className="text-slate-600 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product: any) => (
            <div key={product?.sku}
              className="group bg-slate-900 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 hover:shadow-xl hover:shadow-black/30 transition-all duration-200"
            >
              <div className="relative aspect-[4/3] bg-slate-800 overflow-hidden">
                <img src={product?.base_img_url} alt={product?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(product?.status)}`}>{product?.status}</span>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="h-7 w-7 bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-slate-400 hover:text-white border border-white/10">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-white font-medium text-sm leading-tight line-clamp-1">{product?.name}</h3>
                  <p className="text-slate-600 text-xs mt-0.5">SKU: {product?.sku}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="h-3 w-3 text-slate-600" />
                  <span className="text-xs text-slate-500">{product?.category}</span>
                  {product?.subcategory && <><span className="text-slate-700">·</span><span className="text-xs text-slate-500">{product?.subcategory}</span></>}
                </div>
                <div className="flex items-baseline gap-2">
                  {product?.sale_price > 0 ? (
                    <><span className="text-white font-semibold text-sm">₹{product?.sale_price}</span><span className="text-slate-600 text-xs line-through">₹{product?.actual_price}</span></>
                  ) : (
                    <span className="text-white font-semibold text-sm">₹{product?.actual_price}</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${getStockBadge(product?.quantity)}`}>
                    {product?.quantity === 0 && <AlertCircle className="h-3 w-3" />}
                    {product?.quantity === 0 ? 'Out of stock' : `${product?.quantity} units`}
                  </span>
                  <Link to={`/home/products/view/${product?.id}`}>
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200">
                      <Eye className="h-3.5 w-3.5" /> View
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