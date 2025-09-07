import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Player, Couple } from '@/types/game';

interface GameSetupProps {
  onStart: (couples: Couple[]) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [couple1Player1, setCouple1Player1] = useState('');
  const [couple1Player2, setCouple1Player2] = useState('');
  const [couple2Player1, setCouple2Player1] = useState('');
  const [couple2Player2, setCouple2Player2] = useState('');

  const handleStart = () => {
    if (!couple1Player1 || !couple1Player2 || !couple2Player1 || !couple2Player2) {
      alert('Lütfen tüm oyuncu isimlerini girin!');
      return;
    }

    const player1: Player = {
      id: 'p1',
      name: couple1Player1,
      coupleId: 'c1',
      score: 0
    };

    const player2: Player = {
      id: 'p2',
      name: couple1Player2,
      coupleId: 'c1',
      score: 0
    };

    const player3: Player = {
      id: 'p3',
      name: couple2Player1,
      coupleId: 'c2',
      score: 0
    };

    const player4: Player = {
      id: 'p4',
      name: couple2Player2,
      coupleId: 'c2',
      score: 0
    };

    const couple1: Couple = {
      id: 'c1',
      player1,
      player2,
      totalScore: 0
    };

    const couple2: Couple = {
      id: 'c2',
      player1: player3,
      player2: player4,
      totalScore: 0
    };

    onStart([couple1, couple2]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black p-4 flex items-center justify-center">
      <Card className="w-full max-w-md bg-black/80 border-cyan-400 text-white">
        <CardHeader className="text-center">
          <img src="/assets/logo.png" alt="Zoka Night" className="w-32 h-32 mx-auto mb-4 rounded-full" />
          <CardTitle className="text-3xl font-bold text-cyan-400">ZOKA NIGHT</CardTitle>
          <CardDescription className="text-gray-300">
            Çiftler İçin Yetişkin Oyunu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-cyan-300">1. Çift</h3>
            <div className="space-y-2">
              <Input
                placeholder="1. Oyuncu İsmi"
                value={couple1Player1}
                onChange={(e) => setCouple1Player1(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Input
                placeholder="2. Oyuncu İsmi"
                value={couple1Player2}
                onChange={(e) => setCouple1Player2(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-cyan-300">2. Çift</h3>
            <div className="space-y-2">
              <Input
                placeholder="3. Oyuncu İsmi"
                value={couple2Player1}
                onChange={(e) => setCouple2Player1(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Input
                placeholder="4. Oyuncu İsmi"
                value={couple2Player2}
                onChange={(e) => setCouple2Player2(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleStart} 
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3"
          >
            Oyuna Başla
          </Button>
          
          <div className="text-xs text-gray-400 text-center mt-4">
            <p>• 4 Bölüm: Başlangıç • Isınma • En Sıcak • Akşam Sonrası</p>
            <p>• Toplam süre: ~80 dakika</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};