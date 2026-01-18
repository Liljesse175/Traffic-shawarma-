import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Search, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Order {
  orderId: string;
  email: string;
  amount: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface OrderTrackingProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderTracking({ isOpen, onClose }: OrderTrackingProps) {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Auto-refresh order status every 30 seconds when order is loaded
  useEffect(() => {
    if (order) {
      const interval = setInterval(() => {
        fetchOrder(true);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [order?.orderId]);

  const fetchOrder = async (silent = false) => {
    if (!orderId.trim()) {
      toast.error('Please enter an Order ID');
      return;
    }

    if (!silent) setLoading(true);
    setNotFound(false);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-316989a5/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        setNotFound(true);
        setOrder(null);
        if (!silent) toast.error('Order not found');
        return;
      }

      const data = await response.json();
      
      // Verify email if provided
      if (email && data.order.email !== email) {
        setNotFound(true);
        setOrder(null);
        if (!silent) toast.error('Order not found or email mismatch');
        return;
      }

      setOrder(data.order);
      setNotFound(false);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      if (!silent) toast.error('Failed to fetch order');
      setNotFound(true);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderId('');
    setEmail('');
    setOrder(null);
    setNotFound(false);
    onClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'accepted':
        return <Package className="w-8 h-8 text-blue-500" />;
      case 'completed':
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Clock className="w-8 h-8 text-zinc-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is awaiting confirmation.';
      case 'accepted':
        return 'Your order is being prepared! It will be ready soon.';
      case 'completed':
      case 'success':
        return 'Your order is ready! Thank you for your order.';
      case 'cancelled':
        return 'This order has been cancelled.';
      default:
        return 'Order status unknown.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-poppins text-2xl text-white">
            Track Your Order
          </DialogTitle>
          <DialogDescription className="font-inter text-zinc-400">
            Enter your order details to track its status in real-time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!order ? (
            <>
              {/* Order ID Input */}
              <div>
                <Label htmlFor="orderId" className="font-inter text-sm font-semibold text-zinc-300 mb-2 block">
                  Order ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter your order reference number"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchOrder();
                  }}
                />
              </div>

              {/* Email Input (Optional) */}
              <div>
                <Label htmlFor="email" className="font-inter text-sm font-semibold text-zinc-300 mb-2 block">
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchOrder();
                  }}
                />
                <p className="text-xs text-zinc-500 mt-1 font-inter">
                  Optional: For additional verification
                </p>
              </div>

              {/* Not Found Message */}
              {notFound && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="font-inter text-sm text-red-400">
                    Order not found. Please check your Order ID and try again.
                  </p>
                </div>
              )}

              {/* Track Button */}
              <Button
                onClick={() => fetchOrder()}
                disabled={loading || !orderId.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold py-6"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track Order
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Order Status Display */}
              <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center">
                    {getStatusIcon(order.status)}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                  <p className="font-inter text-zinc-400 mt-3">
                    {getStatusMessage(order.status)}
                  </p>
                </div>

                {/* Order Timeline */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      order.status ? 'bg-green-500' : 'bg-zinc-700'
                    }`}>
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-poppins font-semibold text-white">Order Placed</p>
                      <p className="font-inter text-xs text-zinc-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      order.status === 'accepted' || order.status === 'completed' || order.status === 'success'
                        ? 'bg-green-500'
                        : 'bg-zinc-700'
                    }`}>
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-poppins font-semibold text-white">Order Accepted</p>
                      <p className="font-inter text-xs text-zinc-400">
                        {order.status === 'accepted' || order.status === 'completed' || order.status === 'success'
                          ? 'Being prepared'
                          : 'Awaiting confirmation'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      order.status === 'completed' || order.status === 'success'
                        ? 'bg-green-500'
                        : 'bg-zinc-700'
                    }`}>
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-poppins font-semibold text-white">Order Ready</p>
                      <p className="font-inter text-xs text-zinc-400">
                        {order.status === 'completed' || order.status === 'success'
                          ? 'Ready for pickup/delivery'
                          : 'Not ready yet'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="border-t border-zinc-700 pt-6">
                  <p className="font-poppins font-semibold text-white mb-3">Order Details</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between font-inter text-sm">
                        <span className="text-zinc-300">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-orange-500 font-semibold">
                          GH₵ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-poppins font-bold text-lg border-t border-zinc-700 pt-2 mt-2">
                      <span className="text-white">Total</span>
                      <span className="text-orange-500">GH₵ {order.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Order ID */}
                <div className="border-t border-zinc-700 pt-4 mt-4">
                  <p className="font-inter text-xs text-zinc-500">Order Reference</p>
                  <p className="font-mono text-sm text-zinc-300 mt-1">{order.orderId}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setOrder(null);
                    setOrderId('');
                    setEmail('');
                  }}
                  variant="outline"
                  className="flex-1 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                >
                  Track Another Order
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
