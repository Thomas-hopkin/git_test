import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useGameState } from './src/hooks/useGameState';
import { getLevelChallenges } from './src/data/challenges';
import HomeScreen from './src/screens/HomeScreen';
import ChallengeScreen from './src/screens/ChallengeScreen';
import ResultScreen from './src/screens/ResultScreen';

type Screen = 'home' | 'challenge' | 'result';

export default function App() {
  const { state, loaded, awardXP, recordWrong } = useGameState();
  const [screen, setScreen] = useState<Screen>('home');
  const [activeLevel, setActiveLevel] = useState(1);
  const [sessionXP, setSessionXP] = useState(0);
  const [didLevelUp, setDidLevelUp] = useState(false);

  if (!loaded) return null;

  const handleStartLevel = (level: number) => {
    setActiveLevel(level);
    setSessionXP(0);
    setDidLevelUp(false);
    setScreen('challenge');
  };

  const handleChallengeComplete = (xpEarned: number) => {
    setSessionXP(xpEarned);
    setDidLevelUp(state.level < Math.floor((state.xp + xpEarned) / 100) + 1);
    setScreen('result');
  };

  if (screen === 'home') {
    return (
      <>
        <StatusBar style="light" />
        <HomeScreen state={state} onStartLevel={handleStartLevel} />
      </>
    );
  }

  if (screen === 'challenge') {
    const challenges = getLevelChallenges(activeLevel);
    return (
      <>
        <StatusBar style="light" />
        <ChallengeScreen
          challenges={challenges}
          onComplete={handleChallengeComplete}
          onBack={() => setScreen('home')}
          awardXP={awardXP}
          recordWrong={recordWrong}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <ResultScreen
        xpEarned={sessionXP}
        leveledUp={didLevelUp}
        newLevel={state.level}
        onContinue={() => setScreen('home')}
      />
    </>
  );
}
