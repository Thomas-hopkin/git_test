import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GameState {
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate: string | null;
  completedChallengeIds: string[];
  totalCorrect: number;
  totalAttempted: number;
}

const STORAGE_KEY = 'codequest_state';

const XP_PER_LEVEL = 100;

const defaultState: GameState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastPlayedDate: null,
  completedChallengeIds: [],
  totalCorrect: 0,
  totalAttempted: 0,
};

export function xpToNextLevel(currentXp: number): number {
  const levelProgress = currentXp % XP_PER_LEVEL;
  return XP_PER_LEVEL - levelProgress;
}

export function xpProgressPercent(currentXp: number): number {
  return (currentXp % XP_PER_LEVEL) / XP_PER_LEVEL;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setState(JSON.parse(raw));
      setLoaded(true);
    });
  }, []);

  const save = (next: GameState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const awardXP = (amount: number, challengeId: string): { leveledUp: boolean; newLevel: number } => {
    const newXp = state.xp + amount;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
    const leveledUp = newLevel > state.level;

    const today = new Date().toDateString();
    const playedToday = state.lastPlayedDate === today;
    const playedYesterday =
      state.lastPlayedDate ===
      new Date(Date.now() - 86400000).toDateString();

    const newStreak = playedToday
      ? state.streak
      : playedYesterday
      ? state.streak + 1
      : 1;

    save({
      ...state,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastPlayedDate: today,
      completedChallengeIds: [...state.completedChallengeIds, challengeId],
      totalCorrect: state.totalCorrect + 1,
      totalAttempted: state.totalAttempted + 1,
    });

    return { leveledUp, newLevel };
  };

  const recordWrong = () => {
    save({ ...state, totalAttempted: state.totalAttempted + 1 });
  };

  const resetProgress = () => save(defaultState);

  return { state, loaded, awardXP, recordWrong, resetProgress };
}
