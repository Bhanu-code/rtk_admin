import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Filter, Plus, MoreVertical, Edit,
  Trash2, Tag, Package, AlertCircle, ArrowUpDown
} from 'lucide-react';
// import { AnyAaaaRecord } from 'node:dns';

const Products = () => {
  // Sample products data - would come from your backend in a real app
  const initialProducts = [
    {
      id: 1,
      name: 'Wireless Earbuds',
      sku: 'WE-001',
      category: 'Electronics',
      price: 79.99,
      stock: 45,
      status: 'Active',
      image: '/api/placeholder/80/80'
    },
    {
      id: 2,
      name: 'Phone Case',
      sku: 'PC-002',
      category: 'Accessories',
      price: 50.00,
      stock: 8,
      status: 'Low Stock',
      image: '/api/placeholder/80/80'
    },
    {
      id: 3,
      name: 'Smart Watch',
      sku: 'SW-003',
      category: 'Electronics',
      price: 239.99,
      stock: 0,
      status: 'Out of Stock',
      image: '/api/placeholder/80/80'
    },
    {
      id: 4,
      name: 'Bluetooth Speaker',
      sku: 'BS-004',
      category: 'Electronics',
      price: 189.99,
      stock: 23,
      status: 'Active',
      image: '/api/placeholder/80/80'
    }
  ];

  const [products] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  // const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['All', 'Electronics', 'Accessories', 'Clothing', 'Books'];
  const statuses = ['All', 'Active', 'Low Stock', 'Out of Stock'];

  // Filter products based on search term, category, and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status:any) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen mb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name or SKU..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 border rounded-md"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 border rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 rounded object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{product.name}</h3>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{product.category}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(product.status)}`}>
                      {product.status === 'Low Stock' && <AlertCircle className="h-3 w-3" />}
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">${product.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className="font-medium">{product.stock} units</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Low Stock Items</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.status === 'Low Stock').length}
                  </p>
                </div>
              </div>
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.status === 'Out of Stock').length}
                  </p>
                </div>
              </div>
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Products;