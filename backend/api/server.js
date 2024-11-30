import express from 'express';  // If you are using "type": "module"
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = Stripe(process.env.STRIPE_API);

const app = express();

// Middleware to parse JSON
app.use(cors());
app.use(express.json());

// Example route to check if server is running
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Example route for stripe checkout
app.post('/api/stripe-checkout', async (req, res) => {
  console.log("Hello");
  const { items } = req.body;
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: [item.image],
      },
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(() => console.log('Hello'), 5000);
