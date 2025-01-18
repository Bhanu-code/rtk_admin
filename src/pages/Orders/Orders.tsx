import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Download,
  ArrowUpDown,
  MoreVertical,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const Orders = () => {
  // Sample orders data - in a real application, this would come from your backend
  const initialOrders = [
    {
      id: "ORD-2024-001",
      customer: "Sarah Johnson",
      date: "2024-01-15",
      total: 299.99,
      items: 3,
      status: "Processing",
      payment: "Credit Card",
      shipping: "Express",
      email: "sarah.j@example.com",
    },
    {
      id: "ORD-2024-002",
      customer: "Michael Chen",
      date: "2024-01-15",
      total: 149.5,
      items: 2,
      status: "Delivered",
      payment: "PayPal",
      shipping: "Standard",
      email: "mchen@example.com",
    },
    {
      id: "ORD-2024-003",
      customer: "Emma Davis",
      date: "2024-01-14",
      total: 524.75,
      items: 4,
      status: "Pending",
      payment: "Credit Card",
      shipping: "Next Day",
      email: "emma.d@example.com",
    },
    {
      id: "ORD-2024-004",
      customer: "James Wilson",
      date: "2024-01-14",
      total: 89.99,
      items: 1,
      status: "Delivered",
      payment: "Credit Card",
      shipping: "Standard",
      email: "jwilson@example.com",
    },
    {
      id: "ORD-2024-005",
      customer: "Lisa Thompson",
      date: "2024-01-13",
      total: 199.99,
      items: 2,
      status: "Processing",
      payment: "PayPal",
      shipping: "Express",
      email: "lisa.t@example.com",
    },
  ];

  const [orders, setOrders] = useState(initialOrders);
  console.log(setOrders)
  const [selectedOrder, setSelectedOrder] = useState({
    id: "",
    date: "",
    email: "",
    customer: "",
    payment: "",
    shipping: "",
    total: "",
    status: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Function to get status badge styling
  const getStatusStyle = (status: any) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get status icon
  const StatusIcon = (status: any) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Processing":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "Pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <p className="text-gray-500">View and manage all customer orders</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Package className="h-4 w-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
        </select>

        <select
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue="last7days"
        >
          <option value="today">Today</option>
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="custom">Custom Range</option>
        </select>

        <select
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue="all"
        >
          <option value="all">All Payment Methods</option>
          <option value="credit">Credit Card</option>
          <option value="paypal">PayPal</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-4 px-6 font-medium">
                    <div className="flex items-center gap-2">
                      Order ID
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-medium">
                    <div className="flex items-center gap-2">
                      Customer
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-medium">
                    <div className="flex items-center gap-2">
                      Date
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 font-medium">Total</th>
                  <th className="text-center py-4 px-6 font-medium">Status</th>
                  <th className="text-right py-4 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        {order.id}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p>{new Date(order.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">
                          {order.shipping}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div>
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {order.items} items
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          <div className="flex items-center gap-2">
                            <StatusIcon status={order.status} />
                            {order.status}
                          </div>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Order Details</CardTitle>
              <button
                onClick={() =>
                  setSelectedOrder({
                    id: "",
                    date: "",
                    email: "",
                    customer: "",
                    payment: "",
                    shipping: "",
                    total: "",
                    status: "",
                  })
                }
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {new Date(selectedOrder.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedOrder.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{selectedOrder.payment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipping Method</p>
                    <p className="font-medium">{selectedOrder.shipping}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium">${selectedOrder.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${getStatusStyle(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                      Print Order
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Orders;
