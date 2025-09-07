// Cross-device synchronization utilities
export class GameSync {
  private static instance: GameSync;
  private syncKey = 'game_sync';
  private lastSyncTime = 0;

  static getInstance(): GameSync {
    if (!GameSync.instance) {
      GameSync.instance = new GameSync();
    }
    return GameSync.instance;
  }

  // Create a new room with proper initialization
  createRoom(roomId: string, hostPlayer: { id: string; name: string; isReady: boolean; answers: Record<number, string | number>; score: number; coupleId?: string }, gameType: '2player' | '4player') {
    const room = {
      id: roomId,
      type: gameType,
      players: [hostPlayer],
      gameState: {
        phase: 'waiting',
        section: 1
      },
      currentQuestion: 0,
      timeLeft: 15,
      isActive: false,
      createdAt: Date.now(),
      hostId: hostPlayer.id
    };

    // Store room data
    localStorage.setItem(`room_${roomId}`, JSON.stringify(room));
    
    // Create sync channel
    this.createSyncChannel(roomId, room);
    
    return room;
  }

  // Join existing room
  joinRoom(roomId: string, player: { id: string; name: string; isReady: boolean; answers: Record<number, string | number>; score: number }) {
    const roomData = localStorage.getItem(`room_${roomId}`);
    if (!roomData) {
      throw new Error('Room not found');
    }

    const room = JSON.parse(roomData);
    const maxPlayers = room.type === '2player' ? 2 : 4;

    if (room.players.length >= maxPlayers) {
      throw new Error('Room is full');
    }

    if (room.players.some((p: { name: string }) => p.name === player.name)) {
      throw new Error('Name already taken');
    }

    // Add couple assignment for 4-player game
    if (room.type === '4player') {
      player.coupleId = room.players.length < 2 ? 'couple1' : 'couple2';
    }

    room.players.push(player);
    localStorage.setItem(`room_${roomId}`, JSON.stringify(room));
    
    this.broadcastUpdate(roomId, {
      type: 'player_join',
      data: player,
      timestamp: Date.now()
    });

    return room;
  }

  // Create sync channel for cross-device communication
  private createSyncChannel(roomId: string, room: { id: string; type: string; players: unknown[]; gameState: unknown; currentQuestion: number; timeLeft: number; isActive: boolean; createdAt: number; hostId: string }) {
    const syncData = {
      roomId,
      room,
      lastUpdate: Date.now()
    };
    
    localStorage.setItem(`${this.syncKey}_${roomId}`, JSON.stringify(syncData));
  }

  // Broadcast update to all connected devices
  broadcastUpdate(roomId: string, update: { type: string; data: unknown; timestamp: number }) {
    const syncData = {
      roomId,
      update,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`${this.syncKey}_${roomId}_update`, JSON.stringify(syncData));
    
    // Also trigger storage event for same-origin tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: `${this.syncKey}_${roomId}_update`,
      newValue: JSON.stringify(syncData)
    }));
  }

  // Listen for updates from other devices
  startListening(roomId: string, callback: (room: { id: string; type: string; players: unknown[]; gameState: unknown; currentQuestion: number; timeLeft: number; isActive: boolean; createdAt: number; hostId?: string }) => void) {
    const checkForUpdates = () => {
      const roomData = localStorage.getItem(`room_${roomId}`);
      if (roomData) {
        const room = JSON.parse(roomData);
        callback(room);
      }
    };

    // Check every 100ms for real-time sync
    const interval = setInterval(checkForUpdates, 100);

    // Also listen for storage events (same-origin tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${this.syncKey}_${roomId}_update` && e.newValue) {
        checkForUpdates();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  // Update room data with proper validation
  updateRoom(roomId: string, updates: Record<string, unknown>) {
    const roomData = localStorage.getItem(`room_${roomId}`);
    if (!roomData) {
      throw new Error('Room not found');
    }

    const room = JSON.parse(roomData);
    const updatedRoom = { ...room, ...updates };
    
    localStorage.setItem(`room_${roomId}`, JSON.stringify(updatedRoom));
    
    this.broadcastUpdate(roomId, {
      type: 'room_update',
      data: updates,
      timestamp: Date.now()
    });

    return updatedRoom;
  }

  // Get room data
  getRoom(roomId: string) {
    const roomData = localStorage.getItem(`room_${roomId}`);
    return roomData ? JSON.parse(roomData) : null;
  }

  // Clean up old rooms
  cleanupOldRooms() {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours

    keys.forEach(key => {
      if (key.startsWith('room_')) {
        const roomData = localStorage.getItem(key);
        if (roomData) {
          const room = JSON.parse(roomData);
          if (now - room.createdAt > maxAge) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  }
}