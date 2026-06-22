import {
  ArrowLeft, Package, CheckCircle, Clock, AlertCircle,
  Mail, Phone, ShoppingBag,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { userRequest } from "@/utils/requestMethods";
import { useQuery } from "react-query";

const statusStyles: Record<string, string> = {
  Confirmed:  "bg-teal-500/10  text-teal-400   border border-teal-500/20",
  Delivered:  "bg-teal-500/10  text-teal-400   border border-teal-500/20",
  Processing: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  Pending:    "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  Cancelled:  "bg-red-500/10   text-red-400    border border-red-500/20",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "Delivered":
    case "Confirmed":  return <CheckCircle className="h-3.5 w-3.5" />;
    case "Processing": return <Clock       className="h-3.5 w-3.5" />;
    default:           return <AlertCircle className="h-3.5 w-3.5" />;
  }
};

const UserOrders = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigateTo  = useNavigate();

  const fetchUserOrders = () =>
    userRequest({ url: `user/${userId}/orders`, method: "get" });

  const { data, isLoading, isError } = useQuery(
    ["user-orders", userId],
    fetchUserOrders,
    { enabled: !!userId }
  );

  const user   = data?.data?.user;
  const orders: any[] = data?.data?.orders ?? [];

  return (
    <div className="p-6 space-y-6 bg-[#07070f] min-h-screen">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigateTo("/home/customers")}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            {user ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || "User" : "User"}'s Orders
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">All orders placed by this customer</p>
        </div>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] p-5 flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-400 text-sm font-medium">
                {user.firstname?.[0]}{user.lastname?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                {user.firstname} {user.lastname}
              </p>
              <p className="text-xs text-slate-500">#{user.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Mail className="h-4 w-4 text-slate-600" />
            {user.email}
          </div>
          {user.telephone && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Phone className="h-4 w-4 text-slate-600" />
              {user.telephone}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <ShoppingBag className="h-4 w-4 text-slate-600" />
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e3a]">
          <h2 className="text-sm font-semibold text-slate-100">
            Orders
            <span className="ml-2 text-xs font-normal text-slate-500">({orders.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-slate-600 text-sm">Loading orders…</div>
        ) : isError ? (
          <div className="text-center py-16 text-red-500 text-sm">Failed to load orders.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e3a]">
                  {["Order ID", "Date", "Items", "Total", "Payment", "Status", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider ${
                        i >= 3 ? "text-right" : "text-left"
                      } ${h === "Status" ? "text-center" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e3a]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-600 text-sm">
                      No orders found for this customer
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => {
                    const details = typeof order.productDetails === "string"
                      ? JSON.parse(order.productDetails)
                      : order.productDetails;
                    const items: any[] = details?.items ?? [];

                    return (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">

                        {/* Order ID */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-indigo-500/10">
                              <Package className="h-3.5 w-3.5 text-indigo-400" />
                            </span>
                            <span className="text-sm font-medium text-slate-200 font-mono">
                              {order.id.slice(0, 8)}…
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-300">
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {new Date(order.created_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </td>

                        {/* Items */}
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            {items.slice(0, 2).map((item: any, idx: number) => (
                              <p key={idx} className="text-xs text-slate-400 truncate max-w-[180px]">
                                {item.product_name ?? item.sku}
                              </p>
                            ))}
                            {items.length > 2 && (
                              <p className="text-xs text-slate-600">+{items.length - 2} more</p>
                            )}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-semibold text-teal-400 whitespace-nowrap">
                            ₹{order.total_price?.toLocaleString("en-IN")}
                          </p>
                        </td>

                        {/* Payment */}
                        <td className="px-6 py-4 text-right">
                          <p className="text-xs text-slate-400 capitalize">
                            {order.payment_method ?? "—"}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] ?? "bg-slate-500/10 text-slate-400 border border-slate-500/20"}`}>
                              <StatusIcon status={order.status} />
                              {order.status}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigateTo(`/home/orders/${order.id}`)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                          >
                            Details
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
