import { menuApi } from './api';

// Seed the database with initial menu items
export async function seedMenuItems() {
  const initialMenuItems = [
    {
      name: 'Classic Chicken Shawarma',
      description: 'Succulent grilled chicken wrapped in fresh pita with crispy veggies and our signature sauce',
      price: 25.00,
      category: 'chicken',
      image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
      available: true,
    },
    {
      name: 'Spicy Beef Shawarma',
      description: 'Tender marinated beef with fresh tomatoes, lettuce, and homemade garlic sauce',
      price: 30.00,
      category: 'beef',
      image: 'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=400',
      available: true,
    },
    {
      name: 'Supreme Special Shawarma',
      description: 'Premium combo of chicken & beef with extra toppings, cheese, and spicy sauce',
      price: 40.00,
      category: 'special',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      available: true,
    },
    {
      name: 'Loaded Chicken Shawarma',
      description: 'Extra chicken with double cheese, jalapeños, and premium sauces',
      price: 35.00,
      category: 'chicken',
      image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
      available: true,
    },
    {
      name: 'Deluxe Beef Shawarma',
      description: 'Premium beef cuts with caramelized onions, pepper jack cheese, and special spicy mayo',
      price: 38.00,
      category: 'beef',
      image: 'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=400',
      available: true,
    },
    {
      name: 'Veggie Supreme Shawarma',
      description: 'Fresh vegetables, hummus, falafel, and tahini sauce in warm pita',
      price: 22.00,
      category: 'special',
      image: 'https://images.unsplash.com/photo-1505253304499-671c55fb57fe?w=400',
      available: true,
    },
    {
      name: 'Traffic Friday Special',
      description: 'Buy 3 Shawarmas, Get 1 FREE! Limited time offer',
      price: 100.00,
      category: 'combo',
      image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
      available: true,
    },
    {
      name: 'Mega Combo',
      description: 'Any 2 shawarmas + 2 drinks + fries',
      price: 75.00,
      category: 'combo',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      available: true,
    },
    {
      name: 'Family Pack',
      description: '5 shawarmas of your choice + 4 drinks + 2 large fries',
      price: 150.00,
      category: 'combo',
      image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
      available: true,
    },
    {
      name: 'Extra Cheese',
      description: 'Add melted cheese to any shawarma',
      price: 3.00,
      category: 'extras',
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
      available: true,
    },
    {
      name: 'Extra Meat',
      description: 'Double your protein',
      price: 8.00,
      category: 'extras',
      image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
      available: true,
    },
    {
      name: 'Fries',
      description: 'Crispy golden fries',
      price: 10.00,
      category: 'extras',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
      available: true,
    },
    {
      name: 'Soft Drink',
      description: 'Coca-Cola, Sprite, or Fanta',
      price: 5.00,
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400',
      available: true,
    },
    {
      name: 'Fresh Juice',
      description: 'Orange or Pineapple',
      price: 8.00,
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
      available: true,
    },
  ];

  const results = await Promise.allSettled(
    initialMenuItems.map(item => menuApi.create(item))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { successful, failed, total: initialMenuItems.length };
}
