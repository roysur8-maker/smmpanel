import express from "express";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import axios from "axios";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-smm";
const DB_FILE = './smm-db.json';

interface Database {
  users: any[];
  settings: Record<string, string>;
  provider_services: any[];
  orders: any[];
  fund_requests: any[];
}

let db: Database = {
  users: [],
  settings: {},
  provider_services: [],
  orders: [],
  fund_requests: []
};

async function initDB() {
  if (existsSync(DB_FILE)) {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    db = JSON.parse(data);
    if (!db.settings['upi_id']) {
      db.settings['upi_id'] = 'surya.roy@ptyes';
      db.settings['qr_url'] = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=surya.roy@ptyes%26pn=SMM_Panel';
      db.settings['payment_instructions'] = 'Scan the QR code to pay via UPI (surya.roy@ptyes), then enter your UTR number below.';
      await saveDB();
    }
  } else {
    // Initial settings
    db.settings['commission_percent'] = '10';
    db.settings['payment_instructions'] = 'Scan QR and pay, then enter UTR below.';
    db.settings['qr_url'] = '';
    await saveDB();
  }

  // Create admin if not exists
  const adminEmail = 'roybina019@gmail.com';
  let admin = db.users.find(u => u.email === adminEmail);
  if (!admin) {
    const hashed = await bcrypt.hash('royj27238', 10);
    const apiKey = crypto.randomUUID();
    db.users.push({
      id: 1,
      email: adminEmail,
      password: hashed,
      role: 'admin',
      balance: 0.0,
      api_key: apiKey,
      blocked: false
    });
    await saveDB();
  }
}

