import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SparkPlayer, SparkGameState } from '@/types/spark';
import { section1Questions, section2Questions } from '@/data/sparkQuestions';
import { section3WrittenActivities, section3PhysicalActivities } from '@/data/sparkActivities';

interface SparkGameProps {
  onGameEnd: () => void;
}

export const SparkGame: React.FC<SparkGameProps> = ({ onGameEnd }) => {
  const [players, setPlayers] = useState<SparkPlayer[]>([
    { id: 'p1', name: '', score: 0 },
    { id: 'p2', name: '', score: 0 }
  ]);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<SparkGameState>({
    section: 1,
    players,
    currentQuestion: null,
    currentActivity: null,
    questionIndex: 0,
    scores: { p1: 0, p2: 0 }
  });

  const [timer, setTimer] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [partnerRating, setPartnerRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timer > 0 && gameState.section === 1) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      setShowRating(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer, gameState.section]);

  const startGame = () => {
    if (!players[0].name || !players[1].name) {
      alert('Lütfen her iki oyuncu ismini girin!');
      return;
    }
    
    setGameStarted(true);
    loadNextQuestion();
  };

  const loadNextQuestion = () => {
    let question;
    if (gameState.section === 1) {
      question = section1Questions[gameState.questionIndex];
      setTimer(15);
      setIsActive(true);
    } else if (gameState.section === 2) {
      question = section2Questions[gameState.questionIndex];
    }
    
    if (question) {
      setGameState(prev => ({
        ...prev,
        currentQuestion: question
      }));
    }
    
    setCurrentAnswer('');
    setPartnerRating(0);
    setShowRating(false);
  };

  const handleAnswer = (answerIndex?: number) => {
    if (gameState.section === 1 && answerIndex !== undefined) {
      setCurrentAnswer(gameState.currentQuestion?.options?.[answerIndex] || '');
    }
    setIsActive(false);
    setShowRating(true);
  };

  const submitRating = () => {
    if (partnerRating === 0) {
      alert('Lütfen partner puanı verin (1-5 yıldız)!');
      return;
    }

    // Update score
    const playerId = currentPlayer === 0 ? 'p1' : 'p2';
    setGameState(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [playerId]: prev.scores[playerId] + partnerRating
      }
    }));

    // Move to next question or section
    const maxQuestions = gameState.section === 1 ? 25 : 25;
    if (gameState.questionIndex < maxQuestions - 1) {
      setGameState(prev => ({
        ...prev,
        questionIndex: prev.questionIndex + 1
      }));
      setCurrentPlayer(prev => (prev + 1) % 2);
      loadNextQuestion();
    } else {
      // Move to next section or end
      if (gameState.section < 3) {
        setGameState(prev => ({
          ...prev,
          section: (prev.section + 1) as 1 | 2 | 3,
          questionIndex: 0
        }));
        setCurrentPlayer(0);
        if (gameState.section === 2) {
          loadNextQuestion();
        } else {
          loadNextActivity();
        }
      } else {
        setGameState(prev => ({ ...prev, section: 'finished' }));
      }
    }
  };

  const loadNextActivity = () => {
    const isWritten = gameState.questionIndex < 10;
    let activity;
    
    if (isWritten) {
      activity = section3WrittenActivities[gameState.questionIndex];
    } else {
      activity = section3PhysicalActivities[gameState.questionIndex - 10];
    }
    
    setGameState(prev => ({
      ...prev,
      currentActivity: activity
    }));
  };

  const completeActivity = () => {
    if (partnerRating === 0) {
      alert('Lütfen partner puanı verin (1-5 yıldız)!');
      return;
    }

    const playerId = currentPlayer === 0 ? 'p1' : 'p2';
    setGameState(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [playerId]: prev.scores[playerId] + (partnerRating * 2)
      }
    }));

    if (gameState.questionIndex < 24) {
      setGameState(prev => ({
        ...prev,
        questionIndex: prev.questionIndex + 1
      }));
      setCurrentPlayer(prev => (prev + 1) % 2);
      setPartnerRating(0);
      loadNextActivity();
    } else {
      setGameState(prev => ({ ...prev, section: 'finished' }));
    }
  };

  const renderSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-400 mb-2">KIVILCIM: YENİDEN DOĞUŞ</h2>
        <p className="text-gray-300">Evli çiftler için özel intimacy oyunu</p>
      </div>
      
      <div className="space-y-4">
        <Input
          placeholder="1. Oyuncu İsmi"
          value={players[0].name}
          onChange={(e) => setPlayers(prev => [
            { ...prev[0], name: e.target.value },
            prev[1]
          ])}
          className="bg-gray-800 border-gray-600 text-white"
        />
        <Input
          placeholder="2. Oyuncu İsmi"
          value={players[1].name}
          onChange={(e) => setPlayers(prev => [
            prev[0],
            { ...prev[1], name: e.target.value }
          ])}
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>
      
      <Button onClick={startGame} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
        Oyuna Başla
      </Button>
    </div>
  );

  const renderSection1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-purple-400">BÖLÜM 1: ANI YOLU</h3>
        <p className="text-gray-300">Soru {gameState.questionIndex + 1}/25</p>
        <p className="text-sm text-gray-400">Sıra: {players[currentPlayer].name}</p>
      </div>

      {!showRating && (
        <>
          <div className="text-center">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Kalan Süre</span>
              <span className="text-red-400 font-bold">{timer}s</span>
            </div>
            <Progress value={(timer / 15) * 100} className="mb-4" />
          </div>

          <Card className="bg-gray-800/50 border-purple-400">
            <CardHeader>
              <CardTitle className="text-center text-white">
                {gameState.currentQuestion?.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {gameState.currentQuestion?.options?.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={!isActive}
                    variant="outline"
                    className="bg-gray-700/50 border-gray-600 text-white hover:bg-purple-600/20"
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showRating && (
        <Card className="bg-gray-800/50 border-green-400">
          <CardHeader>
            <CardTitle className="text-center text-white">Partner Puanlaması</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-300 mb-2">Seçilen cevap:</p>
              <p className="text-white font-medium">{currentAnswer}</p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-300 mb-3">Partner puanı ver (1-5 yıldız):</p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Button
                    key={star}
                    onClick={() => setPartnerRating(star)}
                    variant="ghost"
                    className={`text-2xl ${partnerRating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                  >
                    ⭐
                  </Button>
                ))}
              </div>
            </div>
            
            <Button onClick={submitRating} className="w-full bg-green-600 hover:bg-green-700">
              Puanı Kaydet ve Devam Et
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-blue-400">BÖLÜM 2: ŞİMDİNİN SESİ</h3>
        <p className="text-gray-300">Soru {gameState.questionIndex + 1}/25</p>
        <p className="text-sm text-gray-400">Sıra: {players[currentPlayer].name}</p>
      </div>

      {!showRating && (
        <Card className="bg-gray-800/50 border-blue-400">
          <CardHeader>
            <CardTitle className="text-center text-white">
              {gameState.currentQuestion?.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Cevabınızı buraya yazın..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white min-h-[100px]"
            />
            <Button 
              onClick={() => setShowRating(true)}
              disabled={!currentAnswer.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Cevabı Gönder
            </Button>
          </CardContent>
        </Card>
      )}

      {showRating && (
        <Card className="bg-gray-800/50 border-green-400">
          <CardHeader>
            <CardTitle className="text-center text-white">Partner Puanlaması</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-700/50 p-4 rounded">
              <p className="text-white">{currentAnswer}</p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-300 mb-3">Partner puanı ver (1-5 yıldız):</p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Button
                    key={star}
                    onClick={() => setPartnerRating(star)}
                    variant="ghost"
                    className={`text-2xl ${partnerRating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                  >
                    ⭐
                  </Button>
                ))}
              </div>
            </div>
            
            <Button onClick={submitRating} className="w-full bg-green-600 hover:bg-green-700">
              Puanı Kaydet ve Devam Et
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-red-400">BÖLÜM 3: GELECEK DOKUNUŞU</h3>
        <p className="text-gray-300">Aktivite {gameState.questionIndex + 1}/25</p>
        <p className="text-sm text-gray-400">Sıra: {players[currentPlayer].name}</p>
      </div>

      <Card className="bg-gray-800/50 border-red-400">
        <CardHeader>
          <CardTitle className="text-center text-white flex items-center justify-center gap-2">
            {gameState.currentActivity?.title}
            <Badge variant="outline" className={gameState.currentActivity?.type === 'written' ? 'border-blue-400 text-blue-400' : 'border-red-400 text-red-400'}>
              {gameState.currentActivity?.type === 'written' ? 'Yazılı' : 'Fiziksel'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-900/30 p-4 rounded">
            <p className="text-white">{gameState.currentActivity?.description}</p>
            {gameState.currentActivity?.duration && (
              <p className="text-red-300 text-sm mt-2">Süre: {gameState.currentActivity.duration} saniye</p>
            )}
          </div>

          {gameState.currentActivity?.type === 'written' && (
            <Textarea
              placeholder="Cevabınızı/düşüncelerinizi yazın..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white min-h-[100px]"
            />
          )}

          <div className="text-center">
            <p className="text-gray-300 mb-3">Aktivite tamamlandıktan sonra partner puanı:</p>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <Button
                  key={star}
                  onClick={() => setPartnerRating(star)}
                  variant="ghost"
                  className={`text-2xl ${partnerRating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                >
                  ⭐
                </Button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={completeActivity}
            disabled={partnerRating === 0 || (gameState.currentActivity?.type === 'written' && !currentAnswer.trim())}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Aktiviteyi Tamamla
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinished = () => {
    const totalScore1 = gameState.scores.p1;
    const totalScore2 = gameState.scores.p2;
    const winner = totalScore1 > totalScore2 ? players[0] : players[1];
    const winnerScore = Math.max(totalScore1, totalScore2);

    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-yellow-400">🎉 OYUN TAMAMLANDI!</h2>
        
        <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-300">🏆 En Yüksek Puan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl text-white font-bold mb-2">
              {winner.name}
            </div>
            <div className="text-yellow-300 text-lg">
              {winnerScore} Puan
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gray-800/50">
            <CardContent className="p-4 text-center">
              <div className="text-white font-medium">{players[0].name}</div>
              <div className="text-purple-400 text-lg">{totalScore1} puan</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50">
            <CardContent className="p-4 text-center">
              <div className="text-white font-medium">{players[1].name}</div>
              <div className="text-purple-400 text-lg">{totalScore2} puan</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2 text-sm text-gray-400">
          <p>90+ Puan → 10 dk masaj + 7 günlük aktivite</p>
          <p>70+ Puan → 5 dk manuel servis</p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Tekrar Oyna
          </Button>
          <Button 
            onClick={onGameEnd}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Ana Menüye Dön
          </Button>
        </div>
      </div>
    );
  };

  const renderCurrentSection = () => {
    if (!gameStarted) return renderSetup();
    
    switch (gameState.section) {
      case 1: return renderSection1();
      case 2: return renderSection2();
      case 3: return renderSection3();
      case 'finished': return renderFinished();
      default: return renderSection1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <img src="/assets/logo.png" alt="Kıvılcım" className="w-16 h-16 mx-auto mb-2 rounded-full" />
          <h1 className="text-2xl font-bold text-white">KIVILCIM: YENİDEN DOĞUŞ</h1>
        </div>
        
        <Card className="bg-black/80 border-purple-400 text-white">
          <CardContent className="p-6">
            {renderCurrentSection()}
          </CardContent>
        </Card>
        
        {gameStarted && gameState.section !== 'finished' && (
          <Card className="mt-4 bg-black/60 border-gray-600">
            <CardHeader>
              <CardTitle className="text-center text-white text-lg">SKOR TABLOSU</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-white">{players[0].name}</div>
                  <div className="text-purple-400 font-bold">{gameState.scores.p1}</div>
                </div>
                <div className="text-center">
                  <div className="text-white">{players[1].name}</div>
                  <div className="text-purple-400 font-bold">{gameState.scores.p2}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};