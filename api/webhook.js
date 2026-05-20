import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const rawBody = await getRawBody(req);
    const signatureHeader = req.headers['paymongo-signature'];
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!signatureHeader || !webhookSecret) {
      return res.status(400).json({ error: 'Missing signature or secret' });
    }

    const [tPart, tePart, liPart] = signatureHeader.split(',');
    const timestamp = tPart.split('=')[1];
    const testSignature = tePart ? tePart.split('=')[1] : null;
    const liveSignature = liPart ? liPart.split('=')[1] : null;

    const signatureToCompare = process.env.NODE_ENV === 'production' ? liveSignature : (testSignature || liveSignature);

    const signatureString = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signatureString)
      .digest('hex');

    if (signatureToCompare !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody);

    if (event.data.attributes.type === 'payment.paid' || event.data.attributes.type === 'link.payment.paid') {
      const payment = event.data.attributes.data.attributes;
      const checkoutUrl = payment.redirect.checkout_url;

      const updateUrl = `https://cebu-fierce-fitness-gym-default-rtdb.asia-southeast1.firebasedatabase.app/transactions.json`;

      const trxResponse = await fetch(updateUrl);
      const transactions = await trxResponse.json();

      for (const key in transactions) {
        if (transactions[key].checkoutUrl === checkoutUrl) {
          await fetch(`https://cebu-fierce-fitness-gym-default-rtdb.asia-southeast1.firebasedatabase.app/transactions/${key}/status.json`, {
            method: 'PUT',
            body: JSON.stringify("Completed")
          });
          break;
        }
      }
    }

    return res.status(200).json({ received: true });
    
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(200).json({ received: true, error: "Acknowledged with error." });
  }
}