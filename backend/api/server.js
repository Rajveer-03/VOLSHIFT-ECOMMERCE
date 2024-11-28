import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with the secret API key from environment variables
const stripe = Stripe(process.env.STRIPE_API);

const app = express();

// Use CORS middleware to handle cross-origin requests
const corsOptions = {
  origin: 'https://volshift-ecommerce-ten.vercel.app/cart.html', // Allow all origins or specify frontend URLs like: ['https://yourfrontend.com']
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(cors(corsOptions)); // Apply CORS to all routes

// Middleware to parse JSON bodies
app.use(express.json());

// Route to create a Stripe checkout session
app.post('/api/stripe-checkout', async (req, res) => {
    console.log("Testing");
  
    const { items } = req.body;
  
    // Map cart items to Stripe line items format
    const lineItems = items.map(item => {
        const unitAmount = Math.round(item.price * 100); // Convert price to cents
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: [item.image], // Image URLs
                },
                unit_amount: unitAmount,
            },
            quantity: item.quantity,
        };
    });
  
    try {
        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.BASE_URL}/success.html`,  // Adjust for production URL
            cancel_url: `${process.env.BASE_URL}/cancel.html`,  // Adjust for production URL
            billing_address_collection: 'required',
        });
  
        // Send the session URL to the frontend
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Stripe Checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Catch-all for unsupported methods
app.use((req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
});

// Set the port number for the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
