import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Couple } from '@/types/game';
import { part3Tasks } from '@/data/tasks';

interface Part3PhysicalProps {
  couples: Couple[];
  onComplete: () => void;
}

export const Part3Physical: React.FC<Part3PhysicalProps> = ({ couples, onComplete }) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [currentPerformingCouple, setCurrentPerformingCouple] = useState(0);
  const [currentChoosingCouple, setCurrentChoosingCouple] = useState(1);
  const [showTask, setShowTask] = useState(false);
  const [passCount, setPassCount] = useState({ c1: 0, c2: 0 });

  const getRandomTask = () => {
    const availableTasks = part3Tasks
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
    // Switch roles
    setCurrentPerformingCouple(prev => (prev + 1) % couples.length);
    setCurrentChoosingCouple(prev => (prev + 1) % couples.length);
    
    if (completedTasks.length >= 8) {
      onComplete();
    }
  };

  const handlePass = () => {
    const coupleId = couples[currentPerformingCouple].id;
    const newPassCount = { ...passCount, [coupleId]: passCount[coupleId as keyof typeof passCount] + 1 };
    setPassCount(newPassCount);
    
    if (newPassCount[coupleId as keyof typeof passCount] >= 2) {
      alert('Bu çift pas hakkını tüketti!');
    }
    
    handleTaskComplete();
  };

  const performingCouple = couples[currentPerformingCouple];
  const choosingCouple = couples[currentChoosingCouple];
  const currentTask = part3Tasks[currentTaskIndex];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return 'Bilinmeyen';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-2">BÖLÜM 3: EN SICAK</h2>
        <p className="text-gray-300">Fiziksel görevler</p>
        <div className="text-sm text-gray-400 mt-2">
          {completedTasks.length}/8 görev tamamlandı
        </div>
      </div>

      {/* Pass Count Display */}
      <div className="grid grid-cols-2 gap-4">
        {couples.map(couple => (
          <Card key={couple.id} className="bg-gray-800/30 border-gray-600">
            <CardContent className="p-3 text-center">
              <div className="text-sm text-white mb-1">
                {couple.player1.name} & {couple.player2.name}
              </div>
              <div className="text-xs text-gray-400">
                Pas Hakkı: {2 - passCount[couple.id as keyof typeof passCount]}/2
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!showTask ? (
        <Card className="bg-gray-800/50 border-red-400">
          <CardHeader>
            <CardTitle className="text-center text-white">
              {choosingCouple.player1.name} & {choosingCouple.player2.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300">
              {performingCouple.player1.name} & {performingCouple.player2.name} için görev seçin
            </p>
            <Button 
              onClick={handleChooseTask}
              className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
            >
              Görev Seç
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-800/50 border-red-400">
          <CardHeader>
            <CardTitle className="text-center text-white">
              {performingCouple.player1.name} & {performingCouple.player2.name} için görev:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge className={`${getDifficultyColor(currentTask.difficulty)} text-white mb-2`}>
                {getDifficultyText(currentTask.difficulty)}
              </Badge>
            </div>
            
            <div className="text-center p-6 bg-red-900/30 rounded-lg">
              <p className="text-lg text-white font-medium">
                {currentTask.text}
              </p>
            </div>
            
            <div className="text-center text-sm text-gray-400">
              <p>• Görevi tamamlayın veya pas geçin</p>
              <p>• Her çiftin 2 pas hakkı vardır</p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={handleTaskComplete}
                className="bg-green-600 hover:bg-green-700"
              >
                Tamamlandı
              </Button>
              
              <Button 
                onClick={handlePass}
                disabled={passCount[performingCouple.id as keyof typeof passCount] >= 2}
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
              >
                Pas Geç ({2 - passCount[performingCouple.id as keyof typeof passCount]} kaldı)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {completedTasks.length >= 6 && (
        <div className="text-center">
          <Button 
            onClick={onComplete}
            className="bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700"
          >
            Bölüm 4'e Geç
          </Button>
        </div>
      )}
    </div>
  );
};