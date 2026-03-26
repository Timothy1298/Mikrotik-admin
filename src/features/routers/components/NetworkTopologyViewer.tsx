import React, { useState } from 'react';
import { useConnectedDevices, useConnectionStats, transformDevicesToMarkers, discoverRouterDevices } from '@/features/routers/hooks/useTopology';
import { NetworkTopoMap } from './NetworkTopoMap';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatBytes } from '@/lib/formatters/bytes';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface NetworkTopologyViewerProps {
  routerId: string;
}

interface SelectedDevice {
  id: string;
  name: string;
  lat: number;
  lng: number;
  online: boolean;
  type: string;
}

export function NetworkTopologyViewer({ routerId }: NetworkTopologyViewerProps) {
  const devicesQuery = useConnectedDevices(routerId);
  const statsQuery = useConnectionStats(routerId);
  const queryClient = useQueryClient();
  const [selectedDevice, setSelectedDevice] = useState<SelectedDevice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);

  const devices = devicesQuery.data?.devices || [];
  const parentLocation = devicesQuery.data?.parentLocation;
  const stats = statsQuery.data;

  const routerDevices = devices.filter((device: any) => device.deviceType === 'router');
  const hiddenClientCount = Math.max(0, devices.length - routerDevices.length);
  const markers = transformDevicesToMarkers(routerDevices, parentLocation);
  const filteredDevices = routerDevices.filter((d: any) =>
    d.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.ipAddress?.includes(searchTerm)
  );

  const handleDeviceClick = (device: SelectedDevice) => {
    const fullDevice = routerDevices.find((d: any) => d._id === device.id);
    setSelectedDevice(fullDevice ? { ...device, ...fullDevice } : device);
  };

  const handleDiscoverDevices = async () => {
    try {
      setIsDiscovering(true);
      toast.loading('Scanning router for connected devices...', { id: 'discovery' });
      const result = await discoverRouterDevices(routerId);
      // Refetch devices after discovery
      await queryClient.invalidateQueries({ queryKey: ['connected-devices', routerId] });
      await queryClient.invalidateQueries({ queryKey: ['connection-stats', routerId] });
      const status = result?.data?.status;
      if (status === 'partial') {
        toast.warning('Device discovery completed with warnings. Some probes failed.', { id: 'discovery' });
      } else {
        toast.success('Device discovery completed. Devices updated.', { id: 'discovery' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Device discovery failed. Please check your router connection and try again.';
      toast.error(errorMessage, { id: 'discovery' });
      console.error('Discovery error:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Discovered Routers</CardTitle>
            </CardHeader>
            <div className="text-2xl font-bold">{routerDevices.length}</div>
            <p className="text-xs text-text-muted mt-1">
              {routerDevices.filter((device: any) => device.isOnline).length} online • {routerDevices.filter((device: any) => !device.isOnline).length} offline
            </p>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Topology Scope</CardTitle>
            </CardHeader>
            <div className="flex gap-2">
              <Badge tone="info">{routerDevices.length} RT</Badge>
              {hiddenClientCount > 0 ? <Badge tone="neutral">{hiddenClientCount} hidden clients</Badge> : null}
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            </CardHeader>
            <div className="text-2xl font-bold">{stats.avgLatency?.toFixed(1) || '—'}ms</div>
            <p className="text-xs text-text-muted mt-1">
              Packet loss: {stats.avgPacketLoss?.toFixed(1) || 0}%
            </p>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Bandwidth</CardTitle>
            </CardHeader>
            <div className="text-2xl font-bold">{stats.avgBandwidth?.toFixed(1) || '—'}Mbps</div>
          </Card>
        </div>
      )}

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Network Map</CardTitle>
          <CardDescription>Only downstream routers are shown here. End-user clients stay in Hotspot, PPPoE, and other client views.</CardDescription>
        </CardHeader>
        <div className="p-4">
          {devicesQuery.isLoading ? (
            <div className="flex items-center justify-center h-96 bg-background-panel rounded-lg">
              <p className="text-text-muted">Loading map...</p>
            </div>
          ) : markers.length === 0 ? (
            <div className="flex items-center justify-center h-96 bg-background-panel rounded-lg">
              <p className="text-text-muted">No router nodes with coordinates available yet.</p>
            </div>
          ) : (
            <NetworkTopoMap
              routerId={routerId}
              parentLocation={parentLocation}
              devices={markers}
              onDeviceClick={handleDeviceClick}
              height="500px"
            />
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Device List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Discovered Routers</CardTitle>
                  <CardDescription>{routerDevices.length} routers found{hiddenClientCount > 0 ? ` • ${hiddenClientCount} clients hidden` : ''}</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDiscoverDevices}
                  disabled={isDiscovering}
                >
                  {isDiscovering ? 'Discovering...' : 'Discover Devices'}
                </Button>
              </div>
            </CardHeader>
            <div className="p-4 space-y-3">
              <Input
                placeholder="Search routers by name or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {devicesQuery.isLoading ? (
                <div className="text-center py-8 text-text-muted">Loading routers...</div>
              ) : filteredDevices.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredDevices.map((device: any) => (
                    <div
                      key={device._id}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        selectedDevice?.id === device._id
                          ? 'border-primary-500 bg-primary-500/5'
                          : 'border-background-border hover:border-primary-400'
                      }`}
                      onClick={() => handleDeviceClick({
                        id: device._id,
                        name: device.deviceName,
                        lat: device.latitude,
                        lng: device.longitude,
                        online: device.isOnline,
                        type: device.deviceType
                      })}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium truncate">{device.deviceName || device.ipAddress}</p>
                          <p className="text-sm text-text-muted">
                            {device.ipAddress}
                            {device.deviceType && ` • ${device.deviceType}`}
                          </p>
                        </div>
                        <Badge tone={device.isOnline ? 'success' : 'warning'}>
                          {device.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                      {device.latitude && device.longitude && (
                        <p className="text-sm text-text-muted mt-1">
                          📍 {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
                        </p>
                      )}
                      {device.lastSeen && (
                        <p className="text-sm text-text-muted">
                          Last seen: {new Date(device.lastSeen).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted">
                  {searchTerm ? 'No routers match your search' : 'No downstream routers found'}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Device Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Device Details</CardTitle>
              <CardDescription>
                {selectedDevice ? 'Selected device information' : 'Click a device to view details'}
              </CardDescription>
            </CardHeader>
            {selectedDevice ? (
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-text-muted uppercase">Name</p>
                  <p className="font-medium">{selectedDevice.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase">Type</p>
                  <Badge tone="neutral">{selectedDevice.type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase">Status</p>
                  <Badge tone={selectedDevice.online ? 'success' : 'warning'}>
                    {selectedDevice.online ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase">Location</p>
                  {selectedDevice.lat && selectedDevice.lng ? (
                    <p className="font-mono text-sm">
                      {selectedDevice.lat.toFixed(4)}, {selectedDevice.lng.toFixed(4)}
                    </p>
                  ) : (
                    <p className="text-text-muted">Not available</p>
                  )}
                </div>

                {(selectedDevice as any).latency && (
                  <div>
                    <p className="text-xs text-text-muted uppercase">Latency</p>
                    <p>{(selectedDevice as any).latency}ms</p>
                  </div>
                )}

                {(selectedDevice as any).bandwidth && (
                  <div>
                    <p className="text-xs text-text-muted uppercase">Bandwidth</p>
                    <p>{(selectedDevice as any).bandwidth}Mbps</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedDevice(null)}
                >
                  Clear Selection
                </Button>
              </div>
            ) : (
              <div className="p-4 text-center text-text-muted text-sm py-8">
                Select a device from the list to view detailed information
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
