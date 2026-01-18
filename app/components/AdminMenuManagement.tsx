import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Plus, Edit2, Trash2, Upload, Image as ImageIcon, Database, Search } from 'lucide-react';
import { toast } from 'sonner';
import { menuApi } from '@/utils/api';
import { seedMenuItems } from '@/utils/seedDatabase';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

export function AdminMenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await menuApi.getAllAdmin();
        setMenuItems(items);
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
        toast.error('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'chicken',
    image: '',
    available: true,
  });

  const categories = [
    { value: 'chicken', label: 'Chicken Shawarma' },
    { value: 'beef', label: 'Beef Shawarma' },
    { value: 'special', label: 'Special' },
    { value: 'combo', label: 'Combo Deals' },
    { value: 'extras', label: 'Extras' },
    { value: 'drinks', label: 'Drinks' },
  ];

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'chicken',
      image: '',
      available: true,
    });
    setIsAddEditOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      available: item.available,
    });
    setIsAddEditOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const itemData = {
      id: editingItem?.id,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image || 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
      available: formData.available,
    };

    try {
      if (editingItem) {
        const updatedItem = await menuApi.update(editingItem.id, itemData);
        setMenuItems(menuItems.map(item => item.id === editingItem.id ? updatedItem : item));
        toast.success('Menu item updated successfully!');
      } else {
        const newItem = await menuApi.create(itemData);
        setMenuItems([...menuItems, newItem]);
        toast.success('New menu item added successfully!');
      }
      setIsAddEditOpen(false);
    } catch (error) {
      console.error('Failed to save menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        console.log('🗑️ FRONTEND - Deleting menu item:', itemToDelete);
        console.log('🗑️ FRONTEND - Menu item ID:', itemToDelete.id);
        console.log('🗑️ FRONTEND - Menu item ID type:', typeof itemToDelete.id);
        console.log('🗑️ FRONTEND - Full item object:', JSON.stringify(itemToDelete, null, 2));
        
        await menuApi.delete(itemToDelete.id);
        
        setMenuItems(menuItems.filter(item => item.id !== itemToDelete.id));
        toast.success(`${itemToDelete.name} removed from menu`);
        setIsDeleteOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('❌ Failed to delete menu item:', error);
        toast.error('Failed to delete menu item');
      }
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const updatedItem = await menuApi.update(item.id, { available: !item.available });
      setMenuItems(menuItems.map(i => 
        i.id === item.id ? updatedItem : i
      ));
      toast.success(`${item.name} is now ${!item.available ? 'available' : 'out of stock'}`);
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleSeedDatabase = async () => {
    try {
      toast.info('Seeding database...');
      const result = await seedMenuItems();
      // Refresh menu items
      const items = await menuApi.getAllAdmin();
      setMenuItems(items);
      toast.success(`Successfully seeded ${result.successful} menu items!`);
    } catch (error) {
      console.error('Failed to seed menu items:', error);
      toast.error('Failed to seed menu items');
    }
  };

  // Filter menu items based on search query and category
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-poppins font-bold text-2xl md:text-3xl text-zinc-900 mb-1">Manage Menu</h1>
          <p className="font-inter text-sm text-zinc-600">Add, edit, or remove items from your menu</p>
        </div>
        <div className="flex gap-2">
          {menuItems.length === 0 && !loading && (
            <Button
              onClick={handleSeedDatabase}
              className="bg-blue-500 hover:bg-blue-600 text-white font-poppins font-semibold px-5 py-5 rounded-xl shadow-sm text-sm w-full sm:w-auto"
            >
              <Database className="w-4 h-4 mr-2" />
              Seed Database
            </Button>
          )}
          <Button
            onClick={handleAddNew}
            className="bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold px-5 py-5 rounded-xl shadow-sm text-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <p className="font-inter text-xs sm:text-sm text-blue-800">
          💡 <strong>Tip:</strong> Turn off availability instead of deleting if item is temporarily unavailable.
        </p>
      </div>

      {/* Search and Filter Controls */}
      {!loading && menuItems.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search menu items by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-zinc-300 text-zinc-900"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-zinc-900 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="mt-3 pt-3 border-t border-zinc-200">
              <p className="font-inter text-sm text-zinc-600">
                Showing {filteredMenuItems.length} of {menuItems.length} items
                {searchQuery && <span> matching "{searchQuery}"</span>}
                {selectedCategory !== 'all' && (
                  <span> in {categories.find(c => c.value === selectedCategory)?.label}</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="font-inter text-zinc-600">Loading menu items...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && menuItems.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-zinc-400" />
          </div>
          <h3 className="font-poppins font-bold text-xl text-zinc-900 mb-2">No menu items yet</h3>
          <p className="font-inter text-zinc-600 mb-6 max-w-md mx-auto">
            Get started by seeding the database with sample items, or add your first menu item manually.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleSeedDatabase}
              className="bg-blue-500 hover:bg-blue-600 text-white font-poppins font-semibold px-6 py-3"
            >
              <Database className="w-4 h-4 mr-2" />
              Seed Sample Menu
            </Button>
            <Button
              onClick={handleAddNew}
              className="bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold px-6 py-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      {!loading && menuItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMenuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-zinc-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full font-poppins font-semibold text-sm">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Category Badge */}
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold mb-3">
                  {categories.find(c => c.value === item.category)?.label || item.category}
                </span>

                {/* Name & Price */}
                <h3 className="font-poppins font-bold text-lg text-zinc-900 mb-2">
                  {item.name}
                </h3>
                <p className="font-poppins font-semibold text-2xl text-orange-500 mb-3">
                  GH₵ {item.price.toFixed(2)}
                </p>

                {/* Description */}
                <p className="font-inter text-sm text-zinc-600 mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Availability Toggle */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-200">
                  <span className="font-inter text-sm text-zinc-700 font-medium">
                    Availability
                  </span>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      item.available ? 'bg-green-500' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        item.available ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(item)}
                    variant="outline"
                    className="flex-1 border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-inter"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      setItemToDelete(item);
                      setIsDeleteOpen(true);
                    }}
                    variant="outline"
                    className="flex-1 border-red-200 hover:bg-red-50 text-red-600 font-inter"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="bg-white border-zinc-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins text-2xl text-zinc-900">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </DialogTitle>
            <DialogDescription className="font-inter text-zinc-600">
              {editingItem ? 'Update the details below to edit this menu item' : 'Fill in the details below to add a new item to your menu'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Item Name */}
            <div>
              <Label htmlFor="name" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Classic Chicken Shawarma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-zinc-300 text-zinc-900"
              />
            </div>

            {/* Price & Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                  Price (GH₵) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-white border-zinc-300 text-zinc-900"
                />
              </div>

              <div>
                <Label htmlFor="category" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-zinc-900 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your menu item..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white border-zinc-300 text-zinc-900 resize-none"
              />
              <p className="text-xs text-zinc-500 mt-1 font-inter">
                Tell customers what makes this item special
              </p>
            </div>

            {/* Image URL */}
            <div>
              <Label htmlFor="image" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                Image URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="bg-white border-zinc-300 text-zinc-900 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-zinc-300 hover:bg-zinc-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-inter">
                Paste an image URL or upload from your computer
              </p>
              {formData.image && (
                <div className="mt-3 rounded-lg overflow-hidden border border-zinc-200">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between bg-zinc-50 rounded-lg p-4 border border-zinc-200">
              <div>
                <Label className="font-inter text-sm font-semibold text-zinc-700 mb-1 block">
                  Item Availability
                </Label>
                <p className="text-xs text-zinc-600 font-inter">
                  Toggle if this item is currently available for orders
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, available: !formData.available })}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  formData.available ? 'bg-green-500' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    formData.available ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddEditOpen(false)}
              className="border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-inter"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold px-6"
            >
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-white border-zinc-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-poppins text-xl text-zinc-900">
              Remove Menu Item?
            </DialogTitle>
            <DialogDescription className="font-inter text-zinc-600">
              Are you sure you want to remove <strong>{itemToDelete?.name}</strong> from your menu? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
            <p className="font-inter text-sm text-amber-800">
              💡 <strong>Tip:</strong> Consider turning off availability instead if the item is just temporarily unavailable.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setItemToDelete(null);
              }}
              className="border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-inter"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white font-poppins font-semibold"
            >
              Yes, Remove Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}