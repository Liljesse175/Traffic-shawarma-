import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { LogOut, RefreshCw, Package, DollarSign, ShoppingBag, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface Order {
  orderId: string;
  email: string;
  amount: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface AdminDashboardProps {
  token: string;
  username: string;
  onLogout: () => void;
}

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  accepted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
};

export function AdminDashboard({ token, username, onLogout }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      console.log('Fetching orders with token:', token.substring(0, 20) + '...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-316989a5/admin/orders`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const data = await response.json();
        console.log('Response error:', data);
        throw new Error(data.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      console.log('Response data:', data);

      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Only show error toast if it's not just an empty database
      if (error instanceof Error && !error.message.includes('Failed to fetch orders')) {
        toast.error('Failed to fetch orders. Please try logging out and back in.');
      }
      // Set empty array on error so UI shows "No orders yet"
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-316989a5/admin/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order');
      }

      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(false);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchOrders(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    accepted: orders.filter((o) => o.status === 'accepted').length,
    completed: orders.filter((o) => o.status === 'completed' || o.status === 'success').length,
    totalRevenue: orders
      .filter((o) => o.status === 'completed' || o.status === 'success')
      .reduce((sum, o) => sum + o.amount, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-inter text-zinc-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="font-poppins font-bold text-3xl text-zinc-900 mb-2">Dashboard Overview</h1>
        <p className="font-inter text-zinc-600">Monitor your restaurant's performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-inter text-sm text-zinc-600">Total Orders</p>
              <p className="font-poppins font-bold text-2xl text-zinc-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="font-inter text-sm text-zinc-600">Pending</p>
              <p className="font-poppins font-bold text-2xl text-zinc-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-inter text-sm text-zinc-600">Accepted</p>
              <p className="font-poppins font-bold text-2xl text-zinc-900">{stats.accepted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-inter text-sm text-zinc-600">Completed</p>
              <p className="font-poppins font-bold text-2xl text-zinc-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-200 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-700" />
            </div>
            <div>
              <p className="font-inter text-sm text-orange-800">Revenue</p>
              <p className="font-poppins font-bold text-2xl text-orange-700">
                GH₵ {stats.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="font-poppins font-bold text-xl text-zinc-900">Recent Orders</h2>
          <Button
            onClick={() => fetchOrders(false)}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-zinc-300 hover:bg-zinc-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="font-inter text-zinc-600">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-4 text-left font-poppins text-sm font-semibold text-zinc-700">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left font-poppins text-sm font-semibold text-zinc-700">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left font-poppins text-sm font-semibold text-zinc-700">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left font-poppins text-sm font-semibold text-zinc-700">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left font-poppins text-sm font-semibold text-zinc-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-poppins text-sm font-semibold text-zinc-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left font-poppins text-sm font-semibold text-zinc-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-zinc-600">
                        {order.orderId.slice(0, 12)}...
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-inter text-sm text-zinc-900">{order.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="font-inter text-sm text-zinc-600">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-poppins font-semibold text-orange-600">
                        GH₵ {order.amount.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[order.status] || statusColors.pending
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-inter text-sm text-zinc-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="font-inter text-xs text-zinc-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                        className="bg-white border border-zinc-300 text-zinc-900 rounded-lg px-3 py-2 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}