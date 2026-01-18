import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { MenuCard, MenuItem } from './components/MenuCard';
import { CartSheet } from './components/CartSheet';
import { CartItemData } from './components/CartItem';
import { Button } from './components/ui/button';
import { ShoppingCart, MapPin, Clock, Phone, Instagram, MessageCircle, Flame, Settings, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { OrderTracking } from './components/OrderTracking';
import { useOptimizedMenu } from '@/hooks/useOptimizedMenu';
import { useFavorites } from '@/hooks/useFavorites';
import { useDebounce } from '@/hooks/useDebounce';
import { menuApi, settingsApi } from '@/utils/api';

// Lazy load admin panel for better initial load performance
const Admin = lazy(() => import('./Admin'));

// Import Figma assets
import shawarmaImage1 from 'figma:asset/7ca2055d340d1fad77fbbc2374c226320419774f.png';
import trafficFridayPromo from 'figma:asset/dad6293d891712591c0919e315bb8f556babc7ab.png';
import shawarmaImage3 from 'figma:asset/3b0fa73868e7a2c90804ceaa2f12c00a80a3e2ff.png';
import shawarmaImage4 from 'figma:asset/b637f686d84930f6bf2a49ec89ad0a9da5922249.png';
import shawarmaImage5 from 'figma:asset/74a579bea05ef4c50d324220a2d6b379b9dbb0ac.png';
import shawarmaImage6 from 'figma:asset/89aa1573db9998e6c9ffdced2819437a26e87986.png';
import shawarmaImage7 from 'figma:asset/840dd45e78c9cf4fd309219438e0df2d0f584f96.png';

// Fallback menu items (used if database is empty or during initial load)
const fallbackMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Chicken Shawarma',
    description: 'Succulent grilled chicken wrapped in fresh pita with crispy veggies and our signature sauce',
    price: 25.00,
    image: shawarmaImage1,
    category: 'chicken',
  },
  {
    id: '2',
    name: 'Spicy Beef Shawarma',
    description: 'Tender marinated beef with fresh tomatoes, lettuce, and homemade garlic sauce',
    price: 30.00,
    image: shawarmaImage5,
    category: 'beef',
  },
  {
    id: '3',
    name: 'Supreme Special Shawarma',
    description: 'Premium combo of chicken & beef with extra toppings, cheese, and spicy sauce',
    price: 40.00,
    image: shawarmaImage3,
    category: 'special',
    badge: 'Best Seller',
  },
  {
    id: '4',
    name: 'Loaded Chicken Shawarma',
    description: 'Extra chicken with double cheese, jalapeños, and premium sauces',
    price: 35.00,
    image: shawarmaImage6,
    category: 'chicken',
  },
  {
    id: '5',
    name: 'Deluxe Beef Shawarma',
    description: 'Premium beef cuts with caramelized onions, pepper jack cheese, and special spicy mayo',
    price: 38.00,
    image: shawarmaImage7,
    category: 'beef',
  },
  {
    id: '6',
    name: 'Veggie Supreme Shawarma',
    description: 'Fresh vegetables, hummus, falafel, and tahini sauce in warm pita',
    price: 22.00,
    image: shawarmaImage4,
    category: 'special',
  },
];

const comboDeals: MenuItem[] = [
  {
    id: 'combo1',
    name: 'Traffic Friday Special',
    description: 'Buy 3 Shawarmas, Get 1 FREE! Limited time offer',
    price: 100.00,
    image: trafficFridayPromo,
    category: 'combo',
    badge: 'Limited Deal',
  },
  {
    id: 'combo2',
    name: 'Mega Combo',
    description: 'Any 2 shawarmas + 2 drinks + fries',
    price: 75.00,
    image: shawarmaImage1,
    category: 'combo',
    badge: 'Value Deal',
  },
  {
    id: 'combo3',
    name: 'Family Pack',
    description: '5 shawarmas of your choice + 4 drinks + 2 large fries',
    price: 150.00,
    image: shawarmaImage3,
    category: 'combo',
  },
];

