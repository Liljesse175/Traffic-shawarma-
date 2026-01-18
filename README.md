# 🌯 Traffic Shawarma - Modern Restaurant Web App

A full-stack, mobile-first one-page website for Traffic Shawarma, Ghana's premier street-food shawarma spot. Built with React, TypeScript, Tailwind CSS, and Supabase.

![Traffic Shawarma](https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=1200&h=400&fit=crop)

---

## ✨ Features

### **Customer Features**
- 🍖 **Interactive Menu** - Browse chicken, beef, special, and combo shawarmas
- 🛒 **Shopping Cart** - Add items, adjust quantities, view totals
- 💬 **WhatsApp Ordering** - One-click order to WhatsApp (+233 20 017 216)
- 🔍 **Order Tracking** - Track orders in real-time by order ID
- ⭐ **Favorites System** - Save favorite items (localStorage)
- 📱 **Mobile-First Design** - Optimized for mobile with responsive desktop view
- 🎨 **Dark Theme** - Street-food vibe with black background and orange accents

### **Admin Features**
- 🔐 **Secure Login** - SHA-256 password hashing, rate limiting, session management
- 📊 **Analytics Dashboard** - Revenue, orders, popular items, charts
- 🍽️ **Menu Management** - Full CRUD operations for menu items
- 🔍 **Quick Search** - Search by name and filter by category
- ⚙️ **Settings Panel** - Configure restaurant info, hours, contact details
- 📈 **Performance Optimized** - Lazy loading, caching, debounced search

### **Security Features**
- 🔒 **Password Hashing** - SHA-256 encryption
- 🚫 **Rate Limiting** - 5 attempts per 5 minutes
- ⏱️ **Session Management** - 24-hour sessions with 2-hour inactivity timeout
- 🔐 **Account Lockout** - 15-minute lockout after max failed attempts
- 📝 **Audit Trail** - IP logging and security event tracking

---

## 🏗️ Tech Stack

**Frontend:**
- ⚛️ React 18 + TypeScript
- 🎨 Tailwind CSS v4
- 🔥 Vite (build tool)
- 📦 Shadcn/ui components
- 🎭 Lucide React icons
- 📊 Recharts (analytics)
- 🔔 Sonner (notifications)

**Backend:**
- 🚀 Supabase Edge Functions (Deno + Hono)
- 🗄️ Supabase PostgreSQL
- 🔑 Key-Value store for data
- 🔐 Secure authentication system

**Performance:**
- ⚡ Lazy loading for admin panel
- 💾 5-minute menu caching
- 🔄 Debounced search
- 🎯 Memoized components
- 📱 Mobile-optimized

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm or pnpm
- Supabase account

### **Installation**

```bash
# Clone the repository
git clone <your-repo-url>
cd traffic-shawarma

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Supabase credentials to .env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Start development server
npm run dev
```

Visit `http://localhost:5173`

---

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Vercel:**
```bash
npm install -g vercel
vercel
```

**Quick Deploy to Netlify:**
```bash
npm run build
# Drag dist folder to netlify.com/drop
```

---

## 🔑 Admin Access

Access the admin panel at `/#/admin`

**Default Credentials:**
- Username: `admin`
- Password: `traffic_hills`

**Change password** after first login for security!

---

## 📁 Project Structure

```
traffic-shawarma/
├── src/
│   ├── app/
│   │   ├── components/          # React components
│   │   │   ├── ui/              # Shadcn/ui components
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── MenuCard.tsx
│   │   │   ├── CartSheet.tsx
│   │   │   └── ...
│   │   ├── Admin.tsx            # Admin panel (lazy loaded)
│   │   └── App.tsx              # Main app component
│   ├── hooks/                   # Custom React hooks
│   │   ├── useOptimizedMenu.ts
│   │   ├── useFavorites.ts
│   │   └── useDebounce.ts
│   ├── utils/
│   │   └── api.ts               # API utilities
│   ├── imports/                 # Figma imported assets
│   ├── styles/
│   │   ├── theme.css            # Tailwind theme
│   │   ├── fonts.css            # Font imports
│   │   └── globals.css          # Global styles
│   └── main.tsx                 # App entry point
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx        # Main server file
│           ├── auth.tsx         # Authentication module
│           └── kv_store.tsx     # Database utilities
├── public/                      # Static assets
├── vite.config.ts               # Vite configuration
├── vercel.json                  # Vercel config
├── netlify.toml                 # Netlify config
└── package.json
```

