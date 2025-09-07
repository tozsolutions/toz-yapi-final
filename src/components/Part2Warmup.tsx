import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Couple } from '@/types/game';
import { part2Questions } from '@/data/tasks';

interface Part2WarmupProps {
  couples: Couple[];
  onComplete: () => void;
}

export const Part2Warmup: React.FC<Part2WarmupProps> = ({ couples, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [askedQuestions, setAskedQuestions] = useState<number[]>([]);
  const [currentAskingCouple, setCurrentAskingCouple] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);

  const getRandomQuestion = () => {
    const availableQuestions = part2Questions
      .map((_, index) => index)
      .filter(index => !askedQuestions.includes(index));
    
    if (availableQuestions.length === 0) return null;
    
    const randomIndex = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    return randomIndex;
  };

  const handleAskQuestion = () => {
    const questionIndex = getRandomQuestion();
    if (questionIndex === null) {
      onComplete();
      return;
    }
    
    setCurrentQuestionIndex(questionIndex);
    setAskedQuestions(prev => [...prev, questionIndex]);
    setShowQuestion(true);
  };

  const handleNextTurn = () => {
    setShowQuestion(false);
    setCurrentAskingCouple(prev => (prev + 1) % couples.length);
    
    if (askedQuestions.length >= 10) {
      onComplete();
    }
  };

  const askingCouple = couples[currentAskingCouple];
  const answeringCouple = couples[(currentAskingCouple + 1) % couples.length];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-400 mb-2">BÖLÜM 2: ISINMA</h2>
        <p className="text-gray-300">Birbirinizi daha yakından tanıyın</p>
        <div className="text-sm text-gray-400 mt-2">
          {askedQuestions.length}/10 soru soruldu
        </div>
      </div>

      {!showQuestion ? (
        <Card className="bg-gray-800/50 border-purple-400">
          <CardHeader>
            <CardTitle className="text-center text-white">
              Sıra: {askingCouple.player1.name} & {askingCouple.player2.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300">
              {answeringCouple.player1.name} & {answeringCouple.player2.name} çiftine soru soracaksınız
            </p>
            <Button 
              onClick={handleAskQuestion}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              Soru Çek
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-800/50 border-purple-400">
          <CardHeader>
            <CardTitle className="text-center text-white">
              {answeringCouple.player1.name} & {answeringCouple.player2.name} için soru:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-purple-900/30 rounded-lg">
              <p className="text-lg text-white font-medium">
                {part2Questions[currentQuestionIndex]}
              </p>
            </div>
            
            <div className="text-center text-sm text-gray-400">
              <p>• Çift sırayla cevap verir</p>
              <p>• Soru soran çift, verdikleri cevapları puanlar</p>
              <p>• Her iyi cevap için 1 puan</p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={handleNextTurn}
                className="bg-green-600 hover:bg-green-700"
              >
                Cevaplandı, Sonraki Tur
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {askedQuestions.length >= 8 && (
        <div className="text-center">
          <Button 
            onClick={onComplete}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            Bölüm 3'e Geç
          </Button>
        </div>
      )}
    </div>
  );
};