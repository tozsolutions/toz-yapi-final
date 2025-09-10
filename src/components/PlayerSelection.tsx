import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github } from 'lucide-react';

interface PlayerSelectionProps {
  onSelectPlayers: (playerCount: number) => void;
}

export const PlayerSelection: React.FC<PlayerSelectionProps> = ({ onSelectPlayers }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black p-4 flex items-center justify-center">
      <Card className="w-full max-w-md bg-black/80 border-cyan-400 text-white">
        <CardHeader className="text-center">
          <img src="/assets/logo.png" alt="Zoka Night" className="w-32 h-32 mx-auto mb-4 rounded-full" />
          <CardTitle className="text-3xl font-bold text-cyan-400">ZOKA NIGHT</CardTitle>
          <CardDescription className="text-gray-300">
            Oyuncu Sayısını Seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 border-purple-400 cursor-pointer hover:bg-purple-700/50 transition-colors">
            <CardContent className="p-6 text-center" onClick={() => onSelectPlayers(2)}>
              <h3 className="text-xl font-bold text-purple-300 mb-2">👫 2 KİŞİ</h3>
              <h4 className="text-lg font-semibold text-pink-300 mb-2">Kıvılcım: Yeniden Doğuş</h4>
              <p className="text-sm text-gray-300">Evli çiftler için özel intimacy oyunu</p>
              <div className="mt-3 text-xs text-gray-400">
                <p>• 3 Bölüm: Anı Yolu • Şimdinin Sesi • Gelecek Dokunuşu</p>
                <p>• Derin sorular ve fiziksel aktiviteler</p>
              </div>
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                onClick={() => onSelectPlayers(2)}
              >
                Başla
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-cyan-800/50 to-blue-800/50 border-cyan-400 cursor-pointer hover:bg-cyan-700/50 transition-colors">
            <CardContent className="p-6 text-center" onClick={() => onSelectPlayers(4)}>
              <h3 className="text-xl font-bold text-cyan-300 mb-2">👫👫 4 KİŞİ</h3>
              <h4 className="text-lg font-semibold text-blue-300 mb-2">Zoka Night</h4>
              <p className="text-sm text-gray-300">2 çift için eğlenceli parti oyunu</p>
              <div className="mt-3 text-xs text-gray-400">
                <p>• 4 Bölüm: Başlangıç • Isınma • En Sıcak • Akşam Sonrası</p>
                <p>• Sorular, görevler ve partner değişimi</p>
              </div>
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                onClick={() => onSelectPlayers(4)}
              >
                Başla
              </Button>
            </CardContent>
          </Card>
        </CardContent>
        <div className="p-4 border-t border-gray-700">
          <Button 
            variant="outline" 
            className="w-full border-green-400 text-green-400 hover:bg-green-400/10"
            onClick={() => window.location.href = '/github-analyzer'}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub Repository Analizi
          </Button>
        </div>
      </Card>
    </div>
  );
};