---

## 🎯 Key Features Explained

### **WhatsApp Integration**
Orders are sent directly to WhatsApp (+233 20 017 216) with formatted messages:

```
🌯 NEW ORDER FROM TRAFFIC SHAWARMA

📋 Order Details:
• Classic Chicken Shawarma x2 (GH₵ 50.00)
• Spicy Beef Shawarma x1 (GH₵ 30.00)

💰 Total: GH₵ 80.00
📱 Order ID: TS-20260118-1234
```

### **Order Tracking**
Customers can track orders by entering their order ID on the homepage.

### **Favorites System**
Items marked as favorites are saved in localStorage for quick reordering.

### **Menu Caching**
Menu items are cached for 5 minutes to reduce API calls and improve performance.

### **Admin Security**
- Sessions expire after 24 hours or 2 hours of inactivity
- Failed login attempts trigger progressive security measures
- All admin actions are logged with timestamps and IP addresses

---

## 🔧 Configuration

### **Restaurant Settings** (via Admin Panel)
- Restaurant name
- WhatsApp number
- Phone number
- Address
- Opening hours
- Delivery fee
- Open/Closed status
- Social media links

### **Menu Categories**
- Chicken
- Beef
- Special
- Combo

---

## 📊 Analytics

The admin dashboard provides:
- **Total revenue** (all-time and by period)
- **Total orders** with trend indicators
- **Average order value**
- **Popular items** ranking
- **Revenue chart** (daily/weekly/monthly)
- **Category distribution** pie chart

---

## 🔐 Security Best Practices

1. **Change default admin password** immediately
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production (automatic on Vercel/Netlify)
4. **Regular backups** of Supabase database
5. **Monitor admin logs** for suspicious activity

---

## 📱 Mobile Optimization

- Single column layout on mobile
- Touch-friendly buttons and controls
- Optimized images with lazy loading
- Hamburger menu for admin panel
- Responsive typography
- Fast loading times

---

## 🎨 Design System

**Colors:**
- Background: Black (#000000)
- Accent: Orange (#f97316)
- Text: White/Zinc shades
- Cards: Zinc-900

**Fonts:**
- Headings: Poppins (Bold)
- Body: Inter (Regular)

**Components:**
- Built with Shadcn/ui
- Radix UI primitives
- Tailwind CSS utility classes

---

## 🤝 Contributing

This is a custom project for Traffic Shawarma. For modifications:

1. Create a feature branch
2. Make your changes
3. Test thoroughly (especially admin features)
4. Deploy to staging first
5. Then deploy to production

---

## 📄 License

Proprietary - Traffic Shawarma © 2026

---

## 📞 Support

**Restaurant Contact:**
- 📍 Madina Junction, Near Total Filling Station, Accra
- 📞 +233 24 680 189
- 💬 WhatsApp: +233 20 017 216

**Technical Issues:**
- Check browser console for errors
- Review Supabase Edge Function logs
- Verify environment variables are set correctly

---

## 🎉 Acknowledgments

Built with Figma Make - a powerful web application builder powered by React and Tailwind CSS.

**Special thanks to:**
- Figma team for the development platform
- Supabase for backend infrastructure
- Shadcn for UI components
- All the open-source libraries used

---

**Enjoy hot & loaded shawarma, Ghana style! 🌯🔥**
