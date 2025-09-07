import { useState, useEffect } from 'react';
import { GameRoom, RoomPlayer, GameSync } from '@/types/multiplayer';

export const useGameRoom = () => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<RoomPlayer | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Generate unique player ID
  const generatePlayerId = () => {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Generate room ID
  const generateRoomId = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  // Create new room
  const createRoom = (type: '2player' | '4player', playerName: string): string => {
    const roomId = generateRoomId();
    const playerId = generatePlayerId();
    
    const newRoom: GameRoom = {
      id: roomId,
      type,
      players: [{
        id: playerId,
        name: playerName,
        isReady: false,
        answers: {},
        score: 0,
        coupleId: type === '4player' ? 'couple1' : undefined
      }],
      gameState: null,
      currentQuestion: 0,
      timeLeft: 15,
      isActive: false,
      createdAt: Date.now()
    };

    localStorage.setItem(`room_${roomId}`, JSON.stringify(newRoom));
    
    setRoom(newRoom);
    setCurrentPlayer(newRoom.players[0]);
    setIsConnected(true);
    
    // Start listening for updates
    startRoomSync(roomId);
    
    return roomId;
  };

  // Join existing room
  const joinRoom = (roomId: string, playerName: string): boolean => {
    const roomData = localStorage.getItem(`room_${roomId}`);
    if (!roomData) return false;

    const existingRoom: GameRoom = JSON.parse(roomData);
    const maxPlayers = existingRoom.type === '2player' ? 2 : 4;
    
    if (existingRoom.players.length >= maxPlayers) return false;

    const playerId = generatePlayerId();
    const newPlayer: RoomPlayer = {
      id: playerId,
      name: playerName,
      isReady: false,
      answers: {},
      score: 0,
      coupleId: existingRoom.type === '4player' ? 
        (existingRoom.players.length < 2 ? 'couple1' : 'couple2') : 
        undefined
    };

    existingRoom.players.push(newPlayer);
    localStorage.setItem(`room_${roomId}`, JSON.stringify(existingRoom));

    setRoom(existingRoom);
    setCurrentPlayer(newPlayer);
    setIsConnected(true);

    // Notify other players
    broadcastUpdate(roomId, {
      type: 'player_join',
      data: newPlayer,
      timestamp: Date.now()
    });

    startRoomSync(roomId);
    
    return true;
  };

  // Start room synchronization
  const startRoomSync = (roomId: string) => {
    const syncInterval = setInterval(() => {
      const roomData = localStorage.getItem(`room_${roomId}`);
      if (roomData) {
        const updatedRoom: GameRoom = JSON.parse(roomData);
        setRoom(updatedRoom);
        
        // Update current player data
        const updatedPlayer = updatedRoom.players.find(p => p.id === currentPlayer?.id);
        if (updatedPlayer) {
          setCurrentPlayer(updatedPlayer);
        }
      } else {
        clearInterval(syncInterval);
        setIsConnected(false);
      }
    }, 500); // Sync every 500ms

    // Clean up old rooms (older than 4 hours)
    const now = Date.now();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('room_')) {
        const roomData = localStorage.getItem(key);
        if (roomData) {
          const room: GameRoom = JSON.parse(roomData);
          if (now - room.createdAt > 4 * 60 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        }
      }
    });

    return () => clearInterval(syncInterval);
  };

  // Broadcast update to room
  const broadcastUpdate = (roomId: string, update: GameSync) => {
    const updateKey = `update_${roomId}_${update.timestamp}`;
    localStorage.setItem(updateKey, JSON.stringify(update));
    
    // Clean up old updates after 10 seconds
    setTimeout(() => {
      localStorage.removeItem(updateKey);
    }, 10000);
  };

  // Update room data
  const updateRoom = (updates: Partial<GameRoom>) => {
    if (!room) return;
    
    const updatedRoom = { ...room, ...updates };
    localStorage.setItem(`room_${room.id}`, JSON.stringify(updatedRoom));
    setRoom(updatedRoom);
    
    broadcastUpdate(room.id, {
      type: 'game_update',
      data: updates,
      timestamp: Date.now()
    });
  };

  // Submit answer
  const submitAnswer = (questionIndex: number, answer: string | number) => {
    if (!room || !currentPlayer) return;
    
    const updatedPlayer = {
      ...currentPlayer,
      answers: { ...currentPlayer.answers, [questionIndex]: answer }
    };
    
    const updatedPlayers = room.players.map(p => 
      p.id === currentPlayer.id ? updatedPlayer : p
    );
    
    updateRoom({ players: updatedPlayers });
    setCurrentPlayer(updatedPlayer);
  };

  // Mark player as ready
  const setPlayerReady = (ready: boolean = true) => {
    if (!room || !currentPlayer) return;
    
    const updatedPlayer = { ...currentPlayer, isReady: ready };
    const updatedPlayers = room.players.map(p => 
      p.id === currentPlayer.id ? updatedPlayer : p
    );
    
    updateRoom({ players: updatedPlayers });
    setCurrentPlayer(updatedPlayer);
  };

  // Check if all players answered current question
  const allPlayersAnswered = (questionIndex: number): boolean => {
    if (!room) return false;
    return room.players.every(player => 
      player.answers && Object.prototype.hasOwnProperty.call(player.answers, questionIndex)
    );
  };

  // Check if all players are ready
  const allPlayersReady = (): boolean => {
    if (!room) return false;
    const requiredPlayers = room.type === '2player' ? 2 : 4;
    return room.players.length === requiredPlayers && 
           room.players.every(p => p.isReady);
  };

  // Leave room
  const leaveRoom = () => {
    if (room && currentPlayer) {
      const updatedPlayers = room.players.filter(p => p.id !== currentPlayer.id);
      if (updatedPlayers.length === 0) {
        localStorage.removeItem(`room_${room.id}`);
      } else {
        updateRoom({ players: updatedPlayers });
      }
    }
    
    setRoom(null);
    setCurrentPlayer(null);
    setIsConnected(false);
  };

  return {
    room,
    currentPlayer,
    isConnected,
    createRoom,
    joinRoom,
    updateRoom,
    submitAnswer,
    setPlayerReady,
    allPlayersAnswered,
    allPlayersReady,
    leaveRoom
  };
};