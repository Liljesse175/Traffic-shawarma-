import { Trash2, Plus, Minus } from 'lucide-react';

export interface CartItemData {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const handleIncrement = () => onUpdateQuantity(item.id, item.quantity + 1);
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
      <div className="flex-1">
        <h4 className="font-poppins font-semibold text-white text-sm mb-1">
          {item.name}
        </h4>
        <p className="font-inter text-orange-500 font-semibold">
          GH₵ {item.price.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-2 py-1">
        <button
          onClick={handleDecrement}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700 transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3 h-3 text-white" />
        </button>
        <span className="font-inter font-semibold text-white w-6 text-center text-sm">
          {item.quantity}
        </span>
        <button
          onClick={handleIncrement}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-3 h-3 text-white" />
        </button>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors"
        aria-label="Remove item"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );
}
