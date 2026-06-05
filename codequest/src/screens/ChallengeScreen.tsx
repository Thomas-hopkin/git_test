import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  ScrollView,
} from 'react-native';
import { Challenge } from '../data/challenges';

interface Props {
  challenges: Challenge[];
  onComplete: (xpEarned: number) => void;
  onBack: () => void;
  awardXP: (amount: number, id: string) => { leveledUp: boolean; newLevel: number };
  recordWrong: () => void;
}

type Phase = 'question' | 'correct' | 'wrong';

export default function ChallengeScreen({ challenges, onComplete, onBack, awardXP, recordWrong }: Props) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('question');
  const [selected, setSelected] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const challenge = challenges[index];
  const isLast = index === challenges.length - 1;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleAnswer = (answer: string) => {
    if (phase !== 'question') return;
    setSelected(answer);

    if (answer === challenge.correctAnswer) {
      const result = awardXP(challenge.xpReward, challenge.id);
      setXpEarned((prev) => prev + challenge.xpReward);
      if (result.leveledUp) setLeveledUp(true);
      setPhase('correct');
    } else {
      recordWrong();
      shake();
      setPhase('wrong');
    }
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(xpEarned);
      return;
    }
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setIndex((i) => i + 1);
      setPhase('question');
      setSelected(null);
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  const handleRetry = () => {
    setPhase('question');
    setSelected(null);
  };

  const options = challenge.options ?? [challenge.correctAnswer];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.progress}>
            {index + 1} / {challenges.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarOuter}>
          <View style={[styles.progressBarInner, { width: `${((index) / challenges.length) * 100}%` }]} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }}>
          {/* Language + concept badge */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{challenge.language}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{challenge.concept}</Text>
            </View>
            <View style={[styles.badge, styles.xpBadge]}>
              <Text style={styles.badgeText}>+{challenge.xpReward} XP</Text>
            </View>
          </View>

          {/* Question */}
          <Text style={styles.question}>{challenge.question}</Text>

          {/* Code block */}
          {challenge.code && (
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{challenge.code}</Text>
            </View>
          )}

          {/* Options */}
          {options.map((opt) => {
            const isSelected = selected === opt;
            const isCorrect = opt === challenge.correctAnswer;
            let optStyle = styles.option;
            let textStyle = styles.optionText;

            if (phase !== 'question') {
              if (isCorrect) { optStyle = { ...styles.option, ...styles.optionCorrect }; }
              else if (isSelected && !isCorrect) { optStyle = { ...styles.option, ...styles.optionWrong }; }
            }

            return (
              <TouchableOpacity
                key={opt}
                style={optStyle}
                onPress={() => handleAnswer(opt)}
                disabled={phase !== 'question'}
              >
                <Text style={textStyle}>{opt}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Feedback */}
          {phase === 'correct' && (
            <View style={styles.feedbackCorrect}>
              <Text style={styles.feedbackTitle}>✓ Correct! +{challenge.xpReward} XP</Text>
              <Text style={styles.feedbackText}>{challenge.explanation}</Text>
              {leveledUp && <Text style={styles.levelUp}>🎉 Level Up!</Text>}
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.nextBtnText}>{isLast ? 'Finish' : 'Next →'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'wrong' && (
            <View style={styles.feedbackWrong}>
              <Text style={styles.feedbackTitle}>✗ Not quite</Text>
              <Text style={styles.feedbackText}>{challenge.explanation}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                <Text style={styles.nextBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0f13' },
  container: { padding: 24, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  back: { color: '#6c63ff', fontSize: 16 },
  progress: { color: '#555', fontSize: 14 },
  progressBarOuter: { height: 4, backgroundColor: '#1a1a24', borderRadius: 2, marginBottom: 24 },
  progressBarInner: { height: '100%', backgroundColor: '#6c63ff', borderRadius: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { backgroundColor: '#1a1a24', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  xpBadge: { backgroundColor: '#2a1a4a' },
  badgeText: { color: '#888', fontSize: 12, fontWeight: '600' },
  question: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 16, lineHeight: 28 },
  codeBlock: { backgroundColor: '#111118', borderRadius: 10, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  codeText: { fontFamily: 'monospace', color: '#a8e6cf', fontSize: 14, lineHeight: 22 },
  option: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  optionCorrect: { backgroundColor: '#0d2b1a', borderColor: '#2ecc71' },
  optionWrong: { backgroundColor: '#2b0d0d', borderColor: '#e74c3c' },
  optionText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  feedbackCorrect: { marginTop: 20, backgroundColor: '#0d2b1a', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#2ecc71' },
  feedbackWrong: { marginTop: 20, backgroundColor: '#2b0d0d', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#e74c3c' },
  feedbackTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8 },
  feedbackText: { fontSize: 14, color: '#ccc', lineHeight: 20 },
  levelUp: { fontSize: 18, fontWeight: '800', color: '#f1c40f', marginTop: 10, textAlign: 'center' },
  nextBtn: { backgroundColor: '#6c63ff', borderRadius: 10, padding: 14, marginTop: 14, alignItems: 'center' },
  retryBtn: { backgroundColor: '#e74c3c', borderRadius: 10, padding: 14, marginTop: 14, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
