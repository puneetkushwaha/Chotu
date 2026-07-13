import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, category, rating, is_online, delivery_radius_km, latitude, longitude')
    .eq('is_online', true)
    .order('rating', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
