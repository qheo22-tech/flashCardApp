import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";

export default function DeckDetailScreen({ route, navigation, decks, setDecks }) {
  const { deckId } = route.params;
  const deck = decks.find((d) => d.id === deckId);

  if (!deck) return <Text>Deck not found</Text>;

  const deleteDeck = () => {
    Alert.alert("Delete Deck", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updated = decks.filter((d) => d.id !== deck.id);
          setDecks(updated);
          navigation.navigate("DeckList");
        },
      },
    ]);
  };

  const addCard = () => navigation.navigate("AddCard", { deckId: deck.id });

  const startQuiz = () => {
    if (deck.cards.length === 0) {
      Alert.alert("No cards", "This deck has no cards.");
      return;
    }
    navigation.navigate("Quiz", { deckId: deck.id });
  };

  const retryWrongCards = () => {
    if (deck.cards.length === 0) {
      Alert.alert("No cards", "This deck has no cards.");
      return;
    }
    navigation.navigate("Quiz", { deckId: deck.id, retryWrong: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.iconButton} onPress={addCard}>
          <Text style={styles.iconText}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={deleteDeck}>
          <Text style={styles.iconText}>🗑</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{deck.title}</Text>
      <Text style={styles.cardCount}>{deck.cards.length} cards</Text>

      <View style={styles.quizContainer}>
        <TouchableOpacity style={[styles.quizButton, { backgroundColor: "white" }]} onPress={startQuiz}>
          <Text style={[styles.quizText, { color: "black" }]}>Start Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quizButton, { backgroundColor: "white" }]} onPress={retryWrongCards}>
          <Text style={[styles.quizText, { color: "black" }]}>Retry Wrong Cards</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={deck.cards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardItem}
            onPress={() => navigation.navigate("CardDetail", { deckId: deck.id, cardId: item.id })}
          >
            <Text style={styles.cardFront}>{item.front}</Text>
            <Text style={styles.cardStats}>
              Attempts: {item.attempts || 0} | Correct: {item.correct || 0} | Wrong: {item.wrong || 0}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  topRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 },
  iconButton: { marginLeft: 10 },
  iconText: { fontSize: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5, color: "black" },
  cardCount: { fontSize: 16, color: "#666", marginBottom: 20 },
  quizContainer: { marginBottom: 20 },
  quizButton: { padding: 20, marginVertical: 5, borderRadius: 8, alignItems: "center" },
  quizText: { fontSize: 18, fontWeight: "bold" },
  cardItem: { padding: 15, backgroundColor: "white", borderRadius: 8, marginBottom: 10 },
  cardFront: { fontSize: 16, color: "black" },
  cardStats: { fontSize: 12, color: "#888", marginTop: 5 },
});
