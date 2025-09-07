import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GameSync } from '@/utils/gameSync';

interface RoomConnectionProps {
  gameType: '2player' | '4player';
  onRoomReady: (roomId: string, playerId: string) => void;
  onBack: () => void;
}

export const RoomConnection: React.FC<RoomConnectionProps> = ({ gameType, onRoomReady, onBack }) => {
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shareInfo, setShareInfo] = useState<{roomId: string, link: string} | null>(null);

  const gameSync = GameSync.getInstance();

  useEffect(() => {
    // Clean up old rooms on component mount
    gameSync.cleanupOldRooms();
  }, []);

  const generateRoomId = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const createRoom = () => {
    if (!playerName.trim()) {
      setError('Lütfen isminizi girin!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newRoomId = generateRoomId();
      const playerId = `host_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const hostPlayer = {
        id: playerId,
        name: playerName.trim(),
        isReady: false,
        answers: {},
        score: 0,
        coupleId: gameType === '4player' ? 'couple1' : undefined
      };

      const room = gameSync.createRoom(newRoomId, hostPlayer, gameType);
      
      // Generate shareable link
      const shareLink = `${window.location.origin}${window.location.pathname}`;
      setShareInfo({ roomId: newRoomId, link: shareLink });
      
      // Auto-proceed to waiting room after showing share info
      setTimeout(() => {
        onRoomReady(newRoomId, playerId);
      }, 3000);
      
    } catch (err) {
      setError('Oda oluşturulamadı!');
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = () => {
    if (!playerName.trim()) {
      setError('Lütfen isminizi girin!');
      return;
    }

    if (!roomId.trim()) {
      setError('Lütfen oda kodunu girin!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newPlayer = {
        id: playerId,
        name: playerName.trim(),
        isReady: false,
        answers: {},
        score: 0
      };

      gameSync.joinRoom(roomId.toUpperCase(), newPlayer);
      onRoomReady(roomId.toUpperCase(), playerId);
      
    } catch (err: unknown) {
      setError((err as Error).message || 'Odaya katılamadı!');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add toast notification here
    });
  };

  // Show share info after room creation
  if (shareInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/80 border-green-400 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-300">✅ Oda Oluşturuldu!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded space-y-3">
              <div>
                <p className="text-sm text-gray-400">Oda Kodu:</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-cyan-300">{shareInfo.roomId}</p>
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard(shareInfo.roomId)}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    Kopyala
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400">Paylaş Linki:</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-cyan-300 truncate">{shareInfo.link}</p>
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard(shareInfo.link)}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    Kopyala
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-yellow-300 font-semibold">Diğer oyunculara şunları gönderin:</p>
              <p className="text-sm text-gray-300">1. Yukarıdaki linki paylaşın</p>
              <p className="text-sm text-gray-300">2. Oda kodunu: <span className="text-cyan-300 font-bold">{shareInfo.roomId}</span></p>
            </div>

            <p className="text-center text-gray-400 text-xs">
              Otomatik olarak bekleme odasına yönlendiriliyorsunuz...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/80 border-cyan-400 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-cyan-300">
              {gameType === '2player' ? 'Kıvılcım: Yeniden Doğuş' : 'Zoka Night'}
            </CardTitle>
            <p className="text-gray-300">
              {gameType === '2player' ? '2 Oyuncu' : '4 Oyuncu'} Modu
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button 
              onClick={() => setMode('create')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Yeni Oda Oluştur
            </Button>
            
            <Button 
              onClick={() => setMode('join')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Var Olan Odaya Katıl
            </Button>

            <Button 
              onClick={onBack}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Geri Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4 flex items-center justify-center">
      <Card className="w-full max-w-md bg-black/80 border-cyan-400 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-cyan-300">
            {mode === 'create' ? 'Yeni Oda Oluştur' : 'Odaya Katıl'}
          </CardTitle>
          <p className="text-gray-300">
            {gameType === '2player' ? 'Kıvılcım: Yeniden Doğuş' : 'Zoka Night'} - {gameType === '2player' ? '2' : '4'} Oyuncu
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="İsminizi girin"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>

          {mode === 'join' && (
            <div>
              <Input
                placeholder="Oda kodunu girin (örn: ABC123)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="bg-gray-800/50 border-gray-600 text-white"
                maxLength={6}
              />
            </div>
          )}

          {error && (
            <Alert className="bg-red-900/50 border-red-600">
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={mode === 'create' ? createRoom : joinRoom}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'İşleniyor...' : (mode === 'create' ? 'Oda Oluştur' : 'Odaya Katıl')}
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={() => setMode(null)}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Geri
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Ana Menü
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};