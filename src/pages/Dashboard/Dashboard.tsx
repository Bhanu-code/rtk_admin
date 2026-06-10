import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, ShoppingBag, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Dashboard = () => {
  const salesData = [
    { month: 'Jan', sales: 4000, orders: 240, customers: 150 },
    { month: 'Feb', sales: 3000, orders: 198, customers: 120 },
    { month: 'Mar', sales: 5000, orders: 280, customers: 180 },
    { month: 'Apr', sales: 4500, orders: 250, customers: 160 },
    { month: 'May', sales: 6000, orders: 320, customers: 200 },
    { month: 'Jun', sales: 5500, orders: 290, customers: 185 },
  ];

  const recentOrders = [
    { id: '#12345', customer: 'John Doe',    amount: 129.99, status: 'Processing' },
    { id: '#12344', customer: 'Jane Smith',  amount: 239.99, status: 'Delivered'  },
    { id: '#12343', customer: 'Bob Wilson',  amount: 99.99,  status: 'Pending'    },
    { id: '#12342', customer: 'Alice Brown', amount: 189.99, status: 'Delivered'  },
  ];

  const lowStockItems = [
    { name: 'Wireless Earbuds', stock: 5,  threshold: 10 },
    { name: 'Phone Case',       stock: 8,  threshold: 15 },
    { name: 'USB Cable',        stock: 3,  threshold: 20 },
  ];

  const stats = [
    {
      label: 'Total Revenue',
      value: '$28,000',
      change: '+12.5%',
      up: true,
      icon: <DollarSign className="h-4 w-4" />,
      accent: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Total Orders',
      value: '1,578',
      change: '+8.2%',
      up: true,
      icon: <ShoppingBag className="h-4 w-4" />,
      accent: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Total Customers',
      value: '995',
      change: '+5.9%',
      up: true,
      icon: <Users className="h-4 w-4" />,
      accent: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
    {
      label: 'Conversion Rate',
      value: '3.2%',
      change: '-0.4%',
      up: false,
      icon: <TrendingUp className="h-4 w-4" />,
      accent: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
  ];

  const statusStyles: Record<string, string> = {
    Delivered:  'bg-teal-500/10  text-teal-400   border border-teal-500/20',
    Processing: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    Pending:    'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  };

  const customTooltipStyle = {
    backgroundColor: '#0f0f1e',
    border: '1px solid #1e1e3a',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '13px',
  };

  return (
    <div className="p-6 space-y-6 bg-[#07070f] min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back — here's what's happening.</p>
        </div>
        <span className="text-xs text-slate-600 bg-[#0f0f1e] border border-[#1e1e3a] px-3 py-1.5 rounded-lg">
          {new Date().toLocaleString()}
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{s.label}</span>
              <span className={`p-2 rounded-lg ${s.bg} ${s.accent}`}>{s.icon}</span>
            </div>
            <p className={`text-2xl font-semibold ${s.accent}`}>{s.value}</p>
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${s.up ? 'text-teal-400' : 'text-red-400'}`}>
              {s.up
                ? <ArrowUpRight className="h-3.5 w-3.5" />
                : <ArrowDownRight className="h-3.5 w-3.5" />}
              {s.change} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e3a]">
          <h2 className="text-sm font-semibold text-slate-100">Sales Overview</h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-400 inline-block" />Sales</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-400 inline-block" />Orders</span>
          </div>
        </div>
        <div className="p-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Line type="monotone" dataKey="sales"  stroke="#818cf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="orders" stroke="#2dd4bf" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e1e3a]">
            <h2 className="text-sm font-semibold text-slate-100">Recent Orders</h2>
          </div>
          <div className="px-6 divide-y divide-[#1e1e3a]">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3.5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-200">{order.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{order.customer}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-200">${order.amount}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e1e3a]">
            <h2 className="text-sm font-semibold text-slate-100">Low Stock Alerts</h2>
          </div>
          <div className="px-6 divide-y divide-[#1e1e3a]">
            {lowStockItems.map((item) => (
              <div key={item.name} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.stock} remaining · min {item.threshold}
                    </p>
                  </div>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;