import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Calendar, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Reports = () => {
  const monthlyRevenue = [
    { month: 'Jan', revenue: 42000, expenses: 28000, profit: 14000 },
    { month: 'Feb', revenue: 38000, expenses: 24000, profit: 14000 },
    { month: 'Mar', revenue: 51000, expenses: 31000, profit: 20000 },
    { month: 'Apr', revenue: 47000, expenses: 29000, profit: 18000 },
    { month: 'May', revenue: 58000, expenses: 35000, profit: 23000 },
    { month: 'Jun', revenue: 54000, expenses: 32000, profit: 22000 },
  ];

  const categoryData = [
    { name: 'Electronics',  value: 35 },
    { name: 'Clothing',     value: 25 },
    { name: 'Accessories',  value: 20 },
    { name: 'Home & Garden',value: 15 },
    { name: 'Others',       value: 5  },
  ];

  const customerSegments = [
    { segment: 'New',       orders: 145, revenue: 15000 },
    { segment: 'Returning', orders: 285, revenue: 32000 },
    { segment: 'VIP',       orders: 95,  revenue: 28000 },
  ];

  const metrics = [
    { label: 'Total Revenue',            current: '$290,000', previous: '$265,000', change: '+9.4%',  up: true  },
    { label: 'Average Order Value',       current: '$185',     previous: '$175',     change: '+5.7%',  up: true  },
    { label: 'Customer Acquisition Cost', current: '$28',      previous: '$32',      change: '-12.5%', up: true  },
    { label: 'Customer Lifetime Value',   current: '$850',     previous: '$780',     change: '+9.0%',  up: true  },
  ];

  const PIE_COLORS = ['#818cf8', '#2dd4bf', '#fb923c', '#a78bfa', '#34d399'];

  const tooltipStyle = {
    backgroundColor: '#0f0f1e',
    border: '1px solid #1e1e3a',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '12px',
  };

  const axisProps = { fill: '#64748b', fontSize: 12 };

  return (
    <div className="p-6 space-y-6 bg-[#07070f] min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Financial Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">Detailed analysis and insights</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 bg-[#0f0f1e] border border-[#1e1e3a] hover:bg-white/5 transition-colors">
            <Calendar className="h-4 w-4" />
            Period
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 bg-[#0f0f1e] border border-[#1e1e3a] hover:bg-white/5 transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Revenue vs Expenses */}
      <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e3a]">
          <h2 className="text-sm font-semibold text-slate-100">Revenue vs Expenses</h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-400 inline-block" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" />Expenses</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-400 inline-block" />Profit</span>
          </div>
        </div>
        <div className="p-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
              <XAxis dataKey="month" tick={axisProps} axisLine={false} tickLine={false} />
              <YAxis tick={axisProps} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="revenue"  stroke="#818cf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit"   stroke="#2dd4bf" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sales by Category */}
        <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e1e3a]">
            <h2 className="text-sm font-semibold text-slate-100">Sales by Category</h2>
          </div>
          <div className="p-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%" cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="px-6 pb-5 flex flex-wrap gap-3">
            {categoryData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full inline-block" style={{ background: PIE_COLORS[i] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e3a]">
            <h2 className="text-sm font-semibold text-slate-100">Customer Segments</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-400 inline-block" />Orders</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-400 inline-block" />Revenue</span>
            </div>
          </div>
          <div className="p-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerSegments} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
                <XAxis dataKey="segment" tick={axisProps} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left"  orientation="left"  tick={axisProps} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={axisProps} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar yAxisId="left"  dataKey="orders"  fill="#818cf8" radius={[4,4,0,0]} name="Orders" />
                <Bar yAxisId="right" dataKey="revenue" fill="#2dd4bf" radius={[4,4,0,0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI Table */}
      <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e3a]">
          <h2 className="text-sm font-semibold text-slate-100">Key Performance Metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e3a]">
                {["Metric", "Current Period", "Previous Period", "Change"].map((h, i) => (
                  <th key={h} className={`px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e3a]">
              {metrics.map((m) => (
                <tr key={m.label} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300">{m.label}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-200 text-right">{m.current}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 text-right">{m.previous}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center justify-end gap-1 text-xs font-medium ${m.up ? "text-teal-400" : "text-red-400"}`}>
                      {m.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {m.change}
                    </span>
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

export default Reports;