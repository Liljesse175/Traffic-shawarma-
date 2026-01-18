# ✅ Deployment Checklist

Use this checklist to ensure smooth deployment of Traffic Shawarma.

---

## 📋 Pre-Deployment

- [ ] All code is tested locally
- [ ] Admin panel works (login, menu CRUD, analytics)
- [ ] Customer features work (menu, cart, favorites, tracking)
- [ ] WhatsApp integration tested
- [ ] Mobile responsiveness verified
- [ ] No console errors in browser
- [ ] All images load correctly

---

## 🔑 Credentials & Keys

- [ ] Supabase project URL copied
- [ ] Supabase Anon Key copied
- [ ] Admin password changed from default
- [ ] WhatsApp number verified (+233 20 017 216)
- [ ] Restaurant contact info updated in settings

---

## 🚀 Deploy to Vercel (Easiest)

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Run `npm install` in project
- [ ] Run `vercel` command
- [ ] Add environment variables in Vercel dashboard:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Run `vercel --prod` to redeploy with env vars
- [ ] Test live site thoroughly
- [ ] (Optional) Add custom domain

**Your live URL:** `https://traffic-shawarma.vercel.app`

---

## 🎯 Alternative: Deploy to Netlify

- [ ] Run `npm run build` locally
- [ ] Go to [netlify.com/drop](https://app.netlify.com/drop)
- [ ] Drag `dist` folder to page
- [ ] Add environment variables in Netlify:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Trigger redeploy from Netlify dashboard
- [ ] Test live site
- [ ] (Optional) Add custom domain

**Your live URL:** `https://your-site.netlify.app`

---

## ✅ Post-Deployment Testing

### **Customer Features**
- [ ] Homepage loads and looks correct
- [ ] Menu items display with images
- [ ] Can add items to cart
- [ ] Cart shows correct totals
- [ ] WhatsApp button works and opens correctly
- [ ] Order tracking accepts order IDs
- [ ] Favorites can be added/removed
- [ ] Mobile view works perfectly
- [ ] Tablet/desktop views are responsive

### **Admin Panel**
- [ ] Navigate to `/#/admin`
- [ ] Login works with: `admin` / `traffic_hills`
- [ ] Analytics dashboard loads
- [ ] Menu management shows all items
- [ ] Can create new menu item
- [ ] Can edit existing menu item
- [ ] Can delete menu item
- [ ] Search and filters work
- [ ] Settings panel loads
- [ ] Can update restaurant settings
- [ ] Logout works properly

### **Security**
- [ ] Old tokens are cleared (refresh admin page)
- [ ] Failed logins show attempt counter
- [ ] Account locks after 5 failed attempts
- [ ] Session expires after inactivity
- [ ] Admin password is NOT default

---

## 🌐 Custom Domain (Optional)

### **For Vercel:**
- [ ] Go to Vercel project → Settings → Domains
- [ ] Add your domain (e.g., `trafficshawarma.com`)
- [ ] Update DNS records:
  - [ ] Add A record or CNAME as instructed
  - [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Verify SSL certificate is active
- [ ] Test both www and non-www versions

### **For Netlify:**
- [ ] Go to Site Settings → Domain Management
- [ ] Add custom domain
- [ ] Follow DNS configuration steps
- [ ] Enable HTTPS (automatic)
- [ ] Test domain

---

## 📱 Marketing & Sharing

- [ ] Create QR code for restaurant URL
- [ ] Print QR codes for tables/counter
- [ ] Update Instagram bio with link
- [ ] Update Facebook page with link
- [ ] Update Google Business profile
- [ ] Share on WhatsApp Status
- [ ] Create social media posts announcing online ordering

---

## 🔧 Troubleshooting

If something doesn't work:

1. **Check Browser Console**
   - [ ] Open DevTools (F12)
   - [ ] Look for red errors
   - [ ] Screenshot and note error messages

2. **Check Supabase**
   - [ ] Go to Supabase dashboard
   - [ ] Check Edge Functions logs
   - [ ] Verify database is accessible

3. **Check Environment Variables**
   - [ ] Verify they're set in hosting platform
   - [ ] Values are correct (no extra spaces)
   - [ ] Redeploy after adding variables

4. **Clear Cache**
   - [ ] Clear browser cache
   - [ ] Clear localStorage
   - [ ] Try incognito/private mode

---

## 📊 Monitoring

After deployment, regularly check:

- [ ] Analytics for traffic and orders
- [ ] Admin panel for new orders (if using database orders)
- [ ] WhatsApp for customer orders
- [ ] Supabase usage (free tier limits)
- [ ] Website speed (Google PageSpeed Insights)
- [ ] Mobile responsiveness on real devices

---

## 🎉 Launch Announcement Template

**Social Media Post:**

```
🎉 BIG NEWS! 🎉

You can now order your favorite Traffic Shawarma ONLINE! 🌯🔥

🌐 Visit: [YOUR-SITE-URL]
📱 Browse our full menu
🛒 Select your favorites
💬 Order via WhatsApp instantly

📍 Madina Junction, Accra
📞 024 680 189
⏰ Mon-Sat: 10AM - 10PM

#TrafficShawarma #AccraFood #GhanaEats #OnlineOrdering #Shawarma #StreetFood
```

---

## 🔄 Regular Maintenance

Weekly:
- [ ] Check admin panel for any issues
- [ ] Update menu items/prices if needed
- [ ] Review analytics

Monthly:
- [ ] Backup Supabase database
- [ ] Review and update settings
- [ ] Check for any npm package updates
- [ ] Monitor site performance

---

## 🆘 Emergency Contacts

**Hosting Issues:**
- Vercel Status: https://vercel-status.com
- Netlify Status: https://netlifystatus.com

**Backend Issues:**
- Supabase Status: https://status.supabase.com
- Supabase Support: https://supabase.com/support

**Domain Issues:**
- Contact your domain registrar support

---

**✅ Deployment Complete!**

Your Traffic Shawarma website is now live and accessible to anyone in the world! 🎉

Share the URL:
- 📱 On social media
- 💬 Via WhatsApp
- 🖨️ Print on receipts/menus
- 📋 Add to business cards

**Congratulations on going digital! 🌯🔥**
