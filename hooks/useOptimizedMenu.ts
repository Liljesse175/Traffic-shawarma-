import { useState, useEffect, useMemo } from 'react';
import { menuApi } from '@/utils/api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

const CACHE_KEY = 'traffic_shawarma_menu_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  items: MenuItem[];
  timestamp: number;
}

export function useOptimizedMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { items, timestamp }: CacheData = JSON.parse(cached);
          const now = Date.now();
          
          // Use cached data if less than 5 minutes old
          if (now - timestamp < CACHE_DURATION) {
            console.log('📦 Using cached menu data');
            setMenuItems(items);
            setLoading(false);
            
            // Fetch fresh data in background
            fetchFreshData();
            return;
          }
        }

        // No valid cache, fetch fresh data
        await fetchFreshData();
      } catch (err) {
        console.error('Failed to fetch menu:', err);
        setError('Failed to load menu items');
        setLoading(false);
      }
    };

    const fetchFreshData = async () => {
      const items = await menuApi.getAll();
      setMenuItems(items);
      setLoading(false);
      
      // Update cache
      const cacheData: CacheData = {
        items,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Menu data cached');
    };

    fetchMenu();
  }, []);

  // Memoized category grouping
  const menuByCategory = useMemo(() => {
    return menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menuItems]);

  // Memoized available items
  const availableItems = useMemo(() => {
    return menuItems.filter((item) => item.available);
  }, [menuItems]);

  return {
    menuItems,
    menuByCategory,
    availableItems,
    loading,
    error,
  };
}

// Clear menu cache (useful for admin after updates)
export function clearMenuCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ Menu cache cleared');
}
