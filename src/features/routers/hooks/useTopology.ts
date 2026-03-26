import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface DeviceMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  online: boolean;
  type: 'access_point' | 'router' | 'client' | 'switch' | 'unknown';
  approximate?: boolean;
}

type TopologyDeviceType = DeviceMarker['type'];

interface ConnectionStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  avgLatency: number;
  avgPacketLoss: number;
  avgBandwidth: number;
  accessPoints: number;
  routers: number;
  clients: number;
}

interface ParentLocation {
  latitude: number;
  longitude: number;
  address?: string;
  country?: string;
  city?: string;
}

interface ConnectedDevicesResponse {
  parentLocation: ParentLocation | null;
  devices: Array<{
    _id: string;
    deviceName: string;
    latitude: number;
    longitude: number;
    isOnline: boolean;
    deviceType: TopologyDeviceType;
    ipAddress: string;
    lastSeen: string;
    signal?: number;
    latency?: number;
  }>;
}

interface NetworkTopology {
  router: {
    id: string;
    name: string;
    status: string;
    location: ParentLocation | null;
  };
  connections: Array<{
    device: any;
    childRouter?: {
      id: string;
      name: string;
      status: string;
      location: ParentLocation | null;
    };
    childConnections: number;
  }>;
}

/**
 * Hook to fetch connected devices with locations
 */
export function useConnectedDevices(routerId: string) {
  return useQuery({
    queryKey: ['connected-devices', routerId],
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: ConnectedDevicesResponse }>(
        `/api/admin/routers/${routerId}/topology/devices`
      );
      return data.data;
    },
    enabled: !!routerId,
    staleTime: 30000 // 30 seconds
  });
}

/**
 * Hook to fetch network topology (multi-level)
 */
export function useNetworkTopology(routerId: string) {
  return useQuery({
    queryKey: ['network-topology', routerId],
    queryFn: async () => {
      const { data } = await axios.get<{ data: NetworkTopology }>(
        `/api/admin/routers/${routerId}/topology/network`
      );
      return data.data;
    },
    enabled: !!routerId,
    staleTime: 30000
  });
}

/**
 * Hook to fetch connection statistics
 */
export function useConnectionStats(routerId: string) {
  return useQuery({
    queryKey: ['connection-stats', routerId],
    queryFn: async () => {
      const { data } = await axios.get<{ data: ConnectionStats }>(
        `/api/admin/routers/${routerId}/topology/stats`
      );
      return data.data;
    },
    enabled: !!routerId,
    staleTime: 30000,
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });
}

/**
 * Hook to fetch device clusters (optimized for map)
 */
export function useDeviceClusters(routerId: string, zoom: number = 4) {
  return useQuery({
    queryKey: ['device-clusters', routerId, zoom],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/admin/routers/${routerId}/topology/clusters?zoom=${zoom}`
      );
      return data.data;
    },
    enabled: !!routerId,
    staleTime: 60000
  });
}

/**
 * Transform connected devices to map marker format
 */
export function isRenderableRouterDevice(device: { deviceType?: string; latitude?: number; longitude?: number }) {
  return device.deviceType === 'router';
}

function buildApproximateCoordinates(index: number, parentLocation?: ParentLocation | null) {
  if (!parentLocation?.latitude || !parentLocation?.longitude) {
    return null;
  }

  const angle = (index % 8) * (Math.PI / 4);
  const radius = 0.01 + Math.floor(index / 8) * 0.004;

  return {
    lat: parentLocation.latitude + Math.sin(angle) * radius,
    lng: parentLocation.longitude + Math.cos(angle) * radius
  };
}

export function transformDevicesToMarkers(
  devices: Array<ConnectedDevicesResponse['devices'][number]>,
  parentLocation?: ParentLocation | null
): DeviceMarker[] {
  const markers: Array<DeviceMarker | null> = devices
    .filter(isRenderableRouterDevice)
    .map((d, index) => {
      const fallbackCoordinates = buildApproximateCoordinates(index, parentLocation);
      const lat = d.latitude ?? fallbackCoordinates?.lat;
      const lng = d.longitude ?? fallbackCoordinates?.lng;

      if (lat === undefined || lat === null || lng === undefined || lng === null) {
        return null;
      }

      return {
        id: d._id,
        name: d.deviceName || d.ipAddress,
        lat,
        lng,
        online: d.isOnline,
        type: d.deviceType || 'unknown',
        approximate: !(d.latitude && d.longitude)
      };
    });

  return markers.filter((device): device is DeviceMarker => device !== null);
}

/**
 * Trigger device discovery on a router
 */
export async function discoverRouterDevices(routerId: string) {
  const { data } = await axios.post(
    `/api/admin/routers/${routerId}/topology/discover`
  );
  return data;
}
export type { ConnectedDevicesResponse, NetworkTopology, ConnectionStats, DeviceMarker, TopologyDeviceType };
