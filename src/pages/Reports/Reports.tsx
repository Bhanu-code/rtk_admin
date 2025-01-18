// import  { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Calendar, Filter } from 'lucide-react';

const Reports = () => {
  // Sample data - in a real application, this would come from your backend
  const monthlyRevenue = [
    { month: 'Jan', revenue: 42000, expenses: 28000, profit: 14000 },
    { month: 'Feb', revenue: 38000, expenses: 24000, profit: 14000 },
    { month: 'Mar', revenue: 51000, expenses: 31000, profit: 20000 },
    { month: 'Apr', revenue: 47000, expenses: 29000, profit: 18000 },
    { month: 'May', revenue: 58000, expenses: 35000, profit: 23000 },
    { month: 'Jun', revenue: 54000, expenses: 32000, profit: 22000 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 35 },
    { name: 'Clothing', value: 25 },
    { name: 'Accessories', value: 20 },
    { name: 'Home & Garden', value: 15 },
    { name: 'Others', value: 5 }
  ];

  const customerSegments = [
    { segment: 'New', orders: 145, revenue: 15000 },
    { segment: 'Returning', orders: 285, revenue: 32000 },
    { segment: 'VIP', orders: 95, revenue: 28000 }
  ];

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // State for time period filter
  // const [timePeriod, setTimePeriod] = useState('6months');

  return (
    <div className="mb-10 p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-gray-500">Detailed analysis and insights</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <Calendar className="h-4 w-4" />
            <span>Change Period</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((index:any) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerSegments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Metric</th>
                  <th className="text-right py-3 px-4">Current Period</th>
                  <th className="text-right py-3 px-4">Previous Period</th>
                  <th className="text-right py-3 px-4">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4">Total Revenue</td>
                  <td className="text-right py-3 px-4">$290,000</td>
                  <td className="text-right py-3 px-4">$265,000</td>
                  <td className="text-right py-3 px-4 text-green-600">+9.4%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Average Order Value</td>
                  <td className="text-right py-3 px-4">$185</td>
                  <td className="text-right py-3 px-4">$175</td>
                  <td className="text-right py-3 px-4 text-green-600">+5.7%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Customer Acquisition Cost</td>
                  <td className="text-right py-3 px-4">$28</td>
                  <td className="text-right py-3 px-4">$32</td>
                  <td className="text-right py-3 px-4 text-green-600">-12.5%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Customer Lifetime Value</td>
                  <td className="text-right py-3 px-4">$850</td>
                  <td className="text-right py-3 px-4">$780</td>
                  <td className="text-right py-3 px-4 text-green-600">+9.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;