/**
 * @module mobile/services/network.service
 * Real-time network connectivity monitoring with fallback support.
 */

export type ConnectionType = 'wifi' | 'cellular' | 'none' | 'unknown';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: ConnectionType;
}

type Listener = (state: NetworkState) => void;

class NetworkService {
  private currentState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  };
  private listeners: Set<Listener> = new Set();
  private netInfoModule: typeof import('@react-native-community/netinfo') | null = null;
  private unsubscribeNetInfo: (() => void) | null = null;

  constructor() {
    this.initNetInfo();
  }

  private async initNetInfo() {
    try {
      const NetInfo = await import('@react-native-community/netinfo');
      this.netInfoModule = NetInfo;

      // Subscribe to NetInfo state updates
      this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        const isConnected = Boolean(state.isConnected);
        const isInternetReachable = state.isInternetReachable ?? isConnected;
        let type: ConnectionType = 'unknown';

        if (state.type === 'wifi') type = 'wifi';
        else if (state.type === 'cellular') type = 'cellular';
        else if (!isConnected) type = 'none';

        this.updateState({
          isConnected,
          isInternetReachable,
          type,
        });
      });
    } catch {
      // Fallback for environment without native NetInfo (e.g. web/emulators)
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('online', () => this.handleWebStateChange(true));
        window.addEventListener('offline', () => this.handleWebStateChange(false));
      }
    }
  }

  private handleWebStateChange(online: boolean) {
    this.updateState({
      isConnected: online,
      isInternetReachable: online,
      type: online ? 'wifi' : 'none',
    });
  }

  private updateState(newState: NetworkState) {
    const changed =
      this.currentState.isConnected !== newState.isConnected ||
      this.currentState.type !== newState.type;

    this.currentState = newState;

    if (changed) {
      this.listeners.forEach((listener) => listener(this.currentState));
    }
  }

  public getNetworkState(): NetworkState {
    return { ...this.currentState };
  }

  public isOnline(): boolean {
    return this.currentState.isConnected && this.currentState.isInternetReachable;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Immediately invoke listener with current state
    listener(this.currentState);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Force simulated network state change (useful for testing Airplane mode) */
  public setSimulatedState(connected: boolean, type: ConnectionType = 'wifi') {
    this.updateState({
      isConnected: connected,
      isInternetReachable: connected,
      type: connected ? type : 'none',
    });
  }

  public destroy() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
    this.listeners.clear();
  }
}

export const networkService = new NetworkService();
