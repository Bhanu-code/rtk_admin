import { useState } from "react";
import {
  Search, Download, ArrowUpDown, Package,
  Clock, CheckCircle, AlertCircle,
} from "lucide-react";
import { userRequest } from "@/utils/requestMethods";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [searchTerm, setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigateTo = useNavigate();

  const getAllOrders = () =>
    userRequest({ url: `order/get-all-orders`, method: "get" });

  const { data: allOrders } = useQuery("get-all-orders", getAllOrders, {
    onError: (error: any) => console.log(error),
  });

  const statusStyles: Record<string, string> = {
    Delivered:  "bg-teal-500/10  text-teal-400   border border-teal-500/20",
    Processing: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    Pending:    "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  };

  const StatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":  return <CheckCircle className="h-3.5 w-3.5" />;
      case "Processing": return <Clock       className="h-3.5 w-3.5" />;
      case "Pending":    return <AlertCircle className="h-3.5 w-3.5" />;
      default:           return <Package     className="h-3.5 w-3.5" />;
    }
  };

  const selectClass = `
    px-3 py-2 rounded-lg text-sm text-slate-300
    bg-[#0f0f1e] border border-[#1e1e3a]
    focus:outline-none focus:border-indigo-500/50
    transition-colors
  `;

  const orders = allOrders?.data ?? [];

  const filtered = orders.filter((o: any) => {
    const fullName = `${o.user?.firstname ?? ""} ${o.user?.lastname ?? ""}`.toLowerCase().trim();
    const matchSearch = !searchTerm ||
      o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-[#07070f] min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">View and manage all customer orders</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 bg-[#0f0f1e] border border-[#1e1e3a] hover:bg-white/5 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            <Package className="h-4 w-4" />
            New Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full rounded-lg text-sm text-slate-300 bg-[#0f0f1e] border border-[#1e1e3a] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
        </select>
        <select className={selectClass} defaultValue="last7days">
          <option value="today">Today</option>
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="custom">Custom Range</option>
        </select>
        <select className={selectClass} defaultValue="all">
          <option value="all">All Payment Methods</option>
          <option value="credit">Credit Card</option>
          <option value="paypal">PayPal</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">

        {/* Table header */}
        <div className="px-6 py-4 border-b border-[#1e1e3a] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">
            All Orders
            <span className="ml-2 text-xs font-normal text-slate-500">({filtered.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e3a]">
                {["Order ID", "Customer Name", "Customer", "Date", "Total", "Status", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider ${
                      i >= 4 ? "text-right" : "text-left"
                    } ${h === "Status" ? "text-center" : ""}`}
                  >
                    <div className={`flex items-center gap-1 ${i >= 4 ? "justify-end" : ""} ${h === "Status" ? "justify-center" : ""}`}>
                      {h}
                      {["Order ID", "Customer Name", "Date"].includes(h) && (
                        <ArrowUpDown className="h-3 w-3 text-slate-600" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e3a]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-600 text-sm">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-indigo-500/10">
                          <Package className="h-3.5 w-3.5 text-indigo-400" />
                        </span>
                        <span title={order?.id} className="text-sm font-medium text-slate-200 font-mono cursor-default">
                          {order?.id?.slice(0, 8)}…
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-400 text-xs font-medium">
                            {order?.user?.firstname?.[0]}{order?.user?.lastname?.[0]}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-200">
                          {order?.user?.firstname} {order?.user?.lastname}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p title={order?.userId} className="text-xs font-medium text-slate-400 font-mono cursor-default">
                        {order?.userId?.slice(0, 8)}…
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{order?.payment_method}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">
                        {new Date(order?.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-slate-200 whitespace-nowrap">
                        ₹{order?.total_price?.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[order?.status] ?? "bg-slate-500/10 text-slate-400 border border-slate-500/20"}`}>
                          {StatusIcon(order?.status)}
                          {order?.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigateTo(`/home/orders/${order?.id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;