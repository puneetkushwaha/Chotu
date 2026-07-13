export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p) / 2 +
    c(lat1 * p) * c(lat2 * p) *
    (1 - c((lon2 - lon1) * p)) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

export function estimateDeliveryTime(distanceKm: number): string {
  // Speed ~ 20km/h => distance * 3 minutes.
  // Add 5 min for packing
  let mins = Math.round(distanceKm * 3) + 5;
  if (mins < 8) mins = 8;
  return `${mins} minutes`;
}

export async function getCurrentPosition(): Promise<{ lat: number, lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    }
  });
}
