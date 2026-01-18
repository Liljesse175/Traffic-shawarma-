import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-316989a5`;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

// Menu API
export const menuApi = {
  // Get all menu items (public)
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      console.log('Menu API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Menu API error:', errorText);
        throw new Error(`Failed to fetch menu items: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Menu API response data:', data);
      return data.items || [];
    } catch (error) {
      console.error('Menu API fetch error:', error);
      throw error;
    }
  },

  // Alias for public usage
  getMenuItems: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      console.log('getMenuItems response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('getMenuItems error:', errorText);
        throw new Error(`Failed to fetch menu items: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('getMenuItems response data:', data);
      return data.items || [];
    } catch (error) {
      console.error('getMenuItems fetch error:', error);
      throw error;
    }
  },

  // Get all menu items (admin)
  getAllAdmin: async () => {
    const token = getAuthToken();
    try {
      console.log('Fetching admin menu items with token:', token?.substring(0, 20) + '...');
      
      const response = await fetch(`${API_BASE_URL}/admin/menu`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token || '',
        },
      });
      
      console.log('Admin menu API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Admin menu API error:', errorText);
        throw new Error(`Failed to fetch menu items: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Admin menu API response data:', data);
      return data.items || [];
    } catch (error) {
      console.error('Admin menu API fetch error:', error);
      throw error;
    }
  },

  // Create menu item
  create: async (item: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/menu`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Admin-Token': token || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create menu item error:', errorText);
      throw new Error('Failed to create menu item');
    }
    const data = await response.json();
    return data.item;
  },

  // Update menu item
  update: async (id: string, updates: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Admin-Token': token || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update menu item error:', errorText);
      throw new Error('Failed to update menu item');
    }
    const data = await response.json();
    return data.item;
  },

  // Delete menu item
  delete: async (id: string) => {
    const token = getAuthToken();
    console.log('🗑️ DELETE API - Attempting to delete menu item with ID:', id);
    console.log('🗑️ DELETE API - Request URL:', `${API_BASE_URL}/admin/menu/${id}`);
    
    const response = await fetch(`${API_BASE_URL}/admin/menu/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Admin-Token': token || '',
      },
    });
    
    console.log('🗑️ DELETE API - Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Delete menu item error:', errorText);
      throw new Error('Failed to delete menu item');
    }
    
    const result = await response.json();
    console.log('✅ DELETE API - Success:', result);
    return true;
  },
};

// Settings API
export const settingsApi = {
  // Get settings (public)
  get: async () => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    const data = await response.json();
    return data.settings;
  },

  // Alias for public usage
  getSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    const data = await response.json();
    return data.settings;
  },

  // Update settings (admin)
  update: async (settings: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Admin-Token': token || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    const data = await response.json();
    return data.settings;
  },
};

// Orders API (for future use)
export const ordersApi = {
  // Get all orders (admin)
  getAll: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Admin-Token': token || '',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    return data.orders || [];
  },

  // Update order status
  updateStatus: async (reference: string, status: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/orders/${reference}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Admin-Token': token || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order status');
    const data = await response.json();
    return data.order;
  },
};