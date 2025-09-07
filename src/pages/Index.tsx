import React, { useState } from 'react';
import { PlayerSelection } from '@/components/PlayerSelection';
import { RoomConnection } from '@/components/RoomConnection';
import { WaitingRoom } from '@/components/WaitingRoom';
import { MultiplayerGameBoard } from '@/components/MultiplayerGameBoard';
import { MultiplayerSparkGame } from '@/components/MultiplayerSparkGame';

type AppState = 'select' | 'connect' | 'waiting' | 'playing';

export default function Index() {
  const [state, setState] = useState<AppState>('select');
  const [gameType, setGameType] = useState<'2player' | '4player' | null>(null);
  const [roomId, setRoomId] = useState('');
  const [playerId, setPlayerId] = useState('');

  const handlePlayerSelection = (playerCount: number) => {
    setGameType(playerCount === 2 ? '2player' : '4player');
    setState('connect');
  };

  const handleRoomReady = (newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
    setState('waiting');
  };

  const handleGameStart = () => {
    setState('playing');
  };

  const handleGameEnd = () => {
    setState('select');
    setGameType(null);
    setRoomId('');
    setPlayerId('');
  };

  if (state === 'select') {
    return <PlayerSelection onSelectPlayers={handlePlayerSelection} />;
  }

  if (state === 'connect' && gameType) {
    return (
      <RoomConnection 
        gameType={gameType}
        onRoomReady={handleRoomReady}
        onBack={handleGameEnd}
      />
    );
  }

  if (state === 'waiting') {
    return (
      <WaitingRoom 
        roomId={roomId}
        playerId={playerId}
        onGameStart={handleGameStart}
        onLeave={handleGameEnd}
      />
    );
  }

  if (state === 'playing') {
    if (gameType === '2player') {
      return (
        <MultiplayerSparkGame 
          roomId={roomId}
          playerId={playerId}
          onGameEnd={handleGameEnd}
        />
      );
    } else {
      return (
        <MultiplayerGameBoard 
          roomId={roomId}
          playerId={playerId}
          onGameEnd={handleGameEnd}
        />
      );
    }
  }

  return <PlayerSelection onSelectPlayers={handlePlayerSelection} />;
}