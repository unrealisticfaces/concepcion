import admin from 'firebase-admin';
import crypto from 'crypto';

// Initialize Firebase Admin SDK
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
    const event = JSON.parse(rawBody);

    // 1. Verify Signature
    const signatureHeader = req.headers['paymongo-signature'];
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (signatureHeader && webhookSecret) {
      const [tPart, , liPart] = signatureHeader.split(',');
      const timestamp = tPart.split('=')[1];
      const liveSignature = liPart ? liPart.split('=')[1] : null;
      const signatureString = `${timestamp}.${rawBody}`;
      const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(signatureString).digest('hex');
      
      if (liveSignature !== expectedSignature) return res.status(400).json({ error: 'Invalid signature' });
    }

    // 2. Logic: Only process 'link.payment.paid' as it contains the checkout_url
    if (event.data?.attributes?.type === 'link.payment.paid') {
      const checkoutUrl = event.data.attributes.data?.attributes?.checkout_url;

      if (!checkoutUrl) {
        return res.status(200).json({ received: true, message: "No checkout_url found in event" });
      }

      console.log("Processing payment for URL:", checkoutUrl);

      const db = admin.database();
      const snapshot = await db.ref('transactions').once('value');
      const transactions = snapshot.val();

      if (transactions) {
        for (const key in transactions) {
          if (transactions[key].checkoutUrl === checkoutUrl) {
            await db.ref(`transactions/${key}`).update({ status: 'Completed' });
            console.log(`SUCCESS: Updated transaction ${key} to Completed`);
            break;
          }
        }
      }
    } 
    // Ignore 'payment.paid' or other event types to keep logs clean

    return res.status(200).json({ received: true });
    
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(200).json({ received: true, error: err.message });
  }
}