import { useState } from "react";
import {
  Search, Filter, UserPlus, MessageSquare, Phone,
  Mail, ExternalLink, MapPin, ShoppingBag, Calendar,
  Download, MoreVertical, Users, TrendingUp, DollarSign,
} from "lucide-react";
import { userRequest } from "@/utils/requestMethods";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const token = useSelector((state: any) => state.user.accessToken);

  const fetchCustomers = async () => {
    const response = await userRequest({
      url: `${import.meta.env.VITE_PROXY_URL}/user/get-user/`,
      method: "get",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  const { data: employees } = useQuery("get-customers", fetchCustomers);

  const openWhatsApp = (number: any) =>
    window.open(`https://wa.me/${number}`, "_blank");

  const filtered = (employees ?? []).filter((c: any) => {
    const name  = `${c.firstname} ${c.lastname}`.toLowerCase();
    const match = !searchTerm ||
      name.includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telephone?.includes(searchTerm);
    const status = statusFilter === "All" || c.status === statusFilter;
    return match && status;
  });

  const avgSpent = employees?.length
    ? (employees.reduce((a: number, c: any) => a + (c.totalSpent ?? 0), 0) / employees.length).toFixed(2)
    : "0.00";

  const stats = [
    { label: "Total Customers", value: employees?.length ?? 0,  icon: <Users className="h-4 w-4" />,      accent: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Avg Purchase",    value: `₹${avgSpent}`,           icon: <DollarSign className="h-4 w-4" />, accent: "text-teal-400",   bg: "bg-teal-500/10"   },
    { label: "Customer Growth", value: "+12.5%",                 icon: <TrendingUp className="h-4 w-4" />, accent: "text-violet-400", bg: "bg-violet-500/10" },
  ];

  const selectClass = `
    px-3 py-2 rounded-lg text-sm text-slate-300
    bg-[#0f0f1e] border border-[#1e1e3a]
    focus:outline-none focus:border-indigo-500/50 transition-colors
  `;

  return (
    <div className="p-6 space-y-6 bg-[#07070f] min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Customers</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your customer base</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 bg-[#0f0f1e] border border-[#1e1e3a] hover:bg-white/5 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{s.label}</span>
              <span className={`p-2 rounded-lg ${s.bg} ${s.accent}`}>{s.icon}</span>
            </div>
            <p className={`text-2xl font-semibold ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full rounded-lg text-sm text-slate-300 bg-[#0f0f1e] border border-[#1e1e3a] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 bg-[#0f0f1e] border border-[#1e1e3a] hover:bg-white/5 transition-colors">
          <Filter className="h-4 w-4" />
          More Filters
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e3a]">
          <h2 className="text-sm font-semibold text-slate-100">
            All Customers
            <span className="ml-2 text-xs font-normal text-slate-500">({filtered.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e3a]">
                {["Customer", "Contact", "Location", "Orders", "Total Spent", "Last Purchase", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e3a]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-600 text-sm">
                    No customers found
                  </td>
                </tr>
              ) : filtered.map((customer: any) => (
                <tr key={customer?.id} className="hover:bg-white/[0.02] transition-colors">

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 text-xs font-medium">
                          {customer?.firstname?.[0]}{customer?.lastname?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {customer?.firstname} {customer?.lastname}
                        </p>
                        <p className="text-xs text-slate-500">#{customer?.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Mail className="h-3.5 w-3.5 text-slate-600" />
                        {customer?.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone className="h-3.5 w-3.5 text-slate-600" />
                        {customer?.telephone}
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-slate-600" />
                      {customer?.location ?? "—"}
                    </div>
                  </td>

                  {/* Orders */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <ShoppingBag className="h-3.5 w-3.5 text-slate-600" />
                      {customer?.totalOrders ?? "—"}
                    </div>
                  </td>

                  {/* Total Spent */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-teal-400">
                      ₹{customer?.totalSpent ?? "0"}
                    </span>
                  </td>

                  {/* Last Purchase */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-600" />
                      {customer?.lastPurchase
                        ? new Date(customer.lastPurchase).toLocaleDateString()
                        : "—"}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openWhatsApp(customer?.telephone)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-400 hover:bg-teal-500/10 transition-colors"
                        title="WhatsApp"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;