// // import express from 'express';
// // import dotenv from 'dotenv';
// // import Stripe from 'stripe'; // Correct import for Stripe

// // // Load environment variables
// // dotenv.config();

// // // Initialize Stripe with the secret API key from .env
// // const stripeGateway = Stripe(process.env.stripe_api);
// // // console.log("Key                kjdfnglskjdgn"+stripeGateway);
// // const app = express();

// // app.use(express.static('public'));
// // app.use(express.json());

// // // Home route
// // app.get('/', (req, res) => {
// //     res.sendFile("public/index.html", { root: '' });
// // });

// // // Stripe checkout route
// // app.post('/stripe-checkout', async (req, res) => {        
// //     const { items } = req.body;
// //     const lineItems = items.map(item => {
// //         const unitAmount = Math.round(item.price * 100); // Convert price to cents
// //         return {
// //             price_data: {
// //                 currency: 'usd',
// //                 product_data: {
// //                     name: item.name,
// //                     images: [item.image],
// //                 },
// //                 unit_amount: unitAmount,
// //             },
// //             quantity: item.quantity,
// //         };
// //     });
// //     // Create Stripe Checkout session
// //     const session = await stripeGateway.checkout.sessions.create({
// //         payment_method_types: ['card'],
// //         line_items: lineItems,
// //         mode: 'payment',
// //         success_url: `${process.env.BASE_URL}/succsess.html`,
// //         // success_url: `${process.env.BASE_URL}/success.html`,
// //         cancel_url: `${process.env.BASE_URL}/cancel.html`,
// //         billing_address_collection: 'required'
// //     });
// //     // console.log(session);
// //     res.json(session);
// // });

// // // Start the server
// // app.listen(3000, () => {
// //     console.log('Server is running on port 3000');
// // });
// import { VercelRequest, VercelResponse } from '@vercel/node'; // Required for Vercel serverless functions
// import dotenv from 'dotenv';
// import Stripe from 'stripe';

// // Load environment variables
// dotenv.config();

// // Initialize Stripe with the secret API key from .env
// const stripeGateway = new Stripe(process.env.STRIPE_API, { apiVersion: '2022-11-15' });

// // Stripe checkout route
// export default async function handler(req: VercelRequest, res: VercelResponse) {
//     if (req.method === 'POST') {
//         const { items } = req.body;

//         // Map cart items to line items for Stripe
//         const lineItems = items.map(item => ({
//             price_data: {
//                 currency: 'usd',
//                 product_data: {
//                     name: item.name,
//                     images: [item.image],
//                 },
//                 unit_amount: Math.round(item.price * 100), // Convert price to cents
//             },
//             quantity: item.quantity,
//         }));

//         try {
//             // Create a Stripe Checkout session
//             const session = await stripeGateway.checkout.sessions.create({
//                 payment_method_types: ['card'],
//                 line_items: lineItems,
//                 mode: 'payment',
//                 success_url: `${process.env.BASE_URL}/public/success.html`,
//                 cancel_url: `${process.env.BASE_URL}/public/cancel.html`,
//                 billing_address_collection: 'required',
//             });

//             // Return the session data (URL) to the frontend
//             res.json({ url: session.url });
//         } catch (error) {
//             // Handle errors and return an appropriate response
//             console.error(error);
//             res.status(500).json({ error: 'Failed to create checkout session' });
//         }
//     } else {
//         // Handle unsupported methods (Only POST is allowed for this endpoint)
//         res.status(405).json({ error: 'Method Not Allowed' });
//     }
// }



import { VercelRequest, VercelResponse } from '@vercel/node'; // Required for Vercel serverless functions
import dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

// Initialize Stripe with the secret API key from .env
const stripeGateway = new Stripe(process.env.STRIPE_API, { apiVersion: '2022-11-15' });

// Stripe checkout route
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { items } = req.body;

        // Map cart items to line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: [item.image],
                },
                unit_amount: Math.round(item.price * 100), // Convert price to cents
            },
            quantity: item.quantity,
        }));

        try {
            // Create a Stripe Checkout session
            const session = await stripeGateway.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${process.env.BASE_URL}/public/success.html`,
                cancel_url: `${process.env.BASE_URL}/public/cancel.html`,
                billing_address_collection: 'required',
            });

            // Return the session data (URL) to the frontend
            res.json({ url: session.url });
        } catch (error) {
            // Handle errors and return an appropriate response
            console.error(error);
            res.status(500).json({ error: 'Failed to create checkout session' });
        }
    } else {
        // Handle unsupported methods (Only POST is allowed for this endpoint)
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
