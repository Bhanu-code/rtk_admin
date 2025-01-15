
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  // Sample data - in a real app, this would come from your backend
  const salesData = [
    { month: 'Jan', sales: 4000, orders: 240, customers: 150 },
    { month: 'Feb', sales: 3000, orders: 198, customers: 120 },
    { month: 'Mar', sales: 5000, orders: 280, customers: 180 },
    { month: 'Apr', sales: 4500, orders: 250, customers: 160 },
    { month: 'May', sales: 6000, orders: 320, customers: 200 },
    { month: 'Jun', sales: 5500, orders: 290, customers: 185 }
  ];

  const recentOrders = [
    { id: '#12345', customer: 'John Doe', amount: 129.99, status: 'Processing' },
    { id: '#12344', customer: 'Jane Smith', amount: 239.99, status: 'Delivered' },
    { id: '#12343', customer: 'Bob Wilson', amount: 99.99, status: 'Pending' },
    { id: '#12342', customer: 'Alice Brown', amount: 189.99, status: 'Delivered' }
  ];

  const lowStockItems = [
    { name: 'Wireless Earbuds', stock: 5, threshold: 10 },
    { name: 'Phone Case', stock: 8, threshold: 15 },
    { name: 'USB Cable', stock: 3, threshold: 20 }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen mb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-500">Last updated: {new Date().toLocaleString()}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-blue-100 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-bold">$28,000</h3>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-green-100 rounded-full mr-4">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <h3 className="text-2xl font-bold">1,578</h3>
              <p className="text-sm text-green-600">+8.2% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-purple-100 rounded-full mr-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <h3 className="text-2xl font-bold">995</h3>
              <p className="text-sm text-green-600">+5.9% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-yellow-100 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <h3 className="text-2xl font-bold">3.2%</h3>
              <p className="text-sm text-red-600">-0.4% from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" />
                <Line type="monotone" dataKey="orders" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.amount}</p>
                    <span className={`text-sm px-2 py-1 rounded ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.stock} units remaining (Min: {item.threshold})
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    Restock
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;