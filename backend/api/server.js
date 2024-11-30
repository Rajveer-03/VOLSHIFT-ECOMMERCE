import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with the secret API key
const stripe = Stripe(process.env.STRIPE_API);

const app = express();

// Dynamically configure allowed origins
const allowedOrigins = [
  'https://volshift-ecommerce-ten.vercel.app', // Frontend URL
];

const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'], // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Route to create a Stripe checkout session
app.post('/api/stripe-checkout', async (req, res) => {
  const { items } = req.body;

  // Map cart items to Stripe line items
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: [item.image], // Image URLs
      },
      unit_amount: Math.round(item.price * 100), // Convert price to cents
    },
    quantity: item.quantity,
  }));

  try {
    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/success.html`,
      cancel_url: `${process.env.BASE_URL}/cancel.html`,
      billing_address_collection: 'required',
    });

    // Send the session URL to the frontend
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Preflight request handler for CORS
app.options('/api/stripe-checkout', cors(corsOptions));

// Catch-all for unsupported methods
app.use((req, res) => {
  res.status(405).json({ error: 'Method Not Allowed' });
});

// Set the port number
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Print "Hello" at regular intervals
setInterval(() => {
  console.log("Hello");
}, 5000); // 5000ms = 5 seconds
