import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DeviceMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  online: boolean;
  type: 'access_point' | 'router' | 'client' | 'switch' | 'unknown';
  approximate?: boolean;
}

interface ParentLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface NetworkTopoMapProps {
  routerId: string;
  parentLocation?: ParentLocation | null;
  devices: DeviceMarker[];
  onDeviceClick?: (device: DeviceMarker) => void;
  height?: string;
}

const getDeviceIcon = (type: string, online: boolean) => {
  const getColor = () => {
    if (!online) return '#888888';
    switch (type) {
      case 'access_point':
        return '#FF6B35';
      case 'router':
        return '#004E89';
      case 'client':
        return '#1F77B4';
      case 'switch':
        return '#2CA02C';
      default:
        return '#7F7F7F';
    }
  };

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${getColor()}">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
      </svg>`
    )}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

export function NetworkTopoMap({
  routerId,
  parentLocation,
  devices,
  onDeviceClick,
  height = '500px'
}: NetworkTopoMapProps) {
  void routerId;
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const linesRef = useRef<L.Polyline[]>([]);
  const parentLatitude = parentLocation?.latitude;
  const parentLongitude = parentLocation?.longitude;
  const parentAddress = parentLocation?.address;

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    // Create map
    const map = L.map(containerRef.current, {
      zoom: 4,
      center: [20, 0]
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    // Add parent router marker if location available
    if (parentLatitude && parentLongitude) {
      const parentMarker = L.marker([parentLatitude, parentLongitude], {
        icon: L.icon({
          iconUrl: `data:image/svg+xml;base64,${btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000">
              <rect x="6" y="4" width="12" height="16" rx="2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>`
          )}`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        })
      }).addTo(map);

      parentMarker.bindPopup(
        `<strong>Main Router</strong><br>${parentAddress || 'Coordinates: ' + parentLatitude.toFixed(4) + ', ' + parentLongitude.toFixed(4)}`
      );

      // Set initial view to parent
      map.setView([parentLatitude, parentLongitude], 4);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [parentAddress, parentLatitude, parentLongitude]);

  // Update device markers
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Remove old markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current.clear();

    // Add new markers
    devices.forEach(device => {
      if (device.lat && device.lng) {
        const marker = L.marker([device.lat, device.lng], {
          icon: getDeviceIcon(device.type, device.online)
        }).addTo(map);

        marker.bindPopup(
          `<strong>${device.name || 'Unknown'}</strong><br>
           Type: ${device.type}<br>
           Status: ${device.online ? '🟢 Online' : '🔴 Offline'}<br>
           Location: ${device.approximate ? 'Approximate (near parent router)' : 'Exact'}`
        );

        marker.on('click', () => {
          onDeviceClick?.(device);
        });

        markersRef.current.set(device.id, marker);
      }
    });

    // Draw connection lines from parent to devices
    if (parentLatitude && parentLongitude) {
      linesRef.current.forEach(line => map.removeLayer(line));
      linesRef.current = [];

      devices.forEach(device => {
        if (device.lat && device.lng) {
          const line = L.polyline(
            [
              [parentLatitude, parentLongitude],
              [device.lat, device.lng]
            ],
            {
              color: device.online ? '#4CAF50' : '#CCCCCC',
              weight: device.online ? 2 : 1,
              opacity: device.online ? 0.7 : 0.3,
              dashArray: device.online ? '0' : '5, 5'
            }
          ).addTo(map);

          linesRef.current.push(line);
        }
      });
    }

    // Fit bounds to show all markers
    if (devices.length > 0 && mapRef.current) {
      const group = new L.FeatureGroup([...markersRef.current.values()]);
      if (parentLatitude && parentLongitude) {
        group.addLayer(
          L.marker([parentLatitude, parentLongitude])
        );
      }
      map.fitBounds(group.getBounds().pad(0.1), { maxZoom: 12 });
    }
  }, [devices, onDeviceClick, parentLatitude, parentLongitude]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}
    />
  );
}
