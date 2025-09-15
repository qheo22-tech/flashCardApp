import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function CardDetailScreen({ navigation, decks, setDecks, route }) {
  const { deckId, cardId } = route.params || {};
  if (!deckId || !cardId) return <Text>Invalid route parameters</Text>;

  const deck = decks.find(d => d.id === deckId);
  const card = deck?.cards.find(c => c.id === cardId);
  if (!card) return <Text>Card not found</Text>;

  const [front, setFront] = useState(card.front || "");
  const [back, setBack] = useState(card.back || "");

  const saveCard = () => {
    const updatedDecks = decks.map(d =>
      d.id === deckId
        ? { ...d, cards: d.cards.map(c => c.id === cardId ? { ...c, front, back } : c) }
        : d
    );
    setDecks(updatedDecks);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* 상단 저장 버튼 */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={saveCard} style={styles.iconButton}>
          <Text style={styles.iconText}>💾</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { height: 120 }]}
        value={front}
        onChangeText={setFront}
        multiline
        placeholder="Front"
        textAlignVertical="top"
      />
      <TextInput
        style={[styles.input, { height: 120 }]}
        value={back}
        onChangeText={setBack}
        multiline
        placeholder="Back"
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  topRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 },
  iconButton: { marginLeft: 10 },
  iconText: { fontSize: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "white",
  },
});
