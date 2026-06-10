import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Analytics = () => {
  const engagementData = [
    { date: 'Jan 1', activeUsers: 1200, conversions: 45 },
    { date: 'Jan 2', activeUsers: 1350, conversions: 52 },
    { date: 'Jan 3', activeUsers: 1100, conversions: 40 },
    { date: 'Jan 4', activeUsers: 1400, conversions: 55 },
    { date: 'Jan 5', activeUsers: 1600, conversions: 65 },
    { date: 'Jan 6', activeUsers: 1450, conversions: 58 },
    { date: 'Jan 7', activeUsers: 1300, conversions: 48 },
  ];

  const journeyData = [
    { stage: 'Awareness',      users: 1000, conversion: 60 },
    { stage: 'Consideration',  users: 600,  conversion: 50 },
    { stage: 'Decision',       users: 300,  conversion: 40 },
    { stage: 'Purchase',       users: 120,  conversion: 30 },
    { stage: 'Retention',      users: 90,   conversion: 75 },
  ];

  const cohortData = [
    { month: 'Month 1', retention: 100, users: 500 },
    { month: 'Month 2', retention: 65,  users: 325 },
    { month: 'Month 3', retention: 45,  users: 225 },
    { month: 'Month 4', retention: 35,  users: 175 },
    { month: 'Month 5', retention: 28,  users: 140 },
    { month: 'Month 6', retention: 25,  users: 125 },
  ];

  const predictiveMetrics = [
    { name: 'Expected Revenue',        current: '$58,000', predicted: '$64,000', trend: 'up',   confidence: 85, accent: 'text-indigo-400', bg: 'bg-indigo-500/10', bar: 'bg-indigo-500' },
    { name: 'Customer Churn',          current: '5.2%',    predicted: '4.8%',    trend: 'down', confidence: 78, accent: 'text-teal-400',   bg: 'bg-teal-500/10',   bar: 'bg-teal-500'   },
    { name: 'Avg Order Value',         current: '$175',     predicted: '$190',    trend: 'up',   confidence: 82, accent: 'text-violet-400', bg: 'bg-violet-500/10', bar: 'bg-violet-500' },
    { name: 'Customer Acq. Cost',      current: '$28',      predicted: '$25',     trend: 'down', confidence: 75, accent: 'text-orange-400', bg: 'bg-orange-500/10', bar: 'bg-orange-500' },
  ];

  const behaviorRows = [
    { pattern: 'Cart Abandonment Recovery', users: '2,450', conversion: '23.5%', impact: '+$12,800' },
    { pattern: 'Cross-sell Acceptance',     users: '1,840', conversion: '31.2%', impact: '+$8,900'  },
    { pattern: 'Repeat Purchase Pattern',   users: '3,120', conversion: '42.8%', impact: '+$15,600' },
    { pattern: 'New Feature Adoption',      users: '4,280', conversion: '18.9%', impact: '+$6,400'  },
  ];

  const tooltipStyle = {
    backgroundColor: '#0f0f1e',
    border: '1px solid #1e1e3a',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '12px',
  };

  const axisProps = { fill: '#64748b', fontSize: 12 };

  const ChartCard = ({ title, legend, children }: { title: string; legend?: React.ReactNode; children: React.ReactNode }) => (
    <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e3a]">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {legend}
      </div>
      <div className="p-6 h-72">{children}</div>
    </div>
  );

  const Legend = ({ items }: { items: { label: string; color: string }[] }) => (
    <div className="flex items-center gap-4 text-xs text-slate-500">
      {items.map(i => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full inline-block" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-[#07070f] min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Advanced Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Detailed insights and predictive analysis</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 bg-[#0f0f1e] border border-[#1e1e3a] hover:bg-white/5 transition-colors">
            <Calendar className="h-4 w-4" />
            Last 7 Days
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 bg-[#0f0f1e] border border-[#1e1e3a] hover:bg-white/5 transition-colors">
            <Filter className="h-4 w-4" />
            Filter Data
          </button>
        </div>
      </div>

      {/* Predictive Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {predictiveMetrics.map((m) => (
          <div key={m.name} className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider leading-tight">{m.name}</span>
              <span className={`p-1.5 rounded-lg ${m.bg}`}>
                {m.trend === 'up'
                  ? <ArrowUpRight className={`h-3.5 w-3.5 ${m.accent}`} />
                  : <ArrowDownRight className={`h-3.5 w-3.5 ${m.accent}`} />}
              </span>
            </div>
            <p className={`text-2xl font-semibold ${m.accent}`}>{m.current}</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Predicted</span>
                <span className="text-slate-300 font-medium">{m.predicted}</span>
              </div>
              <div className="w-full bg-[#1e1e3a] rounded-full h-1.5">
                <div className={`${m.bar} rounded-full h-1.5 transition-all`} style={{ width: `${m.confidence}%` }} />
              </div>
              <p className="text-xs text-slate-600">{m.confidence}% confidence</p>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Trends */}
      <ChartCard
        title="User Engagement Trends"
        legend={<Legend items={[{ label: 'Active Users', color: '#818cf8' }, { label: 'Conversions', color: '#2dd4bf' }]} />}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={engagementData}>
            <defs>
              <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2dd4bf" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
            <XAxis dataKey="date"        tick={axisProps} axisLine={false} tickLine={false} />
            <YAxis                        tick={axisProps} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="activeUsers"  stroke="#818cf8" strokeWidth={2} fill="url(#gUsers)" name="Active Users" />
            <Area type="monotone" dataKey="conversions"  stroke="#2dd4bf" strokeWidth={2} fill="url(#gConv)"  name="Conversions"  />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Journey + Cohort */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Customer Journey Analysis"
          legend={<Legend items={[{ label: 'Users', color: '#818cf8' }, { label: 'Conversion %', color: '#2dd4bf' }]} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={journeyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
              <XAxis dataKey="stage"     tick={axisProps} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  orientation="left"  tick={axisProps} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={axisProps} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar yAxisId="left"  dataKey="users"      fill="#818cf8" radius={[4,4,0,0]} name="Users" />
              <Bar yAxisId="right" dataKey="conversion" fill="#2dd4bf" radius={[4,4,0,0]} name="Conversion %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Cohort Retention Analysis"
          legend={<Legend items={[{ label: 'Retention %', color: '#818cf8' }, { label: 'Active Users', color: '#fb923c' }]} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
              <XAxis dataKey="month"     tick={axisProps} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  orientation="left"  tick={axisProps} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={axisProps} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line yAxisId="left"  type="monotone" dataKey="retention" stroke="#818cf8" strokeWidth={2} dot={false} name="Retention %" />
              <Line yAxisId="right" type="monotone" dataKey="users"     stroke="#fb923c" strokeWidth={2} dot={false} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Behavior Table */}
      <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e3a]">
          <h2 className="text-sm font-semibold text-slate-100">User Behavior Insights</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e3a]">
                {["Behavior Pattern", "Users", "Conversion Rate", "Revenue Impact"].map((h, i) => (
                  <th key={h} className={`px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e3a]">
              {behaviorRows.map((r) => (
                <tr key={r.pattern} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300">{r.pattern}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 text-right">{r.users}</td>
                  <td className="px-6 py-4 text-sm text-indigo-400 font-medium text-right">{r.conversion}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center justify-end gap-1 text-xs font-medium text-teal-400">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {r.impact}
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

export default Analytics;