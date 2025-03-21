import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  UserPlus,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  MapPin,
  ShoppingBag,
  Calendar,
  Download,
  MoreVertical,
  Users,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { userRequest } from "@/utils/requestMethods";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";

const Customers = () => {
  // Sample customers data - would come from your backend in a real app
  const initialCustomers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      whatsapp: "+15551234567",
      location: "Austin, TX",
      totalOrders: 12,
      totalSpent: 1250.5,
      lastPurchase: "2025-01-10",
      status: "Active",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 (555) 234-5678",
      whatsapp: "+15552345678",
      location: "New York, NY",
      totalOrders: 8,
      totalSpent: 890.75,
      lastPurchase: "2025-01-12",
      status: "Active",
      avatar: "/api/placeholder/40/40",
    },
    // Add more sample customers as needed
  ];

  const [customers] = useState(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  // const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Filter customers based on search term
  // const filteredCustomers = customers.filter((customer) => {
  //   return (
  //     customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     customer.phone.includes(searchTerm)
  //   );
  // });

  const openWhatsApp = (whatsappNumber: any) => {
    window.open(`https://wa.me/${whatsappNumber}`, "_blank");
  };

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

  console.log("EMPLOYEES : ", employees);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold">{employees?.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Purchase</p>
                <p className="text-2xl font-bold">
                  $
                  {(
                    customers.reduce((acc, cur) => acc + cur.totalSpent, 0) /
                    customers.length
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer Growth</p>
                <p className="text-2xl font-bold">+12.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, email, or phone..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select className="px-4 py-2 border rounded-md">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Last Purchase
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employees?.map((customer:any) => (
                  <tr key={customer?.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={customer?.avatar}
                          alt={customer?.firstname}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{customer?.firstname + " " + customer?.lastname}</p>
                          <p className="text-sm text-gray-500">
                            ID: #{customer?.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {customer?.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {customer.telephone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {customer?.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-gray-400" />
                        {customer?.totalOrders}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        ${customer?.totalSpent}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(customer?.lastPurchase).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => openWhatsApp(customer?.telephone)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
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
    </div>
  );
};

export default Customers;
