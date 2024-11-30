import express from 'express';  // If you are using "type": "module"
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = Stripe(process.env.STRIPE_API);

const app = express();

// Allow all origins
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
  console.log(+req);
  console.log("differentiator");
  console.log(items);
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
      success_url: `https://volshift-ecommerce-ten.vercel.app/`,
      cancel_url: `https://volshift-ecommerce-ten.vercel.app/`,
      billing_address_collection: 'required',
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: "error.message" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(() => console.log('Hello'), 5000);
