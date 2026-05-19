export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { amount, description } = req.body;
  
  // PayMongo requires the amount in cents/centavos (e.g., $10.00 = 1000)
  const amountInCents = Math.round(amount * 100);

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      // The secure Basic Auth encoding required by PayMongo
      authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amountInCents,
          description: description,
          // GCash and PayMaya explicitly enabled
          payment_method_allowed: ['gcash', 'paymaya'],
          currency: 'PHP'
        }
      }
    })
  };

  try {
    const response = await fetch('https://api.paymongo.com/v1/links', options);
    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].detail);
    }

    // Return the generated secure payment URL to the React frontend
    res.status(200).json({ checkoutUrl: data.data.attributes.checkout_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}