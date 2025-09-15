import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

export default function QuizScreen({ route, navigation, decks, setDecks }) {
  const { deckId, cards: passedCards } = route.params || {}; // DeckDetailScreen에서 넘긴 cards
  const deck = decks.find((d) => d.id === deckId);

  if (!deck || !passedCards || passedCards.length === 0) {
    Alert.alert("No cards", "This deck has no cards.");
    navigation.goBack();
    return null;
  }

  const [cards, setCards] = useState(passedCards); // 섞인 배열 그대로 사용
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const card = cards[currentIndex];

  const handleAnswer = (isCorrect) => {
    // Decks 업데이트 (원본 덱 통계 반영)
    const updatedDecks = decks.map((d) => {
      if (d.id !== deckId) return d;
      const updatedCards = d.cards.map((c) => {
        if (c.id !== card.id) return c;
        return {
          ...c,
          attempts: (c.attempts || 0) + 1,
          correct: isCorrect ? (c.correct || 0) + 1 : (c.correct || 0),
          wrong: !isCorrect ? (c.wrong || 0) + 1 : (c.wrong || 0),
        };
      });
      return { ...d, cards: updatedCards };
    });
    setDecks(updatedDecks);

    // 다음 카드로 이동
    if (currentIndex + 1 >= cards.length) {
      const correctCount = cards.filter((c) => (c.correct || 0) > 0).length;
      Alert.alert(
        "Quiz Finished",
        `Correct: ${correctCount} / ${cards.length}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 현재 문제 / 전체 문제 표시 */}
      <Text style={styles.progress}>
        {currentIndex + 1} / {cards.length}
      </Text>

      <Text style={styles.question}>{card.front}</Text>
      {showAnswer && <Text style={styles.answer}>{card.back}</Text>}
      <TouchableOpacity onPress={() => setShowAnswer(!showAnswer)}>
        <Text style={styles.showAnswerButton}>{showAnswer ? "Hide Answer" : "Show Answer"}</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.answerButton, { backgroundColor: "green" }]}
          onPress={() => handleAnswer(true)}
        >
          <Text style={styles.buttonText}>Correct</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.answerButton, { backgroundColor: "red" }]}
          onPress={() => handleAnswer(false)}
        >
          <Text style={styles.buttonText}>Wrong</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.stats}>
        Attempts: {card.attempts || 0} | Correct: {card.correct || 0} | Wrong: {card.wrong || 0}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  progress: { fontSize: 16, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  question: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  answer: { fontSize: 20, marginBottom: 20, color: "#555" },
  showAnswerButton: { color: "blue", marginBottom: 20 },
  buttonRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  answerButton: { padding: 15, borderRadius: 8, width: 120, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold" },
  stats: { fontSize: 14, color: "#666", textAlign: "center" },
});
