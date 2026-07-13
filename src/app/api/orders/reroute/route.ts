import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { order_id } = await req.json();

  if (!order_id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  // 1. Fetch current order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', order_id)
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // If order is no longer 'placed', no need to reroute
  if (order.delivery_status !== 'placed') {
    return NextResponse.json({ message: 'Order already processed', status: order.delivery_status });
  }

  // 2. Fetch online stores, excluding the current store_id
  const { data: onlineStores } = await supabase
    .from('stores')
    .select('id')
    .eq('is_online', true)
    .neq('id', order.store_id);

  if (!onlineStores || onlineStores.length === 0) {
    // No other stores available, cancel the order to avoid endless waiting
    await supabase.from('orders').update({ delivery_status: 'cancelled', payment_status: 'refunded' }).eq('id', order.id);
    return NextResponse.json({ message: 'No other stores available, order cancelled' });
  }

  // Find the next best store based on inventory overlap
  const productIds = order.order_items.map((i: any) => i.product_id);
  const activeStoreIds = onlineStores.map((s: any) => s.id);

  const { data: inventory } = await supabase
    .from('store_products')
    .select('store_id, product_id, is_in_stock')
    .in('product_id', productIds)
    .in('store_id', activeStoreIds)
    .eq('is_in_stock', true);

  const storeCounts: Record<string, number> = {};
  activeStoreIds.forEach((sid: string) => storeCounts[sid] = 0);

  order.order_items.forEach((item: any) => {
    const matchingStores = (inventory || [])
      .filter((inv: any) => inv.product_id === item.product_id)
      .map((inv: any) => inv.store_id);
    matchingStores.forEach((sid: string) => storeCounts[sid]++);
  });

  let bestStoreId = '';
  let maxCount = -1;
  Object.keys(storeCounts).forEach((sid: string) => {
    if (storeCounts[sid] > maxCount) {
      maxCount = storeCounts[sid];
      bestStoreId = sid;
    }
  });

  if (maxCount <= 0) {
    // Default to the first available online store as fallback
    bestStoreId = activeStoreIds[0];
  }

  // Update order's store_id to the new store, resetting created_at so the new merchant has full 90 seconds
  const { error: updateErr } = await supabase
    .from('orders')
    .update({ store_id: bestStoreId, created_at: new Date().toISOString() })
    .eq('id', order.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Order rerouted successfully', new_store_id: bestStoreId });
}
