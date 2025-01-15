import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Select } from "@/components/ui/select";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const Orders = () => {
  // Sample orders data - would come from your backend in a real app
  const initialOrders = [
    {
      id: "#12345",
      customer: "John Doe",
      email: "john@example.com",
      date: "2025-01-14",
      amount: 129.99,
      status: "Processing",
      items: [
        { name: "Wireless Earbuds", quantity: 1, price: 79.99 },
        { name: "Phone Case", quantity: 1, price: 50.0 },
      ],
    },
    {
      id: "#12344",
      customer: "Jane Smith",
      email: "jane@example.com",
      date: "2025-01-13",
      amount: 239.99,
      status: "Delivered",
      items: [{ name: "Smart Watch", quantity: 1, price: 239.99 }],
    },
    {
      id: "#12343",
      customer: "Bob Wilson",
      email: "bob@example.com",
      date: "2025-01-13",
      amount: 99.99,
      status: "Pending",
      items: [{ name: "USB Cable", quantity: 2, price: 49.99 }],
    },
    {
      id: "#12342",
      customer: "Alice Brown",
      email: "alice@example.com",
      date: "2025-01-12",
      amount: 189.99,
      status: "Cancelled",
      items: [{ name: "Bluetooth Speaker", quantity: 1, price: 189.99 }],
    },
  ];

  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState({
    id: "",
    customer: "",
    email: "",
    status: "",
  });

  console.log(setOrders(initialOrders))

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "Processing":
        return <AlertCircle className="h-4 w-4" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export Orders
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders, customers, or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 border rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer}
                      </div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
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
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Order Details - {selectedOrder.id}</span>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setSelectedOrder({
                      id: "",
                      customer: "",
                      email: "",
                      status: "",
                    })
                  }
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedOrder.customer}</p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Status</p>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Order Items</h3>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Item
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {/* {selectedOrder?.items?.map((item:any, index:any) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.name}</td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">${item.price.toFixed(2)}</td>
                        </tr>
                      ))} */}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSelectedOrder({
                        id: "",
                        customer: "",
                        email: "",
                        status: "",
                      })
                    }
                  >
                    Close
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Update Status
                  </Button>
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
