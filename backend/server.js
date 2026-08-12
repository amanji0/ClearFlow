require('express-async-errors'); // Automatically catches async errors and passes them to the global error handler
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ─── VALIDATION SCHEMAS ──────────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const userSchema = z.object({
  username: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(['Admin', 'Sales', 'Warehouse', 'Accounts']),
  password: z.string().min(6)
});

const customerSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  business: z.string().min(1),
  gst: z.string().optional().or(z.literal('')),
  type: z.enum(['Wholesale', 'Distributor', 'Retail']),
  address: z.string().min(1),
  status: z.enum(['Active', 'Lead', 'Inactive']),
  followUp: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal(''))
});

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().min(0),
  minStock: z.number().min(0),
  location: z.string().optional().or(z.literal(''))
});

const challanItemSchema = z.object({
  productId: z.number(),
  name: z.string(),
  sku: z.string(),
  qty: z.number().positive(),
  price: z.number().positive()
});

const challanSchema = z.object({
  number: z.string().min(1),
  customerId: z.number(),
  customerName: z.string(),
  total: z.number().min(0),
  status: z.enum(['Draft', 'Confirmed', 'Cancelled']),
  by: z.string(),
  date: z.string(),
  items: z.array(challanItemSchema).min(1, "Challan must have at least one item")
});

// Middleware for validation
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    });
  }
};

// ─── AUTH ────────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', validate(loginSchema), async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  res.status(200).json(user);
});


// ─── USERS ───────────────────────────────────────────────────────────────────────
app.post('/api/users', validate(userSchema), async (req, res) => {
  const existingUser = await prisma.user.findUnique({ where: { username: req.body.username.toLowerCase() } });
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  const user = await prisma.user.create({ data: req.body });
  res.status(201).json(user);
});

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
});


// ─── CUSTOMERS ───────────────────────────────────────────────────────────────────
app.get('/api/customers', async (req, res) => {
  const { page = 1, limit = 100, search, status } = req.query;
  
  const where = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  if (status) {
    where.status = status;
  }

  const customers = await prisma.customer.findMany({
    where,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { name: 'asc' }
  });
  
  res.status(200).json(customers);
});

app.post('/api/customers', validate(customerSchema), async (req, res) => {
  const customer = await prisma.customer.create({ data: req.body });
  res.status(201).json(customer);
});

app.put('/api/customers/:id', validate(customerSchema), async (req, res) => {
  const id = parseInt(req.params.id);
  const exists = await prisma.customer.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Customer not found' });

  const customer = await prisma.customer.update({
    where: { id },
    data: req.body,
  });
  res.status(200).json(customer);
});

app.delete('/api/customers/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const exists = await prisma.customer.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Customer not found' });

  await prisma.customer.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Customer deleted successfully' });
});


// ─── PRODUCTS ────────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  const { page = 1, limit = 100, search, category } = req.query;
  
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (category) {
    where.category = category;
  }

  const products = await prisma.product.findMany({
    where,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { name: 'asc' }
  });
  
  res.status(200).json(products);
});

app.post('/api/products', validate(productSchema), async (req, res) => {
  const exists = await prisma.product.findUnique({ where: { sku: req.body.sku } });
  if (exists) return res.status(400).json({ error: 'SKU already exists' });

  const product = await prisma.product.create({ data: req.body });
  res.status(201).json(product);
});

app.put('/api/products/:id', validate(productSchema), async (req, res) => {
  const id = parseInt(req.params.id);
  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Product not found' });

  const product = await prisma.product.update({
    where: { id },
    data: req.body,
  });
  res.status(200).json(product);
});

app.delete('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Product not found' });

  await prisma.product.delete({ where: { id } });
  res.status(200).json({ success: true });
});


// ─── CHALLANS ────────────────────────────────────────────────────────────────────
app.get('/api/challans', async (req, res) => {
  const { page = 1, limit = 100, status, search } = req.query;
  
  const where = {};
  if (status) where.status = status;
  if (search) where.number = { contains: search, mode: 'insensitive' };

  const challans = await prisma.challan.findMany({ 
    where,
    include: { items: true },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { id: 'desc' }
  });
  res.status(200).json(challans);
});

app.post('/api/challans', validate(challanSchema), async (req, res) => {
  const { items, ...challanData } = req.body;
  const challan = await prisma.challan.create({
    data: {
      ...challanData,
      items: { create: items }
    },
    include: { items: true }
  });
  res.status(201).json(challan);
});

app.put('/api/challans/:id', validate(challanSchema), async (req, res) => {
  const id = parseInt(req.params.id);
  const exists = await prisma.challan.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Challan not found' });

  // Update logic with nested relations in Prisma
  const challan = await prisma.challan.update({
    where: { id },
    data: {
      status: req.body.status, // We mostly just update status
      by: req.body.by
    },
    include: { items: true }
  });
  res.status(200).json(challan);
});


// ─── STOCK LOGS ──────────────────────────────────────────────────────────────────
app.get('/api/stocklogs', async (req, res) => {
  const { page = 1, limit = 100, productId } = req.query;
  
  const where = {};
  if (productId) where.productId = Number(productId);

  const logs = await prisma.stockLog.findMany({ 
    where,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { id: 'desc' }
  });
  res.status(200).json(logs);
});

app.post('/api/stocklogs', async (req, res) => {
  const log = await prisma.stockLog.create({ data: req.body });
  res.status(201).json(log);
});


// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Validation Error', details: err.errors });
  }
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
