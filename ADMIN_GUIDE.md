# Traffic Shawarma - Admin Dashboard Guide

## 🔐 Accessing the Admin Dashboard

Navigate to: `your-app-url/#/admin`

### Default Login Credentials
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change these credentials in production!

---

## 📊 Dashboard Features

### 1. **Statistics Overview**
View real-time metrics:
- Total Orders
- Pending Orders
- Accepted Orders
- Completed Orders
- Total Revenue (GH₵)

### 2. **Orders Management Table**
Each order displays:
- **Order ID** - Unique reference number
- **Customer** - Customer email address
- **Items** - List of ordered items with quantities
- **Total** - Order total in GH₵
- **Status** - Current order status badge
- **Date** - Order creation date and time
- **Actions** - Status update dropdown

### 3. **Order Status Management**
Update order status via dropdown:
- **Pending** - Waiting for confirmation
- **Accepted** - Order accepted and being prepared
- **Completed** - Order fulfilled
- **Cancelled** - Order cancelled

### 4. **Auto-Refresh**
- Dashboard automatically refreshes every 30 seconds
- Manual refresh button available in the header

---

## 🛠️ Backend Implementation

### Database Structure
Orders are stored in the key-value store with keys: `order:{reference}`

```javascript
{
  orderId: "ref_xxxxx",
  email: "customer@email.com",
  amount: 75.00,
  items: [
    { id: "1", name: "Classic Chicken Shawarma", price: 25.00, quantity: 2 },
    { id: "extra1", name: "Extra Cheese", price: 3.00, quantity: 1 }
  ],
  status: "pending",
  createdAt: "2026-01-16T10:30:00.000Z",
  updatedAt: "2026-01-16T10:35:00.000Z"
}
```

### API Endpoints

#### Admin Login
```
POST /make-server-316989a5/admin/login
Body: { username, password }
Returns: { success: true, token, username }
```

#### Get All Orders (Protected)
```
GET /make-server-316989a5/admin/orders
Headers: { Authorization: "Bearer {token}" }
Returns: { success: true, orders: [...] }
```

#### Update Order Status (Protected)
```
PUT /make-server-316989a5/admin/orders/:reference/status
Headers: { Authorization: "Bearer {token}" }
Body: { status: "accepted" | "pending" | "completed" | "cancelled" }
Returns: { success: true, order: {...} }
```

---

## 🔒 Security Notes

1. **Authentication Token**
   - Token stored in localStorage
   - Remains active until logout
   - Simple base64 encoding (upgrade to JWT for production)

2. **Production Recommendations**
   - Use environment variables for admin credentials
   - Implement proper password hashing (bcrypt, argon2)
   - Use JWT tokens with expiration
   - Add rate limiting
   - Enable HTTPS only

3. **Changing Admin Credentials**
   - Update credentials in the database via Supabase interface
   - Key: `admin:credentials`
   - Value: `{ username: "newuser", password: "newpass" }`

---

## 📱 Customer Order Flow

1. Customer adds items to cart
2. Customer proceeds to checkout
3. Customer enters email
4. Payment initialized via Paystack
5. Order stored with `status: "pending"`
6. After successful payment, status updated to `"success"`
7. Admin can then change status to:
   - `"accepted"` when starting preparation
   - `"completed"` when ready for pickup/delivery
   - `"cancelled"` if needed

---

## 🎨 UI Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Stats** - Dashboard shows live order statistics
- **Color-coded Status** - Visual status indicators
  - Yellow: Pending
  - Blue: Accepted
  - Green: Completed/Success
  - Red: Cancelled
- **Auto-refresh** - Dashboard updates automatically
- **Session Persistence** - Login state persists across page refreshes

---

## 🚀 Quick Start

1. Visit `/#/admin`
2. Login with default credentials
3. View all orders in the table
4. Update order status as needed
5. Monitor stats and revenue
6. Logout when done

---

## 💡 Tips

- Use the Refresh button to manually update order list
- Filter orders by reviewing the status column
- Track total revenue in the orange stats card
- Orders are sorted newest first
- Check the timestamps for order timing

---

## 🐛 Troubleshooting

**Can't login?**
- Verify credentials (admin/admin123)
- Check browser console for errors
- Ensure backend server is running

**Orders not showing?**
- Click refresh button
- Check if any orders exist in the database
- Verify you're logged in

**Status won't update?**
- Check internet connection
- Verify you're still logged in
- Check browser console for errors

---

For support, contact the development team.
