import SimplePeer from 'simple-peer';
import type { DuoSession, BreathingPattern, PeerSignal } from '@shared/types';

interface DuoCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
  onData: (data: DuoData) => void;
  onError: (error: Error) => void;
}

interface DuoData {
  type: 'breath-phase' | 'heartbeat' | 'session-start' | 'session-end' | 'chat';
  payload: unknown;
  timestamp: number;
}

// WebRTC configuration for STUN/TURN servers
const iceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

// In production, add TURN servers for better connectivity
// { 
//   urls: 'turn:your-turn-server.com:3478',
//   username: 'user',
//   credential: 'pass'
// }

export class DuoSyncManager {
  private peer: SimplePeer.Instance | null = null;
  private sessionId: string | null = null;
  private isHost: boolean = false;
  private callbacks: DuoCallbacks | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  async createSession(
    userId: string, 
    callbacks: DuoCallbacks
  ): Promise<{ sessionId: string; inviteCode: string }> {
    this.isHost = true;
    this.callbacks = callbacks;
    
    // Generate session ID and invite code
    this.sessionId = crypto.randomUUID();
    const inviteCode = this.generateInviteCode();
    
    // Create peer as initiator (host)
    this.peer = new SimplePeer({
      initiator: true,
      trickle: false,
      config: { iceServers }
    });

    this.setupPeerListeners();
    
    // Store session in backend (via API call)
    await this.registerSession(this.sessionId, userId, inviteCode);
    
    return { sessionId: this.sessionId, inviteCode };
  }

  async joinSession(
    inviteCode: string, 
    userId: string,
    callbacks: DuoCallbacks
  ): Promise<void> {
    this.isHost = false;
    this.callbacks = callbacks;
    
    // Get session info from backend
    const session = await this.getSessionByInviteCode(inviteCode);
    if (!session) {
      throw new Error('Invalid invite code');
    }
    
    this.sessionId = session.id;
    
    // Create peer as receiver (guest)
    this.peer = new SimplePeer({
      initiator: false,
      trickle: false,
      config: { iceServers }
    });

    this.setupPeerListeners();
    
    // Join session on backend
    await this.joinSessionApi(session.id, userId);
  }

  private setupPeerListeners(): void {
    if (!this.peer) return;

    this.peer.on('signal', (data) => {
      // Send signal data to signaling server
      this.sendSignal({
        type: data.type === 'offer' ? 'offer' : data.type === 'answer' ? 'answer' : 'candidate',
        sdp: data.sdp,
        candidate: data.candidate,
        sessionId: this.sessionId!
      });
    });

    this.peer.on('connect', () => {
      this.reconnectAttempts = 0;
      this.callbacks?.onConnect();
    });

    this.peer.on('data', (data) => {
      try {
        const parsed = JSON.parse(data.toString()) as DuoData;
        this.callbacks?.onData(parsed);
      } catch (e) {
        console.error('Failed to parse peer data:', e);
      }
    });

    this.peer.on('error', (err) => {
      console.error('Peer connection error:', err);
      this.callbacks?.onError(err);
      this.attemptReconnect();
    });

    this.peer.on('close', () => {
      this.callbacks?.onDisconnect();
      this.attemptReconnect();
    });
  }

  private async sendSignal(signal: PeerSignal): Promise<void> {
    // Send to Cloudflare Workers signaling endpoint
    try {
      await fetch('/api/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signal)
      });
    } catch (error) {
      console.error('Failed to send signal:', error);
    }
  }

  // Call this when receiving signal from remote peer
  async handleRemoteSignal(signal: PeerSignal): Promise<void> {
    if (!this.peer) {
      throw new Error('Peer not initialized');
    }

    const signalData: SimplePeer.SignalData = {};
    
    if (signal.sdp) {
      signalData.type = signal.type as 'offer' | 'answer';
      signalData.sdp = signal.sdp;
    }
    
    if (signal.candidate) {
      signalData.candidate = signal.candidate;
    }

    this.peer.signal(signalData);
  }

  sendBreathPhase(phase: 'inhale' | 'hold-in' | 'exhale' | 'hold-out', progress: number): void {
    this.sendData({
      type: 'breath-phase',
      payload: { phase, progress },
      timestamp: Date.now()
    });
  }

  sendHeartbeat(heartRate: number, hrv?: number): void {
    this.sendData({
      type: 'heartbeat',
      payload: { heartRate, hrv },
      timestamp: Date.now()
    });
  }

  startBreathingSession(pattern: BreathingPattern, duration: number): void {
    this.sendData({
      type: 'session-start',
      payload: { pattern, duration },
      timestamp: Date.now()
    });
  }

  endBreathingSession(): void {
    this.sendData({
      type: 'session-end',
      payload: {},
      timestamp: Date.now()
    });
  }

  sendChatMessage(message: string): void {
    this.sendData({
      type: 'chat',
      payload: { message },
      timestamp: Date.now()
    });
  }

  private sendData(data: DuoData): void {
    if (this.peer?.connected) {
      this.peer.send(JSON.stringify(data));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
        // Re-initialize connection
      }, 2000 * this.reconnectAttempts);
    }
  }

  disconnect(): void {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    
    if (this.sessionId) {
      // Notify backend about disconnection
      this.endSession(this.sessionId).catch(console.error);
    }
    
    this.sessionId = null;
    this.callbacks = null;
  }

  isConnected(): boolean {
    return this.peer?.connected || false;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  private generateInviteCode(): string {
    // Generate 6-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // API calls
  private async registerSession(sessionId: string, hostId: string, inviteCode: string): Promise<void> {
    await fetch('/api/duo/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, hostId, inviteCode })
    });
  }

  private async getSessionByInviteCode(code: string): Promise<DuoSession | null> {
    const response = await fetch(`/api/duo/session?code=${code}`);
    if (response.ok) {
      return response.json();
    }
    return null;
  }

  private async joinSessionApi(sessionId: string, guestId: string): Promise<void> {
    await fetch(`/api/duo/session/${sessionId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId })
    });
  }

  private async endSession(sessionId: string): Promise<void> {
    await fetch(`/api/duo/session/${sessionId}`, { method: 'DELETE' });
  }
}

// Singleton instance
export const duoSyncManager = new DuoSyncManager();