const extras: MenuItem[] = [
  {
    id: 'extra1',
    name: 'Extra Cheese',
    description: 'Add melted cheese to any shawarma',
    price: 3.00,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
    category: 'extras',
  },
  {
    id: 'extra2',
    name: 'Extra Meat',
    description: 'Double your protein',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    category: 'extras',
  },
  {
    id: 'extra3',
    name: 'Fries',
    description: 'Crispy golden fries',
    price: 10.00,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    category: 'extras',
  },
  {
    id: 'drink1',
    name: 'Soft Drink',
    description: 'Coca-Cola, Sprite, or Fanta',
    price: 5.00,
    image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400',
    category: 'drinks',
  },
  {
    id: 'drink2',
    name: 'Fresh Juice',
    description: 'Orange or Pineapple',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    category: 'drinks',
  },
];

type Category = 'all' | 'chicken' | 'beef' | 'special' | 'combo' | 'extras' | 'drinks';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'chicken', label: 'Chicken' },
  { id: 'beef', label: 'Beef' },
  { id: 'special', label: 'Special' },
  { id: 'combo', label: 'Combo Deals' },
  { id: 'extras', label: 'Extras & Drinks' },
];

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash);

  // Handle hash changes for routing
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // If admin route, show admin dashboard
  if (currentPath === '#/admin') {
    return <Suspense fallback={<div>Loading Admin...</div>}><Admin /></Suspense>;
  }

  return <MainApp />;
}

