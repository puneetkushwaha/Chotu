import { NextRequest, NextResponse } from 'next/server';
import '../../../../lib/firebaseAdmin';
import { getMessaging } from 'firebase-admin/messaging';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map order delivery_status codes to human-readable messages
const STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
  placed:           { title: '✅ Order Placed!',            body: 'Your order has been placed successfully. Waiting for store confirmation.' },
  accepted:         { title: '🎉 Order Accepted!',          body: 'Your order has been accepted by the store and is being prepared.' },
  rejected:         { title: '❌ Order Rejected',            body: 'Sorry, the store could not accept your order. You will get a full refund.' },
  packed:           { title: '📦 Order Packed!',            body: 'Your order is packed and ready for delivery.' },
  out_for_delivery: { title: '🛵 Out for Delivery!',        body: 'Your order is on the way! It will arrive shortly.' },
  delivered:        { title: '🏠 Order Delivered!',         body: 'Your order has been delivered. Enjoy! 🛒' },
  cancelled:        { title: '🚫 Order Cancelled',          body: 'Your order has been cancelled. A refund will be processed if applicable.' },
};

/**
 * POST /api/notifications/order-status
 * 
 * Called by Supabase Database Webhook when an order's delivery_status changes.
 * Webhook Payload format from Supabase:
 * { "type": "UPDATE", "record": { "id": "...", "delivery_status": "...", "customer_phone": "..." }, ... }
 */
export async function POST(req: NextRequest) {
  try {
    // Validate webhook secret to prevent unauthorized calls
    const webhookSecret = req.headers.get('x-webhook-secret');
    if (process.env.SUPABASE_WEBHOOK_SECRET && webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    // Support both direct calls and Supabase webhook format
    const record = payload.record ?? payload;
    const orderId: string = record.id;
    const newStatus: string = record.delivery_status ?? record.status;
    const customerPhone: string = record.customer_phone;

    if (!orderId || !newStatus || !customerPhone) {
      return NextResponse.json({ error: 'Missing orderId, status, or customerPhone' }, { status: 400 });
    }

    const msgData = STATUS_MESSAGES[newStatus];
    if (!msgData) {
      return NextResponse.json({ success: false, message: `No notification defined for status: ${newStatus}` });
    }

    const title = msgData.title;
    const body = msgData.body;

    // 1. Save to notifications table so it shows in the in-app notification screen
    await supabase.from('notifications').insert({
      title,
      body: `${body} (Order: ${orderId.substring(0, 8)}...)`,
      target_phone: customerPhone,
    });

    // 2. Look up FCM token for this specific customer
    const { data: tokenRow } = await supabase
      .from('customer_fcm_tokens')
      .select('fcm_token')
      .eq('phone_number', customerPhone)
      .single();

    if (!tokenRow?.fcm_token) {
      console.log(`[Order Notification] No FCM token found for ${customerPhone}. Saved to DB only.`);
      return NextResponse.json({ success: true, push: false, reason: 'no_token' });
    }

    // 3. Send push notification to the specific customer's device
    const adminMessaging = getMessaging();
    await adminMessaging.send({
      token: tokenRow.fcm_token,
      notification: { title, body },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'chotu_high_importance',
        },
      },
      data: {
        orderId,
        status: newStatus,
        type: 'order_status',
      },
    });

    console.log(`[Order Notification] Push sent to ${customerPhone} for order ${orderId} — status: ${newStatus}`);
    return NextResponse.json({ success: true, push: true, status: newStatus });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Order Notification API] Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
