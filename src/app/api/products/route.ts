import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get('store_id');
  if (!storeId) return NextResponse.json({ error: 'store_id required' }, { status: 400 });

  const { data, error } = await supabase
    .from('store_products')
    .select(`
      id,
      price,
      is_in_stock,
      store_id,
      product:products (
        id,
        name,
        emoji,
        weight,
        image_url,
        barcode
      )
    `)
    .eq('store_id', storeId)
    .eq('is_in_stock', true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = (data || []).map((sp: any) => ({
    id: sp.id,
    product_id: sp.product?.id,
    store_id: sp.store_id,
    name: sp.product?.name,
    emoji: sp.product?.emoji,
    weight: sp.product?.weight,
    image_url: sp.product?.image_url,
    price: sp.price,
    is_in_stock: sp.is_in_stock,
  }));

  return NextResponse.json(mapped);
}
