'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [catImage, setCatImage] = useState<File | null>(null);
  const [catLoading, setCatLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [prodImage, setProdImage] = useState<File | null>(null);
  const [prodLoading, setProdLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: cData } = await supabase.from('categories').select('*');
      if (cData) setCategories(cData);
      
      const { data: pData } = await supabase.from('products').select('*');
      if (pData) setProducts(pData);
    };
    load();
  }, []);

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    // Upload to 'images' bucket (must exist in Supabase and be public)
    const { error } = await supabase.storage.from('images').upload(filePath, file);
    if (error) throw error;

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleCategoryUpload = async () => {
    if (!selectedCategory || !catImage) return alert('Select category and image');
    setCatLoading(true);
    try {
      const url = await uploadImage(catImage);
      await supabase.from('categories').update({ image_url: url }).eq('id', selectedCategory);
      alert('Category image updated!');
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setCatLoading(false);
  };

  const handleProductUpload = async () => {
    if (!selectedProduct || !prodImage) return alert('Select product and image');
    setProdLoading(true);
    try {
      const url = await uploadImage(prodImage);
      await supabase.from('products').update({ image_url: url }).eq('id', selectedProduct);
      alert('Product image updated!');
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setProdLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Admin Image Upload</h1>
      
      <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
        <h3>Update Category Image</h3>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}>
          <option value="">Select Category...</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="file" onChange={e => setCatImage(e.target.files?.[0] || null)} style={{ display: 'block', margin: '10px 0' }} />
        <button onClick={handleCategoryUpload} disabled={catLoading} style={{ padding: '8px 16px', background: 'blue', color: 'white', border: 'none', borderRadius: '4px' }}>
          {catLoading ? 'Uploading...' : 'Upload & Update'}
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
        <h3>Update Product Image</h3>
        <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}>
          <option value="">Select Product...</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.barcode})</option>)}
        </select>
        <input type="file" onChange={e => setProdImage(e.target.files?.[0] || null)} style={{ display: 'block', margin: '10px 0' }} />
        <button onClick={handleProductUpload} disabled={prodLoading} style={{ padding: '8px 16px', background: 'blue', color: 'white', border: 'none', borderRadius: '4px' }}>
          {prodLoading ? 'Uploading...' : 'Upload & Update'}
        </button>
      </div>
    </div>
  );
}
