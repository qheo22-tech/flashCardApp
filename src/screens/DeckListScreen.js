import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from "react-native";

export default function DeckListScreen({ navigation, decks, setDecks }) {
  const addDeck = () => {
    const newDeck = { id: Date.now().toString(), title: "New Deck", cards: [] };
    setDecks((prev) => [...prev, newDeck]);
    navigation.navigate("DeckDetail", { deckId: newDeck.id });
  };

  return (
    <View style={styles.container}>
      <Button title="+ Add Deck" onPress={addDeck} />
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.deck}
            onPress={() => navigation.navigate("DeckDetail", { deckId: item.id })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.count}>{item.cards.length} cards</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  deck: { padding: 20, backgroundColor: "#f0f0f0", marginBottom: 10, borderRadius: 8 },
  title: { fontSize: 20, fontWeight: "bold" },
  count: { fontSize: 14, color: "#666" },
});
