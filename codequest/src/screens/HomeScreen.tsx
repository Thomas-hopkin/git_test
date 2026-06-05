import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { xpProgressPercent, xpToNextLevel, GameState } from '../hooks/useGameState';
import { getMaxLevel } from '../data/challenges';

interface Props {
  state: GameState;
  onStartLevel: (level: number) => void;
}

export default function HomeScreen({ state, onStartLevel }: Props) {
  const maxLevel = getMaxLevel();
  const progressPercent = xpProgressPercent(state.xp);
  const toNext = xpToNextLevel(state.xp);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>CodeQuest</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatChip label="Level" value={String(state.level)} />
          <StatChip label="XP" value={String(state.xp)} />
          <StatChip label="Streak" value={`${state.streak}🔥`} />
        </View>

        {/* XP bar */}
        <View style={styles.xpBarOuter}>
          <View style={[styles.xpBarInner, { width: `${progressPercent * 100}%` }]} />
        </View>
        <Text style={styles.xpLabel}>{toNext} XP to level {state.level + 1}</Text>

        {/* Levels */}
        <Text style={styles.sectionTitle}>Choose a Level</Text>
        {Array.from({ length: maxLevel }, (_, i) => i + 1).map((lvl) => {
          const unlocked = lvl <= state.level + 1;
          const completed = lvl < state.level || (lvl === state.level && progressPercent > 0);
          return (
            <TouchableOpacity
              key={lvl}
              style={[styles.levelCard, !unlocked && styles.locked]}
              onPress={() => unlocked && onStartLevel(lvl)}
              disabled={!unlocked}
            >
              <View>
                <Text style={styles.levelTitle}>
                  {unlocked ? '' : '🔒 '}Level {lvl}
                </Text>
                <Text style={styles.levelSub}>
                  {lvl <= 5 ? 'Python' : 'JavaScript'} · {getLevelTopic(lvl)}
                </Text>
              </View>
              {completed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipValue}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function getLevelTopic(level: number): string {
  const topics: Record<number, string> = {
    1: 'Variables',
    2: 'Data Types',
    3: 'Conditionals',
    4: 'Loops',
    5: 'Functions',
    6: 'JS Basics',
  };
  return topics[level] ?? 'Advanced';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0f13' },
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  chip: {
    flex: 1,
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  chipValue: { fontSize: 20, fontWeight: '700', color: '#fff' },
  chipLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  xpBarOuter: {
    height: 8,
    backgroundColor: '#1a1a24',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpBarInner: { height: '100%', backgroundColor: '#6c63ff', borderRadius: 4 },
  xpLabel: { fontSize: 12, color: '#555', marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#888', marginBottom: 12 },
  levelCard: {
    backgroundColor: '#1a1a24',
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locked: { opacity: 0.35 },
  levelTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  levelSub: { fontSize: 13, color: '#666' },
  checkmark: { fontSize: 20, color: '#6c63ff' },
});
