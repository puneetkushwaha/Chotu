import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/profile?phone=+91XXXXXXXXXX
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone');
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 });

  const { data, error } = await supabase
    .from('customers')
    .select('name, email')
    .eq('phone_number', phone)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || { name: '', email: '' });
}

// POST /api/profile - update name/email
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phone, name, email } = body;
  if (!phone || !name) return NextResponse.json({ error: 'phone and name required' }, { status: 400 });

  // Upsert customer record
  const { error } = await supabase
    .from('customers')
    .upsert(
      { phone_number: phone, name, email: email || null },
      { onConflict: 'phone_number' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
