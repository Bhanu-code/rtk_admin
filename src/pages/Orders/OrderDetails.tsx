import  { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import {
  Truck, Mail, Phone, 
 CreditCard, CheckCircle, AlertCircle,
  Printer, ArrowLeft, Send
} from 'lucide-react';

const OrderDetails = () => {
  // Sample order data - would come from your backend in a real app
  const [order, setOrder] = useState({
    id: '#12345',
    date: '2025-01-14T10:30:00',
    status: 'Processing',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card (**** 1234)',
    shippingMethod: 'Express Delivery',
    trackingNumber: 'TN123456789',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      shippingAddress: {
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'United States'
      },
      billingAddress: {
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'United States'
      }
    },
    items: [
      {
        id: 1,
        name: 'Wireless Earbuds',
        sku: 'WE-001',
        quantity: 1,
        price: 79.99,
        subtotal: 79.99
      },
      {
        id: 2,
        name: 'Phone Case',
        sku: 'PC-002',
        quantity: 1,
        price: 50.00,
        subtotal: 50.00
      }
    ],
    subtotal: 129.99,
    shippingCost: 10.00,
    tax: 11.70,
    total: 151.69,
    notes: 'Please handle with care',
    timeline: [
      { date: '2025-01-14T10:30:00', status: 'Order Placed', description: 'Order #12345 was placed' },
      { date: '2025-01-14T10:35:00', status: 'Payment Confirmed', description: 'Payment of $151.69 was received' },
      { date: '2025-01-14T11:00:00', status: 'Processing', description: 'Order is being processed' }
    ]
  });

  console.log(typeof setOrder)

  const getStatusColor = (status:any) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order {order.id}</h1>
            <p className="text-gray-500">
              Placed on {new Date(order.date).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Order
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Invoice
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-medium">Order Status</h2>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm mt-2 ${getStatusColor(order.status)}`}>
                    {order.status === 'Processing' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    {order.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="relative mt-8">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                {order.timeline.map((event, index) => (
                  <div key={index} className="relative flex gap-4 pb-6">
                    <div className="absolute left-4 w-2 h-2 rounded-full bg-blue-600 -translate-x-1 mt-2"></div>
                    <div className="ml-8">
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-gray-500">{event.description}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-4 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded"></div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}

                {/* Order Summary */}
                <div className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${order.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{order.customer.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Mail className="h-4 w-4" />
                    {order.customer.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Phone className="h-4 w-4" />
                    {order.customer.phone}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Truck className="h-4 w-4" />
                    {order.shippingMethod}
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>{order.customer.shippingAddress.street}</p>
                    <p>
                      {order.customer.shippingAddress.city}, {order.customer.shippingAddress.state} {order.customer.shippingAddress.zip}
                    </p>
                    <p>{order.customer.shippingAddress.country}</p>
                  </div>
                </div>
                {order.trackingNumber && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <p className="font-medium">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-500">Billing Address</p>
                  <div className="text-sm text-gray-500 space-y-1 mt-2">
                    <p>{order.customer.billingAddress.street}</p>
                    <p>
                      {order.customer.billingAddress.city}, {order.customer.billingAddress.state} {order.customer.billingAddress.zip}
                    </p>
                    <p>{order.customer.billingAddress.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;