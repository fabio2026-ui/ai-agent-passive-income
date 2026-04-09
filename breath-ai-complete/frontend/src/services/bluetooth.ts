import type { HeartRateData, BiometricSession } from '@shared/types';
import { HEART_RATE_SERVICE_UUID, HEART_RATE_MEASUREMENT_UUID } from '@shared/types';

export class HeartRateMonitor {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private readings: HeartRateData[] = [];
  private sessionStartTime: number = 0;
  private onDataCallback: ((data: HeartRateData) => void) | null = null;
  private rrIntervals: number[] = [];

  async requestDevice(): Promise<BluetoothDevice> {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [HEART_RATE_SERVICE_UUID] },
          { namePrefix: 'Apple Watch' },
          { namePrefix: 'Polar' },
          { namePrefix: 'WHOOP' },
          { namePrefix: 'Garmin' },
          { namePrefix: 'Fitbit' },
        ],
        optionalServices: [HEART_RATE_SERVICE_UUID]
      });
      
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnect.bind(this));
      return this.device;
    } catch (error) {
      console.error('Bluetooth device request failed:', error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    if (!this.device) {
      throw new Error('No device selected. Call requestDevice() first.');
    }

    try {
      this.server = await this.device.gatt!.connect();
      const service = await this.server.getPrimaryService(HEART_RATE_SERVICE_UUID);
      this.characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT_UUID);
      
      // Start notifications
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateData.bind(this));
      
      this.sessionStartTime = Date.now();
      this.readings = [];
      this.rrIntervals = [];
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      throw error;
    }
  }

  private handleHeartRateData(event: Event): void {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return;

    const flags = value.getUint8(0);
    const heartRateFormat = flags & 0x01; // 0 = 8-bit, 1 = 16-bit
    const sensorContact = (flags >> 1) & 0x03;
    const energyExpended = (flags >> 3) & 0x01;
    const rrIntervalPresent = (flags >> 4) & 0x01;

    let offset = 1;
    let heartRate: number;

    if (heartRateFormat === 0) {
      heartRate = value.getUint8(offset);
      offset += 1;
    } else {
      heartRate = value.getUint16(offset, true);
      offset += 2;
    }

    // Skip energy expended if present
    if (energyExpended) {
      offset += 2;
    }

    // Extract RR intervals for HRV calculation
    const rrIntervals: number[] = [];
    if (rrIntervalPresent) {
      while (offset + 1 < value.byteLength) {
        const rr = value.getUint16(offset, true);
        rrIntervals.push(rr / 1024 * 1000); // Convert to milliseconds
        offset += 2;
      }
    }

    // Calculate HRV (RMSSD - Root Mean Square of Successive Differences)
    let hrv: number | undefined;
    if (rrIntervals.length >= 2) {
      this.rrIntervals.push(...rrIntervals);
      // Keep last 30 intervals for HRV calculation
      if (this.rrIntervals.length > 30) {
        this.rrIntervals = this.rrIntervals.slice(-30);
      }
      hrv = this.calculateRMSSD(this.rrIntervals);
    }

    const data: HeartRateData = {
      timestamp: Date.now(),
      heartRate,
      hrv
    };

    this.readings.push(data);
    
    if (this.onDataCallback) {
      this.onDataCallback(data);
    }
  }

  private calculateRMSSD(intervals: number[]): number {
    if (intervals.length < 2) return 0;
    
    let sumSquaredDiff = 0;
    let count = 0;
    
    for (let i = 1; i < intervals.length; i++) {
      const diff = intervals[i] - intervals[i - 1];
      sumSquaredDiff += diff * diff;
      count++;
    }
    
    return Math.sqrt(sumSquaredDiff / count);
  }

  private handleDisconnect(event: Event): void {
    console.log('Device disconnected:', event);
    this.cleanup();
  }

  onData(callback: (data: HeartRateData) => void): void {
    this.onDataCallback = callback;
  }

  getSessionData(): BiometricSession {
    const now = Date.now();
    const validReadings = this.readings.filter(r => r.hrv !== undefined);
    
    return {
      id: crypto.randomUUID(),
      userId: '', // Will be set by caller
      startTime: this.sessionStartTime,
      endTime: now,
      heartRateReadings: this.readings,
      averageHeartRate: this.readings.length > 0 
        ? this.readings.reduce((sum, r) => sum + r.heartRate, 0) / this.readings.length 
        : 0,
      averageHRV: validReadings.length > 0
        ? validReadings.reduce((sum, r) => sum + (r.hrv || 0), 0) / validReadings.length
        : 0,
      stressLevel: this.calculateStressLevel()
    };
  }

  private calculateStressLevel(): 'low' | 'medium' | 'high' {
    if (this.readings.length < 5) return 'low';
    
    const recentReadings = this.readings.slice(-10);
    const avgHR = recentReadings.reduce((sum, r) => sum + r.heartRate, 0) / recentReadings.length;
    const validHRV = recentReadings.filter(r => r.hrv !== undefined).map(r => r.hrv!);
    const avgHRV = validHRV.length > 0 ? validHRV.reduce((a, b) => a + b, 0) / validHRV.length : 50;
    
    // Higher HR + lower HRV = higher stress
    if (avgHR > 90 && avgHRV < 30) return 'high';
    if (avgHR > 75 || avgHRV < 40) return 'medium';
    return 'low';
  }

  async disconnect(): Promise<void> {
    if (this.characteristic) {
      try {
        await this.characteristic.stopNotifications();
      } catch (e) {
        console.warn('Failed to stop notifications:', e);
      }
    }
    
    if (this.server?.connected) {
      this.server.disconnect();
    }
    
    this.cleanup();
  }

  private cleanup(): void {
    this.characteristic = null;
    this.server = null;
    this.onDataCallback = null;
  }

  isConnected(): boolean {
    return !!(this.server?.connected && this.characteristic);
  }

  getDeviceName(): string | undefined {
    return this.device?.name;
  }
}

// Singleton instance
export const heartRateMonitor = new HeartRateMonitor();
