import { useState, useCallback } from 'react';

interface BluetoothDevice extends globalThis.BluetoothDevice {}

interface HealthData {
  heartRate: number;
  spO2: number;
  respiration: number;
  timestamp: number;
}

export const useBluetooth = () => {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [connected, setConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);

  const scanForDevices = useCallback(async () => {
    if (!navigator.bluetooth) {
      throw new Error('Bluetooth not supported in this browser');
    }

    setScanning(true);
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'ESP32' },
          { namePrefix: 'COPD' },
          { namePrefix: 'Health' }
        ],
        optionalServices: ['battery_service', 'heart_rate']
      });

      setDevice(device);
      await connectToDevice(device);
    } catch (error) {
      console.error('Bluetooth scan error:', error);
      throw error;
    } finally {
      setScanning(false);
    }
  }, []);

  const connectToDevice = useCallback(async (bluetoothDevice: BluetoothDevice) => {
    try {
      const server = await bluetoothDevice.gatt?.connect();
      if (server) {
        setConnected(true);
        startDataStream(server);
      }
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }, []);

  const startDataStream = useCallback(async (server: BluetoothRemoteGATTServer) => {
    try {
      // Get the service and characteristic for health data
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      
      // Listen for data
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (value) {
          // Parse the incoming data based on your ESP32 format
          const data = parseHealthData(value);
          setHealthData(data);
        }
      });
    } catch (error) {
      console.error('Data stream error:', error);
    }
  }, []);

  const parseHealthData = (dataView: DataView): HealthData => {
    // Parse based on your ESP32 data format
    // This is a placeholder - adjust based on your actual data structure
    return {
      heartRate: dataView.getUint8(0),
      spO2: dataView.getUint8(1),
      respiration: dataView.getUint8(2),
      timestamp: Date.now()
    };
  };

  const disconnect = useCallback(() => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    setConnected(false);
    setDevice(null);
    setHealthData(null);
  }, [device]);

  return {
    device,
    connected,
    scanning,
    healthData,
    scanForDevices,
    disconnect
  };
};