function MainApp() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItemData[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  
  // Use custom hooks for optimization
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity }];
    });
    toast.success(`${item.name} added to cart!`);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success('Item removed from cart');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Generate WhatsApp message
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Format order items for WhatsApp (using actual characters, not HTML entities)
    let message = `🔥 *TRAFFIC SHAWARMA ORDER* 🔥\n\n`;
    message += `📋 *Order Details:*\n`;
    message += `━━━━━━━━━━━━━━━━\n`;
    
    cart.forEach((item, index) => {
      message += `\n${index + 1}. *${item.name}*\n`;
      message += `   Qty: ${item.quantity} x GH₵${item.price.toFixed(2)}\n`;
      message += `   Subtotal: GH₵${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n━━━━━━━━━━━━━━━━\n`;
    message += `💰 *TOTAL: GH₵${total.toFixed(2)}*\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    message += `👤 *Customer Name:*\n`;
    message += `_Please specify your name_\n\n`;
    message += `📍 *Delivery/Pickup Location:*\n`;
    message += `_Please specify your location or if it's for pickup_\n\n`;
    message += `Thank you for choosing Traffic Shawarma! 🌯`;
    
    // WhatsApp number and properly encode the message
    const whatsappNumber = '233546906273';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Clear cart and close
    setCart([]);
    setCartOpen(false);
    toast.success('Order sent to WhatsApp!');
  };

  const scrollToMenu = () => {
    categoryRefs.current['menu']?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCategory = (category: Category) => {
    setActiveCategory(category);
    if (category === 'all') {
      categoryRefs.current['menu']?.scrollIntoView({ behavior: 'smooth' });
    } else {
      categoryRefs.current[category]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [menuItems, setMenuItems] = useState<MenuItem[]>(fallbackMenuItems);
  const [settings, setSettings] = useState({
    restaurantName: 'TRAFFIC SHAWARMA',
    whatsappNumber: '+233200172160',
    phone: '+233246801890',
    address: 'Madina Junction, Near Total Filling Station, Accra',
    openingHours: 'Mon-Sat: 10:00 AM - 10:00 PM, Sun: 12:00 PM - 9:00 PM',
    deliveryFee: 10,
    isOpen: true,
  });

  useEffect(() => {
    // Fetch menu items from the API
    menuApi.getMenuItems()
      .then((items) => {
        console.log('Fetched menu items from API:', items);
        if (items && items.length > 0) {
          // Filter only available items for the customer-facing menu
          const availableItems = items.filter((item: any) => item.available !== false);
          console.log('Available items:', availableItems);
          // Only update if we have items from database
          if (availableItems.length > 0) {
            setMenuItems(availableItems);
          } else {
            console.log('No available items, using fallback menu');
          }
        } else {
          console.log('No items from API, using fallback menu');
        }
      })
      .catch((error) => {
        console.error('Failed to fetch menu items:', error);
        // Keep fallback menu items if API call fails
        console.log('Using fallback menu due to error');
      });

    // Fetch settings from the API
    settingsApi.getSettings()
      .then((fetchedSettings) => {
        console.log('Fetched settings from API:', fetchedSettings);
        if (fetchedSettings) {
          setSettings(fetchedSettings);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch settings:', error);
        // Keep default settings if API call fails
        console.log('Using default settings due to error');
      });
  }, []);

  const allMenuItems = [...menuItems, ...comboDeals, ...extras];
  const filteredItems = activeCategory === 'all' 
    ? allMenuItems 
    : allMenuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <Toaster position="top-center" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1583665354191-634609954d54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBmb29kJTIwc2hhd2FybWF8ZW58MXx8fHwxNzY4NTg2NjE0fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Delicious shawarma"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="font-poppins font-extrabold text-5xl md:text-7xl lg:text-8xl mb-4 leading-tight">
            TRAFFIC
            <br />
            <span className="text-orange-500">SHAWARMA</span>
          </h1>
          <p className="font-poppins text-xl md:text-3xl lg:text-4xl mb-8 text-zinc-300">
            Hot & Loaded Shawarma,
            <br />
            Ghana Style
          </p>
          <Button
            onClick={scrollToMenu}
            className="bg-orange-500 hover:bg-orange-600 text-white font-poppins font-bold text-lg md:text-xl px-10 py-7 md:px-12 md:py-8 rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            Order via WhatsApp
          </Button>
        </div>

        {/* Floating Cart Button */}
        {cartItemCount > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 md:p-5 shadow-2xl transition-all transform hover:scale-110"
          >
            <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center">
              {cartItemCount}
            </span>
          </button>
        )}
      </section>

      {/* Limited Deals Section */}
      <section 
        ref={(el) => (categoryRefs.current['deals'] = el)}
        className="px-6 py-16 md:py-20 lg:py-24 bg-gradient-to-b from-black to-zinc-950"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8 md:mb-12">
            <Flame className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
            <h2 className="font-poppins font-bold text-3xl md:text-5xl lg:text-6xl text-center">
              <span className="text-orange-500">Limited</span> Deals
            </h2>
            <Flame className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
          </div>
          
          {/* Traffic Friday Promo Banner */}
          <div className="mb-8 md:mb-12 rounded-2xl overflow-hidden shadow-2xl border-4 border-orange-500 max-w-3xl mx-auto">
            <img src={trafficFridayPromo} alt="Traffic Friday - Buy 3 Get 1 Free" className="w-full" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {comboDeals.map((item) => (
              <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* Category Tabs - Sticky */}
      <div 
        ref={(el) => (categoryRefs.current['menu'] = el)}
        className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-800 px-4 py-4"
      >
        <div className="max-w-7xl mx-auto overflow-x-auto">
          <div className="flex gap-2 md:gap-3 min-w-max md:justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id as Category)}
                className={`px-5 py-2.5 md:px-6 md:py-3 rounded-full font-poppins font-semibold text-sm md:text-base transition-all whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Section - Chicken */}
      <section 
        ref={(el) => (categoryRefs.current['chicken'] = el)}
        className="px-6 py-16 md:py-20 lg:py-24 bg-zinc-950"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="font-poppins font-bold text-3xl md:text-5xl lg:text-6xl mb-8 md:mb-12">
            �� <span className="text-orange-500">Chicken</span> Shawarma
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems
              .filter((item) => item.category === 'chicken')
              .map((item) => (
                <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
          </div>
        </div>
      </section>

      {/* Menu Section - Beef */}
      <section 
        ref={(el) => (categoryRefs.current['beef'] = el)}
        className="px-6 py-16 md:py-20 lg:py-24 bg-black"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="font-poppins font-bold text-3xl md:text-5xl lg:text-6xl mb-8 md:mb-12">
            🥩 <span className="text-orange-500">Beef</span> Shawarma
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems
              .filter((item) => item.category === 'beef')
              .map((item) => (
                <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
          </div>
        </div>
      </section>

      {/* Menu Section - Special */}
      <section 
        ref={(el) => (categoryRefs.current['special'] = el)}
        className="px-6 py-16 md:py-20 lg:py-24 bg-zinc-950"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="font-poppins font-bold text-3xl md:text-5xl lg:text-6xl mb-8 md:mb-12">
            ⭐ <span className="text-orange-500">Special</span> Shawarma
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems
              .filter((item) => item.category === 'special')
              .map((item) => (
                <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
          </div>
        </div>
      </section>

      {/* Extras & Drinks Section */}
      <section 
        ref={(el) => (categoryRefs.current['extras'] = el)}
        className="px-6 py-16 md:py-20 lg:py-24 bg-black"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="font-poppins font-bold text-3xl md:text-5xl lg:text-6xl mb-8 md:mb-12">
            🍟 <span className="text-orange-500">Extras</span> & Drinks
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {extras.map((item) => (
              <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="px-6 py-16 md:py-20 lg:py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-poppins font-bold text-3xl md:text-5xl lg:text-6xl text-center mb-12 md:mb-16">
            Visit <span className="text-orange-500">Us</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 md:w-7 md:h-7 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl md:text-2xl mb-2">Location</h3>
                  <p className="font-inter text-zinc-400 text-base md:text-lg">
                    {settings.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 md:w-7 md:h-7 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl md:text-2xl mb-2">Opening Hours</h3>
                  <p className="font-inter text-zinc-400 text-base md:text-lg">
                    {settings.openingHours}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800 md:col-span-2 lg:col-span-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 md:w-7 md:h-7 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl md:text-2xl mb-2">Contact</h3>
                  <p className="font-inter text-zinc-400 text-base md:text-lg">
                    {settings.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 md:py-16 bg-black border-t border-zinc-800">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="font-poppins font-bold text-2xl md:text-3xl mb-6">
            TRAFFIC <span className="text-orange-500">SHAWARMA</span>
          </h3>
          <div className="flex items-center justify-center gap-6 mb-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-zinc-900 hover:bg-orange-500 flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 md:w-6 md:h-6" />
            </a>
            <a
              href="https://wa.me/233241234567"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-zinc-900 hover:bg-orange-500 flex items-center justify-center transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
            </a>
          </div>
          
          {/* Track Order & Admin Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Button
              onClick={() => setOrderTrackingOpen(true)}
              variant="outline"
              className="border-zinc-700 hover:border-orange-500 hover:bg-orange-500/10 text-zinc-400 hover:text-orange-500 transition-all font-poppins font-semibold"
            >
              <Package className="w-4 h-4 mr-2" />
              Track Order
            </Button>
            <Button
              onClick={() => window.location.hash = '#/admin'}
              variant="outline"
              className="border-zinc-700 hover:border-orange-500 hover:bg-orange-500/10 text-zinc-400 hover:text-orange-500 transition-all font-poppins font-semibold"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
          </div>

          <p className="font-inter text-sm md:text-base text-zinc-500">
            © 2026 Traffic Shawarma. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Cart Sheet */}
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Order Tracking Dialog */}
      <OrderTracking
        isOpen={orderTrackingOpen}
        onClose={() => setOrderTrackingOpen(false)}
      />
    </div>
  );
}