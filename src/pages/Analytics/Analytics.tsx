// import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Analytics = () => {
  // Sample data representing user engagement metrics over time
  const engagementData = [
    { date: '2024-01-01', activeUsers: 1200, sessionDuration: 15, bounceRate: 35, conversions: 45 },
    { date: '2024-01-02', activeUsers: 1350, sessionDuration: 17, bounceRate: 32, conversions: 52 },
    { date: '2024-01-03', activeUsers: 1100, sessionDuration: 14, bounceRate: 38, conversions: 40 },
    { date: '2024-01-04', activeUsers: 1400, sessionDuration: 16, bounceRate: 30, conversions: 55 },
    { date: '2024-01-05', activeUsers: 1600, sessionDuration: 18, bounceRate: 28, conversions: 65 },
    { date: '2024-01-06', activeUsers: 1450, sessionDuration: 16, bounceRate: 31, conversions: 58 },
    { date: '2024-01-07', activeUsers: 1300, sessionDuration: 15, bounceRate: 33, conversions: 48 }
  ];

  // Sample customer journey data
  const journeyData = [
    { stage: 'Awareness', users: 1000, conversion: 60 },
    { stage: 'Consideration', users: 600, conversion: 50 },
    { stage: 'Decision', users: 300, conversion: 40 },
    { stage: 'Purchase', users: 120, conversion: 30 },
    { stage: 'Retention', users: 90, conversion: 75 }
  ];

  // Sample cohort retention data
  const cohortData = [
    { month: 'Month 1', retention: 100, users: 500 },
    { month: 'Month 2', retention: 65, users: 325 },
    { month: 'Month 3', retention: 45, users: 225 },
    { month: 'Month 4', retention: 35, users: 175 },
    { month: 'Month 5', retention: 28, users: 140 },
    { month: 'Month 6', retention: 25, users: 125 }
  ];

  // Predictive metrics showing forecasted values
  const predictiveMetrics = [
    { name: 'Expected Revenue', current: 58000, predicted: 64000, trend: 'up', confidence: 85 },
    { name: 'Customer Churn', current: 5.2, predicted: 4.8, trend: 'down', confidence: 78 },
    { name: 'Average Order Value', current: 175, predicted: 190, trend: 'up', confidence: 82 },
    { name: 'Customer Acquisition Cost', current: 28, predicted: 25, trend: 'down', confidence: 75 }
  ];

  // const [selectedTimeframe, setSelectedTimeframe] = useState('7days');
  // const [activeMetric, setActiveMetric] = useState('activeUsers');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen mb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Advanced Analytics</h1>
          <p className="text-gray-500">Detailed insights and predictive analysis</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <Calendar className="h-4 w-4" />
            <span>Last 7 Days</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Filter Data</span>
          </button>
        </div>
      </div>

      {/* Predictive Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {predictiveMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {typeof metric.current === 'number' && metric.current % 1 === 0
                      ? `$${metric.current.toLocaleString()}`
                      : `${metric.current}${metric.name.includes('Churn') ? '%' : ''}`}
                  </h3>
                </div>
                <div className={`p-2 rounded-full ${
                  metric.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {metric.trend === 'up' 
                    ? <ArrowUpRight className="h-4 w-4 text-green-600" />
                    : <ArrowDownRight className="h-4 w-4 text-red-600" />
                  }
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Predicted</span>
                  <span className="font-medium">
                    {typeof metric.predicted === 'number' && metric.predicted % 1 === 0
                      ? `$${metric.predicted.toLocaleString()}`
                      : `${metric.predicted}${metric.name.includes('Churn') ? '%' : ''}`}
                  </span>
                </div>
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 rounded-full h-2"
                      style={{ width: `${metric.confidence}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metric.confidence}% confidence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>User Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="activeUsers" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1} 
                  name="Active Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.1}
                  name="Conversions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Journey Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Journey Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={journeyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="users" fill="#3b82f6" name="Users" />
                  <Bar yAxisId="right" dataKey="conversion" fill="#10b981" name="Conversion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cohort Retention Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Cohort Retention Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cohortData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="retention" 
                    stroke="#3b82f6" 
                    name="Retention %"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="users" 
                    stroke="#10b981" 
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Behavioral Insights Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Behavior Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Behavior Pattern</th>
                  <th className="text-right py-3 px-4">Users</th>
                  <th className="text-right py-3 px-4">Conversion Rate</th>
                  <th className="text-right py-3 px-4">Revenue Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4">Cart Abandonment Recovery</td>
                  <td className="text-right py-3 px-4">2,450</td>
                  <td className="text-right py-3 px-4">23.5%</td>
                  <td className="text-right py-3 px-4 text-green-600">+$12,800</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Cross-sell Acceptance</td>
                  <td className="text-right py-3 px-4">1,840</td>
                  <td className="text-right py-3 px-4">31.2%</td>
                  <td className="text-right py-3 px-4 text-green-600">+$8,900</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Repeat Purchase Pattern</td>
                  <td className="text-right py-3 px-4">3,120</td>
                  <td className="text-right py-3 px-4">42.8%</td>
                  <td className="text-right py-3 px-4 text-green-600">+$15,600</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">New Feature Adoption</td>
                  <td className="text-right py-3 px-4">4,280</td>
                  <td className="text-right py-3 px-4">18.9%</td>
                  <td className="text-right py-3 px-4 text-green-600">+$6,400</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;