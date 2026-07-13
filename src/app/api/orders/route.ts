import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { store_id, customer_name, customer_phone, customer_email, delivery_address, delivery_lat, delivery_lng, items } = body;

  if (!customer_name || !customer_phone || !delivery_address || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Fetch all online stores
  const { data: onlineStores } = await supabase
    .from('stores')
    .select('id')
    .eq('is_online', true);

  const activeStoreIds = (onlineStores || []).map(s => s.id);
  const defaultStoreId = activeStoreIds[0] || store_id || '8a3106b0-3bc7-4209-8d75-0b1e93f57c01';

  // 2. Fetch inventory for items in cart
  const productIds = items.map((i: any) => i.product_id);
  const { data: inventory } = await supabase
    .from('store_products')
    .select('store_id, product_id, is_in_stock')
    .in('product_id', productIds)
    .in('store_id', activeStoreIds)
    .eq('is_in_stock', true);

  // Group items by store using greedy algorithm
  const unassigned = [...items];
  const storeGroups: Record<string, any[]> = {}; // store_id -> items[]

  while (unassigned.length > 0) {
    // For each online store, count how many of the remaining unassigned items it has in stock
    const storeCounts: Record<string, number> = {};
    activeStoreIds.forEach(sid => {
      storeCounts[sid] = 0;
    });

    unassigned.forEach(item => {
      const matchingStores = (inventory || [])
        .filter(inv => inv.product_id === item.product_id)
        .map(inv => inv.store_id);
      matchingStores.forEach(sid => {
        if (storeCounts[sid] !== undefined) {
          storeCounts[sid]++;
        }
      });
    });

    // Find store with max matches
    let bestStoreId = '';
    let maxCount = -1;
    Object.keys(storeCounts).forEach(sid => {
      if (storeCounts[sid] > maxCount) {
        maxCount = storeCounts[sid];
        bestStoreId = sid;
      }
    });

    // If no store has any of the remaining items, assign them all to the default store
    if (maxCount <= 0) {
      const sid = defaultStoreId;
      storeGroups[sid] = storeGroups[sid] || [];
      storeGroups[sid] = storeGroups[sid].concat(unassigned);
      break;
    }

    // Assign items that this store has in stock to this store
    const assignedIds: string[] = [];
    const storeItems: any[] = [];
    unassigned.forEach(item => {
      const hasStock = (inventory || []).some(inv => inv.store_id === bestStoreId && inv.product_id === item.product_id && inv.is_in_stock);
      if (hasStock) {
        storeItems.push(item);
        assignedIds.push(item.product_id);
      }
    });

    storeGroups[bestStoreId] = storeGroups[bestStoreId] || [];
    storeGroups[bestStoreId] = storeGroups[bestStoreId].concat(storeItems);

    // Remove assigned items from unassigned
    for (let i = unassigned.length - 1; i >= 0; i--) {
      if (assignedIds.includes(unassigned[i].product_id)) {
        unassigned.splice(i, 1);
      }
    }
  }

  // Place orders for each group
  const createdOrderIds: string[] = [];
  const delivery_fee = 25; 

  const storeIdsToProcess = Object.keys(storeGroups);
  for (let idx = 0; idx < storeIdsToProcess.length; idx++) {
    const sid = storeIdsToProcess[idx];
    const groupItems = storeGroups[sid];
    const items_total = groupItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
    // Charge delivery fee only on the primary split order, remaining are free delivery
    const fee = idx === 0 ? delivery_fee : 0; 
    const grand_total = items_total + fee;

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        store_id: sid,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        delivery_address,
        delivery_lat: delivery_lat || null,
        delivery_lng: delivery_lng || null,
        items_total,
        delivery_fee: fee,
        grand_total,
        payment_status: 'pending',
        delivery_status: 'placed',
      })
      .select()
      .single();

    if (orderErr) {
      return NextResponse.json({ error: `Order insertion failed: ${orderErr.message}` }, { status: 500 });
    }

    createdOrderIds.push(order.id);

    // Insert order items
    const orderItems = groupItems.map((i: any) => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      price_per_item: i.price,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) {
      return NextResponse.json({ error: `Order items insertion failed: ${itemsErr.message}` }, { status: 500 });
    }

    // Trigger invoice email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/email-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id }),
      });
    } catch (_) {}
  }

  // Return the first order ID for redirection
  return NextResponse.json({ order_id: createdOrderIds[0] });
}

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('id');
  if (!orderId) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items(*, product:products(name, emoji, weight))`)
    .eq('id', orderId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
