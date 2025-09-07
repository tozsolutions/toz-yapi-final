import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameRoom } from '@/types/multiplayer';
import { GameSync } from '@/utils/gameSync';

interface WaitingRoomProps {
  roomId: string;
  playerId: string;
  onGameStart: () => void;
  onLeave: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomId, playerId, onGameStart, onLeave }) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const gameSync = GameSync.getInstance();

  useEffect(() => {
    // Start listening for room updates
    const stopListening = gameSync.startListening(roomId, (updatedRoom: GameRoom) => {
      setRoom(updatedRoom);

      // Check if all players are ready and game should start
      const requiredPlayers = updatedRoom.type === '2player' ? 2 : 4;
      if (updatedRoom.players.length === requiredPlayers && 
          updatedRoom.players.every(p => p.isReady) &&
          updatedRoom.gameState.phase === 'waiting') {
        // Start game
        gameSync.updateRoom(roomId, { gameState: { phase: 'playing' } });
        setTimeout(() => onGameStart(), 1000);
      }
    });

    // Load initial room data
    const initialRoom = gameSync.getRoom(roomId);
    if (initialRoom) {
      setRoom(initialRoom);
    }

    return stopListening;
  }, [roomId, playerId, onGameStart, gameSync]);

  const toggleReady = () => {
    if (!room) return;

    const currentPlayer = room.players.find(p => p.id === playerId);
    if (!currentPlayer) return;

    const updatedPlayer = { ...currentPlayer, isReady: !currentPlayer.isReady };
    const updatedPlayers = room.players.map(p => 
      p.id === playerId ? updatedPlayer : p
    );
    
    gameSync.updateRoom(roomId, { players: updatedPlayers });
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/80 border-red-400 text-white">
          <CardContent className="p-6 text-center">
            <p className="text-red-400">Oda yükleniyor...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requiredPlayers = room.type === '2player' ? 2 : 4;
  const currentPlayer = room.players.find(p => p.id === playerId);
  const isReady = currentPlayer?.isReady || false;
  const allReady = room.players.length === requiredPlayers && room.players.every(p => p.isReady);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4 flex items-center justify-center">
      <Card className="w-full max-w-md bg-black/80 border-cyan-400 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-cyan-300">
            {room.type === '2player' ? 'Kıvılcım: Yeniden Doğuş' : 'Zoka Night'}
          </CardTitle>
          <p className="text-gray-300">Oda: {roomId}</p>
          <p className="text-sm text-gray-400">
            {room.players.length}/{requiredPlayers} Oyuncu
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Room sharing info */}
          <div className="bg-gray-800/50 p-4 rounded space-y-2">
            <p className="text-sm text-gray-400 text-center">Diğer oyuncuları bekleyin</p>
            <div className="text-center">
              <p className="text-cyan-300 font-bold text-lg">{roomId}</p>
              <p className="text-xs text-gray-400">Bu kodu paylaşın</p>
            </div>
          </div>

          {/* Players list */}
          <div className="space-y-3">
            <h3 className="text-center text-gray-300">Oyuncular</h3>
            
            {room.type === '4player' ? (
              // Show couples for 4-player game
              <div className="space-y-4">
                {[
                  room.players.filter(p => p.coupleId === 'couple1'),
                  room.players.filter(p => p.coupleId === 'couple2')
                ].map((couple, coupleIndex) => (
                  <div key={coupleIndex} className="space-y-2">
                    <h4 className="text-cyan-300 text-sm font-semibold text-center">
                      {coupleIndex + 1}. Çift
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1].map(slotIndex => {
                        const player = couple[slotIndex];
                        return (
                          <div 
                            key={slotIndex} 
                            className={`p-3 rounded text-center border ${
                              player ? 'bg-gray-700/50 border-cyan-600' : 'bg-gray-800/30 border-gray-600 border-dashed'
                            }`}
                          >
                            {player ? (
                              <>
                                <div className={`text-sm font-medium ${
                                  player.id === playerId ? 'text-yellow-300' : 'text-white'
                                }`}>
                                  {player.name}
                                  {player.id === playerId && ' (Sen)'}
                                </div>
                                <Badge 
                                  variant={player.isReady ? 'default' : 'secondary'}
                                  className={`text-xs mt-1 ${
                                    player.isReady ? 'bg-green-600' : 'bg-gray-600'
                                  }`}
                                >
                                  {player.isReady ? '✅ Hazır' : '⏳ Bekliyor'}
                                </Badge>
                              </>
                            ) : (
                              <div className="text-gray-500 text-sm">Boş slot</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show simple list for 2-player game
              <div className="space-y-2">
                {[0, 1].map(slotIndex => {
                  const player = room.players[slotIndex];
                  return (
                    <div 
                      key={slotIndex} 
                      className={`p-3 rounded text-center border ${
                        player ? 'bg-gray-700/50 border-cyan-600' : 'bg-gray-800/30 border-gray-600 border-dashed'
                      }`}
                    >
                      {player ? (
                        <>
                          <div className={`text-sm font-medium ${
                            player.id === playerId ? 'text-yellow-300' : 'text-white'
                          }`}>
                            {player.name}
                            {player.id === playerId && ' (Sen)'}
                          </div>
                          <Badge 
                            variant={player.isReady ? 'default' : 'secondary'}
                            className={`text-xs mt-1 ${
                              player.isReady ? 'bg-green-600' : 'bg-gray-600'
                            }`}
                          >
                            {player.isReady ? '✅ Hazır' : '⏳ Bekliyor'}
                          </Badge>
                        </>
                      ) : (
                        <div className="text-gray-500 text-sm">Oyuncu bekleniyor...</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ready button */}
          {room.players.length >= 2 && (
            <Button
              onClick={toggleReady}
              className={`w-full ${
                isReady ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {isReady ? '✅ Hazırım' : '⏳ Hazır Değilim'}
            </Button>
          )}

          {/* Game start status */}
          {allReady && (
            <div className="text-center bg-green-900/30 p-3 rounded border border-green-600">
              <p className="text-green-300 font-semibold">🎮 Oyun başlıyor...</p>
            </div>
          )}

          {room.players.length < requiredPlayers && (
            <div className="text-center bg-blue-900/30 p-3 rounded border border-blue-600">
              <p className="text-blue-300">
                {requiredPlayers - room.players.length} oyuncu daha bekleniyor
              </p>
            </div>
          )}

          {/* Leave room button */}
          <Button
            onClick={onLeave}
            variant="outline"
            className="w-full border-red-600 text-red-400 hover:bg-red-600/10"
          >
            Odadan Ayrıl
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};