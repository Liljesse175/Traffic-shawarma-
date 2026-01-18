import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { CartItem, CartItemData } from './CartItem';
import { Button } from '@/app/components/ui/button';
import { ShoppingCart, MessageCircle } from 'lucide-react';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItemData[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export function CartSheet({
  open,
  onOpenChange,
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartSheetProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-black border-t border-zinc-800 max-h-[85vh] overflow-y-auto rounded-t-3xl"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="font-poppins text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-orange-500" />
            Your Cart
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review your order items and proceed to checkout
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="font-inter text-zinc-400">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemove}
                />
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <div className="flex items-center justify-between mb-6">
                <span className="font-poppins text-lg text-white">Total</span>
                <span className="font-poppins font-bold text-2xl text-orange-500">
                  GH₵ {total.toFixed(2)}
                </span>
              </div>

              <Button
                onClick={onCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-poppins font-bold py-7 rounded-xl text-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Order via WhatsApp
              </Button>

              <p className="text-center text-xs text-zinc-500 mt-3 font-inter">
                Complete your order through WhatsApp
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}