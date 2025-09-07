import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GameRoom } from '@/types/multiplayer';
import { part1Questions } from '@/data/questions';
import { GameSync } from '@/utils/gameSync';

interface MultiplayerGameBoardProps {
  roomId: string;
  playerId: string;
  onGameEnd: () => void;
}

export const MultiplayerGameBoard: React.FC<MultiplayerGameBoardProps> = ({ roomId, playerId, onGameEnd }) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [timer, setTimer] = useState(15);
  const [hasAnswered, setHasAnswered] = useState(false);
  const gameSync = GameSync.getInstance();

  useEffect(() => {
    // Start listening for room updates
    const stopListening = gameSync.startListening(roomId, (updatedRoom: GameRoom) => {
      setRoom(updatedRoom);
      setTimer(updatedRoom.timeLeft);
      
      // Check if current player has answered this question
      const currentPlayer = updatedRoom.players.find(p => p.id === playerId);
      const hasCurrentAnswer = currentPlayer?.answers && Object.prototype.hasOwnProperty.call(currentPlayer.answers, updatedRoom.currentQuestion);
      setHasAnswered(!!hasCurrentAnswer);
    });

    return stopListening;
  }, [roomId, playerId, gameSync]);

  // Timer countdown for host
  useEffect(() => {
    if (!room) return;
    
    const isHost = room.hostId === playerId;
    if (!isHost || !room.isActive) return;

    const timerInterval = setInterval(() => {
      const currentRoom = gameSync.getRoom(roomId);
      if (currentRoom && currentRoom.timeLeft > 0) {
        gameSync.updateRoom(roomId, { timeLeft: currentRoom.timeLeft - 1 });
      } else if (currentRoom) {
        // Time's up - move to next
        gameSync.updateRoom(roomId, { isActive: false });
        setTimeout(() => moveToNext(), 2000);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [room?.isActive, playerId, roomId, gameSync]);

  const moveToNext = () => {
    if (!room) return;
    
    if (room.currentQuestion < part1Questions.length - 1) {
      gameSync.updateRoom(roomId, {
        currentQuestion: room.currentQuestion + 1,
        timeLeft: 15,
        isActive: false
      });
    } else {
      gameSync.updateRoom(roomId, {
        gameState: { phase: 'finished' }
      });
    }
  };

  const submitAnswer = (answerIndex: number) => {
    if (!room || hasAnswered) return;

    const currentPlayer = room.players.find(p => p.id === playerId);
    if (!currentPlayer) return;

    // Update player's answer and score
    const updatedAnswers = { ...currentPlayer.answers, [room.currentQuestion]: answerIndex };
    let updatedScore = currentPlayer.score;
    
    if (answerIndex === part1Questions[room.currentQuestion].correctAnswer) {
      updatedScore += 1;
    }

    const updatedPlayer = {
      ...currentPlayer,
      answers: updatedAnswers,
      score: updatedScore
    };

    const updatedPlayers = room.players.map(p => 
      p.id === playerId ? updatedPlayer : p
    );

    gameSync.updateRoom(roomId, { players: updatedPlayers });
    setHasAnswered(true);

    // Check if all players answered
    const allAnswered = updatedPlayers.every(p => 
      p.answers && Object.prototype.hasOwnProperty.call(p.answers, room.currentQuestion)
    );
    
    if (allAnswered) {
      gameSync.updateRoom(roomId, { isActive: false });
      setTimeout(() => moveToNext(), 2000);
    }
  };

  const startNextQuestion = () => {
    if (!room) return;
    gameSync.updateRoom(roomId, { timeLeft: 15, isActive: true });
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/80 border-red-400 text-white">
          <CardContent className="p-6 text-center">
            <p className="text-red-400">Oda bulunamadı!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = part1Questions[room.currentQuestion];
  const answeredCount = room.players.filter(p => p.answers && Object.prototype.hasOwnProperty.call(p.answers, room.currentQuestion)).length;
  const isHost = room.hostId === playerId;

  if (room.gameState.phase === 'finished') {
    const couples = [
      {
        players: room.players.filter(p => p.coupleId === 'couple1'),
        score: room.players.filter(p => p.coupleId === 'couple1').reduce((sum, p) => sum + p.score, 0)
      },
      {
        players: room.players.filter(p => p.coupleId === 'couple2'),
        score: room.players.filter(p => p.coupleId === 'couple2').reduce((sum, p) => sum + p.score, 0)
      }
    ];

    const winner = couples[0].score > couples[1].score ? couples[0] : couples[1];
    const loser = couples[0].score < couples[1].score ? couples[0] : couples[1];

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-black/80 border-cyan-400 text-white">
            <CardContent className="p-6 text-center space-y-6">
              <h2 className="text-3xl font-bold text-yellow-400">🎉 OYUN BİTTİ!</h2>
              
              <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-400">
                <CardHeader>
                  <CardTitle className="text-2xl text-yellow-300">👑 KAZANAN ÇİFT</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl text-white font-bold">
                    {winner.players.map(p => p.name).join(' & ')}
                  </div>
                  <div className="text-yellow-300 mt-2">{winner.score} Puan</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-red-400">🎯 Kaybeden Çift</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white">{loser.players.map(p => p.name).join(' & ')}</div>
                  <div className="text-gray-400 mt-2">{loser.score} Puan</div>
                </CardContent>
              </Card>

              <Button onClick={onGameEnd} className="w-full bg-blue-600 hover:bg-blue-700">
                Ana Menüye Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-white">ZOKA NIGHT</h1>
          <p className="text-gray-300">Oda: {roomId}</p>
        </div>

        <Card className="bg-black/80 border-cyan-400 text-white">
          <CardHeader className="text-center">
            <CardTitle>BÖLÜM 1: BAŞLANGIÇ</CardTitle>
            <p className="text-gray-300">Soru {room.currentQuestion + 1}/25</p>
            <p className="text-sm text-gray-400">
              {answeredCount}/{room.players.length} oyuncu cevapladı
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {!room.isActive && answeredCount < room.players.length && (
              <div className="text-center">
                {isHost ? (
                  <Button 
                    onClick={startNextQuestion}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {room.currentQuestion + 1}. Soruyu Başlat
                  </Button>
                ) : (
                  <p className="text-gray-400">Host soruyu başlatacak...</p>
                )}
              </div>
            )}

            {room.isActive && (
              <>
                <div className="text-center">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Kalan Süre</span>
                    <span className="text-red-400 font-bold">{timer}s</span>
                  </div>
                  <Progress value={(timer / 15) * 100} className="mb-4" />
                </div>

                <div className="bg-gray-800/50 p-4 rounded">
                  <p className="text-white text-center font-medium">{currentQuestion?.text}</p>
                </div>

                {hasAnswered ? (
                  <div className="text-center">
                    <div className="bg-green-900/30 p-4 rounded border border-green-600">
                      <p className="text-green-300">✅ Cevabınız kaydedildi!</p>
                      <p className="text-sm text-gray-400">Diğer oyuncular cevaplamalarını bekleyin...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {currentQuestion?.options.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => submitAnswer(index)}
                        variant="outline"
                        className="bg-gray-700/50 border-gray-600 text-white hover:bg-cyan-600/20 text-left"
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}

            {answeredCount === room.players.length && (
              <div className="text-center">
                <div className="bg-blue-900/30 p-4 rounded border border-blue-600">
                  <p className="text-blue-300">✅ Tüm oyuncular cevapladı!</p>
                  <p className="text-sm text-gray-400">
                    {room.currentQuestion < part1Questions.length - 1 
                      ? 'Sonraki soru yükleniyor...' 
                      : 'Oyun sonuçları hazırlanıyor...'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Player Status */}
        <Card className="mt-4 bg-black/60 border-gray-600">
          <CardContent className="p-4">
            <h3 className="text-center text-white text-lg mb-4">OYUNCU DURUMLARI</h3>
            <div className="space-y-2">
              {[
                room.players.filter(p => p.coupleId === 'couple1'),
                room.players.filter(p => p.coupleId === 'couple2')
              ].map((couple, coupleIndex) => (
                <div key={coupleIndex} className="space-y-2">
                  <h4 className="text-cyan-300 text-sm font-semibold">
                    {coupleIndex + 1}. Çift
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {couple.map(player => (
                      <div key={player.id} className="bg-gray-800/50 p-2 rounded text-center">
                        <div className={`text-sm ${player.id === playerId ? 'text-cyan-400 font-bold' : 'text-white'}`}>
                          {player.name}
                          {player.id === playerId && ' (Sen)'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {player.answers && Object.prototype.hasOwnProperty.call(player.answers, room.currentQuestion) ? '✅ Cevapladı' : '⏳ Bekliyor'}
                        </div>
                        <div className="text-xs text-cyan-400">
                          Puan: {player.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};