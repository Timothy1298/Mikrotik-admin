import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { SectionLoader } from '@/components/feedback/SectionLoader';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { useConnectedDevices, useConnectionStats, transformDevicesToMarkers, discoverRouterDevices } from '@/features/routers/hooks/useTopology';
import { NetworkTopoMap } from './NetworkTopoMap';

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

const deviceTypeTabs = [
  { label: 'All Devices', value: 'all' },
  { label: 'Routers', value: 'router' },
  { label: 'Access Points', value: 'access_point' },
  { label: 'Switches', value: 'switch' },
  { label: 'Clients', value: 'client' },
  { label: 'Unknown', value: 'unknown' },
];

export function NetworkTopologyViewer({ routerId }: NetworkTopologyViewerProps) {
  const devicesQuery = useConnectedDevices(routerId);
  const statsQuery = useConnectionStats(routerId);
  const queryClient = useQueryClient();
  const [selectedDevice, setSelectedDevice] = useState<SelectedDevice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('all');
  const [isDiscovering, setIsDiscovering] = useState(false);

  const devices = devicesQuery.data?.devices || [];
  const parentLocation = devicesQuery.data?.parentLocation;
  const stats = statsQuery.data;

  const filteredByType = deviceTypeFilter === 'all'
    ? devices
    : devices.filter((device: any) => device.deviceType === deviceTypeFilter);
  const markers = transformDevicesToMarkers(filteredByType, parentLocation);
  const filteredDevices = filteredByType.filter((device: any) => {
    const query = searchTerm.toLowerCase();
    return (
      !query ||
      device.deviceName?.toLowerCase().includes(query) ||
      device.ipAddress?.includes(searchTerm) ||
      device.macAddress?.toLowerCase().includes(query)
    );
  });

  const handleDeviceClick = (device: SelectedDevice) => {
    const fullDevice = devices.find((item: any) => item._id === device.id);
    setSelectedDevice(fullDevice ? { ...device, ...fullDevice } : device);
  };

  const handleDiscoverDevices = async () => {
    try {
      setIsDiscovering(true);
      toast.loading('Scanning router for connected devices...', { id: 'discovery' });
      const result = await discoverRouterDevices(routerId, { timeoutMs: 3500 });
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
    } finally {
      setIsDiscovering(false);
    }
  };

  if (devicesQuery.isLoading || statsQuery.isLoading) {
    return <SectionLoader />;
  }

  if (devicesQuery.isError) {
    return (
      <ErrorState
        title="Unable to load discovered devices"
        description={devicesQuery.error instanceof Error ? devicesQuery.error.message : 'The topology device inventory could not be loaded.'}
        onAction={() => void devicesQuery.refetch()}
      />
    );
  }

  if (statsQuery.isError) {
    return (
      <ErrorState
        title="Unable to load topology statistics"
        description={statsQuery.error instanceof Error ? statsQuery.error.message : 'The topology statistics endpoint could not be loaded.'}
        onAction={() => void statsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Discovered Devices</CardTitle>
            </CardHeader>
            <div className="text-2xl font-bold">{stats.totalDevices}</div>
            <p className="mt-1 text-xs text-text-muted">
              {stats.onlineDevices} online • {stats.offlineDevices} offline
            </p>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Infrastructure Mix</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">{stats.routers} RT</Badge>
              <Badge tone="warning">{stats.accessPoints} AP</Badge>
              <Badge tone="success">{stats.switches} SW</Badge>
              <Badge tone="neutral">{stats.clients} Clients</Badge>
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            </CardHeader>
            <div className="text-2xl font-bold">{stats.avgLatency?.toFixed(1) || '—'}ms</div>
            <p className="mt-1 text-xs text-text-muted">
              Packet loss: {stats.avgPacketLoss?.toFixed(1) || 0}%
            </p>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            </CardHeader>
            <div className="text-2xl font-bold">{stats.unknown}</div>
            <p className="mt-1 text-xs text-text-muted">
              Unknown devices still need stronger evidence or manual confirmation
            </p>
          </Card>
        </div>
      ) : null}

      <Tabs tabs={deviceTypeTabs} value={deviceTypeFilter} onChange={setDeviceTypeFilter} />

      <Card>
        <CardHeader>
          <CardTitle>Network Map</CardTitle>
          <CardDescription>
            Discovery map for the selected device class. This currently shows discovered inventory and approximate parent relationships, not a fully validated cable graph.
          </CardDescription>
        </CardHeader>
        <div className="p-4">
          {markers.length === 0 ? (
            <div className="flex h-96 items-center justify-center rounded-lg bg-background-panel">
              <p className="text-text-muted">
                No {deviceTypeFilter === 'all' ? 'devices' : deviceTypeFilter.replace('_', ' ')} with coordinates are available yet.
              </p>
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
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Discovered Inventory</CardTitle>
                  <CardDescription>
                    {filteredByType.length} {deviceTypeFilter === 'all' ? 'devices' : `${deviceTypeFilter.replace('_', ' ')} devices`} in the current view
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDiscoverDevices}
                  isLoading={isDiscovering}
                >
                  Discover Devices
                </Button>
              </div>
            </CardHeader>
            <div className="space-y-3 p-4">
              <Input
                placeholder="Search by name, IP, or MAC..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              {filteredDevices.length > 0 ? (
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {filteredDevices.map((device: any) => (
                    <div
                      key={device._id}
                      className={`cursor-pointer rounded-lg border p-3 transition ${
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
                        type: device.deviceType,
                      })}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-medium">{device.deviceName || device.ipAddress}</p>
                          <p className="text-sm text-text-muted">
                            {device.ipAddress}
                            {device.deviceType ? ` • ${device.deviceType}` : ''}
                          </p>
                        </div>
                        <Badge tone={device.isOnline ? 'success' : 'warning'}>
                          {device.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                      {device.latitude && device.longitude ? (
                        <p className="mt-1 text-sm text-text-muted">
                          {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
                        </p>
                      ) : null}
                      {device.lastSeen ? (
                        <p className="text-sm text-text-muted">
                          Last seen: {new Date(device.lastSeen).toLocaleString()}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {typeof device.classificationConfidence === 'number' ? (
                          <Badge tone={device.classificationConfidence >= 80 ? 'success' : device.classificationConfidence >= 60 ? 'info' : 'warning'}>
                            Confidence {device.classificationConfidence}%
                          </Badge>
                        ) : null}
                        {Array.isArray(device.classificationEvidence) && device.classificationEvidence.length ? (
                          <Badge tone="neutral">{String(device.classificationEvidence[0]).replace(/_/g, ' ')}</Badge>
                        ) : null}
                        {device.interfaceName ? <Badge tone="neutral">{device.interfaceName}</Badge> : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-text-muted">
                  {searchTerm ? 'No devices match your search' : 'No devices found in this view'}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Device Details</CardTitle>
              <CardDescription>
                {selectedDevice ? 'Selected device information' : 'Click a device to view details'}
              </CardDescription>
            </CardHeader>
            {selectedDevice ? (
              <div className="space-y-4 p-4">
                <div>
                  <p className="text-xs uppercase text-text-muted">Name</p>
                  <p className="font-medium">{selectedDevice.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-text-muted">Type</p>
                  <Badge tone="neutral">{selectedDevice.type}</Badge>
                </div>
                {(selectedDevice as any).classificationConfidence !== undefined ? (
                  <div>
                    <p className="text-xs uppercase text-text-muted">Classification confidence</p>
                    <p>{(selectedDevice as any).classificationConfidence}%</p>
                  </div>
                ) : null}
                {Array.isArray((selectedDevice as any).classificationEvidence) && (selectedDevice as any).classificationEvidence.length ? (
                  <div>
                    <p className="text-xs uppercase text-text-muted">Evidence</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedDevice as any).classificationEvidence.map((item: string) => (
                        <Badge key={item} tone="neutral">{item.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs uppercase text-text-muted">Status</p>
                  <Badge tone={selectedDevice.online ? 'success' : 'warning'}>
                    {selectedDevice.online ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs uppercase text-text-muted">Location</p>
                  {selectedDevice.lat && selectedDevice.lng ? (
                    <p className="font-mono text-sm">
                      {selectedDevice.lat.toFixed(4)}, {selectedDevice.lng.toFixed(4)}
                    </p>
                  ) : (
                    <p className="text-text-muted">Not available</p>
                  )}
                </div>
                {(selectedDevice as any).macAddress ? (
                  <div>
                    <p className="text-xs uppercase text-text-muted">MAC</p>
                    <p className="font-mono text-sm">{(selectedDevice as any).macAddress}</p>
                  </div>
                ) : null}
                {(selectedDevice as any).manufacturer || (selectedDevice as any).model ? (
                  <div>
                    <p className="text-xs uppercase text-text-muted">Hardware</p>
                    <p>{[(selectedDevice as any).manufacturer, (selectedDevice as any).model].filter(Boolean).join(' • ')}</p>
                  </div>
                ) : null}
                {(selectedDevice as any).latency ? (
                  <div>
                    <p className="text-xs uppercase text-text-muted">Latency</p>
                    <p>{(selectedDevice as any).latency}ms</p>
                  </div>
                ) : null}
                {(selectedDevice as any).bandwidth ? (
                  <div>
                    <p className="text-xs uppercase text-text-muted">Bandwidth</p>
                    <p>{(selectedDevice as any).bandwidth}Mbps</p>
                  </div>
                ) : null}

                <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedDevice(null)}>
                  Clear Selection
                </Button>
              </div>
            ) : (
              <div className="p-4 py-8 text-center text-sm text-text-muted">
                Select a device from the list to view detailed information
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
