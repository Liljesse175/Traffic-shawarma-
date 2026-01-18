import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Star, Calendar } from 'lucide-react';
import { ordersApi, menuApi } from '@/utils/api';

interface Order {
  orderId: string;
  email: string;
  amount: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  status: string;
  createdAt: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

export function AdminAnalytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, menuData] = await Promise.all([
          ordersApi.getAll(),
          menuApi.getAllAdmin(),
        ]);
        setOrders(ordersData);
        setMenuItems(menuData);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter orders by time range
  const getFilteredOrders = () => {
    const now = new Date();
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= monthAgo;
      }
      return true;
    });
    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Calculate statistics
  const stats = {
    totalRevenue: filteredOrders
      .filter((o) => o.status === 'completed' || o.status === 'success')
      .reduce((sum, o) => sum + o.amount, 0),
    totalOrders: filteredOrders.length,
    completedOrders: filteredOrders.filter((o) => o.status === 'completed' || o.status === 'success').length,
    cancelledOrders: filteredOrders.filter((o) => o.status === 'cancelled').length,
    averageOrderValue: filteredOrders.length > 0
      ? filteredOrders.reduce((sum, o) => sum + o.amount, 0) / filteredOrders.length
      : 0,
  };

  // Get popular items
  const itemQuantities: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  filteredOrders.forEach(order => {
    if (order.status === 'completed' || order.status === 'success') {
      order.items.forEach(item => {
        if (!itemQuantities[item.id]) {
          itemQuantities[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemQuantities[item.id].quantity += item.quantity;
        itemQuantities[item.id].revenue += item.price * item.quantity;
      });
    }
  });

  const popularItems = Object.values(itemQuantities)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Revenue by category
  const categoryRevenue: { [key: string]: number } = {};
  filteredOrders.forEach(order => {
    if (order.status === 'completed' || order.status === 'success') {
      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.id);
        const category = menuItem?.category || 'Other';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + (item.price * item.quantity);
      });
    }
  });

  const categoryData = Object.entries(categoryRevenue).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: parseFloat(value.toFixed(2)),
  }));

  // Daily revenue trend
  const dailyRevenue: { [key: string]: number } = {};
  filteredOrders.forEach(order => {
    if (order.status === 'completed' || order.status === 'success') {
      const date = new Date(order.createdAt).toLocaleDateString();
      dailyRevenue[date] = (dailyRevenue[date] || 0) + order.amount;
    }
  });

  const revenueData = Object.entries(dailyRevenue)
    .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Last 7 days

  // Order status distribution
  const statusData = [
    { name: 'Completed', value: stats.completedOrders, color: '#22c55e' },
    { name: 'Pending', value: filteredOrders.filter(o => o.status === 'pending').length, color: '#eab308' },
    { name: 'Accepted', value: filteredOrders.filter(o => o.status === 'accepted').length, color: '#3b82f6' },
    { name: 'Cancelled', value: stats.cancelledOrders, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const COLORS = ['#22c55e', '#eab308', '#3b82f6', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="font-inter text-zinc-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-2xl md:text-3xl text-zinc-900 mb-1">Analytics Dashboard</h1>
          <p className="font-inter text-sm text-zinc-600">Track your business performance and insights</p>
        </div>
        
        {/* Time Range Filter */}
        <div className="flex gap-2 bg-zinc-100 rounded-lg p-1">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-md font-inter text-sm font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-md font-inter text-sm font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-md font-inter text-sm font-medium transition-colors ${
              timeRange === 'all'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-200 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-700" />
            </div>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="font-inter text-sm text-orange-800 mb-1">Total Revenue</p>
          <p className="font-poppins font-bold text-3xl text-orange-700 mb-1">
            GH₵ {stats.totalRevenue.toFixed(2)}
          </p>
          <p className="font-inter text-xs text-orange-600">
            {stats.completedOrders} completed orders
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="font-inter text-sm text-zinc-600 mb-1">Total Orders</p>
          <p className="font-poppins font-bold text-3xl text-zinc-900 mb-1">{stats.totalOrders}</p>
          <p className="font-inter text-xs text-zinc-500">
            {((stats.completedOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(0)}% completion rate
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="font-inter text-sm text-zinc-600 mb-1">Avg. Order Value</p>
          <p className="font-poppins font-bold text-3xl text-zinc-900 mb-1">
            GH₵ {stats.averageOrderValue.toFixed(2)}
          </p>
          <p className="font-inter text-xs text-zinc-500">Per order average</p>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="font-inter text-sm text-zinc-600 mb-1">Cancellation Rate</p>
          <p className="font-poppins font-bold text-3xl text-zinc-900 mb-1">
            {((stats.cancelledOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(1)}%
          </p>
          <p className="font-inter text-xs text-zinc-500">{stats.cancelledOrders} cancelled orders</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <h3 className="font-poppins font-bold text-lg text-zinc-900 mb-4">Revenue Trend</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                  formatter={(value) => [`GH₵ ${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-zinc-500">
              <p className="font-inter text-sm">No revenue data available</p>
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <h3 className="font-poppins font-bold text-lg text-zinc-900 mb-4">Order Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-zinc-500">
              <p className="font-inter text-sm">No order data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Popular Items and Category Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-orange-500" />
            <h3 className="font-poppins font-bold text-lg text-zinc-900">Top Selling Items</h3>
          </div>
          {popularItems.length > 0 ? (
            <div className="space-y-4">
              {popularItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <span className="font-poppins font-bold text-orange-700">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-semibold text-zinc-900 truncate">{item.name}</p>
                    <p className="font-inter text-xs text-zinc-500">{item.quantity} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-poppins font-semibold text-orange-600">
                      GH₵ {item.revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500">
              <p className="font-inter text-sm">No sales data available</p>
            </div>
          )}
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <h3 className="font-poppins font-bold text-lg text-zinc-900 mb-4">Revenue by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" stroke="#71717a" style={{ fontSize: '12px' }} />
                <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                  formatter={(value) => [`GH₵ ${value}`, 'Revenue']}
                />
                <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-zinc-500">
              <p className="font-inter text-sm">No category data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
