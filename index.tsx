import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { authenticateAdmin, validateSession, invalidateSession, initializeAdmin } from "./auth.tsx";

const app = new Hono();

// Email sending function using Resend API
async function sendEmail(to: string, subject: string, htmlContent: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("Email sending warning: RESEND_API_KEY not configured. Email will not be sent.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Traffic Shawarma <onboarding@resend.dev>",
        to: [to],
        subject,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("Resend API error:", data);
      return { success: false, error: data.message || "Failed to send email" };
    }

    console.log(`Email sent successfully to ${to}`);
    return { success: true, data };
  } catch (error) {
    console.log("Error sending email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to send email" };
  }
}

// Generate order confirmation email HTML
function generateOrderConfirmationEmail(orderId: string, items: any[], amount: number) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #27272a;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #27272a; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #27272a; text-align: right;">GH₵ ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Traffic Shawarma</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000000;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 32px; margin: 0;">TRAFFIC <span style="color: #f97316;">SHAWARMA</span></h1>
            <p style="color: #a1a1aa; font-size: 16px; margin-top: 10px;">Hot & Loaded Shawarma, Ghana Style</p>
          </div>

          <div style="background-color: #27272a; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="background-color: #dcfce7; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #16a34a; font-size: 40px;">✓</span>
              </div>
              <h2 style="color: #ffffff; font-size: 24px; margin: 0;">Payment Successful!</h2>
              <p style="color: #a1a1aa; margin-top: 10px;">Your order is being prepared</p>
            </div>

            <div style="border-top: 1px solid #3f3f46; padding-top: 20px; margin-top: 20px;">
              <p style="color: #a1a1aa; font-size: 14px; margin: 0;">Order Reference:</p>
              <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 5px 0 0 0;">${orderId}</p>
            </div>
          </div>

          <div style="background-color: #27272a; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <h3 style="color: #ffffff; font-size: 20px; margin: 0 0 20px 0;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #3f3f46;">
                  <th style="padding: 12px; text-align: left; color: #ffffff; font-size: 14px;">Item</th>
                  <th style="padding: 12px; text-align: center; color: #ffffff; font-size: 14px;">Qty</th>
                  <th style="padding: 12px; text-align: right; color: #ffffff; font-size: 14px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 20px 12px 12px; text-align: right; color: #ffffff; font-size: 18px; font-weight: bold;">Total:</td>
                  <td style="padding: 20px 12px 12px; text-align: right; color: #f97316; font-size: 18px; font-weight: bold;">GH₵ ${amount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background-color: #27272a; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 15px 0;">What's Next?</h3>
            <ol style="color: #a1a1aa; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Your order is now being prepared by our team</li>
              <li>We'll notify you when it's ready for pickup/delivery</li>
              <li>You can track your order status via WhatsApp</li>
            </ol>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://wa.me/233241234567" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">Track Order on WhatsApp</a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #27272a;">
            <p style="color: #71717a; font-size: 14px; margin: 5px 0;">📍 Madina Junction, Near Total Filling Station, Accra</p>
            <p style="color: #71717a; font-size: 14px; margin: 5px 0;">📞 +233 24 680 189 | WhatsApp: +233 20 017 216</p>
            <p style="color: #71717a; font-size: 12px; margin-top: 20px;">© 2026 Traffic Shawarma. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-316989a5/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize Paystack payment
app.post("/make-server-316989a5/payments/initialize", async (c) => {
  try {
    const { email, amount, items } = await c.req.json();
    
    if (!email || !amount || !items) {
      console.log("Payment initialization error: Missing required fields");
      return c.json({ error: "Email, amount, and items are required" }, 400);
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      console.log("Payment initialization error: PAYSTACK_SECRET_KEY not configured");
      return c.json({ error: "Payment service not configured" }, 500);
    }

    console.log(`PAYSTACK_SECRET_KEY exists: ${paystackSecretKey ? 'Yes' : 'No'}, Length: ${paystackSecretKey?.length || 0}, Starts with: ${paystackSecretKey?.substring(0, 3) || 'N/A'}`);

    // Initialize payment with Paystack
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert to pesewas (smallest currency unit)
        currency: "GHS",
        metadata: {
          items: JSON.stringify(items),
          custom_fields: [
            {
              display_name: "Order Type",
              variable_name: "order_type",
              value: "Online Order"
            }
          ]
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("Paystack API error during payment initialization:", data);
      return c.json({ error: data.message || "Payment initialization failed" }, response.status);
    }

    // Store order in KV store with error handling
    const orderId = data.data.reference;
    try {
      await kv.set(`order:${orderId}`, {
        orderId,
        email,
        amount,
        items,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      console.log(`Order stored successfully: ${orderId}`);
    } catch (kvError) {
      console.log(`Warning: Failed to store order in database: ${kvError}. Payment will still proceed.`);
      // Don't fail the payment initialization if order storage fails
    }

    console.log(`Payment initialized successfully: ${orderId}`);
    return c.json({ success: true, data: data.data });
  } catch (error) {
    console.log("Error initializing payment:", error);
    return c.json({ error: error instanceof Error ? error.message : "Failed to initialize payment" }, 500);
  }
});

// Verify Paystack payment
app.get("/make-server-316989a5/payments/verify/:reference", async (c) => {
  try {
    const reference = c.req.param("reference");

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      console.log("Payment verification error: PAYSTACK_SECRET_KEY not configured");
      return c.json({ error: "Payment service not configured" }, 500);
    }

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("Paystack API error during payment verification:", data);
      return c.json({ error: data.message || "Payment verification failed" }, response.status);
    }

    // Update order status in KV store
    const order = await kv.get(`order:${reference}`);
    if (order) {
      await kv.set(`order:${reference}`, {
        ...order,
        status: data.data.status,
        verifiedAt: new Date().toISOString(),
      });

      // Send confirmation email if payment was successful
      if (data.data.status === 'success' && order.email) {
        const emailHtml = generateOrderConfirmationEmail(
          reference,
          order.items,
          order.amount
        );
        
        const emailResult = await sendEmail(
          order.email,
          `Order Confirmation - ${reference}`,
          emailHtml
        );

        if (emailResult.success) {
          console.log(`Confirmation email sent to ${order.email} for order ${reference}`);
        } else {
          console.log(`Failed to send confirmation email for order ${reference}: ${emailResult.error}`);
        }
      }
    }

    console.log(`Payment verified successfully: ${reference} - Status: ${data.data.status}`);
    return c.json({ success: true, data: data.data });
  } catch (error) {
    console.log("Error verifying payment:", error);
    return c.json({ error: "Failed to verify payment" }, 500);
  }
});

// Get order by reference
app.get("/make-server-316989a5/orders/:reference", async (c) => {
  try {
    const reference = c.req.param("reference");
    const order = await kv.get(`order:${reference}`);

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({ success: true, order });
  } catch (error) {
    console.log("Error fetching order:", error);
    return c.json({ error: "Failed to fetch order" }, 500);
  }
});

// Admin Login with enhanced security
app.post("/make-server-316989a5/admin/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: "Username and password are required" }, 400);
    }

    // Get client IP for logging
    const ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    
    // Authenticate using secure auth module
    const result = await authenticateAdmin(username, password, ipAddress);
    
    if (!result.success) {
      console.log(`🔒 Admin login failed: ${username} from ${ipAddress} - ${result.error}`);
      
      if (result.lockedUntil) {
        return c.json({ 
          error: result.error,
          lockedUntil: result.lockedUntil 
        }, 429);
      }
      
      return c.json({ 
        error: result.error,
        remainingAttempts: result.remainingAttempts 
      }, 401);
    }

    console.log(`✅ Admin login successful: ${username} from ${ipAddress}`);
    return c.json({ 
      success: true, 
      token: result.token, 
      username 
    });
  } catch (error) {
    console.log("Error during admin login:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Admin logout
app.post("/make-server-316989a5/admin/logout", async (c) => {
  try {
    const token = c.req.header("X-Admin-Token");
    
    if (token) {
      await invalidateSession(token);
      console.log("🔒 Admin logged out successfully");
    }
    
    return c.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error during admin logout:", error);
    return c.json({ error: "Logout failed" }, 500);
  }
});

// Verify admin token middleware with session validation
const verifyAdmin = async (c: any, next: any) => {
  const authHeader = c.req.header("X-Admin-Token");
  
  if (!authHeader) {
    console.log("🔒 Admin verification failed: Missing X-Admin-Token header");
    return c.json({ error: "Unauthorized - Authentication required" }, 401);
  }

  const token = authHeader;
  
  try {
    // Validate session using secure auth module
    const validation = await validateSession(token);
    
    if (!validation.valid) {
      console.log(`🔒 Admin verification failed: ${validation.reason}`);
      return c.json({ error: `Unauthorized - ${validation.reason}` }, 401);
    }
    
    console.log(`✅ Admin verification successful: ${validation.username}`);
    
    // Attach username to context for logging
    c.set('adminUsername', validation.username);
    
    return await next();
  } catch (error) {
    console.log("Error verifying admin token:", error);
    return c.json({ error: "Unauthorized - Token verification failed" }, 401);
  }
};

// Get all orders (admin only)
app.get("/make-server-316989a5/admin/orders", verifyAdmin, async (c) => {
  try {
    console.log("Fetching orders from KV store...");
    const orders = await kv.getByPrefix("order:");
    console.log(`Found ${orders.length} orders in database`);
    
    // Sort by creation date (newest first)
    const sortedOrders = orders.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    console.log(`Admin fetched ${sortedOrders.length} orders`);
    return c.json({ success: true, orders: sortedOrders });
  } catch (error) {
    console.log("Error fetching orders for admin:", error);
    console.log("Error details:", error instanceof Error ? error.message : String(error));
    return c.json({ error: "Failed to fetch orders", details: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// Update order status (admin only)
app.put("/make-server-316989a5/admin/orders/:reference/status", verifyAdmin, async (c) => {
  try {
    const reference = c.req.param("reference");
    const { status } = await c.req.json();

    const validStatuses = ["pending", "accepted", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    const order = await kv.get(`order:${reference}`);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order:${reference}`, updatedOrder);

    console.log(`Admin updated order ${reference} status to ${status}`);
    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log("Error updating order status:", error);
    return c.json({ error: "Failed to update order status" }, 500);
  }
});

// Get all menu items
app.get("/make-server-316989a5/menu", async (c) => {
  try {
    const menuItems = await kv.getByPrefix("menu:");
    console.log(`Fetched ${menuItems.length} menu items`);
    return c.json({ success: true, items: menuItems });
  } catch (error) {
    console.log("Error fetching menu items:", error);
    return c.json({ error: "Failed to fetch menu items" }, 500);
  }
});

// Get all menu items (admin only)
app.get("/make-server-316989a5/admin/menu", verifyAdmin, async (c) => {
  try {
    const menuItems = await kv.getByPrefix("menu:");
    console.log(`📋 GET ADMIN MENU - Found ${menuItems.length} menu items from KV store`);
    
    // Log each item's ID for debugging
    menuItems.forEach((item, index) => {
      console.log(`  📦 Item ${index + 1}: ID="${item.id}", Name="${item.name}"`);
    });
    
    return c.json({ success: true, items: menuItems });
  } catch (error) {
    console.log("Error fetching menu items for admin:", error);
    return c.json({ error: "Failed to fetch menu items" }, 500);
  }
});

// Create menu item (admin only)
app.post("/make-server-316989a5/admin/menu", verifyAdmin, async (c) => {
  try {
    const item = await c.req.json();
    
    if (!item.name || !item.price || !item.category) {
      return c.json({ error: "Name, price, and category are required" }, 400);
    }

    const id = item.id || `menu_${Date.now()}`;
    const newItem = {
      id,
      name: item.name,
      description: item.description || "",
      price: parseFloat(item.price),
      category: item.category,
      image: item.image || "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400",
      available: item.available !== undefined ? item.available : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`menu:${id}`, newItem);
    console.log(`Admin created menu item: ${id} - ${newItem.name}`);
    return c.json({ success: true, item: newItem });
  } catch (error) {
    console.log("Error creating menu item:", error);
    return c.json({ error: "Failed to create menu item" }, 500);
  }
});

// Update menu item (admin only)
app.put("/make-server-316989a5/admin/menu/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();

    const existingItem = await kv.get(`menu:${id}`);
    if (!existingItem) {
      return c.json({ error: "Menu item not found" }, 404);
    }

    const updatedItem = {
      ...existingItem,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`menu:${id}`, updatedItem);
    console.log(`Admin updated menu item: ${id} - ${updatedItem.name}`);
    return c.json({ success: true, item: updatedItem });
  } catch (error) {
    console.log("Error updating menu item:", error);
    return c.json({ error: "Failed to update menu item" }, 500);
  }
});

// Delete menu item (admin only)
app.delete("/make-server-316989a5/admin/menu/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    
    console.log(`Attempting to delete menu item with id: ${id}`);
    console.log(`Looking for key: menu:${id}`);

    const existingItem = await kv.get(`menu:${id}`);
    console.log(`Found item:`, existingItem);
    
    if (!existingItem) {
      console.log(`Menu item not found with key: menu:${id}`);
      return c.json({ error: "Menu item not found" }, 404);
    }

    await kv.del(`menu:${id}`);
    console.log(`Admin deleted menu item: ${id}`);
    return c.json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    console.log("Error deleting menu item:", error);
    return c.json({ error: "Failed to delete menu item" }, 500);
  }
});

// Get settings
app.get("/make-server-316989a5/settings", async (c) => {
  try {
    const settings = await kv.get("settings:general");
    
    // Default settings if none exist
    const defaultSettings = {
      restaurantName: "TRAFFIC SHAWARMA",
      whatsappNumber: "+233200172160",
      phone: "+233246801890",
      address: "Madina Junction, Near Total Filling Station, Accra",
      openingHours: "Mon-Sat: 10:00 AM - 10:00 PM, Sun: 12:00 PM - 9:00 PM",
      deliveryFee: 10,
      isOpen: true,
      socialMedia: {
        instagram: "",
        facebook: "",
        twitter: ""
      }
    };

    return c.json({ success: true, settings: settings || defaultSettings });
  } catch (error) {
    console.log("Error fetching settings:", error);
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

// Update settings (admin only)
app.put("/make-server-316989a5/admin/settings", verifyAdmin, async (c) => {
  try {
    const settings = await c.req.json();
    
    await kv.set("settings:general", {
      ...settings,
      updatedAt: new Date().toISOString(),
    });

    console.log("Admin updated settings");
    return c.json({ success: true, settings });
  } catch (error) {
    console.log("Error updating settings:", error);
    return c.json({ error: "Failed to update settings" }, 500);
  }
});

// Initialize admin credentials on server startup
console.log("🔐 Initializing admin authentication system...");
await initializeAdmin();
console.log("✅ Admin authentication system ready");

Deno.serve(app.fetch);