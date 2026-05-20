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
    const event = JSON.parse(rawBody);

    // 1. Verify Signature (Optional but recommended for production)
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

    // 2. Extract checkout_url based on PayMongo Event structure
    // Log the full event to Vercel logs to debug if it stays undefined
    console.log("Full PayMongo Event received:", JSON.stringify(event));

    // Try multiple paths common in PayMongo events
    const attributes = event.data?.attributes;
    const checkoutUrl = attributes?.data?.attributes?.redirect?.checkout_url || 
                        attributes?.data?.attributes?.checkout_url;

    if (!checkoutUrl) {
      console.error("Critical: Could not extract checkout_url from event.");
      return res.status(400).json({ error: "Missing checkout_url in event data" });
    }

    console.log("Processing payment for URL:", checkoutUrl);

    // 3. Match and Update Database
    const db = admin.database();
    const snapshot = await db.ref('transactions').once('value');
    const transactions = snapshot.val();

    let updated = false;
    if (transactions) {
      for (const key in transactions) {
        if (transactions[key].checkoutUrl === checkoutUrl) {
          await db.ref(`transactions/${key}`).update({ status: 'Completed' });
          console.log(`Success: Marked transaction ${key} as Completed.`);
          updated = true;
          break;
        }
      }
    }

    if (!updated) {
      console.warn("Match failed: checkoutUrl found in event, but not in Firebase.");
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.status(200).json({ received: true });
    
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ error: err.message });
  }
}