export default async function handler(req, res) {
  // Only allow POST requests from your React frontend
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { amount, description } = req.body;
  
  // PayMongo strictly requires the amount in centavos (e.g., $10.00 = 1000)
  const amountInCents = Math.round(amount * 100);

  // Build the request using your secret key hidden in Vercel's Environment Variables
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amountInCents,
          description: description,
          payment_method_allowed: ['gcash'], // Explicitly targeting GCash
          currency: 'PHP'
        }
      }
    })
  };

  try {
    // Generate the secure GCash link
    const response = await fetch('https://api.paymongo.com/v1/links', options);
    const data = await response.json();
    
    if (data.errors) throw new Error(data.errors[0].detail);

    // Send the payment link back to React so it can redirect the user
    res.status(200).json({ checkoutUrl: data.data.attributes.checkout_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}