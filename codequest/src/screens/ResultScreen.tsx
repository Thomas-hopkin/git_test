import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

interface Props {
  xpEarned: number;
  leveledUp: boolean;
  newLevel: number;
  onContinue: () => void;
}

export default function ResultScreen({ xpEarned, leveledUp, newLevel, onContinue }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>{leveledUp ? '🎉' : '✅'}</Text>
        <Text style={styles.title}>{leveledUp ? 'Level Up!' : 'Level Complete!'}</Text>
        {leveledUp && <Text style={styles.newLevel}>You reached Level {newLevel}</Text>}
        <View style={styles.xpBox}>
          <Text style={styles.xpLabel}>XP Earned</Text>
          <Text style={styles.xpValue}>+{xpEarned}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={onContinue}>
          <Text style={styles.btnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0f13' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  newLevel: { fontSize: 18, color: '#6c63ff', marginBottom: 24, fontWeight: '600' },
  xpBox: { backgroundColor: '#1a1a24', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 40, marginBottom: 32, alignItems: 'center' },
  xpLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
  xpValue: { fontSize: 36, fontWeight: '800', color: '#f1c40f' },
  btn: { backgroundColor: '#6c63ff', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
