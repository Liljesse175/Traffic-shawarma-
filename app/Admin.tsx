import { useState, useEffect } from 'react';
import { AdminLogin } from '@/app/components/AdminLogin';
import { AdminMenuManagement } from '@/app/components/AdminMenuManagement';
import { AdminAnalytics } from '@/app/components/AdminAnalytics';
import { AdminSettings } from '@/app/components/AdminSettings';
import { Toaster } from '@/app/components/ui/sonner';
import { Button } from '@/app/components/ui/button';
import { UtensilsCrossed, ShoppingBag, Settings, LogOut, Menu, X, Home, BarChart3 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

type AdminView = 'analytics' | 'menu' | 'orders' | 'settings';

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [activeView, setActiveView] = useState<AdminView>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [isValidatingSession, setIsValidatingSession] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const validateStoredSession = async () => {
      const storedToken = localStorage.getItem('adminToken');
      const storedUsername = localStorage.getItem('adminUsername');
      
      if (!storedToken || !storedUsername) {
        setIsValidatingSession(false);
        return;
      }

      try {
        // Test if token is valid by making a lightweight API call
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-316989a5/admin/menu`,
          {
            method: 'GET',
            headers: {
              'X-Admin-Token': storedToken,
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          // Token is valid
          console.log('✅ Session validated successfully');
          setToken(storedToken);
          setUsername(storedUsername);
        } else {
          // Token is invalid (session expired or invalid)
          console.log('🔒 Session invalid or expired, clearing stored credentials');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUsername');
          toast.error('Session expired. Please login again.');
        }
      } catch (error) {
        console.error('Session validation error:', error);
        // Network error or other issue - clear session to be safe
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
      } finally {
        setIsValidatingSession(false);
      }
    };

    validateStoredSession();
  }, []);

  const handleLogin = (newToken: string, newUsername: string) => {
    console.log('🔐 New login successful, storing credentials');
    setToken(newToken);
    setUsername(newUsername);
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('adminUsername', newUsername);
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint to invalidate session on server
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-316989a5/admin/logout`,
        {
          method: 'POST',
          headers: {
            'X-Admin-Token': token || '',
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setToken(null);
    setUsername('');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    toast.success('Logged out successfully');
    window.location.reload();
  };

  // Show loading state while validating session
  if (isValidatingSession) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-inter text-zinc-400">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <>
        <Toaster position="top-center" />
        <AdminLogin onLogin={handleLogin} />
      </>
    );
  }

  const navigationItems = [
    { id: 'analytics' as AdminView, label: 'Analytics', icon: BarChart3 },
    { id: 'menu' as AdminView, label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'orders' as AdminView, label: 'Orders', icon: ShoppingBag },
    { id: 'settings' as AdminView, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-zinc-50 flex relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-56 lg:w-48 bg-white border-r border-zinc-200 transition-transform duration-300 overflow-y-auto`}
        >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="px-4 py-5 border-b border-zinc-200">
              <h2 className="font-poppins font-bold text-lg text-zinc-900">
                TRAFFIC <span className="text-orange-500">SHAWARMA</span>
              </h2>
              <p className="font-inter text-xs text-zinc-500 mt-1">Admin Panel</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setSidebarOpen(false); // Close sidebar on mobile after selecting
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg font-inter text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* User & Logout */}
            <div className="px-3 py-3 border-t border-zinc-200">
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-lg mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-poppins font-bold text-sm flex-shrink-0">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-semibold text-xs text-zinc-900 truncate">
                    {username}
                  </p>
                  <p className="font-inter text-[10px] text-zinc-500">Admin</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full border-zinc-300 hover:bg-red-50 hover:border-red-300 text-zinc-700 hover:text-red-600 font-inter text-xs"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto w-full">
          {/* Top Bar */}
          <header className="bg-white border-b border-zinc-200 px-4 py-3 sticky top-0 z-20">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5 text-zinc-600" />
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  onClick={() => window.location.hash = ''}
                  variant="outline"
                  size="sm"
                  className="border-zinc-300 hover:bg-zinc-50 font-inter text-xs px-3"
                >
                  <Home className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Back to Website</span>
                  <span className="sm:hidden">Home</span>
                </Button>
                <span className="font-inter text-xs text-zinc-600 hidden md:block">
                  <strong>{username}</strong>
                </span>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeView === 'analytics' && <AdminAnalytics />}
            {activeView === 'menu' && <AdminMenuManagement />}
            {activeView === 'orders' && (
              <div className="text-center py-20">
                <ShoppingBag className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                <h2 className="font-poppins font-bold text-2xl text-zinc-900 mb-2">
                  Orders View
                </h2>
                <p className="font-inter text-zinc-600">
                  Orders management coming soon...
                </p>
              </div>
            )}
            {activeView === 'settings' && <AdminSettings />}
          </div>
        </main>
      </div>
    </>
  );
}