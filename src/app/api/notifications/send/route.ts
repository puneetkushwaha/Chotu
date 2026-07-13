import { NextRequest, NextResponse } from 'next/server';
import '../../../../lib/firebaseAdmin';
import { getMessaging } from 'firebase-admin/messaging';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, targetPhone } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'title and message are required' }, { status: 400 });
    }

    // 1. Store notification in Supabase `notifications` table for in-app display
    await supabase.from('notifications').insert({
      title,
      body: message,
      target_phone: targetPhone ?? null, // null = broadcast to all
    });

    const adminMessaging = getMessaging();

    if (targetPhone) {
      // 2a. Send to a SPECIFIC customer via their stored FCM token
      const { data: tokenRow } = await supabase
        .from('customer_fcm_tokens')
        .select('fcm_token')
        .eq('phone_number', targetPhone)
        .single();

      if (!tokenRow?.fcm_token) {
        return NextResponse.json({ success: false, error: 'No FCM token found for this user.' });
      }

      await adminMessaging.send({
        token: tokenRow.fcm_token,
        notification: { title, body: message },
        android: { priority: 'high' },
      });

      return NextResponse.json({ success: true, type: 'individual', phone: targetPhone });
    } else {
      // 2b. Broadcast to ALL customers via topic
      await adminMessaging.send({
        topic: 'all_customers',
        notification: { title, body: message },
        android: { priority: 'high' },
      });

      return NextResponse.json({ success: true, type: 'broadcast' });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /api/notifications/send] Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
