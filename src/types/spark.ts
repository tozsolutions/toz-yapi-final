export interface SparkPlayer {
  id: string;
  name: string;
  score: number;
}

export interface SparkQuestion {
  id: string;
  text: string;
  options?: string[];
  type: 'multiple' | 'open';
  section: 1 | 2 | 3;
}

export interface SparkActivity {
  id: string;
  title: string;
  description: string;
  type: 'written' | 'physical';
  duration?: number;
}

export interface SparkGameState {
  section: 1 | 2 | 3 | 'finished';
  players: SparkPlayer[];
  currentQuestion: SparkQuestion | null;
  currentActivity: SparkActivity | null;
  questionIndex: number;
  scores: { [playerId: string]: number };
}