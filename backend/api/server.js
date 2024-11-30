import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const stripe = Stripe(process.env.STRIPE_API);
const app = express();

// CORS Configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Serve static files from the public folder
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// Stripe API Endpoint
app.post('/api/stripe-checkout', async (req, res) => {
  const { items } = req.body;

  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name, images: [item.image] },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/success.html`,
      cancel_url: `${process.env.BASE_URL}/cancel.html`,
      billing_address_collection: 'required',
    });
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Serve `index.html` for all other routes (fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Log "Hello" every 5 seconds
setInterval(() => console.log('Hello'), 5000);
