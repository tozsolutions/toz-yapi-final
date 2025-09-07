import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GameState, Couple, Question } from '@/types/game';
import { part1Questions } from '@/data/questions';
import { Part2Warmup } from './Part2Warmup';
import { Part3Physical } from './Part3Physical';
import { Part4Hangover } from './Part4Hangover';

interface GameBoardProps {
  couples: Couple[];
  onGameEnd: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ couples, onGameEnd }) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'part1',
    couples,
    currentQuestion: null,
    currentTask: null,
    timeLeft: 15,
    isActive: false,
    scores: {}
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timer) clearInterval(timer);
    setGameState(prev => ({ ...prev, timeLeft: 15, isActive: true }));
    
    const newTimer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(newTimer);
          return { ...prev, timeLeft: 0, isActive: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    
    setTimer(newTimer);
  };

  const handleAnswer = (playerId: string, answerIndex: number) => {
    if (!gameState.isActive || !gameState.currentQuestion) return;
    
    const isCorrect = answerIndex === gameState.currentQuestion.correctAnswer;
    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        scores: {
          ...prev.scores,
          [playerId]: (prev.scores[playerId] || 0) + 1
        }
      }));
    }
    
    if (timer) clearInterval(timer);
    setGameState(prev => ({ ...prev, isActive: false }));
    setShowResults(true);
  };

  const nextQuestion = () => {
    setShowResults(false);
    if (currentQuestionIndex < part1Questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setGameState(prev => ({
        ...prev,
        currentQuestion: part1Questions[nextIndex]
      }));
    } else {
      // Move to next phase
      setGameState(prev => ({ ...prev, phase: 'part2' }));
    }
  };

  const loadQuestion = () => {
    const question = part1Questions[currentQuestionIndex];
    setGameState(prev => ({
      ...prev,
      currentQuestion: question
    }));
    startTimer();
  };

  const renderPart1 = () => {
    if (!gameState.currentQuestion && !showResults) {
      return (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-cyan-400">BÖLÜM 1: BAŞLANGIÇ</h2>
          <p className="text-gray-300">Partnerinizi ne kadar iyi tanıyorsunuz?</p>
          <p className="text-sm text-gray-400">25 soru • Her soru için 15 saniye</p>
          <div className="bg-cyan-900/20 p-4 rounded-lg text-sm text-gray-300">
            <p>🎯 Nasıl oynanır:</p>
            <p>• Soru tüm telefonlarda görünür</p>
            <p>• A-B-C-D şıklarından birini seçin</p>
            <p>• Partneriniz cevabınızı doğrular</p>
            <p>• Doğru cevap = 1 puan</p>
          </div>
          <Button 
            onClick={loadQuestion}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            {currentQuestionIndex + 1}. Soruyu Başlat
          </Button>
        </div>
      );
    }

    if (showResults) {
      return (
        <div className="text-center space-y-4">
          <h3 className="text-xl text-cyan-400">Soru {currentQuestionIndex + 1} Tamamlandı</h3>
          <div className="space-y-2">
            {couples.map(couple => (
              <div key={couple.id} className="flex justify-between items-center bg-gray-800/50 p-3 rounded">
                <span>{couple.player1.name} & {couple.player2.name}</span>
                <span className="text-cyan-400 font-bold">
                  {(gameState.scores[couple.player1.id] || 0) + (gameState.scores[couple.player2.id] || 0)} puan
                </span>
              </div>
            ))}
          </div>
          <Button onClick={nextQuestion} className="bg-green-600 hover:bg-green-700">
            {currentQuestionIndex < part1Questions.length - 1 ? 'Sonraki Soru' : 'Bölüm 2\'ye Geç'}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400">Soru {currentQuestionIndex + 1}/25</span>
            <span className="text-lg font-bold text-red-400">{gameState.timeLeft}s</span>
          </div>
          <Progress 
            value={(gameState.timeLeft / 15) * 100} 
            className="mb-4"
          />
        </div>
        
        <Card className="bg-gray-800/50 border-cyan-400">
          <CardHeader>
            <CardTitle className="text-center text-white">
              {gameState.currentQuestion?.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {gameState.currentQuestion?.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer('current-player', index)}
                  disabled={!gameState.isActive}
                  variant="outline"
                  className="bg-gray-700/50 border-gray-600 text-white hover:bg-cyan-600/20 hover:border-cyan-400"
                >
                  {String.fromCharCode(65 + index)}. {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGameFinished = () => {
    const couple1Score = (gameState.scores[couples[0].player1.id] || 0) + (gameState.scores[couples[0].player2.id] || 0);
    const couple2Score = (gameState.scores[couples[1].player1.id] || 0) + (gameState.scores[couples[1].player2.id] || 0);
    const winner = couple1Score > couple2Score ? couples[0] : couples[1];
    const loser = couple1Score > couple2Score ? couples[1] : couples[0];

    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-yellow-400">🎉 OYUN BİTTİ!</h2>
        
        <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-300">👑 KAZANAN ÇİFT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl text-white font-bold">
              {winner.player1.name} & {winner.player2.name}
            </div>
            <div className="text-yellow-300 mt-2">
              {couple1Score > couple2Score ? couple1Score : couple2Score} Puan
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-600">
          <CardHeader>
            <CardTitle className="text-red-400">🎯 Kaybeden Çift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-white">
              {loser.player1.name} & {loser.player2.name}
            </div>
            <div className="text-gray-400 mt-2">
              {couple1Score < couple2Score ? couple1Score : couple2Score} Puan
            </div>
            <div className="text-sm text-red-300 mt-3">
              Kazanan çift, size istediğinizi yaptırabilir! 😈
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button 
            onClick={() => {
              setGameState(prev => ({ ...prev, phase: 'part1' }));
              setCurrentQuestionIndex(0);
              setShowResults(false);
            }}
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

  const renderPhase = () => {
    switch (gameState.phase) {
      case 'part1': return renderPart1();
      case 'part2': return <Part2Warmup couples={couples} onComplete={() => setGameState(prev => ({ ...prev, phase: 'part3' }))} />;
      case 'part3': return <Part3Physical couples={couples} onComplete={() => setGameState(prev => ({ ...prev, phase: 'part4' }))} />;
      case 'part4': return <Part4Hangover couples={couples} onComplete={() => setGameState(prev => ({ ...prev, phase: 'finished' }))} />;
      case 'finished': return renderGameFinished();
      default: return renderPart1();
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <img src="/assets/logo.png" alt="Zoka Night" className="w-16 h-16 mx-auto mb-2 rounded-full" />
          <h1 className="text-2xl font-bold text-white">ZOKA NIGHT</h1>
        </div>
        
        <Card className="bg-black/80 border-cyan-400 text-white">
          <CardContent className="p-6">
            {renderPhase()}
          </CardContent>
        </Card>
        
        {/* Scoreboard - Only show in part1 */}
        {gameState.phase === 'part1' && (
          <Card className="mt-4 bg-black/60 border-gray-600">
            <CardHeader>
              <CardTitle className="text-center text-white text-lg">SKOR TABLOSU</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {couples.map(couple => (
                  <div key={couple.id} className="flex justify-between items-center text-white">
                    <span className="text-sm">{couple.player1.name} & {couple.player2.name}</span>
                    <span className="text-cyan-400 font-bold">
                      {(gameState.scores[couple.player1.id] || 0) + (gameState.scores[couple.player2.id] || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};