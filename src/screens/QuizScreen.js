import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function QuizScreen({ route, navigation, decks }) {
  const { deckId, onlyWrong } = route.params;
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [wrongCards, setWrongCards] = useState([]);

  useEffect(() => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;

    const loadQuiz = async () => {
      let quizCards = deck.cards;
      if (onlyWrong) {
        const savedWrong = await AsyncStorage.getItem(`wrongCards_${deckId}`);
        const wrongIds = savedWrong ? JSON.parse(savedWrong) : [];
        quizCards = deck.cards.filter(c => wrongIds.includes(c.id));
        if (quizCards.length === 0) {
          Alert.alert("틀린 카드 없음", "틀린 카드가 없습니다.");
          navigation.goBack();
          return;
        }
      }
      setCards(shuffleArray(quizCards));
      setWrongCards([]);
      setCurrentIndex(0);
      setShowAnswer(false);
    };

    loadQuiz();
  }, [deckId]);

  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

  const markAnswer = async (isCorrect) => {
    const card = cards[currentIndex];
    let updatedWrong = [...wrongCards];
    if (!isCorrect) updatedWrong.push(card.id);

    setWrongCards(updatedWrong);

    if (currentIndex + 1 >= cards.length) {
      await AsyncStorage.setItem(`wrongCards_${deckId}`, JSON.stringify(updatedWrong));
      Alert.alert("퀴즈 종료", `총 ${cards.length}문제 중 틀린 문제 ${updatedWrong.length}개`);
      navigation.goBack();
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  if (cards.length === 0) return null;

  const card = cards[currentIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.question}>Q: {card.front}</Text>
      {showAnswer && <Text style={styles.answer}>A: {card.back}</Text>}
      <Button title={showAnswer ? "Next" : "Show Answer"} onPress={() => setShowAnswer(true)} />
      {showAnswer && (
        <View style={styles.buttons}>
          <Button title="Correct" onPress={() => markAnswer(true)} />
          <Button title="Wrong" onPress={() => markAnswer(false)} />
        </View>
      )}
      <Text style={styles.progress}>{currentIndex + 1} / {cards.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  question: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  answer: { fontSize: 20, color: "green", marginBottom: 20 },
  buttons: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20 },
  progress: { textAlign: "center", fontSize: 16 },
});
