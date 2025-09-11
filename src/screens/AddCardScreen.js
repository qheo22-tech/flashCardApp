import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

export default function AddCardScreen({ navigation, decks, setDecks, route }) {
  const { deckId } = route.params;

  // 1️⃣ 카드 앞면/뒷면 상태
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  // 2️⃣ 카드 추가
  const addCard = () => {
    if (!front.trim() || !back.trim()) return;

    const newCard = { id: Date.now().toString(), front, back };
    const updatedDecks = decks.map((deck) =>
      deck.id === deckId ? { ...deck, cards: [...deck.cards, newCard] } : deck
    );
    setDecks(updatedDecks);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Front" value={front} onChangeText={setFront} />
      <TextInput style={styles.input} placeholder="Back" value={back} onChangeText={setBack} />
      <Button title="Add Card" onPress={addCard} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 6 },
});
