import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { AxiosError } from 'axios';

interface DeviceMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  online: boolean;
  type: 'access_point' | 'router' | 'client' | 'switch' | 'unknown';
}

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
  switches: number;
  unknown: number;
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
    deviceType: string;
    ipAddress: string;
    lastSeen: string;
    classificationConfidence?: number;
    classificationEvidence?: string[];
    interfaceName?: string;
    macAddress?: string;
    manufacturer?: string;
    model?: string;
    bandwidth?: number;
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.error || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

/**
 * Hook to fetch connected devices with locations
 */
export function useConnectedDevices(routerId: string) {
  return useQuery({
    queryKey: ['connected-devices', routerId],
    queryFn: async (): Promise<ConnectedDevicesResponse> => {
      try {
        const response = await apiClient.get(endpoints.admin.routerTopologyDevices(routerId));
        if (response.data?.data) {
          return response.data.data;
        }
        throw new Error('Topology device response was empty');
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Failed to fetch connected devices'));
      }
    },
    enabled: !!routerId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch network topology (multi-level)
 */
export function useNetworkTopology(routerId: string) {
  return useQuery({
    queryKey: ['network-topology', routerId],
    queryFn: async (): Promise<NetworkTopology> => {
      try {
        const response = await apiClient.get(endpoints.admin.routerTopologyNetwork(routerId));
        if (response.data?.data) {
          return response.data.data;
        }
        throw new Error('Network topology response was empty');
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Failed to fetch network topology'));
      }
    },
    enabled: !!routerId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch connection statistics
 */
export function useConnectionStats(routerId: string) {
  return useQuery({
    queryKey: ['connection-stats', routerId],
    queryFn: async (): Promise<ConnectionStats> => {
      try {
        const response = await apiClient.get(endpoints.admin.routerTopologyStats(routerId));
        if (response.data?.data) {
          return response.data.data;
        }
        throw new Error('Connection stats response was empty');
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Failed to fetch connection stats'));
      }
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
    queryFn: async (): Promise<any[]> => {
      try {
        const response = await apiClient.get(endpoints.admin.routerTopologyClusters(routerId, zoom));
        if (response.data?.data) {
          return response.data.data;
        }
        throw new Error('Device cluster response was empty');
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Failed to fetch device clusters'));
      }
    },
    enabled: !!routerId,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Transform connected devices to map marker format
 */
export function transformDevicesToMarkers(devices: any[], parentLocation: ParentLocation | null | undefined): DeviceMarker[] {
  return devices
    .filter(d => d.latitude && d.longitude)
    .map(d => ({
      id: d._id,
      name: d.deviceName || d.ipAddress,
      lat: d.latitude,
      lng: d.longitude,
      online: d.isOnline,
      type: d.deviceType || 'unknown'
    }));
}

/**
 * Trigger device discovery on a router
 */
export async function discoverRouterDevices(routerId: string, options?: { timeoutMs?: number; sources?: string[] }) {
  try {
    const response = await apiClient.post(endpoints.admin.routerTopologyDiscover(routerId), options || {});
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Topology discovery failed'));
  }
}


export type { ConnectedDevicesResponse, NetworkTopology, ConnectionStats, DeviceMarker };
