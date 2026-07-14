import { NextRequest, NextResponse } from 'next/server';
import '../../../../lib/firebaseAdmin';
import { getMessaging } from 'firebase-admin/messaging';
import { createClient } from '@supabase/supabase-js';


/**
 * POST /api/notifications/new-order
 * 
 * Called when a new order is inserted in the Supabase 'orders' table.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const payload = await req.json();
    const record = payload.record ?? payload;
    const orderId = record.id;
    const storeId = record.store_id; // Order goes to this store
    const orderAmount = record.total_price || record.amount || '';

    if (!orderId || !storeId) {
      return NextResponse.json({ error: 'Missing orderId or storeId' }, { status: 400 });
    }

    // 1. Find the merchant owner's phone number from the stores table
    const { data: storeData } = await supabase
      .from('stores')
      .select('owner_phone')
      .eq('id', storeId)
      .single();

    const merchantPhone = storeData?.owner_phone;
    if (!merchantPhone) {
      console.log(`[New Order] No owner_phone found for store ${storeId}`);
      return NextResponse.json({ success: false, reason: 'no_store_owner' });
    }

    // 2. Lookup the FCM token for this merchant phone
    // We will save merchant tokens in a 'merchant_fcm_tokens' table
    const { data: tokenRow } = await supabase
      .from('merchant_fcm_tokens')
      .select('fcm_token')
      .eq('phone_number', merchantPhone)
      .single();

    if (!tokenRow?.fcm_token) {
      console.log(`[New Order] No FCM token registered for Merchant ${merchantPhone}`);
      return NextResponse.json({ success: true, push: false, reason: 'no_merchant_token' });
    }

    // 3. Send high-priority ring notification to the Merchant
    const adminMessaging = getMessaging();
    await adminMessaging.send({
      token: tokenRow.fcm_token,
      notification: {
        title: '🔔 New Order Received!',
        body: `You have received a new order worth ₹${orderAmount}! Open the app to accept it.`
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default', // Standard system alert sound
          channelId: 'chotu_high_importance', // Keep app alert awake
        },
      },
      data: {
        orderId,
        type: 'new_order',
      },
    });

    console.log(`[New Order Push] Alert sent successfully to merchant ${merchantPhone}`);
    return NextResponse.json({ success: true, push: true });

  } catch (error: any) {
    console.error('[New Order Push API] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
