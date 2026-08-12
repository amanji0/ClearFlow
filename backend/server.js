const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- USERS ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
  if (user && user.password === password) res.json(user);
  else res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});


// --- CUSTOMERS ---
app.get('/api/customers', async (req, res) => {
  const customers = await prisma.customer.findMany();
  res.json(customers);
});

app.post('/api/customers', async (req, res) => {
  const customer = await prisma.customer.create({ data: req.body });
  res.json(customer);
});

app.put('/api/customers/:id', async (req, res) => {
  const customer = await prisma.customer.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
  });
  res.json(customer);
});

app.delete('/api/customers/:id', async (req, res) => {
  await prisma.customer.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});


// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = await prisma.product.create({ data: req.body });
  res.json(product);
});

app.put('/api/products/:id', async (req, res) => {
  const product = await prisma.product.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
  });
  res.json(product);
});

app.delete('/api/products/:id', async (req, res) => {
  await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});


// --- CHALLANS ---
app.get('/api/challans', async (req, res) => {
  const challans = await prisma.challan.findMany({ include: { items: true } });
  res.json(challans);
});

app.post('/api/challans', async (req, res) => {
  const { items, ...challanData } = req.body;
  const challan = await prisma.challan.create({
    data: {
      ...challanData,
      items: { create: items }
    },
    include: { items: true }
  });
  res.json(challan);
});

app.put('/api/challans/:id', async (req, res) => {
  const challan = await prisma.challan.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
    include: { items: true }
  });
  res.json(challan);
});


// --- STOCK LOGS ---
app.get('/api/stocklogs', async (req, res) => {
  const logs = await prisma.stockLog.findMany({ orderBy: { id: 'desc' } });
  res.json(logs);
});

app.post('/api/stocklogs', async (req, res) => {
  const log = await prisma.stockLog.create({ data: req.body });
  res.json(log);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
