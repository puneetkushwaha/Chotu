'use client';
import { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddressPage() {
  const router = useRouter();
  const { savedLocations, addLocation, deleteLocation, updateLocation, useCurrentLocation } = useLocation();
  
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [completeAddress, setCompleteAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // When edit is clicked
  const handleEdit = (loc: any) => {
    setEditingId(loc.id);
    setLabel(loc.label as 'Home' | 'Work' | 'Other');
    
    // Attempt to parse out parts if they were saved in the format
    // "label - house, complete, area, city"
    // Since it's just a string, we'll put the whole string in completeAddress for simplicity
    setCompleteAddress(loc.address);
    setCity('');
    setArea('');
    setHouseNo('');
    setActiveTab('edit');
  };

  const handleUseCurrent = async () => {
    setLoading(true);
    await useCurrentLocation();
    setLoading(false);
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'edit' && editingId) {
      if (!completeAddress.trim()) {
        alert('Please fill the address details');
        return;
      }
      
      let finalAddress = completeAddress;
      if (houseNo || area || city) {
        finalAddress = `${houseNo ? houseNo + ', ' : ''}${completeAddress}${area ? ', ' + area : ''}${city ? ', ' + city : ''}`;
      }
      
      await updateLocation(editingId, label, finalAddress);
      setActiveTab('list');
    } else {
      if (!city.trim() || !area.trim() || !houseNo.trim() || !completeAddress.trim()) {
        alert('Please fill all required address details');
        return;
      }
      
      const fullAddress = `${houseNo}, ${completeAddress}, ${area}, ${city}`;
      await addLocation(label, fullAddress, 26.8467, 80.9462); // dummy coords
      setActiveTab('list');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => { activeTab === 'list' ? router.back() : setActiveTab('list') }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="24" height="24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
          {activeTab === 'list' ? 'My Addresses' : activeTab === 'add' ? 'Add New Address' : 'Edit Address'}
        </h1>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        {activeTab === 'list' ? (
          <div>
            <div 
              onClick={handleUseCurrent}
              style={{ display: 'flex', alignItems: 'center', padding: '16px', background: '#fff', borderRadius: '12px', marginBottom: '16px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div style={{ color: 'var(--brand-green)', marginRight: '16px' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--brand-green)', fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>Use current location</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>{loading ? 'Fetching location...' : 'Tap to fetch GPS location'}</div>
              </div>
            </div>

            <div 
              onClick={() => {
                setCity(''); setArea(''); setHouseNo(''); setCompleteAddress(''); setLabel('Home'); setActiveTab('add');
              }}
              style={{ display: 'flex', alignItems: 'center', padding: '16px', background: '#fff', borderRadius: '12px', marginBottom: '24px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div style={{ color: 'var(--brand-green)', marginRight: '16px' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--brand-green)', fontWeight: 700, fontSize: '15px' }}>Add new address</div>
              </div>
            </div>

            {savedLocations.length > 0 && (
              <div>
                <div style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '16px', paddingLeft: '4px' }}>
                  Saved Addresses
                </div>
                <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {savedLocations.map((loc, index) => (
                    <div key={loc.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '16px', borderBottom: index < savedLocations.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '50%', marginRight: '16px', color: 'var(--brand-orange)' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>{loc.label}</div>
                        <div style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.4, marginBottom: '12px' }}>{loc.address}</div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <button onClick={() => handleEdit(loc)} style={{ background: 'none', border: 'none', color: 'var(--brand-green)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                            Edit
                          </button>
                          <button onClick={() => deleteLocation(loc.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>House / Flat No.</label>
              <input type="text" value={houseNo} onChange={e => setHouseNo(e.target.value)} required={activeTab === 'add'} placeholder="e.g. Flat 101, B Wing" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Complete Address / Landmark</label>
              <textarea value={completeAddress} onChange={e => setCompleteAddress(e.target.value)} required rows={3} placeholder="e.g. Near Apollo Pharmacy" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }} />
            </div>
            {activeTab === 'add' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Area, Street</label>
                  <input type="text" value={area} onChange={e => setArea(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>City</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }} />
                </div>
              </>
            )}
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: '#475569' }}>Save as</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Home', 'Work', 'Other'].map(l => (
                  <button type="button" key={l} onClick={() => setLabel(l as any)} style={{
                    flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    border: label === l ? '2px solid var(--brand-green)' : '1px solid #e2e8f0',
                    background: label === l ? '#f0fdf4' : 'white',
                    color: label === l ? 'var(--brand-green)' : '#64748b'
                  }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            
            <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--brand-green)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
              {activeTab === 'add' ? 'Save New Address' : 'Update Address'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
