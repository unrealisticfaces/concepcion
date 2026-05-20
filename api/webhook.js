// api/webhook.js
import admin from 'firebase-admin';
import crypto from 'crypto';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "cebu-fierce-fitness-gym",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: "https://cebu-fierce-fitness-gym-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) { chunks.push(chunk); }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const rawBody = await getRawBody(req);
    const signatureHeader = req.headers['paymongo-signature'];
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (signatureHeader && webhookSecret) {
      const [tPart, tePart, liPart] = signatureHeader.split(',');
      const timestamp = tPart.split('=')[1];
      const liveSignature = liPart ? liPart.split('=')[1] : null;
      const signatureString = `${timestamp}.${rawBody}`;
      const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(signatureString).digest('hex');
      
      if (liveSignature !== expectedSignature) return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody);
    if (event.data?.attributes?.type === 'payment.paid' || event.data?.attributes?.type === 'link.payment.paid') {
      const checkoutUrl = event.data.attributes.data?.attributes?.redirect?.checkout_url;
      
      console.log("Webhook received payment for:", checkoutUrl);

      const db = admin.database();
      const snapshot = await db.ref('transactions').once('value');
      const transactions = snapshot.val();

      let found = false;
      for (const key in transactions) {
        // Log what we are comparing
        console.log(`Comparing DB URL [${transactions[key].checkoutUrl}] with PayMongo [${checkoutUrl}]`);
        
        if (transactions[key].checkoutUrl === checkoutUrl) {
          await db.ref(`transactions/${key}`).update({ status: 'Completed' });
          console.log(`SUCCESS: Updated transaction ${key} to Completed`);
          found = true;
          break;
        }
      }
      if (!found) console.warn("WARNING: No matching checkoutUrl found in database.");
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(200).json({ received: true, error: err.message });
  }
}