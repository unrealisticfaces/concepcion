export default async function handler(req, res) {

  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed'
    });
  }

  try {

    const { amount, description } = req.body;

    // Convert to centavos
    const amountInCents = Math.round(amount * 100);

    // PayMongo Request
    const response = await fetch(
      'https://api.paymongo.com/v1/links',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          authorization:
            `Basic ${Buffer.from(
              process.env.PAYMONGO_SECRET_KEY + ':'
            ).toString('base64')}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amountInCents,
              description: description,
              currency: 'PHP',
              payment_method_types: ['gcash']
            }
          }
        })
      }
    );

    const data = await response.json();

    console.log(data);

    // PayMongo Error
    if (data.errors) {
      return res.status(400).json({
        error: data.errors[0].detail
      });
    }

    // Success
    return res.status(200).json({
      checkoutUrl: data.data.attributes.checkout_url
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}