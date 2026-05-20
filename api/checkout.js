// api/checkout.js
export default async function handler(req, res) {
  // 1. HANDLE PAYMENT LINK CREATION (Called by your React App)
  if (req.method === 'POST') {
    try {
      const { amount, description } = req.body;
      const amountInCents = Math.round(amount * 100);

      const response = await fetch('https://api.paymongo.com/v1/links', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amountInCents,
              description: description,
              currency: 'PHP',
              payment_method_types: ['gcash', 'paymaya'],
              success_url: 'https://concepcion.vercel.app/dashboard' 
            }
          }
        })
      });

      const data = await response.json();
      if (data.errors) return res.status(400).json({ error: data.errors[0].detail });

      return res.status(200).json({ checkoutUrl: data.data.attributes.checkout_url });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 2. HANDLE WEBHOOK (Called by PayMongo)
  if (req.method === 'GET') {
     return res.status(200).json({ message: "Webhook endpoint is active." });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}