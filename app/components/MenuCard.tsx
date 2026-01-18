import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  badge?: string;
}

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export function MenuCard({ item, onAddToCart }: MenuCardProps) {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    setQuantity(1);
  };

  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-zinc-800 relative">
      {item.badge && (
        <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white text-xs font-poppins font-bold px-3 py-1.5 rounded-full shadow-lg">
          {item.badge}
        </div>
      )}
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="font-poppins font-bold text-xl text-white mb-2">
          {item.name}
        </h3>
        <p className="font-inter text-sm text-zinc-400 mb-4">
          {item.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="font-poppins font-bold text-2xl text-orange-500">
            GH₵ {item.price.toFixed(2)}
          </span>
          <div className="flex items-center gap-3 bg-zinc-800 rounded-lg px-2 py-1">
            <button
              onClick={handleDecrement}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-700 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <span className="font-inter font-semibold text-white w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-700 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        <Button
          onClick={handleAddToCart}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold py-6 rounded-xl transition-colors"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}