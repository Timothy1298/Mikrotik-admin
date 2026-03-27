import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { env } from '@/config/env';

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

const apiBaseUrl = env.apiBaseUrl?.replace(/\/+$/, '') || 'http://localhost:5000';

function getAbsoluteApiUrl(path: string) {
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${apiBaseUrl}${sanitizedPath}`;
  console.debug('[Topology] getAbsoluteApiUrl', { path, apiBaseUrl, url });
  return url;
}

/**
 * Hook to fetch connected devices with locations
 */
export function useConnectedDevices(routerId: string) {
  return useQuery({
    queryKey: ['connected-devices', routerId],
    queryFn: async (): Promise<ConnectedDevicesResponse> => {
      try {
        const url = getAbsoluteApiUrl(endpoints.admin.routerTopologyDevices(routerId));
        const response = await apiClient.get(url);
        const responseData = response.data;
        if (responseData && responseData.data) {
          return responseData.data;
        }
        return { parentLocation: null, devices: [] };
      } catch (error) {
        console.error('Failed to fetch connected devices:', error);
        return { parentLocation: null, devices: [] };
      }
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
    queryFn: async (): Promise<NetworkTopology> => {
      try {
        const url = getAbsoluteApiUrl(endpoints.admin.routerTopologyNetwork(routerId));
        const response = await apiClient.get(url);
        const responseData = response.data;
        if (responseData && responseData.data) {
          return responseData.data;
        }
        return { router: { id: routerId, name: '', status: '', location: null }, connections: [] };
      } catch (error) {
        console.error('Failed to fetch network topology:', error);
        return { router: { id: routerId, name: '', status: '', location: null }, connections: [] };
      }
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
    queryFn: async (): Promise<ConnectionStats> => {
      try {
        const url = getAbsoluteApiUrl(endpoints.admin.routerTopologyStats(routerId));
        const response = await apiClient.get(url);
        const responseData = response.data;
        if (responseData && responseData.data) {
          return responseData.data;
        }
        return {
          totalDevices: 0,
          onlineDevices: 0,
          offlineDevices: 0,
          avgLatency: 0,
          avgPacketLoss: 0,
          avgBandwidth: 0,
          accessPoints: 0,
          routers: 0,
          clients: 0,
        };
      } catch (error) {
        console.error('Failed to fetch connection stats:', error);
        return {
          totalDevices: 0,
          onlineDevices: 0,
          offlineDevices: 0,
          avgLatency: 0,
          avgPacketLoss: 0,
          avgBandwidth: 0,
          accessPoints: 0,
          routers: 0,
          clients: 0,
        };
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
        const url = getAbsoluteApiUrl(endpoints.admin.routerTopologyClusters(routerId, zoom));
        const response = await apiClient.get(url);
        const responseData = response.data;
        if (responseData && responseData.data) {
          return responseData.data;
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch device clusters:', error);
        return [];
      }
    },
    enabled: !!routerId,
    staleTime: 60000
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
export async function discoverRouterDevices(routerId: string) {
  const route = endpoints.admin.routerTopologyDiscover(routerId);
  const fullUrl = getAbsoluteApiUrl(route);

  console.debug('[Topology] discoverRouterDevices', { route, fullUrl, baseURL: apiClient.defaults.baseURL });

  const response = await fetch(fullUrl, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Topology discovery failed ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data;
}


export type { ConnectedDevicesResponse, NetworkTopology, ConnectionStats, DeviceMarker };
