import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Couple } from '@/types/game';
import { part4Tasks } from '@/data/tasks';

interface Part4HangoverProps {
  couples: Couple[];
  onComplete: () => void;
}

export const Part4Hangover: React.FC<Part4HangoverProps> = ({ couples, onComplete }) => {
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [confirmations, setConfirmations] = useState<{ [playerId: string]: boolean }>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [currentPerformingPair, setCurrentPerformingPair] = useState(0);
  const [showTask, setShowTask] = useState(false);

  // New mixed couples for Part 4
  const mixedCouples = [
    {
      id: 'mixed1',
      player1: couples[0].player1,
      player2: couples[1].player1,
      totalScore: 0
    },
    {
      id: 'mixed2', 
      player1: couples[0].player2,
      player2: couples[1].player2,
      totalScore: 0
    }
  ];

  const handlePlayerConfirmation = (playerId: string) => {
    setConfirmations(prev => ({
      ...prev,
      [playerId]: true
    }));
  };

  const allPlayersConfirmed = () => {
    const allPlayerIds = couples.flatMap(couple => [couple.player1.id, couple.player2.id]);
    return allPlayerIds.every(id => confirmations[id]);
  };

  const startPart4 = () => {
    if (!allPlayersConfirmed()) {
      alert('Tüm oyuncular onay vermeli!');
      return;
    }
    setShowConfirmation(false);
    setGameStarted(true);
  };

  const getRandomTask = () => {
    const availableTasks = part4Tasks
      .map((_, index) => index)
      .filter(index => !completedTasks.includes(index));
    
    if (availableTasks.length === 0) return null;
    
    const randomIndex = availableTasks[Math.floor(Math.random() * availableTasks.length)];
    return randomIndex;
  };

  const handleChooseTask = () => {
    const taskIndex = getRandomTask();
    if (taskIndex === null) {
      onComplete();
      return;
    }
    
    setCurrentTaskIndex(taskIndex);
    setCompletedTasks(prev => [...prev, taskIndex]);
    setShowTask(true);
  };

  const handleTaskComplete = () => {
    setShowTask(false);
    setCurrentPerformingPair(prev => (prev + 1) % mixedCouples.length);
    
    if (completedTasks.length >= 6) {
      onComplete();
    }
  };

  const currentPair = mixedCouples[currentPerformingPair];
  const currentTask = part4Tasks[currentTaskIndex];

  if (showConfirmation) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">BÖLÜM 4: AKŞAM SONRASI</h2>
          <p className="text-gray-300 mb-4">Partner değişimi ile devam</p>
        </div>

        <Card className="bg-gray-800/50 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-center text-red-400">⚠️ UYARI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <p className="text-white font-medium">
                Bu bölümde partnerler değişecek ve daha sıcak görevler yapılacak.
              </p>
              
              <div className="bg-yellow-900/30 p-4 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  Yeni eşleşmeler:
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-white">
                    {couples[0].player1.name} ↔ {couples[1].player1.name}
                  </p>
                  <p className="text-white">
                    {couples[0].player2.name} ↔ {couples[1].player2.name}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm">
                Devam etmek istiyorsanız onay verin:
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {couples.flatMap(couple => [couple.player1, couple.player2]).map(player => (
                <div key={player.id} className="text-center">
                  <p className="text-white text-sm mb-2">{player.name}</p>
                  <Button
                    onClick={() => handlePlayerConfirmation(player.id)}
                    disabled={confirmations[player.id]}
                    className={confirmations[player.id] 
                      ? 'bg-green-600 hover:bg-green-600' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                    }
                    size="sm"
                  >
                    {confirmations[player.id] ? 'Onaylandı ✓' : 'Onayıyorum'}
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="text-center pt-4">
              <Button
                onClick={startPart4}
                disabled={!allPlayersConfirmed()}
                className="bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700"
              >
                Bölüm 4'ü Başlat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameStarted) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">BÖLÜM 4: AKŞAM SONRASI</h2>
        <p className="text-gray-300">Yeni partnerlerle sıcak görevler</p>
        <div className="text-sm text-gray-400 mt-2">
          {completedTasks.length}/6 görev tamamlandı
        </div>
      </div>

      {/* Current Pairs Display */}
      <div className="grid grid-cols-1 gap-4">
        {mixedCouples.map((pair, index) => (
          <Card key={pair.id} className={`bg-gray-800/30 border-2 ${
            index === currentPerformingPair ? 'border-yellow-400' : 'border-gray-600'
          }`}>
            <CardContent className="p-3 text-center">
              <div className="text-sm text-white">
                {pair.player1.name} & {pair.player2.name}
                {index === currentPerformingPair && (
                  <Badge className="ml-2 bg-yellow-500">Sıradaki</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!showTask ? (
        <Card className="bg-gray-800/50 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-center text-white">
              Sıra: {currentPair.player1.name} & {currentPair.player2.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300">
              Yeni partnerinizle görev yapmaya hazır mısınız?
            </p>
            <Button 
              onClick={handleChooseTask}
              className="bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700"
            >
              Görev Al
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-800/50 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-center text-white">
              {currentPair.player1.name} & {currentPair.player2.name} için görev:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-yellow-900/30 to-red-900/30 rounded-lg">
              <p className="text-lg text-white font-medium">
                {currentTask?.text}
              </p>
            </div>
            
            <div className="text-center text-sm text-gray-400">
              <p>• Bu bölümde pas hakkı yoktur</p>
              <p>• Görevler daha sıcak ve samimi</p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleTaskComplete}
                className="bg-green-600 hover:bg-green-700"
              >
                Tamamlandı
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {completedTasks.length >= 5 && (
        <div className="text-center">
          <Button 
            onClick={onComplete}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            Oyunu Bitir
          </Button>
        </div>
      )}
    </div>
  );
};