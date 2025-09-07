export interface GameRoom {
  id: string;
  type: '2player' | '4player';
  players: RoomPlayer[];
  gameState: {
    phase: string;
    section?: number;
  };
  currentQuestion: number;
  timeLeft: number;
  isActive: boolean;
  createdAt: number;
}

export interface RoomPlayer {
  id: string;
  name: string;
  isReady: boolean;
  answers: { [questionIndex: number]: string | number };
  score: number;
  coupleId?: string;
}

export interface GameSync {
  type: 'player_join' | 'player_ready' | 'answer_submit' | 'next_question' | 'game_update';
  data: RoomPlayer | Partial<GameRoom>;
  timestamp: number;
}