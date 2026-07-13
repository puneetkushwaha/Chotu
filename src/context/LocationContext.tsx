'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateDistance, estimateDeliveryTime, getCurrentPosition } from '../lib/locationUtils';

export interface SavedLocation {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  address: string;
  lat: number | null;
  lng: number | null;
}

interface LocationContextType {
  location: string;
  lat: number | null;
  lng: number | null;
  deliveryTime: string;
  savedLocations: SavedLocation[];
  selectLocation: (id: string) => void;
  addLocation: (label: 'Home' | 'Work' | 'Other', address: string, lat?: number, lng?: number) => void;
  deleteLocation: (id: string) => void;
  updateLocation: (id: string, label: 'Home' | 'Work' | 'Other', address: string) => void;
  useCurrentLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState('Select Location');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState('10 minutes');
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);

  const calculateTimeForCoords = async (latitude: number, longitude: number) => {
    try {
      const { data: stores } = await supabase.from('stores').select('latitude, longitude, is_online');
      if (stores) {
        let minDistance = Infinity;
        for (const store of stores) {
          if (store.is_online && store.latitude && store.longitude) {
            const dist = calculateDistance(latitude, longitude, store.latitude, store.longitude);
            if (dist < minDistance) minDistance = dist;
          }
        }
        if (minDistance !== Infinity) {
          setDeliveryTime(estimateDeliveryTime(minDistance));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAddresses = async () => {
    const phone = localStorage.getItem('chotu_merchant_phone');
    if (phone) {
      // Sync local to Supabase first time
      const saved = localStorage.getItem('chotu_saved_locations');
      if (saved) {
        const localLocs: SavedLocation[] = JSON.parse(saved);
        for (const loc of localLocs) {
           await supabase.from('customer_addresses').upsert({
             id: loc.id,
             phone_number: phone,
             label: loc.label,
             complete_address: loc.address,
             lat: loc.lat,
             lng: loc.lng
           });
        }
        localStorage.removeItem('chotu_saved_locations');
      }

      // Load from Supabase
      const { data } = await supabase.from('customer_addresses').select().eq('phone_number', phone);
      if (data && data.length > 0) {
        const parsed = data.map((d: any) => ({
          id: d.id,
          label: d.label,
          address: d.complete_address,
          lat: d.lat,
          lng: d.lng
        }));
        setSavedLocations(parsed);
      } else {
        setSavedLocations([]);
      }
    } else {
      // Load from localStorage
      const saved = localStorage.getItem('chotu_saved_locations');
      if (saved) {
        setSavedLocations(JSON.parse(saved));
      } else {
        const defaults: SavedLocation[] = [];
        setSavedLocations(defaults);
      }
    }

    const active = localStorage.getItem('chotu_active_location');
    if (active) {
      const parsed = JSON.parse(active);
      setLocation(parsed.address);
      setLat(parsed.lat);
      setLng(parsed.lng);
      if (parsed.lat && parsed.lng) {
        calculateTimeForCoords(parsed.lat, parsed.lng);
      }
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const selectLocation = (id: string) => {
    const target = savedLocations.find(l => l.id === id);
    if (target) {
      setLocation(target.address);
      setLat(target.lat);
      setLng(target.lng);
      localStorage.setItem('chotu_active_location', JSON.stringify(target));
      if (target.lat && target.lng) {
        calculateTimeForCoords(target.lat, target.lng);
      }
    }
  };

  const addLocation = async (label: 'Home' | 'Work' | 'Other', address: string, la?: number, ln?: number) => {
    const newLoc: SavedLocation = {
      id: Math.random().toString(36).substr(2, 9),
      label,
      address,
      lat: la || null,
      lng: ln || null
    };
    
    const phone = localStorage.getItem('chotu_merchant_phone');
    if (phone) {
      await supabase.from('customer_addresses').upsert({
        id: newLoc.id,
        phone_number: phone,
        label: newLoc.label,
        complete_address: newLoc.address,
        lat: newLoc.lat,
        lng: newLoc.lng
      });
      loadAddresses(); // Refresh from DB
    } else {
      const updated = [...savedLocations, newLoc];
      setSavedLocations(updated);
      localStorage.setItem('chotu_saved_locations', JSON.stringify(updated));
    }

    // Auto-select newly added location
    setLocation(newLoc.address);
    setLat(newLoc.lat);
    setLng(newLoc.lng);
    localStorage.setItem('chotu_active_location', JSON.stringify(newLoc));
    if (newLoc.lat && newLoc.lng) {
      calculateTimeForCoords(newLoc.lat, newLoc.lng);
    }
  };

  const useCurrentLocation = async () => {
    try {
      const coords = await getCurrentPosition();
      // Reverse geocoding could be done via Google Maps API.
      // For now, we'll just set it to a dummy string and accurate coords.
      const addressString = 'Current Location';
      setLocation(addressString);
      setLat(coords.lat);
      setLng(coords.lng);
      localStorage.setItem('chotu_active_location', JSON.stringify({ address: addressString, lat: coords.lat, lng: coords.lng }));
      calculateTimeForCoords(coords.lat, coords.lng);
    } catch (e) {
      console.error(e);
      alert('Failed to get GPS location');
    }
  };

  const deleteLocation = async (id: string) => {
    const phone = localStorage.getItem('chotu_merchant_phone');
    if (phone) {
      await supabase.from('customer_addresses').delete().eq('id', id);
      loadAddresses();
    } else {
      const updated = savedLocations.filter(l => l.id !== id);
      setSavedLocations(updated);
      localStorage.setItem('chotu_saved_locations', JSON.stringify(updated));
    }
  };

  const updateLocation = async (id: string, label: 'Home' | 'Work' | 'Other', address: string) => {
    const phone = localStorage.getItem('chotu_merchant_phone');
    const target = savedLocations.find(l => l.id === id);
    if (!target) return;
    
    const updatedLoc = { ...target, label, address };
    if (phone) {
      await supabase.from('customer_addresses').update({
        label,
        complete_address: address
      }).eq('id', id);
      loadAddresses();
    } else {
      const updated = savedLocations.map(l => l.id === id ? updatedLoc : l);
      setSavedLocations(updated);
      localStorage.setItem('chotu_saved_locations', JSON.stringify(updated));
    }

    if (location === target.address) {
      setLocation(address);
      localStorage.setItem('chotu_active_location', JSON.stringify(updatedLoc));
    }
  };

  return (
    <LocationContext.Provider value={{ location, lat, lng, deliveryTime, savedLocations, selectLocation, addLocation, deleteLocation, updateLocation, useCurrentLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be inside LocationProvider');
  return ctx;
}