async function saveDB() {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

let nextId = {
  users: () => db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
  services: () => db.provider_services.length ? Math.max(...db.provider_services.map(s => s.id)) + 1 : 1,
  orders: () => db.orders.length ? Math.max(...db.orders.map(o => o.id)) + 1 : 1,
  funds: () => db.fund_requests.length ? Math.max(...db.fund_requests.map(f => f.id)) + 1 : 1,
};

async function startServer() {
  await initDB();
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Middlewares
  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = db.users.find(u => u.id === decoded.id);
      if (!user) return res.status(401).json({ error: 'User not found' });
      if (user.blocked) return res.status(403).json({ error: 'Account is blocked' });
      //@ts-ignore
      req.user = { id: user.id, email: user.email, role: user.role, balance: user.balance, api_key: user.api_key, blocked: user.blocked };
      next();
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const adminMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    //@ts-ignore
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const apiKey = crypto.randomBytes(16).toString('hex');
    const id = nextId.users();
    
    const newUser = { id, email, password: hashed, role: 'user', balance: 0.0, api_key: apiKey, blocked: false };
    db.users.push(newUser);
    await saveDB();

    const token = jwt.sign({ id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, email, role: 'user', balance: 0, api_key: apiKey, blocked: false } });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userNoPass } = user;
    res.json({ token, user: userNoPass });
  });

  // Public Settings
  app.get('/api/settings', async (req, res) => {
    res.json({ 
       payment_instructions: db.settings['payment_instructions'] || '',
       qr_url: db.settings['qr_url'] || ''
    });
  });

  // User Routes
  app.get('/api/user/me', authMiddleware, (req, res) => {
    //@ts-ignore
    res.json(req.user);
  });

  // Fund Requests
  app.post('/api/user/funds', authMiddleware, async (req, res) => {
    const { amount, utr } = req.body;
    //@ts-ignore
    if (!amount || !utr) return res.status(400).json({ error: 'Missing required fields' });
    
    if (db.fund_requests.find(f => f.utr === utr)) {
      return res.status(400).json({ error: 'UTR already exists' });
    }

    const newFund = {
      id: nextId.funds(),
      //@ts-ignore
      user_id: req.user.id,
      amount: parseFloat(amount),
      utr,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.fund_requests.push(newFund);
    await saveDB();

    res.json({ success: true, message: 'Fund request submitted successfully' });
  });

  app.get('/api/user/funds', authMiddleware, async (req, res) => {
    //@ts-ignore
    const funds = db.fund_requests.filter(f => f.user_id === req.user.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(funds);
  });

  // Services
  app.get('/api/services', async (req, res) => {
    res.json(db.provider_services);
  });

  // Orders
  app.get('/api/user/orders', authMiddleware, async (req, res) => {
    //@ts-ignore
    let userOrders = db.orders.filter(o => o.user_id === req.user.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // attach service name
    userOrders = userOrders.map(o => {
       const s = db.provider_services.find(s => s.id === parseInt(o.service_id));
       return { ...o, service_name: s ? s.name : 'Unknown Service' };
    });
    
    res.json(userOrders);
  });

  app.post('/api/user/orders', authMiddleware, async (req, res) => {
    const { service_id, link, quantity } = req.body;
    //@ts-ignore
    const reqUser = req.user;
    const user = db.users.find(u => u.id === reqUser.id);
    if(!user) return res.status(400).json({error: 'User not found'});
    
    const service = db.provider_services.find(s => s.id.toString() === service_id.toString());
    if (!service) return res.status(404).json({ error: 'Service not found' });
    
    const qNum = parseInt(quantity);
    if (qNum < service.min || qNum > service.max) {
       return res.status(400).json({ error: `Quantity must be between ${service.min} and ${service.max}` });
    }

    const charge = (service.rate / 1000) * qNum;
    if (user.balance < charge) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct balance
    user.balance -= charge;
    // update session reqUser
    reqUser.balance = user.balance;
    
    let status = 'pending';
    let providerOrderId = null;
    const providerUrl = db.settings['provider_url'];
    const providerKey = db.settings['provider_key'];

    if (providerUrl && providerKey) {
      try {
        const params = new URLSearchParams({
          key: providerKey,
          action: 'add',
          service: service.service_id,
          link: link,
          quantity: qNum.toString()
        });
        const apiRes = await axios.post(providerUrl, params.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});
        if (apiRes.data.order) {
           providerOrderId = apiRes.data.order;
           status = 'processing';
        }
      } catch (e) {
        console.error("Provider API Error:", e);
      }
    }

    const orderId = nextId.orders();
    db.orders.push({
      id: orderId,
      user_id: user.id,
      service_id,
      link,
      quantity: qNum,
      charge,
      status,
      provider_order_id: providerOrderId,
      created_at: new Date().toISOString()
    });
    await saveDB();

    res.json({ success: true, message: 'Order placed', order_id: orderId });
  });

  // Admin Routes
  app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    res.json(db.users.map(u => ({ id: u.id, email: u.email, role: u.role, balance: u.balance, api_key: u.api_key, blocked: u.blocked })));
  });

  app.post('/api/admin/users/:id/balance', authMiddleware, adminMiddleware, async (req, res) => {
    const { amount } = req.body;
    const user = db.users.find(u => u.id.toString() === req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    user.balance += parseFloat(amount);
    await saveDB();
    res.json({ success: true, balance: user.balance });
  });

  app.post('/api/admin/users/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    const { blocked } = req.body;
    const user = db.users.find(u => u.id.toString() === req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    user.blocked = blocked;
    await saveDB();
    res.json({ success: true, blocked: user.blocked });
  });

  app.get('/api/admin/services', authMiddleware, adminMiddleware, async (req, res) => {
    res.json(db.provider_services);
  });

  app.get('/api/admin/funds', authMiddleware, adminMiddleware, async (req, res) => {
    let funds = [...db.fund_requests].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    funds = funds.map(f => {
       const u = db.users.find(u => u.id === f.user_id);
       return { ...f, email: u ? u.email : 'Unknown' };
    });
    res.json(funds);
  });

  app.post('/api/admin/funds/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    
    const fund = db.fund_requests.find(f => f.id.toString() === id.toString());
    if (!fund) return res.status(404).json({ error: 'Not found' });
    if (fund.status !== 'pending') return res.status(400).json({ error: 'Already processed' });

    fund.status = status;
    
    if (status === 'accepted') {
      const u = db.users.find(u => u.id === fund.user_id);
      if (u) {
         u.balance += fund.amount;
      }
    }
    await saveDB();
    res.json({ success: true });
  });

  app.get('/api/admin/settings', authMiddleware, adminMiddleware, async (req, res) => {
    res.json(db.settings);
  });

  app.post('/api/admin/settings', authMiddleware, adminMiddleware, async (req, res) => {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
       db.settings[key] = value as string;
    }
    await saveDB();
    res.json({ success: true });
  });

  app.post('/api/admin/provider/sync', authMiddleware, adminMiddleware, async (req, res) => {
    const providerUrl = db.settings['provider_url'];
    const providerKey = db.settings['provider_key'];
    const commissionSetting = db.settings['commission_percent'];
    
    if (!providerUrl || !providerKey) {
      return res.status(400).json({ error: 'Provider API not configured in settings' });
    }

    try {
      const apiRes = await axios.post(providerUrl, new URLSearchParams({
        key: providerKey,
        action: 'services'
      }).toString());
      
      if (!Array.isArray(apiRes.data)) {
        return res.status(400).json({ error: 'Invalid response from provider' });
      }

      db.provider_services = [];
      const commission = parseFloat(commissionSetting || '10') / 100;

      for (const service of apiRes.data) {
         const newRate = parseFloat(service.rate) * (1 + commission);
         const id = nextId.services();
         db.provider_services.push({
            id,
            service_id: service.service,
            name: service.name,
            category: service.category,
            rate: newRate,
            min: parseInt(service.min),
            max: parseInt(service.max)
         });
      }
      await saveDB();
      res.json({ success: true, count: apiRes.data.length });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to sync services: ' + e.message });
    }
  });

  app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
      const usersCount = db.users.length;
      const ordersCount = db.orders.length;
      const totalFunds = db.fund_requests.filter(f => f.status==='accepted').reduce((sum, f) => sum + f.amount, 0);
      res.json({ usersCount, ordersCount, totalFunds });
  });

  // Public API for Users
  app.post('/api/v1', async (req, res) => {
    const { key, action, service, link, quantity } = req.body;
    
    if (!key) return res.status(400).json({ error: 'API Key is required' });
    const user = db.users.find(u => u.api_key === key);
    if (!user) return res.status(401).json({ error: 'Invalid API Key' });
    if (user.blocked) return res.status(403).json({ error: 'Account blocked' });

    if (action === 'balance') {
      return res.json({ balance: user.balance, currency: 'INR' });
    }

    if (action === 'services') {
      return res.json(db.provider_services.map(s => ({ service: s.id, name: s.name, type: 'Default', category: s.category, rate: s.rate, min: s.min, max: s.max })));
    }

    if (action === 'add') {
       if(!service || !link || !quantity) return res.status(400).json({ error: 'Missing parameters' });
       
       const svc = db.provider_services.find(s => s.id.toString() === service.toString());
       if (!svc) return res.status(400).json({ error: 'Invalid service' });
       
       const q = parseInt(quantity);
       if (q < svc.min || q > svc.max) return res.status(400).json({ error: 'Invalid quantity' });

       const charge = (svc.rate / 1000) * q;
       if (user.balance < charge) return res.status(400).json({ error: 'Insufficient balance' });

       user.balance -= charge;

       let status = 'pending';
       let providerOrderId = null;
       const providerUrl = db.settings['provider_url'];
       const providerKey = db.settings['provider_key'];

       if (providerUrl && providerKey) {
         try {
           const apiRes = await axios.post(providerUrl, new URLSearchParams({
             key: providerKey, action: 'add', service: svc.service_id, link, quantity: q.toString()
           }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});
           if (apiRes.data.order) { providerOrderId = apiRes.data.order; status = 'processing'; }
         } catch (e) {}
       }

       const id = nextId.orders();
       db.orders.push({
         id,
         user_id: user.id,
         service_id: svc.id,
         link,
         quantity: q,
         charge,
         status,
         provider_order_id: providerOrderId,
         created_at: new Date().toISOString()
       });
       await saveDB();
      
       return res.json({ order: id });
    }

    if (action === 'status') {
      const { order } = req.body;
      const o = db.orders.find(o => o.id.toString() === order?.toString() && o.user_id === user.id);
      if (!o) return res.status(400).json({ error: 'Invalid order id' });
      return res.json({ status: o.status, charge: o.charge });
    }

    return res.status(400).json({ error: 'Invalid action' });
  });

  // Vite & Static file serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
