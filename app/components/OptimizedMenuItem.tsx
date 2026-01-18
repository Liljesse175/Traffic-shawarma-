import { memo, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Heart, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';

interface OptimizedMenuItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  quantity: number;
  isFavorite: boolean;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const OptimizedMenuItem = memo(function OptimizedMenuItem({
  id,
  name,
  description,
  price,
  image,
  available,
  quantity,
  isFavorite,
  onAddToCart,
  onRemoveFromCart,
  onToggleFavorite,
}: OptimizedMenuItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => onAddToCart(id);
  const handleRemoveFromCart = () => onRemoveFromCart(id);
  const handleToggleFavorite = () => onToggleFavorite(id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 hover:border-orange-500 transition-all hover:shadow-xl hover:shadow-orange-500/10"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={image}
          alt={name}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageError(true);
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400';
          }}
        />
        
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
            }`}
          />
        </button>

        {/* Out of Stock Overlay */}
        {!available && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-poppins font-semibold text-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-poppins font-bold text-xl text-white mb-2 line-clamp-1">
          {name}
        </h3>
        <p className="font-inter text-sm text-zinc-400 mb-4 line-clamp-2 min-h-[2.5rem]">
          {description}
        </p>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-poppins font-bold text-2xl text-orange-500">
              GH₵ {price.toFixed(2)}
            </p>
          </div>

          {available && (
            <div className="flex items-center gap-2">
              {quantity > 0 ? (
                <div className="flex items-center gap-2 bg-orange-500 rounded-lg">
                  <Button
                    onClick={handleRemoveFromCart}
                    size="sm"
                    className="bg-transparent hover:bg-orange-600 text-white h-9 w-9 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-poppins font-bold text-white min-w-[1.5rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    onClick={handleAddToCart}
                    size="sm"
                    className="bg-transparent hover:bg-orange-600 text-white h-9 w-9 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
