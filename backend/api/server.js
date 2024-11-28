import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with the secret API key from environment variables
const stripe = Stripe(process.env.STRIPE_API);

export default async function handler(req, res) {
    // Enable CORS by allowing the frontend to access this backend
    res.setHeader('Access-Control-Allow-Origin', '*');  // Allow all origins or specify your frontend URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle POST request to create the Stripe Checkout session
    if (req.method === 'POST') {
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
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
