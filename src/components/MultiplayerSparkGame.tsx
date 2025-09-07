import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GameRoom } from '@/types/multiplayer';
import { section1Questions, section2Questions } from '@/data/sparkQuestions';
import { section3WrittenActivities, section3PhysicalActivities } from '@/data/sparkActivities';

interface MultiplayerSparkGameProps {
  roomId: string;
  playerId: string;
  onGameEnd: () => void;
}

export const MultiplayerSparkGame: React.FC<MultiplayerSparkGameProps> = ({ roomId, playerId, onGameEnd }) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [timer, setTimer] = useState(15);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    const syncInterval = setInterval(() => {
      const roomData = localStorage.getItem(`room_${roomId}`);
      if (roomData) {
        const updatedRoom: GameRoom = JSON.parse(roomData);
        setRoom(updatedRoom);
        
        // Update timer from room
        setTimer(updatedRoom.timeLeft);
        
        // Check if current player has answered this question
        const currentPlayer = updatedRoom.players.find(p => p.id === playerId);
        const hasCurrentAnswer = currentPlayer?.answers && Object.prototype.hasOwnProperty.call(currentPlayer.answers, updatedRoom.currentQuestion);
        setHasAnswered(!!hasCurrentAnswer);
      }
    }, 100);

    return () => clearInterval(syncInterval);
  }, [roomId, playerId]);

  // Timer countdown for host
  useEffect(() => {
    if (!room) return;
    
    const isHost = room.players[0].id === playerId;
    if (!isHost || !room.isActive) return;

    const timerInterval = setInterval(() => {
      const roomData = localStorage.getItem(`room_${roomId}`);
      if (roomData) {
        const currentRoom: GameRoom = JSON.parse(roomData);
        
        if (currentRoom.timeLeft > 0) {
          currentRoom.timeLeft = currentRoom.timeLeft - 1;
          localStorage.setItem(`room_${roomId}`, JSON.stringify(currentRoom));
        } else {
          // Time's up or everyone answered - move to next
          currentRoom.isActive = false;
          checkAndMoveNext(currentRoom);
        }
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [room?.isActive, playerId, roomId]);

  const checkAndMoveNext = (currentRoom: GameRoom) => {
    const allAnswered = currentRoom.players.every(p => 
      p.answers && Object.prototype.hasOwnProperty.call(p.answers, currentRoom.currentQuestion)
    );

    if (allAnswered || currentRoom.timeLeft <= 0) {
      // Move to next question or section
      setTimeout(() => {
        moveToNext(currentRoom);
      }, 2000); // 2 second delay to show results
    }
  };

  const moveToNext = (currentRoom: GameRoom) => {
    const section = getCurrentSection(currentRoom);
    const maxQuestions = getMaxQuestions(section);

    if (currentRoom.currentQuestion < maxQuestions - 1) {
      // Next question in same section
      currentRoom.currentQuestion++;
      currentRoom.timeLeft = section === 1 ? 15 : 60;
      currentRoom.isActive = section === 1;
    } else {
      // Next section or end game
      if (section < 3) {
        currentRoom.gameState.section = section + 1;
        currentRoom.currentQuestion = 0;
        currentRoom.timeLeft = section === 1 ? 60 : 120;
        currentRoom.isActive = false;
      } else {
        currentRoom.gameState.phase = 'finished';
      }
    }

    localStorage.setItem(`room_${roomId}`, JSON.stringify(currentRoom));
  };

  const getCurrentSection = (room: GameRoom): number => {
    if (room.currentQuestion < 25) return 1;
    if (room.currentQuestion < 50) return 2;
    return 3;
  };

  const getMaxQuestions = (section: number): number => {
    return section === 1 ? 25 : section === 2 ? 25 : 25;
  };

  const submitAnswer = (answerIndex?: number) => {
    if (!room || hasAnswered) return;

    let answer;
    if (answerIndex !== undefined) {
      answer = getCurrentQuestion()?.options?.[answerIndex];
    } else {
      answer = currentAnswer;
    }

    const roomData = localStorage.getItem(`room_${roomId}`);
    if (roomData) {
      const currentRoom: GameRoom = JSON.parse(roomData);
      const playerIndex = currentRoom.players.findIndex(p => p.id === playerId);
      
      if (playerIndex !== -1) {
        currentRoom.players[playerIndex].answers[currentRoom.currentQuestion] = answer;
        localStorage.setItem(`room_${roomId}`, JSON.stringify(currentRoom));
        setHasAnswered(true);
        
        // Check if all players answered
        const allAnswered = currentRoom.players.every(p => 
          p.answers && Object.prototype.hasOwnProperty.call(p.answers, currentRoom.currentQuestion)
        );
        
        if (allAnswered) {
          currentRoom.isActive = false;
          checkAndMoveNext(currentRoom);
        }
      }
    }
  };

  const getCurrentQuestion = () => {
    if (!room) return null;
    
    const section = getCurrentSection(room);
    const questionIndex = room.currentQuestion;
    
    if (section === 1) {
      return section1Questions[questionIndex];
    } else if (section === 2) {
      return section2Questions[questionIndex - 25];
    }
    
    return null;
  };

  const getCurrentActivity = () => {
    if (!room) return null;
    
    const section = getCurrentSection(room);
    if (section !== 3) return null;
    
    const activityIndex = room.currentQuestion - 50;
    if (activityIndex < 10) {
      return section3WrittenActivities[activityIndex];
    } else {
      return section3PhysicalActivities[activityIndex - 10];
    }
  };

  const startNextQuestion = () => {
    if (!room) return;
    
    const roomData = localStorage.getItem(`room_${roomId}`);
    if (roomData) {
      const currentRoom: GameRoom = JSON.parse(roomData);
      const section = getCurrentSection(currentRoom);
      
      currentRoom.timeLeft = section === 1 ? 15 : 60;
      currentRoom.isActive = section === 1;
      localStorage.setItem(`room_${roomId}`, JSON.stringify(currentRoom));
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/80 border-red-400 text-white">
          <CardContent className="p-6 text-center">
            <p className="text-red-400">Oda bulunamadı!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const section = getCurrentSection(room);
  const currentQuestion = getCurrentQuestion();
  const currentActivity = getCurrentActivity();
  const currentPlayer = room.players.find(p => p.id === playerId);
  const answeredCount = room.players.filter(p => p.answers && Object.prototype.hasOwnProperty.call(p.answers, room.currentQuestion)).length;

  if (room.gameState.phase === 'finished') {
    const scores = room.players.map(p => ({
      name: p.name,
      score: Object.keys(p.answers).length
    }));

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-black/80 border-purple-400 text-white">
            <CardContent className="p-6 text-center space-y-6">
              <h2 className="text-3xl font-bold text-yellow-400">🎉 OYUN BİTTİ!</h2>
              
              <div className="space-y-2">
                {scores.map((player, index) => (
                  <div key={index} className="flex justify-between bg-gray-800/50 p-3 rounded">
                    <span className="text-white">{player.name}</span>
                    <span className="text-purple-400 font-bold">{player.score}</span>
                  </div>
                ))}
              </div>

              <Button onClick={onGameEnd} className="w-full bg-purple-600 hover:bg-purple-700">
                Ana Menüye Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-white">KIVILCIM: YENİDEN DOĞUŞ</h1>
          <p className="text-gray-300">Oda: {roomId}</p>
        </div>

        <Card className="bg-black/80 border-purple-400 text-white">
          <CardHeader className="text-center">
            <CardTitle>
              BÖLÜM {section}: {section === 1 ? 'ANI YOLU' : section === 2 ? 'ŞİMDİNİN SESİ' : 'GELECEK DOKUNUŞU'}
            </CardTitle>
            <p className="text-gray-300">
              Soru {room.currentQuestion + 1}/{section === 1 ? 25 : section === 2 ? 50 : 75}
            </p>
            <p className="text-sm text-gray-400">
              {answeredCount}/{room.players.length} oyuncu cevapladı
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {section <= 2 && currentQuestion && (
              <>
                {section === 1 && (
                  <div className="text-center">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Kalan Süre</span>
                      <span className="text-red-400 font-bold">{timer}s</span>
                    </div>
                    <Progress value={(timer / 15) * 100} className="mb-4" />
                  </div>
                )}

                <div className="bg-gray-800/50 p-4 rounded">
                  <p className="text-white text-center font-medium">{currentQuestion.text}</p>
                </div>

                {hasAnswered ? (
                  <div className="text-center space-y-4">
                    <div className="bg-green-900/30 p-4 rounded border border-green-600">
                      <p className="text-green-300">✅ Cevabınız kaydedildi!</p>
                      <p className="text-sm text-gray-400">Diğer oyuncular cevaplamalarını bekleyin...</p>
                    </div>
                    <div className="text-sm text-gray-400">
                      Cevabınız: <span className="text-white">{currentPlayer?.answers[room.currentQuestion]}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {section === 1 && currentQuestion.options ? (
                      <div className="grid grid-cols-1 gap-3">
                        {currentQuestion.options.map((option, index) => (
                          <Button
                            key={index}
                            onClick={() => submitAnswer(index)}
                            disabled={!room.isActive && section === 1}
                            variant="outline"
                            className="bg-gray-700/50 border-gray-600 text-white hover:bg-purple-600/20 text-left"
                          >
                            {String.fromCharCode(65 + index)}. {option}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Cevabınızı buraya yazın..."
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white min-h-[100px]"
                        />
                        <Button 
                          onClick={() => submitAnswer()}
                          disabled={!currentAnswer.trim()}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Cevabı Gönder
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {section === 3 && currentActivity && (
              <div className="space-y-4">
                <div className="bg-red-900/30 p-4 rounded border border-red-600">
                  <h3 className="text-white font-bold mb-2">{currentActivity.title}</h3>
                  <p className="text-gray-300">{currentActivity.description}</p>
                </div>

                {!hasAnswered ? (
                  room.players[0].id === playerId ? (
                    <Button 
                      onClick={startNextQuestion}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Aktiviteyi Başlat
                    </Button>
                  ) : (
                    <p className="text-center text-gray-400">Host aktiviteyi başlatacak...</p>
                  )
                ) : (
                  <div className="text-center">
                    <p className="text-green-300">✅ Aktivite kaydedildi!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Player Status */}
        <Card className="mt-4 bg-black/60 border-gray-600">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {room.players.map(player => (
                <div key={player.id} className="text-center">
                  <div className={`text-sm ${player.id === playerId ? 'text-cyan-400 font-bold' : 'text-white'}`}>
                    {player.name}
                    {player.id === playerId && ' (Sen)'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {player.answers && Object.prototype.hasOwnProperty.call(player.answers, room.currentQuestion) ? '✅ Cevapladı' : '⏳ Bekliyor'}
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