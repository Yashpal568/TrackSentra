import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CheckpointMapProps {
  checkpoints: any[];
}

export const CheckpointMap: React.FC<CheckpointMapProps> = ({ checkpoints }) => {
  const validCheckpoints = checkpoints.filter(cp => cp.latitude && cp.longitude);
  
  if (validCheckpoints.length === 0) {
    return (
      <div className="w-full h-64 bg-surface-card rounded-lg border border-border-subtle flex items-center justify-center text-text-muted">
        No checkpoints with valid GPS coordinates to display.
      </div>
    );
  }

  // Calculate bounds or center
  const center: [number, number] = [
    validCheckpoints.reduce((sum, cp) => sum + cp.latitude, 0) / validCheckpoints.length,
    validCheckpoints.reduce((sum, cp) => sum + cp.longitude, 0) / validCheckpoints.length,
  ];

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-border-subtle shadow-sm z-0 relative">
      <MapContainer center={center} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validCheckpoints.map(cp => (
          <React.Fragment key={cp._id}>
            <Marker position={[cp.latitude, cp.longitude]}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm">{cp.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Status: {cp.installationStatus}</p>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[cp.latitude, cp.longitude]} 
              radius={cp.radius || 50} 
              pathOptions={{ 
                color: cp.installationStatus === 'active' ? '#10B981' : '#F59E0B', 
                fillColor: cp.installationStatus === 'active' ? '#10B981' : '#F59E0B', 
                fillOpacity: 0.2 
              }} 
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};
