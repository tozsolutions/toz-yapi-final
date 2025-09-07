export interface Player {
  id: string;
  name: string;
  coupleId: string;
  score: number;
}

export interface Couple {
  id: string;
  player1: Player;
  player2: Player;
  totalScore: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

export interface PhysicalTask {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface GameState {
  phase: 'setup' | 'part1' | 'part2' | 'part3' | 'part4' | 'finished';
  couples: Couple[];
  currentQuestion: Question | null;
  currentTask: PhysicalTask | null;
  timeLeft: number;
  isActive: boolean;
  scores: { [playerId: string]: number };
}