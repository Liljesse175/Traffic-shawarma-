# 🚀 Traffic Shawarma - Deployment Guide

This guide will help you deploy your Traffic Shawarma website so anyone can access it without the Figma subdomain.

## 📦 What You're Deploying

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase Edge Functions (already deployed on Supabase)
- **Database**: Supabase PostgreSQL (already configured)
- **Features**: Menu management, admin dashboard, WhatsApp ordering, order tracking

---

## ✅ Prerequisites

Before deploying, make sure you have:

1. ✅ Supabase project is set up (already done)
2. ✅ All code files from Figma Make
3. ✅ Node.js installed (v18 or higher)
4. ✅ Your Supabase URL and Anon Key

---

## 🎯 Quick Deploy Options

### **Option 1: Vercel (Recommended - 5 minutes)**

Perfect for React apps, free hosting, automatic HTTPS.

#### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

#### **Step 2: Navigate to Your Project**
```bash
cd traffic-shawarma
npm install
```

#### **Step 3: Deploy**
```bash
vercel
```

Follow the prompts:
- Link to existing project? **No**
- What's your project name? **traffic-shawarma**
- Which directory is your code located? **./  (just press Enter)**
- Want to override settings? **No**

#### **Step 4: Add Environment Variables**
Go to [vercel.com](https://vercel.com) → Your Project → Settings → Environment Variables

Add these variables:
- `VITE_SUPABASE_URL` = Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key

#### **Step 5: Redeploy**
```bash
vercel --prod
```

**Your site is now live at**: `https://traffic-shawarma.vercel.app` 🎉

#### **Optional: Add Custom Domain**
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `trafficshawarma.com`)
3. Follow DNS configuration instructions

---

### **Option 2: Netlify (Alternative - 5 minutes)**

Great for static sites, also free with HTTPS.

#### **Method A: Drag & Drop (Easiest)**

1. **Build locally**:
   ```bash
   npm install
   npm run build
   ```

2. **Go to** [app.netlify.com/drop](https://app.netlify.com/drop)

3. **Drag the `dist` folder** to the page

4. **Add Environment Variables**:
   - Site Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

5. **Trigger Redeploy** with new environment variables

**Your site is live!** 🎉

#### **Method B: Netlify CLI**

```bash
# Install CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod
```

---

### **Option 3: GitHub Pages (Free)**

Host directly from a GitHub repository.

#### **Step 1: Update vite.config.ts**

Add base URL for GitHub Pages:
```typescript
export default defineConfig({
  base: '/traffic-shawarma/', // Replace with your repo name
  // ... rest of config
})
```

#### **Step 2: Add Deploy Script**

Add to `package.json`:
```json
"scripts": {
  "build": "vite build",
  "deploy": "npm run build && gh-pages -d dist"
}
```

#### **Step 3: Install gh-pages**
```bash
npm install --save-dev gh-pages
```

#### **Step 4: Deploy**
```bash
npm run deploy
```

**Your site**: `https://yourusername.github.io/traffic-shawarma/`

---

### **Option 4: Custom Domain + Any Host**

For full control with your own hosting.

#### **Step 1: Build the App**
```bash
npm install
npm run build
```

This creates a `dist` folder with all static files.

#### **Step 2: Upload to Your Host**

Upload the contents of the `dist` folder to:
- **cPanel**: Public HTML folder
- **Hostinger**: public_html folder
- **DigitalOcean**: /var/www/html
- **AWS S3**: Create bucket + enable static hosting

#### **Step 3: Configure Server**

Add this to `.htaccess` (Apache) or nginx config:
```apache
# Apache (.htaccess)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🔐 Environment Variables

Your app needs these Supabase credentials:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Where to Find These:**

1. Go to [supabase.com](https://supabase.com)
2. Open your Traffic Shawarma project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### **How to Set Them:**

**Vercel:**
- Dashboard → Settings → Environment Variables

**Netlify:**
- Site Settings → Environment Variables

**Local Development:**
- Create `.env` file (copy from `.env.example`)
- Add your keys

---

## 🧪 Test Before Deploying

```bash
# Install dependencies
npm install

# Test build locally
npm run build

# Preview production build
npx vite preview
```

Visit `http://localhost:4173` to test the production build.

---

## ✅ Post-Deployment Checklist

After deploying, verify:

- [ ] Homepage loads correctly
- [ ] Menu items display
- [ ] Shopping cart works
- [ ] WhatsApp order button works
- [ ] Order tracking works
- [ ] Admin panel accessible at `/admin`
- [ ] Admin login works with `admin` / `traffic_hills`
- [ ] Menu management (CRUD operations) works
- [ ] Settings panel saves correctly
- [ ] Mobile responsive design works

---

## 🔧 Troubleshooting

### **Issue: Blank page after deployment**
- Check browser console for errors
- Verify environment variables are set
- Make sure `index.html` is in the root of dist folder

### **Issue: Admin panel shows "Session not found"**
- Clear browser localStorage
- Login again with new credentials
- Check if Supabase Edge Functions are running

### **Issue: Menu items don't load**
- Verify Supabase URL and key are correct
- Check Supabase Edge Function logs
- Test API endpoint manually

### **Issue: 404 on page refresh**
- Add rewrite rules (see hosting-specific guides above)
- Check `vercel.json` or `netlify.toml` is included

---

## 📱 Share Your Site

Once deployed, share your Traffic Shawarma site:

- **Short URL**: Use bit.ly or your custom domain
- **QR Code**: Generate one for the URL (perfect for restaurant)
- **Social Media**: Share on Instagram, Facebook
- **WhatsApp Business**: Add to your profile

---

## 🎉 You're Live!

Your Traffic Shawarma website is now accessible to anyone worldwide! 

**Admin Credentials:**
- Username: `admin`
- Password: `traffic_hills`

**Features Available:**
- ✅ Online menu with live updates
- ✅ WhatsApp ordering integration
- ✅ Order tracking by ID
- ✅ Customer favorites system
- ✅ Full admin dashboard
- ✅ Real-time menu management
- ✅ Analytics & insights
- ✅ Restaurant settings

---

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Review Supabase Edge Function logs
3. Verify all environment variables are set
4. Test the Supabase connection directly

---

**Built with ❤️ for Traffic Shawarma**
Ghana's Best Shawarma Experience 🌯🔥
