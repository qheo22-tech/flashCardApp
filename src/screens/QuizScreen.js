import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

export default function QuizScreen({ route, navigation, decks, setDecks }) {
  const { deckId, retryWrong } = route.params || {};
  const deck = decks.find((d) => d.id === deckId);

  if (!deck || deck.cards.length === 0) {
    Alert.alert("No cards", "This deck has no cards.");
    navigation.goBack();
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const card = deck.cards[currentIndex];

  const handleAnswer = (isCorrect) => {
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

    if (currentIndex + 1 >= deck.cards.length) {
      Alert.alert(
        "Quiz Finished",
        `Correct: ${deck.cards.filter(c => c.correct).length} / ${deck.cards.length}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{card.front}</Text>
      {showAnswer && <Text style={styles.answer}>{card.back}</Text>}
      <TouchableOpacity onPress={() => setShowAnswer(!showAnswer)}>
        <Text style={styles.showAnswerButton}>{showAnswer ? "Hide Answer" : "Show Answer"}</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.answerButton, { backgroundColor: "green" }]} onPress={() => handleAnswer(true)}>
          <Text style={styles.buttonText}>Correct</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.answerButton, { backgroundColor: "red" }]} onPress={() => handleAnswer(false)}>
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
  question: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  answer: { fontSize: 20, marginBottom: 20, color: "#555" },
  showAnswerButton: { color: "blue", marginBottom: 20 },
  buttonRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  answerButton: { padding: 15, borderRadius: 8, width: 120, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold" },
  stats: { fontSize: 14, color: "#666", textAlign: "center" },
});
