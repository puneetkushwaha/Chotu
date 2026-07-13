import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from('store_products')
    .select(`
      product_id,
      products!inner(id, name, weight, standard_mrp, emoji, image_url)
    `)
    .eq('is_in_stock', true)
    .ilike('products.name', `%${query.trim()}%`)
    .limit(30); // fetch more to account for duplicates

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const uniqueProductsMap = new Map();
  data?.forEach((sp: any) => {
    if (sp.products && !uniqueProductsMap.has(sp.product_id)) {
      uniqueProductsMap.set(sp.product_id, {
        ...sp.products,
        product_id: sp.product_id,
        store_id: sp.store_id || 'unified',
        price: sp.products.standard_mrp
      });
    }
  });
  const uniqueProducts = Array.from(uniqueProductsMap.values()).slice(0, 10);

  return NextResponse.json(uniqueProducts);
}
