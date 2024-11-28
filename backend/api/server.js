import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = Stripe(process.env.STRIPE_API);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { items } = req.body;

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
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${process.env.BASE_URL}/success.html`,  // Adjust for production URL
                cancel_url: `${process.env.BASE_URL}/cancel.html`,  // Adjust for production URL
                billing_address_collection: 'required',
            });

            res.json({ url: session.url });
        } catch (error) {
            console.error('Stripe Checkout error:', error);
            res.status(500).json({ error: 'Failed to create checkout session' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
