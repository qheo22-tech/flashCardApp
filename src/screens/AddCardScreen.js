// AddCardScreen.js
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";

export default function AddCardScreen({ navigation, decks, setDecks, route }) {
  const { deckId } = route.params;

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const addCard = () => {
    if (!front.trim() || !back.trim()) {
      Alert.alert("Error", "Both front and back are required!");
      return;
    }

    const newCard = {
      id: Date.now().toString(),
      front,
      back,
      stats: { total: 0, correct: 0, wrong: 0 },
    };

    const updatedDecks = decks.map(deck =>
      deck.id === deckId ? { ...deck, cards: [...deck.cards, newCard] } : deck
    );

    setDecks(updatedDecks);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Front"
        value={front}
        onChangeText={setFront}
      />
      <TextInput
        style={styles.input}
        placeholder="Back"
        value={back}
        onChangeText={setBack}
      />
      <TouchableOpacity style={styles.button} onPress={addCard}>
        <Text style={styles.buttonText}>Add Card</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 6 },
  button: { padding: 15, backgroundColor: "blue", borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
